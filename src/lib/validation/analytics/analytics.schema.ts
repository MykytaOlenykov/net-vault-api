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

export type GetAnalyticsResponse = z.infer<typeof getAnalyticsResponseSchema>;
