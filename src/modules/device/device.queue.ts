import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { QueueName } from "@/worker/worker.const.js";
import { addDIResolverName } from "@/lib/awilix/awilix.js";

export const createQueue = (redis: Redis) => {
    return new Queue(QueueName.Backup, {
        connection: redis,
    });
};

addDIResolverName(createQueue, "backupQueue");
