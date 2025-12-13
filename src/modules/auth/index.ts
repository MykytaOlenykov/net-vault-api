import { FastifyInstance } from "fastify";
import { createAuthRoutes } from "./auth.route.js";

// Define the endpoint prefix by providing autoPrefix module property.
export const autoPrefix = "/api/auth";

export default async function (fastify: FastifyInstance) {
    const authHandler = fastify.di.resolve("authHandler");
    createAuthRoutes(fastify, authHandler);
}
