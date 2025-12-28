import { PrismaClient } from "@prisma/client";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { getPaginationParams } from "@/lib/utils/pagination.util.js";
import { DeviceRepository } from "@/database/repositories/device/device.repository.js";
import {
    GetDevicesQuerystring,
    GetDevicesResponse,
} from "@/lib/validation/device/device.schema.js";

export type DeviceService = {
    getDevices: (args: {
        query: GetDevicesQuerystring;
    }) => Promise<GetDevicesResponse>;
};

export const createService = (
    prisma: PrismaClient,
    deviceRepository: DeviceRepository
): DeviceService => {
    return {
        getDevices: async ({ query }) => {
            const { limit, page } = query;

            const { skip, take } = getPaginationParams({ page, limit });

            const [devices, total] = await prisma.$transaction([
                deviceRepository.findMany({
                    select: {
                        id: true,
                        name: true,
                        ipAddress: true,
                        port: true,

                        deviceType: {
                            select: {
                                id: true,
                                vendor: true,
                            },
                        },

                        backupSchedule: true,

                        isActive: true,
                        createdAt: true,
                        updatedAt: true,

                        deviceTags: {
                            select: {
                                tag: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                    skip,
                    take,
                }),
                deviceRepository.count(),
            ]);

            return { data: { devices, total } };
        },
    };
};

addDIResolverName(createService, "deviceService");
