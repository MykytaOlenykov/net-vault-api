import z from "zod";
import { BackupStatus } from "@prisma/client";
import { paginationSchema } from "@/lib/validation/application/application.schema.js";

export const configVersionSchema = z.object({
    id: z.string(),

    deviceId: z.string(),

    versionNumber: z.number(),

    status: z.enum(BackupStatus),

    startedAt: z.date(),
    finishedAt: z.date().nullable(),

    configText: z.string().nullable(),
    configHash: z.string().nullable(),

    changedLines: z.number().nullable(),

    isDuplicate: z.boolean(),

    error: z.string().nullable(),
});

export const configVersionParamsSchema = z.object({
    configId: z.uuid(),
});

export type ConfigVersionParams = z.infer<typeof configVersionParamsSchema>;

export const getConfigVersionsQuerystringSchema = paginationSchema.extend({});

export type GetConfigVersionsQuerystring = z.infer<
    typeof getConfigVersionsQuerystringSchema
>;

export const getConfigVersionsResponseSchema = z.object({
    data: z.object({
        configVersions: z.array(configVersionSchema),
        total: z.number(),
    }),
});

export type GetConfigVersionsResponse = z.infer<
    typeof getConfigVersionsResponseSchema
>;

export const getConfigVersionByIdResponseSchema = z.object({
    data: z.object({
        configVersion: configVersionSchema,
    }),
});

export type GetConfigVersionByIdResponse = z.infer<
    typeof getConfigVersionByIdResponseSchema
>;

export const getLastConfigVersionResponseSchema = z.object({
    data: z.object({
        configVersion: configVersionSchema,
    }),
});

export type GetLastConfigVersionResponse = z.infer<
    typeof getLastConfigVersionResponseSchema
>;

// Schema for device with config versions
export const deviceWithConfigsSchema = z.object({
    id: z.string(),
    name: z.string(),
    ipAddress: z.string(),
    configVersions: z.array(configVersionSchema),
});

export const getAllDevicesWithConfigsResponseSchema = z.object({
    data: z.object({
        devices: z.array(deviceWithConfigsSchema),
    }),
});

export type GetAllDevicesWithConfigsResponse = z.infer<
    typeof getAllDevicesWithConfigsResponseSchema
>;

// Schema for config comparison
export const compareConfigsQuerystringSchema = z.object({
    leftConfigId: z.string().uuid(),
    rightConfigId: z.string().uuid(),
});

export type CompareConfigsQuerystring = z.infer<
    typeof compareConfigsQuerystringSchema
>;

export const configDiffItemSchema = z.object({
    content: z.string(),
    filename: z.string(),
    date: z.string(),
    deviceId: z.string(),
    deviceName: z.string(),
});

export const compareConfigsResponseSchema = z.object({
    data: z.object({
        left: configDiffItemSchema,
        right: configDiffItemSchema,
    }),
});

export type CompareConfigsResponse = z.infer<
    typeof compareConfigsResponseSchema
>;
