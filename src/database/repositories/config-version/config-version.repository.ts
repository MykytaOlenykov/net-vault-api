import { Prisma, PrismaClient } from "@prisma/client";
import { NotFoundError } from "@/lib/errors/errors.js";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { FindUniqueOrFail } from "@/database/prisma/prisma.type.js";
import { BaseRepository, generateRepository } from "../generate.repository.js";

export type ConfigVersionRepository = BaseRepository<"configVersion"> & {
    findUniqueOrFail: FindUniqueOrFail<
        Prisma.ConfigVersionFindUniqueArgs,
        Prisma.$ConfigVersionPayload
    >;
};

export const createConfigVersionRepository = (
    prisma: PrismaClient
): ConfigVersionRepository => {
    const repository = generateRepository(prisma, "ConfigVersion");

    return {
        ...repository,
        findUniqueOrFail: async (args) => {
            const ConfigVersion = await prisma.configVersion.findUnique(args);

            if (!ConfigVersion) {
                throw new NotFoundError("Config version not found.");
            }

            return ConfigVersion;
        },
    };
};

addDIResolverName(createConfigVersionRepository, "configVersionRepository");
