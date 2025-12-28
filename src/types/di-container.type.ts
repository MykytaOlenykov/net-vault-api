import { JWT } from "@fastify/jwt";
import { EnvConfig } from "./env.type.js";
import { FastifyBaseLogger } from "fastify";
import { PrismaClient } from "@prisma/client/extension";
import { AuthService } from "@/modules/auth/auth.service.js";
import { AuthHandler } from "@/modules/auth/auth.handler.js";
import { DeviceService } from "@/modules/device/device.service.js";
import { DeviceHandler } from "@/modules/device/device.handler.js";
import { UserRepository } from "@/database/repositories/user/user.repository.js";
import { ApplicationService } from "@/modules/application/application.service.js";
import { ApplicationHandler } from "@/modules/application/application.handler.js";
import { DeviceRepository } from "@/database/repositories/device/device.repository.js";

export type Cradle = {
    log: FastifyBaseLogger;
    prisma: PrismaClient;
    config: EnvConfig;
    jwt: JWT;

    applicationService: ApplicationService;
    applicationHandler: ApplicationHandler;

    userRepository: UserRepository;

    authService: AuthService;
    authHandler: AuthHandler;

    deviceRepository: DeviceRepository;
    deviceService: DeviceService;
    deviceHandler: DeviceHandler;
};
