import { Job } from "bullmq";
import { logger } from "../worker.utils.js";
import { JobName } from "../worker.const.js";
import { connectSSH, execShell } from "../ssh.js";
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
        const device = {
            id: "1",
            ip: "10.10.1.27",
            username: String(process.env.SSH_USERNAME),
            password: String(process.env.SSH_PASSWORD),
        };

        if (!device) {
            throw new Error("Device not found");
        }
        // console.log(device);
        // console.log("Start connection...");

        const client = await connectSSH({
            host: device.ip,
            username: device.username,
            password: device.password,
        });

        // console.log("Connected...");

        // const output_test = await execShell(client, "terminal length 0\nshow version");
        // console.log(output_test)
        // const output = await execShell(client, [
        await execShell(client, [
            "terminal length 0",
            "show startup-config",
        ]);
        // console.log(output);

        // logger.info({ output }, "SSH command output");

        client.end();

        return;
    }
    }
}
