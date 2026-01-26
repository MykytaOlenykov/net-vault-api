import { Job } from "bullmq";
import { logger } from "../worker.utils.js";
import { JobName } from "../worker.const.js";
import { connectSSH, execShell } from "../connectors/ssh.js";
import { connectTelnet, execTelnet } from "../connectors/telnet.js";
// import { prisma } from "../worker.prisma.js";

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

        let output = "";
        const protocol = device.protocol || "ssh";

        const commands = device.commands;

        if (!commands) {
            throw new Error("Commands not found");
        }

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

        console.log(output);

        return;
    }
    }
}
