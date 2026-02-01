import { Redis } from "ioredis";
import { JWT } from "@fastify/jwt";
import { EnvConfig } from "./env.type.js";
import { FastifyBaseLogger } from "fastify";
import { PrismaClient } from "@prisma/client/extension";
import { BackupQueue } from "@/worker/types/backup.type.js";
import { AuthService } from "@/modules/auth/auth.service.js";
import { AuthHandler } from "@/modules/auth/auth.handler.js";
import { UserService } from "@/modules/user/user.service.js";
import { UserHandler } from "@/modules/user/user.handler.js";
import { SecretsService } from "@/lib/aws/secrets.service.js";
import { DeviceService } from "@/modules/device/device.service.js";
import { DeviceHandler } from "@/modules/device/device.handler.js";
import { AnalyticsService } from "@/modules/analytics/analytics.service.js";
import { AnalyticsHandler } from "@/modules/analytics/analytics.handler.js";
import { UserRepository } from "@/database/repositories/user/user.repository.js";
import { RoleRepository } from "@/database/repositories/role/role.repository.js";
import { ApplicationService } from "@/modules/application/application.service.js";
import { ApplicationHandler } from "@/modules/application/application.handler.js";
import { ConfigVersionService } from "@/modules/device/config-version.service.js";
import { DeviceRepository } from "@/database/repositories/device/device.repository.js";
import { ConfigVersionRepository } from "@/database/repositories/config-version/config-version.repository.js";

export type Cradle = {
    log: FastifyBaseLogger;
    prisma: PrismaClient;
    redis: Redis;
    config: EnvConfig;
    jwt: JWT;

    secretsService: SecretsService;

    applicationService: ApplicationService;
    applicationHandler: ApplicationHandler;

    analyticsService: AnalyticsService;
    analyticsHandler: AnalyticsHandler;

    userRepository: UserRepository;
    roleRepository: RoleRepository;
    userService: UserService;
    userHandler: UserHandler;

    authService: AuthService;
    authHandler: AuthHandler;

    deviceRepository: DeviceRepository;
    deviceService: DeviceService;
    deviceHandler: DeviceHandler;
    backupQueue: BackupQueue;

    configVersionRepository: ConfigVersionRepository;
    configVersionService: ConfigVersionService;
};
