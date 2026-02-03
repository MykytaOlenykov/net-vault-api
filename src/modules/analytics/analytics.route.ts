import { FastifyInstance } from "fastify";
import { AnalyticsHandler } from "./analytics.handler.js";
import { getAnalyticsResponseSchema } from "@/lib/validation/analytics/analytics.schema.js";
import { getDevicesWithConfigChangesResponseSchema } from "@/lib/validation/analytics/devices-with-config-changes.schema.js";

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

    fastify.get(
        "/devices/config-changes",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["analytics"],
                summary: "Devices with config changes (last 24h)",
                response: {
                    200: getDevicesWithConfigChangesResponseSchema,
                },
            },
        },
        analyticsHandler.getDevicesWithConfigChanges
    );
};
