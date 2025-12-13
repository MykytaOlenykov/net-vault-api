import { AwilixContainer } from "awilix";
import { EnvConfig } from "./env.type.js";
import { PrismaClient } from "@prisma/client";
import { Cradle } from "./di-container.type.js";
import { IAuthUser } from "@/modules/auth/auth.type.ts";
import { Authenticate } from "@/modules/auth/auth.guard.ts";

declare module "fastify" {
    export interface FastifyInstance {
        config: EnvConfig;
        prisma: PrismaClient;
        di: AwilixContainer<Cradle>;

        authenticate: Authenticate;
    }

    export interface FastifyRequest {
        authUser?: IAuthUser;
    }
}
