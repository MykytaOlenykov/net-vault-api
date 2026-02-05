import { FastifyInstance } from "fastify";
import { DeviceHandler } from "@/modules/device/device.handler.js";
import {
    compareConfigsQuerystringSchema,
    compareConfigsResponseSchema,
    configVersionParamsSchema,
    getAllDevicesWithConfigsResponseSchema,
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

    // ВСІ статичні маршрути мають бути перед параметризованими
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
        "/configs",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Get all devices with config versions",
                response: {
                    200: getAllDevicesWithConfigsResponseSchema,
                },
            },
        },
        deviceHandler.getAllDevicesWithConfigs
    );

    fastify.get(
        "/configs/compare",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Compare two configuration versions",
                querystring: compareConfigsQuerystringSchema,
                response: {
                    200: compareConfigsResponseSchema,
                },
            },
        },
        deviceHandler.compareConfigs
    );

    fastify.get(
        "/configs/:configId",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Get specific configuration version",
                params: configVersionParamsSchema,
                response: {
                    200: getConfigVersionByIdResponseSchema,
                },
            },
        },
        deviceHandler.getConfigVersionById
    );

    // Параметризовані маршрути після всіх статичних
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
        "/:deviceId/configs",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["device"],
                summary: "Get config versions for a device",
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
