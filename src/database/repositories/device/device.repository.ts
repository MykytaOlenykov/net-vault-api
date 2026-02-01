import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundError } from "@/lib/errors/errors.js";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { FindUniqueOrFail } from "@/database/prisma/prisma.type.js";
import { BaseRepository, generateRepository } from "../generate.repository.js";

export type DeviceRepository = BaseRepository<"device"> & {
    findUniqueOrFail: FindUniqueOrFail<
        Prisma.DeviceFindUniqueArgs,
        Prisma.$DevicePayload
    >;
};

export const deviceSelect = {
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
    protocol: true,

    deviceTags: {
        select: {
            tag: {
                select: {
                    name: true,
                },
            },
        },
    },
} satisfies Prisma.DeviceSelect;

export const createDeviceRepository = (
    prisma: PrismaClient
): DeviceRepository => {
    const repository = generateRepository(prisma, "Device");

    return {
        ...repository,
        findUniqueOrFail: async (args) => {
            const device = await prisma.device.findUnique(args);

            if (!device) {
                throw new NotFoundError("Device not found.");
            }

            return device;
        },
    };
};

addDIResolverName(createDeviceRepository, "deviceRepository");
