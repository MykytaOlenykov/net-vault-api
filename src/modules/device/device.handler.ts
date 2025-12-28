import { FastifyReply, FastifyRequest } from "fastify";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { DeviceService } from "@/modules/device/device.service.js";
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
};

export const createHandler = (deviceService: DeviceService): DeviceHandler => {
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
    };
};

addDIResolverName(createHandler, "deviceHandler");
