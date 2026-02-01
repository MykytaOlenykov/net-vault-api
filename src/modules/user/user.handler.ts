import { FastifyReply, FastifyRequest } from "fastify";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { UserService } from "@/modules/user/user.service.js";
import {
    ChangeRoleBody,
    ChangeRoleResponse,
    GetRolesResponse,
    GetUserByIdResponse,
    GetUsersQuerystring,
    GetUsersResponse,
    InviteUserBody,
    InviteUserResponse,
    UpdateUserBody,
    UpdateUserResponse,
    UserParams,
} from "@/lib/validation/user/user.schema.js";

export type UserHandler = {
    getUsers: (
        request: FastifyRequest<{ Querystring: GetUsersQuerystring }>,
        reply: FastifyReply
    ) => Promise<void>;

    inviteUser: (
        request: FastifyRequest<{ Body: InviteUserBody }>,
        reply: FastifyReply
    ) => Promise<void>;

    updateUser: (
        request: FastifyRequest<{
            Params: UserParams;
            Body: UpdateUserBody;
        }>,
        reply: FastifyReply
    ) => Promise<void>;

    changeRole: (
        request: FastifyRequest<{
            Params: UserParams;
            Body: ChangeRoleBody;
        }>,
        reply: FastifyReply
    ) => Promise<void>;

    getUserById: (
        request: FastifyRequest<{ Params: UserParams }>,
        reply: FastifyReply
    ) => Promise<void>;

    deleteUserById: (
        request: FastifyRequest<{ Params: UserParams }>,
        reply: FastifyReply
    ) => Promise<void>;

    getRoles: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
};

export const createHandler = (userService: UserService): UserHandler => {
    return {
        getUsers: async (request, reply) => {
            const { data } = await userService.getUsers({
                query: request.query,
            });

            const response: GetUsersResponse = { data };

            return reply.status(200).send(response);
        },

        inviteUser: async (request, reply) => {
            const { data } = await userService.inviteUser({
                payload: request.body,
            });

            const response: InviteUserResponse = { data };

            return reply.status(201).send(response);
        },

        updateUser: async (request, reply) => {
            const { data } = await userService.updateUser({
                userId: request.params.userId,
                payload: request.body,
            });

            const response: UpdateUserResponse = { data };

            return reply.status(200).send(response);
        },

        changeRole: async (request, reply) => {
            const { data } = await userService.changeRole({
                userId: request.params.userId,
                payload: request.body,
            });

            const response: ChangeRoleResponse = { data };

            return reply.status(200).send(response);
        },

        getUserById: async (request, reply) => {
            const { data } = await userService.getUserById({
                userId: request.params.userId,
            });

            const response: GetUserByIdResponse = { data };

            return reply.status(200).send(response);
        },

        deleteUserById: async (request, reply) => {
            await userService.deleteUserById({
                userId: request.params.userId,
            });

            return reply.status(204).send();
        },

        getRoles: async (_, reply) => {
            const { data } = await userService.getRoles();

            const response: GetRolesResponse = { data };

            return reply.status(200).send(response);
        },
    };
};

addDIResolverName(createHandler, "userHandler");

