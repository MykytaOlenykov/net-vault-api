import { FastifyInstance } from "fastify";
import { createAnalyticsRoutes } from "./analytics.route.js";

// Define the endpoint prefix by providing autoPrefix module property.
export const autoPrefix = "/api/analytics";

export default async function (fastify: FastifyInstance) {
    const analyticsHandler = fastify.di.resolve("analyticsHandler");
    createAnalyticsRoutes(fastify, analyticsHandler);
}
