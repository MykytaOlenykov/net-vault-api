import { FastifyInstance } from "fastify";
import { AuthHandler } from "./auth.handler.js";
import {
    currentUserResponseSchema,
    loginBodySchema,
    loginResponseSchema,
} from "@/lib/validation/auth/auth.schema.js";

export const createAuthRoutes = (
    fastify: FastifyInstance,
    authHandler: AuthHandler
) => {
    fastify.post(
        "/login",
        {
            schema: {
                tags: ["auth"],
                summary: "User login",
                body: loginBodySchema,
                response: {
                    200: loginResponseSchema,
                },
            },
        },
        authHandler.login
    );

    fastify.get(
        "/current",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["auth"],
                summary: "Get current user",
                response: {
                    200: currentUserResponseSchema,
                },
            },
        },
        authHandler.current
    );
};
