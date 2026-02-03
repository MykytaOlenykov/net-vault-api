import z from "zod";

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

export type GetDevicesWithConfigChangesResponse = z.infer<
    typeof getDevicesWithConfigChangesResponseSchema
>;
