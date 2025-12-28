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

export const getDevicesQuerystringSchema = paginationSchema.extend({});

export type GetDevicesQuerystring = z.infer<typeof getDevicesQuerystringSchema>;

export const getDevicesResponseSchema = z.object({
    data: z.object({
        devices: z.array(deviceSchema),
        total: z.number(),
    }),
});

export type GetDevicesResponse = z.infer<typeof getDevicesResponseSchema>;
