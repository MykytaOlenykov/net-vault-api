import { FastifyRequest } from "fastify";
import { UnauthorizedError } from "@/lib/errors/errors.js";

export const getAuthUser = (request: FastifyRequest) => {
    const { authUser } = request;

    if (!authUser) {
        throw new UnauthorizedError();
    }

    return authUser;
};
