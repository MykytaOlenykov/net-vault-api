import { Worker } from "bullmq";
import { redis } from "./worker.redis.js";
import { logger } from "./worker.utils.js";
import { QueueName } from "./worker.const.js";
import { backupProcessor } from "./processors/backup.processor.js";

export function startBackupWorker() {
    const worker = new Worker(QueueName.Backup, backupProcessor, {
        connection: redis,
        concurrency: 5,
    });

    worker.on("failed", (job, err) => {
        logger.error(
            { jobId: job?.id, name: job?.name, err },
            "Backup worker job failed"
        );
    });

    return worker;
}
