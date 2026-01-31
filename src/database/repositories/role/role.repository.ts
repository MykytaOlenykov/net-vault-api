import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundError } from "@/lib/errors/errors.js";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { FindUniqueOrFail } from "@/database/prisma/prisma.type.js";
import { BaseRepository, generateRepository } from "../generate.repository.js";

export type RoleRepository = BaseRepository<"role"> & {
    findUniqueOrFail: FindUniqueOrFail<
        Prisma.RoleFindUniqueArgs,
        Prisma.$RolePayload
    >;
};

export const createRoleRepository = (prisma: PrismaClient): RoleRepository => {
    const repository = generateRepository(prisma, "Role");

    return {
        ...repository,
        findUniqueOrFail: async (args) => {
            const role = await prisma.role.findUnique(args);

            if (!role) {
                throw new NotFoundError("Role not found.");
            }

            return role;
        },
    };
};

addDIResolverName(createRoleRepository, "roleRepository");

