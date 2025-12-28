import z from "zod";
import { paginationSchema } from "@/lib/validation/application/application.schema.js";

const deviceSchema = z.object({
    id: z.string(),
    name: z.string(),
    ipAddress: z.string(),
    port: z.number(),

    deviceType: z.object({
        id: z.string(),
        vendor: z.string(),
    }),

    backupSchedule: z.string().nullable(),

    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),

    deviceTags: z.array(
        z.object({
            tag: z.object({
                name: z.string(),
            }),
        })
    ),
});

export const deviceParamsSchema = z.object({
    deviceId: z.uuid(),
});

export type DeviceParams = z.infer<typeof deviceParamsSchema>;

export const getDevicesQuerystringSchema = paginationSchema.extend({});

export type GetDevicesQuerystring = z.infer<typeof getDevicesQuerystringSchema>;

export const getDevicesResponseSchema = z.object({
    data: z.object({
        devices: z.array(deviceSchema),
        total: z.number(),
    }),
});

export type GetDevicesResponse = z.infer<typeof getDevicesResponseSchema>;

export const createDeviceBodySchema = z.object({
    name: z.string(),
    ipAddress: z.string(),
    port: z.number(),

    deviceTypeId: z.uuid(),

    backupSchedule: z.string().nullable(),

    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),

    tags: z.array(z.string()),
});

export type CreateDeviceBody = z.infer<typeof createDeviceBodySchema>;

export const createDeviceResponseSchema = z.object({
    data: z.object({
        device: deviceSchema,
    }),
});

export type CreateDeviceResponse = z.infer<typeof createDeviceResponseSchema>;

export const updateDeviceBodySchema = z.object({
    name: z.string(),
    ipAddress: z.string(),
    port: z.number(),

    deviceTypeId: z.uuid(),

    backupSchedule: z.string().nullable(),

    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),

    tags: z.array(z.string()),
});

export type UpdateDeviceBody = z.infer<typeof updateDeviceBodySchema>;

export const updateDeviceResponseSchema = z.object({
    data: z.object({
        device: deviceSchema,
    }),
});

export type UpdateDeviceResponse = z.infer<typeof createDeviceResponseSchema>;

export const getDeviceByIdResponseSchema = z.object({
    data: z.object({
        device: deviceSchema,
    }),
});

export type GetDeviceByIdResponse = z.infer<typeof getDeviceByIdResponseSchema>;

export const getTagsResponseSchema = z.object({
    data: z.object({
        tags: z.array(z.string()),
    }),
});

export type GetTagsResponse = z.infer<typeof getTagsResponseSchema>;

export const getDeviceTypesResponseSchema = z.object({
    data: z.object({
        types: z.array(
            z.object({
                id: z.string(),
                vendor: z.string(),
            })
        ),
    }),
});

export type GetDeviceTypesResponse = z.infer<
    typeof getDeviceTypesResponseSchema
>;
