import { Job } from "bullmq";
import { logger } from "../worker.utils.js";
import { JobName } from "../worker.const.js";

export async function backupProcessor(job: Job) {
    switch (job.name) {
    case JobName.CheckBackupSchedule:
        logger.info(job.data, "Checking backup schedule...");

        return;

    case JobName.CreateBackup:
        logger.info(job.data, "Creating backup...");

        return;

    default:
        throw new Error(`Unknown job: ${job.name}`);
    }
}
