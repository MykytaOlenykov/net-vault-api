import fp from "fastify-plugin";
import { Redis } from "ioredis";
import { FastifyInstance } from "fastify";
import { FastifyPlugin } from "@/lib/fastify/fastify.constant.js";

const REDIS_RETRY_DELAY_MAX_MS = 20_000;
const REDIS_RETRY_DELAY_MIN_MS = 1_000;

const configureRedis = async (fastify: FastifyInstance) => {
    const redis = new Redis(
        fastify.config.REDIS_PORT,
        fastify.config.REDIS_HOST,
        {
            maxRetriesPerRequest: null,
            retryStrategy(times: number) {
                return Math.max(
                    Math.min(Math.exp(times), REDIS_RETRY_DELAY_MAX_MS),
                    REDIS_RETRY_DELAY_MIN_MS
                );
            },
        }
    );

    try {
        await redis.ping();
        fastify.log.info("Redis connected");
    } catch (err) {
        fastify.log.error(err, "Redis connection failed");
        throw err;
    }

    fastify.decorate("redis", redis);

    fastify.addHook("onClose", async () => {
        await redis.quit();
    });
};

export default fp(configureRedis, {
    name: FastifyPlugin.Redis,
    dependencies: [FastifyPlugin.Env],
});
