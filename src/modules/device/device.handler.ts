import { FastifyReply, FastifyRequest } from "fastify";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { DeviceService } from "@/modules/device/device.service.js";
import { ConfigVersionService } from "@/modules/device/config-version.service.js";
import {
    CompareConfigsQuerystring,
    CompareConfigsResponse,
    ConfigVersionParams,
    GetAllDevicesWithConfigsResponse,
    GetConfigVersionByIdResponse,
    GetConfigVersionsQuerystring,
    GetConfigVersionsResponse,
    GetLastConfigVersionResponse,
} from "@/lib/validation/config-version/config-version.schema.js";
import {
    CreateDeviceBody,
    CreateDeviceResponse,
    DeviceParams,
    GetDeviceByIdResponse,
    GetDevicesQuerystring,
    GetDevicesResponse,
    GetDeviceTypesResponse,
    GetTagsResponse,
    UpdateDeviceBody,
    UpdateDeviceResponse,
} from "@/lib/validation/device/device.schema.js";

export type DeviceHandler = {
    getDevices: (
        request: FastifyRequest<{ Querystring: GetDevicesQuerystring }>,
        reply: FastifyReply
    ) => Promise<void>;

    createDevice: (
        request: FastifyRequest<{ Body: CreateDeviceBody }>,
        reply: FastifyReply
    ) => Promise<void>;

    updateDevice: (
        request: FastifyRequest<{
            Params: DeviceParams;
            Body: UpdateDeviceBody;
        }>,
        reply: FastifyReply
    ) => Promise<void>;

    getDeviceById: (
        request: FastifyRequest<{ Params: DeviceParams }>,
        reply: FastifyReply
    ) => Promise<void>;

    deleteDeviceById: (
        request: FastifyRequest<{ Params: DeviceParams }>,
        reply: FastifyReply
    ) => Promise<void>;

    getTags: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    getTypes: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;

    getConfigVersions: (
        request: FastifyRequest<{
            Params: DeviceParams;
            Querystring: GetConfigVersionsQuerystring;
        }>,
        reply: FastifyReply
    ) => Promise<void>;

    getConfigVersionById: (
        request: FastifyRequest<{ Params: ConfigVersionParams }>,
        reply: FastifyReply
    ) => Promise<void>;

    getLastConfigVersion: (
        request: FastifyRequest<{ Params: DeviceParams }>,
        reply: FastifyReply
    ) => Promise<void>;

    triggerBackup: (
        request: FastifyRequest<{ Params: DeviceParams }>,
        reply: FastifyReply
    ) => Promise<void>;

    getAllDevicesWithConfigs: (
        request: FastifyRequest,
        reply: FastifyReply
    ) => Promise<void>;

    compareConfigs: (
        request: FastifyRequest<{ Querystring: CompareConfigsQuerystring }>,
        reply: FastifyReply
    ) => Promise<void>;
};

export const createHandler = (
    deviceService: DeviceService,
    configVersionService: ConfigVersionService
): DeviceHandler => {
    return {
        getDevices: async (request, reply) => {
            const { data } = await deviceService.getDevices({
                query: request.query,
            });

            const response: GetDevicesResponse = { data };

            return reply.status(200).send(response);
        },

        createDevice: async (request, reply) => {
            const { data } = await deviceService.createDevice({
                payload: request.body,
            });

            const response: CreateDeviceResponse = { data };

            return reply.status(200).send(response);
        },

        updateDevice: async (request, reply) => {
            const { data } = await deviceService.updateDevice({
                deviceId: request.params.deviceId,
                payload: request.body,
            });

            const response: UpdateDeviceResponse = { data };

            return reply.status(200).send(response);
        },

        deleteDeviceById: async (request, reply) => {
            await deviceService.deleteDeviceById({
                deviceId: request.params.deviceId,
            });

            return reply.status(204).send();
        },

        getDeviceById: async (request, reply) => {
            const { data } = await deviceService.getDeviceById({
                deviceId: request.params.deviceId,
            });

            const response: GetDeviceByIdResponse = { data };

            return reply.status(200).send(response);
        },

        getTags: async (_, reply) => {
            const { data } = await deviceService.getTags();

            const response: GetTagsResponse = { data };

            return reply.status(200).send(response);
        },

        getTypes: async (_, reply) => {
            const { data } = await deviceService.getTypes();

            const response: GetDeviceTypesResponse = { data };

            return reply.status(200).send(response);
        },

        getConfigVersions: async (request, reply) => {
            const { data } = await configVersionService.getConfigVersions({
                deviceId: request.params.deviceId,
                query: request.query,
            });

            const response: GetConfigVersionsResponse = { data };

            return reply.status(200).send(response);
        },

        getConfigVersionById: async (request, reply) => {
            const { data } = await configVersionService.getConfigVersionById({
                configId: request.params.configId,
            });

            const response: GetConfigVersionByIdResponse = { data };

            return reply.status(200).send(response);
        },

        getLastConfigVersion: async (request, reply) => {
            const { data } = await configVersionService.getLastConfigVersion({
                deviceId: request.params.deviceId,
            });

            const response: GetLastConfigVersionResponse = { data };

            return reply.status(200).send(response);
        },

        triggerBackup: async (request, reply) => {
            const { message } = await deviceService.triggerBackup({
                deviceId: request.params.deviceId,
            });

            const response = { message };

            return reply.status(200).send(response);
        },

        getAllDevicesWithConfigs: async (_, reply) => {
            const { data } =
                await configVersionService.getAllDevicesWithConfigs();

            const response: GetAllDevicesWithConfigsResponse = { data };

            return reply.status(200).send(response);
        },

        compareConfigs: async (request, reply) => {
            const { data } = await configVersionService.compareConfigs({
                leftConfigId: request.query.leftConfigId,
                rightConfigId: request.query.rightConfigId,
            });

            const response: CompareConfigsResponse = { data };

            return reply.status(200).send(response);
        },
    };
};

addDIResolverName(createHandler, "deviceHandler");
