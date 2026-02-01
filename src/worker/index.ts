import "dotenv/config";
import { redis } from "./worker.redis.js";
import { logger } from "./worker.utils.js";
import { prisma } from "./worker.prisma.js";
import { startBackupWorker } from "@/worker/worker.js";

async function main() {
    await prisma.$connect();

    try {
        await redis.ping();
        logger.info("Redis connected");
    } catch (err) {
        logger.error(err, "Redis connection failed");
        throw err;
    }

    startBackupWorker();
}

await main();

async function shutdown() {
    logger.info("Worker shutting down...");
    await prisma.$disconnect();
    await redis.quit();
    process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
