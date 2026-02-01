import { FastifyInstance } from "fastify";
import { createUserRoutes } from "./user.route.js";

// Define the endpoint prefix by providing autoPrefix module property.
export const autoPrefix = "/api/users";

export default async function (fastify: FastifyInstance) {
    const userHandler = fastify.di.resolve("userHandler");
    createUserRoutes(fastify, userHandler);
}

