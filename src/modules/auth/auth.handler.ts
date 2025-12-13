import { AuthService } from "./auth.service.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { LoginBody, LoginResponse } from "@/lib/validation/auth/auth.schema.js";

export type AuthHandler = {
    login: (
        request: FastifyRequest<{ Body: LoginBody }>,
        reply: FastifyReply
    ) => Promise<void>;
};

export const createHandler = (authService: AuthService): AuthHandler => {
    return {
        login: async (request, reply) => {
            const { data, message } = await authService.login({
                payload: request.body,
            });

            const response: LoginResponse = {
                data,
                message,
            };

            return reply.status(200).send(response);
        },
    };
};

addDIResolverName(createHandler, "authHandler");
