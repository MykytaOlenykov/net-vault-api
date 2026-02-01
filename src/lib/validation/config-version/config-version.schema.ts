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
        configVersions: z.array(
            configVersionSchema.omit({
                configHash: true,
                configText: true,
                error: true,
            })
        ),
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
