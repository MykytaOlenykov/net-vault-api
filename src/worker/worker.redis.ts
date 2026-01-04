import { Redis } from "ioredis";

const REDIS_RETRY_DELAY_MAX_MS = 20_000;
const REDIS_RETRY_DELAY_MIN_MS = 1_000;

const { REDIS_PORT, REDIS_HOST } = process.env;

if (!REDIS_HOST || !REDIS_PORT) {
    throw new Error("'REDIS_HOST' and 'REDIS_PORT' required");
}

export const redis = new Redis(Number(REDIS_PORT), REDIS_HOST, {
    maxRetriesPerRequest: null,
    retryStrategy(times: number) {
        return Math.max(
            Math.min(Math.exp(times), REDIS_RETRY_DELAY_MAX_MS),
            REDIS_RETRY_DELAY_MIN_MS
        );
    },
});
