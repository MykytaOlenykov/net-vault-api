import { NotFoundError } from "@/lib/errors/errors.js";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { PrismaClient, BackupStatus } from "@prisma/client";
import { getPaginationParams } from "@/lib/utils/pagination.util.js";
import { ConfigVersionRepository } from "@/database/repositories/config-version/config-version.repository.js";
import {
    CompareConfigsResponse,
    GetAllDevicesWithConfigsResponse,
    GetConfigVersionByIdResponse,
    GetConfigVersionsQuerystring,
    GetConfigVersionsResponse,
    GetLastConfigVersionResponse,
} from "@/lib/validation/config-version/config-version.schema.js";

export type ConfigVersionService = {
    getConfigVersions: (args: {
        deviceId: string;
        query: GetConfigVersionsQuerystring;
    }) => Promise<GetConfigVersionsResponse>;

    getConfigVersionById: (args: {
        configId: string;
    }) => Promise<GetConfigVersionByIdResponse>;

    getLastConfigVersion: (args: {
        deviceId: string;
    }) => Promise<GetLastConfigVersionResponse>;

    getAllDevicesWithConfigs: () => Promise<GetAllDevicesWithConfigsResponse>;

    compareConfigs: (args: {
        leftConfigId: string;
        rightConfigId: string;
    }) => Promise<CompareConfigsResponse>;
};

export const createService = (
    prisma: PrismaClient,
    configVersionRepository: ConfigVersionRepository
): ConfigVersionService => {
    return {
        getConfigVersions: async ({ deviceId, query }) => {
            const { limit, page } = query;

            const { skip, take } = getPaginationParams({ page, limit });

            const [configVersions, total] = await prisma.$transaction([
                configVersionRepository.findMany({
                    where: {
                        deviceId,
                        status: BackupStatus.Success,
                        isDuplicate: false,
                    },
                    orderBy: {
                        startedAt: "desc",
                    },
                    skip,
                    take,
                    select: {
                        id: true,
                        deviceId: true,
                        versionNumber: true,
                        status: true,
                        startedAt: true,
                        finishedAt: true,
                        configText: true,
                        configHash: true,
                        changedLines: true,
                        isDuplicate: true,
                        error: true,
                    },
                }),
                configVersionRepository.count({
                    where: {
                        deviceId,
                        status: BackupStatus.Success,
                    },
                }),
            ]);

            return { data: { configVersions, total } };
        },

        getConfigVersionById: async ({ configId }) => {
            const configVersion =
                await configVersionRepository.findUniqueOrFail({
                    where: {
                        id: configId,
                    },
                    select: {
                        id: true,
                        deviceId: true,
                        versionNumber: true,
                        status: true,
                        startedAt: true,
                        finishedAt: true,
                        configText: true,
                        configHash: true,
                        changedLines: true,
                        isDuplicate: true,
                        error: true,
                    },
                });

            return { data: { configVersion } };
        },

        getLastConfigVersion: async ({ deviceId }) => {
            const configVersion = await configVersionRepository.findFirst({
                where: {
                    deviceId,
                    status: BackupStatus.Success,
                    isDuplicate: false,
                },
                select: {
                    id: true,
                    deviceId: true,
                    versionNumber: true,
                    status: true,
                    startedAt: true,
                    finishedAt: true,
                    configText: true,
                    configHash: true,
                    changedLines: true,
                    isDuplicate: true,
                    error: true,
                },
                orderBy: [{ startedAt: "desc" }],
            });

            if (!configVersion) {
                throw new NotFoundError("Config version not found.");
            }

            return { data: { configVersion } };
        },

        getAllDevicesWithConfigs: async () => {
            const devices = await prisma.device.findMany({
                select: {
                    id: true,
                    name: true,
                    ipAddress: true,
                    configVersions: {
                        where: {
                            status: BackupStatus.Success,
                            isDuplicate: false,
                        },
                        select: {
                            id: true,
                            deviceId: true,
                            versionNumber: true,
                            status: true,
                            startedAt: true,
                            finishedAt: true,
                            configText: true,
                            configHash: true,
                            changedLines: true,
                            isDuplicate: true,
                            error: true,
                        },
                        orderBy: {
                            startedAt: "desc",
                        },
                    },
                },
            });

            return {
                data: {
                    devices: devices.map((device) => ({
                        id: device.id,
                        name: device.name,
                        ipAddress: device.ipAddress,
                        configVersions: device.configVersions,
                    })),
                },
            };
        },

        compareConfigs: async ({ leftConfigId, rightConfigId }) => {
            const [leftConfig, rightConfig] = await Promise.all([
                configVersionRepository.findUniqueOrFail({
                    where: { id: leftConfigId },
                    select: {
                        id: true,
                        deviceId: true,
                        versionNumber: true,
                        startedAt: true,
                        configText: true,
                        device: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                }),
                configVersionRepository.findUniqueOrFail({
                    where: { id: rightConfigId },
                    select: {
                        id: true,
                        deviceId: true,
                        versionNumber: true,
                        startedAt: true,
                        configText: true,
                        device: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                }),
            ]);

            const formatDate = (date: Date): string => {
                return date.toISOString().split("T")[0];
            };

            return {
                data: {
                    left: {
                        content: leftConfig.configText || "",
                        filename: `v${leftConfig.versionNumber}`,
                        date: formatDate(leftConfig.startedAt),
                        deviceId: leftConfig.device.id,
                        deviceName: leftConfig.device.name,
                    },
                    right: {
                        content: rightConfig.configText || "",
                        filename: `v${rightConfig.versionNumber}`,
                        date: formatDate(rightConfig.startedAt),
                        deviceId: rightConfig.device.id,
                        deviceName: rightConfig.device.name,
                    },
                },
            };
        },
    };
};

addDIResolverName(createService, "configVersionService");
