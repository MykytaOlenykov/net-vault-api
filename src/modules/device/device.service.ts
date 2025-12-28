import { Prisma, PrismaClient } from "@prisma/client";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { getPaginationParams } from "@/lib/utils/pagination.util.js";
import {
    DeviceRepository,
    deviceSelect,
} from "@/database/repositories/device/device.repository.js";
import {
    CreateDeviceBody,
    CreateDeviceResponse,
    GetDeviceByIdResponse,
    GetDevicesQuerystring,
    GetDevicesResponse,
    GetDeviceTypesResponse,
    GetTagsResponse,
    UpdateDeviceResponse,
} from "@/lib/validation/device/device.schema.js";

export type DeviceService = {
    getDevices: (args: {
        query: GetDevicesQuerystring;
    }) => Promise<GetDevicesResponse>;

    createDevice: (args: {
        payload: CreateDeviceBody;
    }) => Promise<CreateDeviceResponse>;

    updateDevice: (args: {
        deviceId: string;
        payload: CreateDeviceBody;
    }) => Promise<UpdateDeviceResponse>;

    getDeviceById: (args: {
        deviceId: string;
    }) => Promise<GetDeviceByIdResponse>;

    deleteDeviceById: (args: { deviceId: string }) => Promise<void>;

    getTags: () => Promise<GetTagsResponse>;

    getTypes: () => Promise<GetDeviceTypesResponse>;
};

export const createService = (
    prisma: PrismaClient,
    deviceRepository: DeviceRepository
): DeviceService => {
    async function prepareDeviceRelations(
        tx: Prisma.TransactionClient,
        tags: string[]
    ) {
        const uniqueTags = [...new Set(tags)];

        let tagIds: { id: string }[] = [];

        if (uniqueTags.length) {
            const existingTags = await tx.tag.findMany({
                where: {
                    name: { in: uniqueTags },
                },
                select: { id: true, name: true },
            });

            const existingTagIdsByName = new Map(
                existingTags.map(({ id, name }) => [name, id])
            );

            const { create, connect } = uniqueTags.reduce<{
                create: { name: string }[];
                connect: { id: string }[];
            }>(
                (acc, tagName) => {
                    const tagId = existingTagIdsByName.get(tagName);

                    if (tagId) {
                        acc.connect.push({ id: tagId });
                    } else {
                        acc.create.push({ name: tagName });
                    }

                    return acc;
                },
                { create: [], connect: [] }
            );

            const createdTags = create.length
                ? await tx.tag.createManyAndReturn({
                    data: create,
                    select: { id: true },
                })
                : [];

            tagIds = [...connect, ...createdTags];
        }

        return tagIds;
    }

    return {
        getDevices: async ({ query }) => {
            const { limit, page } = query;

            const { skip, take } = getPaginationParams({ page, limit });

            const [devices, total] = await prisma.$transaction([
                deviceRepository.findMany({
                    select: deviceSelect,
                    skip,
                    take,
                }),
                deviceRepository.count(),
            ]);

            return { data: { devices, total } };
        },

        createDevice: async ({ payload: { tags, ...payload } }) => {
            const device = await prisma.$transaction(async (tx) => {
                const tagIds = await prepareDeviceRelations(tx, tags);

                return tx.device.create({
                    data: {
                        ...payload,
                        deviceTags: {
                            createMany: {
                                data: tagIds.map(({ id }) => ({ tagId: id })),
                            },
                        },
                    },
                    select: deviceSelect,
                });
            });

            return { data: { device } };
        },

        updateDevice: async ({ deviceId, payload: { tags, ...payload } }) => {
            await deviceRepository.findUniqueOrFail({
                where: { id: deviceId },
            });

            const device = await prisma.$transaction(async (tx) => {
                const tagIds = await prepareDeviceRelations(tx, tags);

                await tx.deviceTag.deleteMany({ where: { deviceId } });

                return tx.device.update({
                    where: { id: deviceId },
                    data: {
                        ...payload,
                        deviceTags: {
                            createMany: {
                                data: tagIds.map(({ id }) => ({ tagId: id })),
                            },
                        },
                    },
                    select: deviceSelect,
                });
            });

            return { data: { device } };
        },

        deleteDeviceById: async ({ deviceId }) => {
            await deviceRepository.findUniqueOrFail({
                where: { id: deviceId },
            });

            await deviceRepository.delete({ where: { id: deviceId } });
        },

        getDeviceById: async ({ deviceId }) => {
            const device = await deviceRepository.findUniqueOrFail({
                where: { id: deviceId },
                select: deviceSelect,
            });

            return { data: { device } };
        },

        getTags: async () => {
            const tags = await prisma.tag.findMany({ select: { name: true } });

            return { data: { tags: tags.map(({ name }) => name) } };
        },

        getTypes: async () => {
            const types = await prisma.deviceType.findMany({
                select: { id: true, vendor: true },
            });

            return { data: { types } };
        },
    };
};

addDIResolverName(createService, "deviceService");
