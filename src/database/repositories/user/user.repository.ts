import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundError } from "@/lib/errors/errors.js";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { FindUniqueOrFail } from "@/database/prisma/prisma.type.js";
import { BaseRepository, generateRepository } from "../generate.repository.js";

export type UserRepository = BaseRepository<"user"> & {
    findUniqueOrFail: FindUniqueOrFail<
        Prisma.UserFindUniqueArgs,
        Prisma.$UserPayload
    >;
};

export const userSelect = {
    id: true,
    name: true,
    email: true,
    status: true,
    lastLogin: true,
    createdAt: true,
    updatedAt: true,
    userRoles: {
        select: {
            role: {
                select: {
                    name: true,
                },
            },
        },
    },
} satisfies Prisma.UserSelect;

export const createUserRepository = (prisma: PrismaClient): UserRepository => {
    const repository = generateRepository(prisma, "User");

    return {
        ...repository,
        findUniqueOrFail: async (args) => {
            const user = await prisma.user.findUnique(args);

            if (!user) {
                throw new NotFoundError("User not found.");
            }

            return user;
        },
    };
};

addDIResolverName(createUserRepository, "userRepository");
