import { Queue } from "bullmq";
import { redis } from "../worker.redis.js";
import { QueueName } from "../worker.const.js";

export const backupQueue = new Queue(QueueName.Backup, {
    connection: redis,
});
