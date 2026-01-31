import { Prisma, PrismaClient } from "@prisma/client";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { getPaginationParams } from "@/lib/utils/pagination.util.js";
import { hashing } from "@/lib/hashing/hashing.js";
import {
    UserRepository,
    userSelect,
} from "@/database/repositories/user/user.repository.js";
import { RoleRepository } from "@/database/repositories/role/role.repository.js";
import {
    ChangeRoleBody,
    ChangeRoleResponse,
    GetRolesResponse,
    GetUserByIdResponse,
    GetUsersQuerystring,
    GetUsersResponse,
    InviteUserBody,
    InviteUserResponse,
    UpdateUserBody,
    UpdateUserResponse,
} from "@/lib/validation/user/user.schema.js";

export type UserService = {
    getUsers: (args: {
        query: GetUsersQuerystring;
    }) => Promise<GetUsersResponse>;

    inviteUser: (args: {
        payload: InviteUserBody;
    }) => Promise<InviteUserResponse>;

    updateUser: (args: {
        userId: string;
        payload: UpdateUserBody;
    }) => Promise<UpdateUserResponse>;

    changeRole: (args: {
        userId: string;
        payload: ChangeRoleBody;
    }) => Promise<ChangeRoleResponse>;

    getUserById: (args: {
        userId: string;
    }) => Promise<GetUserByIdResponse>;

    deleteUserById: (args: { userId: string }) => Promise<void>;

    getRoles: () => Promise<GetRolesResponse>;
};

function formatUserWithRole(
    user: Prisma.UserGetPayload<{ select: typeof userSelect }>
) {
    const role = user.userRoles[0]?.role?.name || "";
    const lastLogin = user.lastLogin
        ? new Date(user.lastLogin).toISOString()
        : "Never";
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        status: user.status,
        lastLogin,
    };
}

export const createService = (
    prisma: PrismaClient,
    userRepository: UserRepository,
    roleRepository: RoleRepository
): UserService => {
    return {
        getUsers: async ({ query }) => {
            const { limit, page, role, status, search } = query;

            const { skip, take } = getPaginationParams({ page, limit });

            const where: Prisma.UserWhereInput = {};

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ];
            }

            if (status) {
                where.status = { in: status };
            }

            if (role) {
                where.userRoles = {
                    some: {
                        role: {
                            name: role,
                        },
                    },
                };
            }

            const [users, total] = await prisma.$transaction([
                userRepository.findMany({
                    where,
                    select: userSelect,
                    skip,
                    take,
                    orderBy: { createdAt: "desc" },
                }),
                userRepository.count({ where }),
            ]);

            return {
                data: {
                    users: users.map(formatUserWithRole),
                    total,
                },
            };
        },

        inviteUser: async ({ payload: { name, email, password, role: roleName } }) => {
            const role = await roleRepository.findFirst({
                where: { name: roleName },
            });

            if (!role) {
                throw new Error(`Role "${roleName}" not found`);
            }

            const hashedPassword = await hashing.hashPassword(password);

            const user = await prisma.$transaction(async (tx) => {
                const newUser = await tx.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        status: "pending",
                        userRoles: {
                            create: {
                                roleId: role.id,
                            },
                        },
                    },
                    select: userSelect,
                });

                return newUser;
            });

            return { data: { user: formatUserWithRole(user) } };
        },

        updateUser: async ({ userId, payload }) => {
            await userRepository.findUniqueOrFail({
                where: { id: userId },
            });

            const user = await userRepository.update({
                where: { id: userId },
                data: payload,
                select: userSelect,
            });

            return { data: { user: formatUserWithRole(user) } };
        },

        changeRole: async ({ userId, payload: { role: roleName } }) => {
            await userRepository.findUniqueOrFail({
                where: { id: userId },
            });

            const role = await roleRepository.findFirst({
                where: { name: roleName },
            });

            if (!role) {
                throw new Error(`Role "${roleName}" not found`);
            }

            const user = await prisma.$transaction(async (tx) => {
                // Remove all existing roles
                await tx.userRole.deleteMany({
                    where: { userId },
                });

                // Add new role
                await tx.userRole.create({
                    data: {
                        userId,
                        roleId: role.id,
                    },
                });

                return tx.user.findUniqueOrThrow({
                    where: { id: userId },
                    select: userSelect,
                });
            });

            return { data: { user: formatUserWithRole(user) } };
        },

        getUserById: async ({ userId }) => {
            const user = await userRepository.findUniqueOrFail({
                where: { id: userId },
                select: userSelect,
            });

            return { data: { user: formatUserWithRole(user) } };
        },

        deleteUserById: async ({ userId }) => {
            await userRepository.findUniqueOrFail({
                where: { id: userId },
            });

            await userRepository.delete({ where: { id: userId } });
        },

        getRoles: async () => {
            const roles = await roleRepository.findMany({
                select: {
                    id: true,
                    name: true,
                    description: true,
                },
                orderBy: { name: "asc" },
            });

            return { data: { roles } };
        },
    };
};

addDIResolverName(createService, "userService");

