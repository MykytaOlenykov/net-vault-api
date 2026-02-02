import { JobState } from "bullmq";
import { Prisma, PrismaClient } from "@prisma/client";
import { ConflictError } from "@/lib/errors/errors.js";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { BackupQueue } from "@/worker/types/backup.type.js";
import { SecretsService } from "@/lib/aws/secrets.service.js";
import { getBackupScheduleKey } from "@/worker/worker.utils.js";
import { getPaginationParams } from "@/lib/utils/pagination.util.js";
import {
    BackupJobName,
    DEFAULT_SCHEDULE_PATTERN,
    SCHEDULE_TZ,
} from "@/worker/worker.const.js";
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
    UpdateDeviceBody,
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
        payload: UpdateDeviceBody;
    }) => Promise<UpdateDeviceResponse>;

    getDeviceById: (args: {
        deviceId: string;
    }) => Promise<GetDeviceByIdResponse>;

    deleteDeviceById: (args: { deviceId: string }) => Promise<void>;

    getTags: () => Promise<GetTagsResponse>;

    getTypes: () => Promise<GetDeviceTypesResponse>;

    triggerBackup: (args: { deviceId: string }) => Promise<{ message: string }>;
};

export const createService = (
    prisma: PrismaClient,
    deviceRepository: DeviceRepository,
    backupQueue: BackupQueue,
    secretsService: SecretsService
): DeviceService => {
    const ACTIVE_BACKUP_JOB_STATES = new Set<JobState | "unknown">([
        "waiting",
        "active",
        "delayed",
    ]);

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
                    select: {
                        ...deviceSelect,
                        configVersions: {
                            select: { startedAt: true },
                            orderBy: { startedAt: "desc" },
                            take: 1,
                        },
                    },
                    skip,
                    take,
                }),
                deviceRepository.count(),
            ]);

            return {
                data: {
                    devices: devices.map((d) => ({
                        ...d,
                        lastBackup: d.configVersions[0]?.startedAt ?? null,
                    })),
                    total,
                },
            };
        },

        createDevice: async ({
            payload: { tags, username, password, ...payload },
        }) => {
            const secretRef = await secretsService.createSecret(password);

            const device = await prisma.$transaction(async (tx) => {
                const tagIds = await prepareDeviceRelations(tx, tags);

                // TODO: add aws
                const credential = await tx.credential.create({
                    data: {
                        secretRef,
                        username,
                    },
                });

                return tx.device.create({
                    data: {
                        ...payload,
                        deviceTags: {
                            createMany: {
                                data: tagIds.map(({ id }) => ({ tagId: id })),
                            },
                        },
                        credentialId: credential.id,
                    },
                    select: deviceSelect,
                });
            });

            if (device.isActive) {
                await backupQueue.upsertJobScheduler(
                    getBackupScheduleKey(device.id),
                    {
                        pattern:
                            device.backupSchedule ?? DEFAULT_SCHEDULE_PATTERN,
                        tz: SCHEDULE_TZ,
                    },
                    {
                        name: BackupJobName.CreateBackup,
                        data: { deviceId: device.id },
                        opts: {
                            removeOnComplete: true,
                            removeOnFail: true,
                        },
                    }
                );
            }

            return { data: { device } };
        },

        updateDevice: async ({ deviceId, payload: { tags, ...payload } }) => {
            const { backupSchedule, isActive } =
                await deviceRepository.findUniqueOrFail({
                    where: { id: deviceId },
                    select: {
                        backupSchedule: true,
                        isActive: true,
                    },
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

            const isChanged = device.backupSchedule !== backupSchedule;

            if (
                (isChanged && device.isActive) ||
                (isActive && !device.isActive)
            ) {
                await backupQueue.removeJobScheduler(
                    getBackupScheduleKey(device.id)
                );
            }

            if (isChanged && device.isActive) {
                await backupQueue.upsertJobScheduler(
                    getBackupScheduleKey(device.id),
                    {
                        pattern:
                            device.backupSchedule ?? DEFAULT_SCHEDULE_PATTERN,
                        tz: SCHEDULE_TZ,
                    },
                    {
                        name: BackupJobName.CreateBackup,
                        data: { deviceId: device.id },
                        opts: {
                            removeOnComplete: true,
                            removeOnFail: true,
                        },
                    }
                );
            }

            return { data: { device } };
        },

        deleteDeviceById: async ({ deviceId }) => {
            const device = await deviceRepository.findUniqueOrFail({
                where: { id: deviceId },
                select: {
                    id: true,
                    credential: {
                        select: {
                            secretRef: true,
                        },
                    },
                    credentialId: true,
                },
            });

            await secretsService.deleteSecret(device.credential.secretRef);

            await prisma.$transaction(async (tx) => {
                await Promise.all([
                    tx.device.delete({ where: { id: deviceId } }),
                    tx.credential.delete({
                        where: { id: device.credentialId },
                    }),
                ]);
            });

            await backupQueue.removeJobScheduler(
                getBackupScheduleKey(device.id)
            );
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

        triggerBackup: async ({ deviceId }) => {
            const device = await deviceRepository.findUniqueOrFail({
                where: { id: deviceId },
                select: {
                    id: true,
                },
            });

            const jobId = `backup:${deviceId}`;

            const existingJob = await backupQueue.getJob(jobId);

            if (existingJob) {
                const state = await existingJob.getState();

                if (ACTIVE_BACKUP_JOB_STATES.has(state)) {
                    throw new ConflictError("Backup is already in progress");
                }
            }

            await backupQueue.add(
                BackupJobName.CreateBackup,
                { deviceId: device.id },
                { jobId }
            );

            return { message: "Backup process has been triggered" };
        },
    };
};

addDIResolverName(createService, "deviceService");
