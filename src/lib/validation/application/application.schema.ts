import z from "zod";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const paginationSchema = z.object({
    page: z.coerce.number().default(1),
    limit: z.coerce.number().max(MAX_LIMIT).default(DEFAULT_LIMIT),
});

export const createQueryArraySchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
    z
        .union([z.array(itemSchema), itemSchema])
        .transform((value) => (Array.isArray(value) ? value : [value]));
