import { FastifyInstance } from "fastify";
import { DeviceHandler } from "@/modules/device/device.handler.js";
import {
    getDevicesQuerystringSchema,
    getDevicesResponseSchema,
} from "@/lib/validation/device/device.schema.js";

export const createDeviceRoutes = (
    fastify: FastifyInstance,
    deviceHandler: DeviceHandler
) => {
    fastify.get(
        "/",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Get devices",
                querystring: getDevicesQuerystringSchema,
                response: {
                    200: getDevicesResponseSchema,
                },
            },
        },
        deviceHandler.getDevices
    );
};
