import { Job } from "bullmq";
import { createHash } from "node:crypto";
import { logger } from "../worker.utils.js";
import { JobName } from "../worker.const.js";
import { prisma } from "../worker.prisma.js";
import { BackupStatus } from "@prisma/client";
import { connectSSH, execShell } from "../connectors/ssh.js";
import { connectTelnet, execTelnet } from "../connectors/telnet.js";

export async function backupProcessor(job: Job) {
    switch (job.name) {
    case JobName.CheckBackupSchedule:
        logger.info(job.data, "Checking backup schedule...");

        return;

        /*     case JobName.CreateBackup:
        logger.info(job.data, "Creating backup...");
 
        return;
 
    default:
        throw new Error(`Unknown job: ${job.name}`);
    } */

    case JobName.CreateBackup: {
        // const device = await prisma.device.findUnique({
        //   where: { id: job.data.deviceId },
        // });
        const device = job.data.device;

        if (!device) {
            throw new Error("Device not found");
        }

        const startedAt = new Date();
        let status = "Running";
        let output = "";
        let error: string | null = null;
        const protocol = device.protocol || "ssh";
        const commands = device.commands;

        if (!commands) {
            throw new Error("Commands not found");
        }

        try {
            if (protocol === "telnet") {
                const client = await connectTelnet({
                    host: device.ip,
                    username: device.username,
                    password: device.password,
                });

                output = await execTelnet(client, commands);

                if (client && typeof client.end === "function") {
                    await client.end();
                } else if (client && typeof client.destroy === "function") {
                    client.destroy();
                }
            } else {
                const client = await connectSSH({
                    host: device.ip,
                    username: device.username,
                    password: device.password,
                });

                output = await execShell(client, commands);

                client.end();
            }

            status = "Success";
        } catch (err) {
            status = "Failed";
            error = err instanceof Error ? err.message : String(err);
            logger.error({ err }, "Backup failed");
            // We re-throw later after saving the failed state
        }

        // Sanitize output (remove null bytes that Postgres rejects)
        output = output.split("\0").join("");

        // Calculate hash
        const configHash = createHash("sha256")
            .update(output)
            .digest("hex");

        // Get last version
        const lastVersion = await prisma.configVersion.findFirst({
            where: { deviceId: device.id },
            orderBy: { versionNumber: "desc" },
        });

        const nextVersionNumber = (lastVersion?.versionNumber || 0) + 1;

        // Check for duplicates (only if success)
        let isDuplicate = false;

        if (
            status === "Success" &&
                lastVersion &&
                lastVersion.status === "Success" &&
                lastVersion.configHash === configHash
        ) {
            isDuplicate = true;
        }

        if (isDuplicate) {
            logger.info(
                { deviceId: device.id },
                "Config is identical to last version. Skipping save."
            );

            return;
        }

        // Save to DB
        await prisma.configVersion.create({
            data: {
                deviceId: device.id,
                versionNumber: nextVersionNumber,
                status: status as BackupStatus,
                startedAt: startedAt,
                finishedAt: new Date(),
                configText: status === "Success" ? output : null,
                configHash: status === "Success" ? configHash : null,
                isDuplicate: isDuplicate,
                error: error,
            },
        });

        if (status === "Failed") {
            throw new Error(error || "Backup failed");
        }

        return;
    }
    }
}
