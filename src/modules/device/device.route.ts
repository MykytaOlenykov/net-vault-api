import { FastifyInstance } from "fastify";
import { DeviceHandler } from "@/modules/device/device.handler.js";
import {
    configVersionParamsSchema,
    getConfigVersionByIdResponseSchema,
    getConfigVersionsQuerystringSchema,
    getConfigVersionsResponseSchema,
    getLastConfigVersionResponseSchema,
} from "@/lib/validation/config-version/config-version.schema.js";
import {
    createDeviceBodySchema,
    createDeviceResponseSchema,
    deviceParamsSchema,
    getDeviceByIdResponseSchema,
    getDevicesQuerystringSchema,
    getDevicesResponseSchema,
    getDeviceTypesResponseSchema,
    getTagsResponseSchema,
    updateDeviceBodySchema,
    updateDeviceResponseSchema,
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

    fastify.post(
        "/",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Create device",
                body: createDeviceBodySchema,
                response: {
                    200: createDeviceResponseSchema,
                },
            },
        },
        deviceHandler.createDevice
    );

    fastify.put(
        "/:deviceId",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Update device",
                params: deviceParamsSchema,
                body: updateDeviceBodySchema,
                response: {
                    200: updateDeviceResponseSchema,
                },
            },
        },
        deviceHandler.updateDevice
    );

    fastify.delete(
        "/:deviceId",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Delete device",
                params: deviceParamsSchema,
            },
        },
        deviceHandler.deleteDeviceById
    );

    fastify.get(
        "/:deviceId",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Get device by id",
                params: deviceParamsSchema,
                response: {
                    200: getDeviceByIdResponseSchema,
                },
            },
        },
        deviceHandler.getDeviceById
    );

    fastify.get(
        "/tags",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Get tags",
                response: {
                    200: getTagsResponseSchema,
                },
            },
        },
        deviceHandler.getTags
    );

    fastify.get(
        "/types",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Get types",
                response: {
                    200: getDeviceTypesResponseSchema,
                },
            },
        },
        deviceHandler.getTypes
    );

    fastify.get(
        "/:deviceId/configs",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Get configs",
                params: deviceParamsSchema,
                querystring: getConfigVersionsQuerystringSchema,
                response: {
                    200: getConfigVersionsResponseSchema,
                },
            },
        },
        deviceHandler.getConfigVersions
    );

    fastify.get(
        "/configs/:configId",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Get config by id",
                params: configVersionParamsSchema,
                response: {
                    200: getConfigVersionByIdResponseSchema,
                },
            },
        },
        deviceHandler.getConfigVersionById
    );

    fastify.get(
        "/:deviceId/configs/last",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Get last config",
                params: deviceParamsSchema,
                response: {
                    200: getLastConfigVersionResponseSchema,
                },
            },
        },
        deviceHandler.getLastConfigVersion
    );

    fastify.post(
        "/:deviceId/configs",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Trigger backup",
                params: deviceParamsSchema,
            },
        },
        deviceHandler.triggerBackup
    );
};
