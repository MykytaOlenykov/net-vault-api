import { FastifyInstance } from "fastify";
import { createDeviceRoutes } from "./device.route.js";

// Define the endpoint prefix by providing autoPrefix module property.
export const autoPrefix = "/api/devices";

export default async function (fastify: FastifyInstance) {
    const deviceHandler = fastify.di.resolve("deviceHandler");
    createDeviceRoutes(fastify, deviceHandler);
}
