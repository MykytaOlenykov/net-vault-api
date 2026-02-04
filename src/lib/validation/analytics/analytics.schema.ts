import z from "zod";

export const getAnalyticsResponseSchema = z.object({
    data: z.object({
        deviceTotal: z.number(),
        backupTotals: z.array(
            z.object({ status: z.string(), _count: z.number() })
        ),
        backupTotalLast24Hours: z.number(),
    }),
});

export const getDevicesWithConfigChangesResponseSchema = z.object({
    data: z.object({
        total: z.number(),
        devices: z.array(
            z.object({
                id: z.string(),
                name: z.string(),
                configChanges: z.number(),
                lastBackup: z.date().nullable(),
            })
        ),
    }),
});

export type GetAnalyticsResponse = z.infer<typeof getAnalyticsResponseSchema>;

export type GetDevicesWithConfigChangesResponse = z.infer<
    typeof getDevicesWithConfigChangesResponseSchema
>;
