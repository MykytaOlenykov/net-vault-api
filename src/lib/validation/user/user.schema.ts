import z from "zod";
import { paginationSchema, createQueryArraySchema } from "@/lib/validation/application/application.schema.js";

export const userStatusSchema = z.enum(["active", "inactive", "pending"]);
export type UserStatus = z.infer<typeof userStatusSchema>;

const userSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    status: userStatusSchema,
    lastLogin: z.string(),
});

export const userParamsSchema = z.object({
    userId: z.uuid(),
});

export type UserParams = z.infer<typeof userParamsSchema>;

export const getUsersQuerystringSchema = paginationSchema.extend({
    role: z.string().optional(),
    status: createQueryArraySchema(userStatusSchema).optional(),
    search: z.string().optional(),
});

export type GetUsersQuerystring = z.infer<typeof getUsersQuerystringSchema>;

export const getUsersResponseSchema = z.object({
    data: z.object({
        users: z.array(userSchema),
        total: z.number(),
    }),
});

export type GetUsersResponse = z.infer<typeof getUsersResponseSchema>;

export const inviteUserBodySchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(1),
    role: z.string().min(1),
});

export type InviteUserBody = z.infer<typeof inviteUserBodySchema>;

export const inviteUserResponseSchema = z.object({
    data: z.object({
        user: userSchema,
    }),
});

export type InviteUserResponse = z.infer<typeof inviteUserResponseSchema>;

export const updateUserBodySchema = z.object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    status: userStatusSchema.optional(),
});

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

export const updateUserResponseSchema = z.object({
    data: z.object({
        user: userSchema,
    }),
});

export type UpdateUserResponse = z.infer<typeof updateUserResponseSchema>;

export const changeRoleBodySchema = z.object({
    role: z.string().min(1),
});

export type ChangeRoleBody = z.infer<typeof changeRoleBodySchema>;

export const changeRoleResponseSchema = z.object({
    data: z.object({
        user: userSchema,
    }),
});

export type ChangeRoleResponse = z.infer<typeof changeRoleResponseSchema>;

export const getUserByIdResponseSchema = z.object({
    data: z.object({
        user: userSchema,
    }),
});

export type GetUserByIdResponse = z.infer<typeof getUserByIdResponseSchema>;

export const getRolesResponseSchema = z.object({
    data: z.object({
        roles: z.array(
            z.object({
                id: z.string(),
                name: z.string(),
                description: z.string().nullable(),
            })
        ),
    }),
});

export type GetRolesResponse = z.infer<typeof getRolesResponseSchema>;

