import { FastifyReply, FastifyRequest } from "fastify";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { DeviceService } from "@/modules/device/device.service.js";
import {
    GetDevicesQuerystring,
    GetDevicesResponse,
} from "@/lib/validation/device/device.schema.js";

export type DeviceHandler = {
    getDevices: (
        request: FastifyRequest<{ Querystring: GetDevicesQuerystring }>,
        reply: FastifyReply
    ) => Promise<void>;
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
    };
};

addDIResolverName(createHandler, "deviceHandler");
