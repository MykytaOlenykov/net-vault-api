import { PrismaClient } from "@prisma/client";
import { NotFoundError } from "@/lib/errors/errors.js";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { getPaginationParams } from "@/lib/utils/pagination.util.js";
import { ConfigVersionRepository } from "@/database/repositories/config-version/config-version.repository.js";
import {
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
                    },
                    orderBy: {
                        versionNumber: "desc",
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
                        changedLines: true,
                        isDuplicate: true,
                    },
                }),
                configVersionRepository.count(),
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
                orderBy: [{ versionNumber: "desc" }],
            });

            if (!configVersion) {
                throw new NotFoundError("Config version not found.");
            }

            return { data: { configVersion } };
        },
    };
};

addDIResolverName(createService, "configVersionService");
