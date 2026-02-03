import { FastifyReply, FastifyRequest } from "fastify";
import { AnalyticsService } from "./analytics.service.js";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { GetAnalyticsResponse } from "@/lib/validation/analytics/analytics.schema.js";
import { GetDevicesWithConfigChangesResponse } from "@/lib/validation/analytics/analytics.schema.js";

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
        getAnalytics: async (_request, reply) => {
            const data = await analyticsService.getAnalytics();

            const response: GetAnalyticsResponse = {
                data,
            };

            return reply.status(200).send(response);
        },

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
