import z from "zod";

export const tokenPayloadSchema = z.object({
    userId: z.uuid(),
});

export type TokenPayload = z.infer<typeof tokenPayloadSchema>;

export const loginBodySchema = z.object({
    email: z.email(),
    password: z.string().nonempty(),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

const userSchema = z.object({
    id: z.uuid(),
    email: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const loginResponseSchema = z.object({
    data: z.object({
        user: userSchema,
        token: z.string(),
    }),
    message: z.string({}),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const currentUserResponseSchema = z.object({
    data: z.object({
        currentUser: userSchema,
    }),
});

export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>;
