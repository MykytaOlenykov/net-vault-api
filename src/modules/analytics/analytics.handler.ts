import { FastifyRequest, FastifyReply } from "fastify";
import { AnalyticsService } from "./analytics.service.js";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { GetAnalyticsResponse } from "@/lib/validation/analytics/analytics.schema.js";

export type AnalyticsHandler = {
    getAnalytics: (
        request: FastifyRequest,
        reply: FastifyReply
    ) => Promise<void>;
};

export const createAnalyticsRoutes = (
    analyticsService: AnalyticsService
): AnalyticsHandler => {
    return {
        getAnalytics: async (_request, reply) => {
            const { deviceTotal, backupTotals, backupTotalLast24Hours } =
                await analyticsService.getAnalytics();

            const response: GetAnalyticsResponse = {
                data: {
                    deviceTotal,
                    backupTotals,
                    backupTotalLast24Hours,
                },
            };

            return reply.status(200).send(response);
        },
    };
};

addDIResolverName(createAnalyticsRoutes, "analyticsHandler");
