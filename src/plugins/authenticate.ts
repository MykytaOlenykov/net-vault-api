import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { authenticate } from "@/modules/auth/auth.guard.js";
import { FastifyPlugin } from "@/lib/fastify/fastify.constant.js";

const configureAuthenticate = async (fastify: FastifyInstance) => {
    fastify.decorate(FastifyPlugin.Authenticate, authenticate);
};

export default fp(configureAuthenticate, {
    name: FastifyPlugin.Authenticate,
    dependencies: [FastifyPlugin.Jwt],
});
