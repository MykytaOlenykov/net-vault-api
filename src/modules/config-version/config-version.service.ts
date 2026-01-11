import { addDIResolverName } from "@/lib/awilix/awilix.js";

export type ConfigVersionService = {
    getConfigVersions: () => Promise<void>;

    getConfigVersionById: () => Promise<void>;

    getCurrentConfigVersion: () => Promise<void>;
};

export const createService = (): ConfigVersionService => {
    return {
        getConfigVersions: async () => {},

        getConfigVersionById: async () => {},

        getCurrentConfigVersion: async () => {},
    };
};

addDIResolverName(createService, "configVersionService");
