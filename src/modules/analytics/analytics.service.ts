import { BackupStatus } from "@prisma/client";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { GetAnalyticsResponse } from "@/lib/validation/analytics/analytics.schema.js";
import { DeviceRepository } from "@/database/repositories/device/device.repository.js";
import { ConfigVersionRepository } from "@/database/repositories/config-version/config-version.repository.js";

export type AnalyticsService = {
    getAnalytics: () => Promise<GetAnalyticsResponse["data"]>;
};

export const createAnalyticsService = (
    deviceRepository: DeviceRepository,
    configVersionRepository: ConfigVersionRepository
): AnalyticsService => ({
    getAnalytics: async () => {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        const [deviceTotal, backupGroupedTotal, backupTotalLast24Hours] =
            await Promise.all([
                deviceRepository.count(),
                configVersionRepository.groupBy({
                    where: { status: { not: BackupStatus.Running } },
                    by: "status",
                    _count: true,
                }),
                configVersionRepository.count({
                    where: { finishedAt: { gte: last24Hours } },
                }),
            ]);

        return {
            deviceTotal,
            backupTotals: backupGroupedTotal,
            backupTotalLast24Hours,
        };
    },
});

addDIResolverName(createAnalyticsService, "analyticsService");
