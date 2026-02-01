import { Job } from "bullmq";
import { diffLines } from "diff";
import { createHash } from "node:crypto";
import { JobName } from "../worker.const.js";
import { prisma } from "../worker.prisma.js";
import { BackupStatus, Protocol } from "@prisma/client";
import { connectSSH, execShell } from "../connectors/ssh.js";
import { BackupJobData } from "@/worker/types/backup.type.js";
import { connectTelnet, execTelnet } from "../connectors/telnet.js";

export async function backupProcessor(job: Job<BackupJobData>) {
    if (job.name === JobName.CreateBackup) {
        await createBackup(job.data);
        return;
    }

    throw new Error("job is not supported");
}

async function createBackup(data: BackupJobData) {
    const device = await prisma.device.findUnique({
        where: { id: data.deviceId },
        select: {
            id: true,
            protocol: true,
            ipAddress: true,
            port: true,
            credential: { select: { username: true, secretRef: true } },
            deviceType: { select: { configCommand: true } },
            configVersions: {
                select: { versionNumber: true },
                take: 1,
                orderBy: { versionNumber: "desc" },
            },
        },
    });

    if (!device) {
        throw new Error("Device not found");
    }

    const versionNumber = (device.configVersions[0]?.versionNumber ?? 0) + 1;

    const backup = await prisma.configVersion.create({
        data: {
            deviceId: device.id,
            status: BackupStatus.Running,
            versionNumber,
        },
        select: { id: true },
    });

    // TODO: add aws secret manager
    const password = device.credential.secretRef;

    try {
        const output = await getConfig({
            protocol: device.protocol,
            host: device.ipAddress,
            port: device.port,
            username: device.credential.username,
            password,
            commands: device.deviceType.configCommand.split("\n"),
        });

        const configHash = createHash("sha256").update(output).digest("hex");

        const prevVersion = await prisma.configVersion.findFirst({
            where: {
                deviceId: device.id,
                id: { not: backup.id },
                versionNumber: { lt: versionNumber },
                isDuplicate: false,
            },
            orderBy: { versionNumber: "desc" },
            select: {
                id: true,
                status: true,
                configHash: true,
                configText: true,
            },
        });

        const isDuplicate =
            !!prevVersion &&
            prevVersion.status === BackupStatus.Success &&
            prevVersion.configHash === configHash;

        let changedLines: number | null = null;

        if (
            prevVersion?.status === BackupStatus.Success &&
            prevVersion.configText
        ) {
            changedLines = calcChangedLines({
                prev: prevVersion.configText,
                current: output,
            });
        }

        await prisma.configVersion.update({
            where: { id: backup.id },
            data: {
                versionNumber,
                status: BackupStatus.Success,
                finishedAt: new Date(),
                duplicateId: isDuplicate ? prevVersion.id : null,
                changedLines,
                isDuplicate,
                configHash: isDuplicate ? null : configHash,
                configText: isDuplicate ? null : output,
            },
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        await prisma.configVersion.update({
            where: { id: backup.id },
            data: {
                error: errorMessage,
                finishedAt: new Date(),
                status: BackupStatus.Failed,
            },
        });

        throw error;
    }

    return;
}

async function getConfig({
    protocol,
    host,
    port,
    username,
    password,
    commands,
}: {
    protocol: Protocol;
    host: string;
    port: number;
    username: string;
    password: string;
    commands: string[];
}) {
    if (protocol === Protocol.Telnet) {
        const client = await connectTelnet({
            host,
            port,
            username,
            password,
        });

        const output = await execTelnet(client, commands);

        // TODO: check
        if (client && typeof client.end === "function") {
            await client.end();
        } else if (client && typeof client.destroy === "function") {
            client.destroy();
        }

        return sanitizeOutput(output);
    }

    const client = await connectSSH({
        host,
        port,
        username,
        password,
    });

    const output = await execShell(client, commands);

    client.end();

    // TODO: check
    // client.destroy();

    return sanitizeOutput(output);
}

function sanitizeOutput(output: string) {
    return output.split("\0").join("");
}

function calcChangedLines({
    prev,
    current,
}: {
    prev: string;
    current: string;
}) {
    const diff = diffLines(prev, current);

    return diff.reduce((count, part) => {
        // Count added or removed lines
        if (part.added || part.removed) {
            return count + (part.count || 0);
        }

        return count;
    }, 0);
}
