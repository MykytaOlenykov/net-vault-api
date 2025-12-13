import { FastifyInstance } from "fastify";
import { AuthHandler } from "./auth.handler.js";
import {
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
};
