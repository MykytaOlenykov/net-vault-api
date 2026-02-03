import { FastifyReply, FastifyRequest } from "fastify";
import { AnalyticsService } from "./analytics.service.js";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { GetAnalyticsResponse } from "@/lib/validation/analytics/analytics.schema.js";
import { GetDevicesWithConfigChangesResponse } from "@/lib/validation/analytics/devices-with-config-changes.schema.js";

export type AnalyticsHandler = {
    getAnalytics: (
        request: FastifyRequest,
        reply: FastifyReply
    ) => Promise<void>;

    getDevicesWithConfigChanges: (
        request: FastifyRequest,
        reply: FastifyReply
    ) => Promise<void>;
};

export const createAnalyticsHandler = (
    analyticsService: AnalyticsService
): AnalyticsHandler => {
    return {
        // 🔹 існуючий endpoint — БЕЗ ЗМІН
        getAnalytics: async (_request, reply) => {
            const data = await analyticsService.getAnalytics();

            const response: GetAnalyticsResponse = {
                data,
            };

            return reply.status(200).send(response);
        },

        // 🔹 НОВИЙ endpoint для таблиці
        getDevicesWithConfigChanges: async (_request, reply) => {
            const data = await analyticsService.getDevicesWithConfigChanges();

            const response: GetDevicesWithConfigChangesResponse = {
                data,
            };

            return reply.status(200).send(response);
        },
    };
};

addDIResolverName(createAnalyticsHandler, "analyticsHandler");
