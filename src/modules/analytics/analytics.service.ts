import { BackupStatus } from "@prisma/client";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { DeviceRepository } from "@/database/repositories/device/device.repository.js";
import { ConfigVersionRepository } from "@/database/repositories/config-version/config-version.repository.js";
import {
    GetAnalyticsResponse,
    GetDevicesWithConfigChangesResponse,
} from "@/lib/validation/analytics/analytics.schema.js";

export type AnalyticsService = {
    getAnalytics: () => Promise<GetAnalyticsResponse["data"]>;
    getDevicesWithConfigChanges: () => Promise<
        GetDevicesWithConfigChangesResponse["data"]
    >;
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
    getDevicesWithConfigChanges: async () => {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const aggregated = await configVersionRepository.groupBy({
            by: ["deviceId"],
            where: {
                startedAt: { gte: since },
                changedLines: { gt: 0 },
                isDuplicate: false,
                status: BackupStatus.Success,
            },
            _sum: {
                changedLines: true,
            },
            _max: {
                startedAt: true,
            },
        });

        if (!aggregated.length) {
            return { total: 0, devices: [] };
        }

        const deviceIds = aggregated.map((a) => a.deviceId);

        const devices = await deviceRepository.findMany({
            where: { id: { in: deviceIds } },
            select: {
                id: true,
                name: true,
            },
        });

        const deviceMap = new Map(devices.map((d) => [d.id, d.name]));

        const result = aggregated.map((row) => ({
            id: row.deviceId,
            name: deviceMap.get(row.deviceId) ?? "Unknown",
            configChanges: row._sum.changedLines ?? 0,
            lastBackup: row._max.startedAt,
        }));

        return {
            total: result.length,
            devices: result,
        };
    },
});

addDIResolverName(createAnalyticsService, "analyticsService");
