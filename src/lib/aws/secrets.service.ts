import { addDIResolverName } from "@/lib/awilix/awilix.js";
import {
    SecretsManagerClient,
    GetSecretValueCommand,
    CreateSecretCommand,
    UpdateSecretCommand,
    DeleteSecretCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient();

export type SecretsService = {
    createSecret: (password: string) => Promise<string>;

    readSecret: (secretRef: string) => Promise<string>;

    updateSecret: (secretRef: string, newPassword: string) => Promise<void>;

    deleteSecret: (secretRef: string, force?: boolean) => Promise<void>;
};

export const createSecretsService = (): SecretsService => {
    if (process.env.SECRET_SERVICE_DEVELOPMENT === "true") {
        return {
            createSecret: async () => "__SECRET_SERVICE_DEVELOPMENT__",

            readSecret: async () => "__SECRET_SERVICE_DEVELOPMENT__",

            updateSecret: async () => {},

            deleteSecret: async () => {},
        };
    }

    return {
        createSecret: async (password: string): Promise<string> => {
            const name = `device-cred-${crypto.randomUUID()}`;

            const res = await client.send(
                new CreateSecretCommand({
                    Name: name,
                    SecretString: password,
                })
            );

            if (!res.ARN) {
                throw new Error("Failed to create secret");
            }

            return res.ARN;
        },

        readSecret: async (secretRef: string): Promise<string> => {
            const res = await client.send(
                new GetSecretValueCommand({
                    SecretId: secretRef,
                })
            );

            if (!res.SecretString) {
                throw new Error("SecretString is empty");
            }

            return res.SecretString;
        },

        updateSecret: async (
            secretRef: string,
            newPassword: string
        ): Promise<void> => {
            await client.send(
                new UpdateSecretCommand({
                    SecretId: secretRef,
                    SecretString: newPassword,
                })
            );
        },

        deleteSecret: async (
            secretRef: string,
            force = false
        ): Promise<void> => {
            await client.send(
                new DeleteSecretCommand({
                    SecretId: secretRef,
                    ForceDeleteWithoutRecovery: force,
                })
            );
        },
    };
};

addDIResolverName(createSecretsService, "secretsService");
