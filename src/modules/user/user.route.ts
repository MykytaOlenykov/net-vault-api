import { FastifyInstance } from "fastify";
import { UserHandler } from "./user.handler.js";
import {
    changeRoleBodySchema,
    changeRoleResponseSchema,
    getRolesResponseSchema,
    getUserByIdResponseSchema,
    getUsersQuerystringSchema,
    getUsersResponseSchema,
    inviteUserBodySchema,
    inviteUserResponseSchema,
    updateUserBodySchema,
    updateUserResponseSchema,
    userParamsSchema,
} from "@/lib/validation/user/user.schema.js";

export const createUserRoutes = (
    fastify: FastifyInstance,
    userHandler: UserHandler
) => {
    fastify.get(
        "/",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["user"],
                summary: "Get users",
                querystring: getUsersQuerystringSchema,
                response: {
                    200: getUsersResponseSchema,
                },
            },
        },
        userHandler.getUsers
    );

    fastify.post(
        "/",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["user"],
                summary: "Invite new user",
                body: inviteUserBodySchema,
                response: {
                    201: inviteUserResponseSchema,
                },
            },
        },
        userHandler.inviteUser
    );

    fastify.get(
        "/roles",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["user"],
                summary: "Get all roles",
                response: {
                    200: getRolesResponseSchema,
                },
            },
        },
        userHandler.getRoles
    );

    fastify.get(
        "/:userId",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["user"],
                summary: "Get user by ID",
                params: userParamsSchema,
                response: {
                    200: getUserByIdResponseSchema,
                },
            },
        },
        userHandler.getUserById
    );

    fastify.put(
        "/:userId",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["user"],
                summary: "Update user",
                params: userParamsSchema,
                body: updateUserBodySchema,
                response: {
                    200: updateUserResponseSchema,
                },
            },
        },
        userHandler.updateUser
    );

    fastify.patch(
        "/:userId/role",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["user"],
                summary: "Change user role",
                params: userParamsSchema,
                body: changeRoleBodySchema,
                response: {
                    200: changeRoleResponseSchema,
                },
            },
        },
        userHandler.changeRole
    );

    fastify.delete(
        "/:userId",
        {
            preHandler: [fastify.authenticate],
            schema: {
                tags: ["user"],
                summary: "Delete user",
                params: userParamsSchema,
            },
        },
        userHandler.deleteUserById
    );
};

