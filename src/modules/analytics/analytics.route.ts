import { FastifyInstance } from "fastify";
import { AnalyticsHandler } from "./analytics.handler.js";
import { getAnalyticsResponseSchema } from "@/lib/validation/analytics/analytics.schema.js";

export const createAnalyticsRoutes = (
    fastify: FastifyInstance,
    analyticsHandler: AnalyticsHandler
) => {
    fastify.get(
        "/",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["analytics"],
                response: {
                    200: getAnalyticsResponseSchema,
                },
            },
        },
        analyticsHandler.getAnalytics
    );
};
