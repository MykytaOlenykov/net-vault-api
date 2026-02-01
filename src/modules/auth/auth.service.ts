import { JWT } from "@fastify/jwt";
import { hashing } from "@/lib/hashing/hashing.js";
import { IAuthUser } from "@/modules/auth/auth.type.js";
import { addDIResolverName } from "@/lib/awilix/awilix.js";
import { UnauthorizedError } from "@/lib/errors/errors.js";
import { DEFAULT_TOKEN_EXPIRES_IN } from "./auth.const.js";
import { UserRepository } from "@/database/repositories/user/user.repository.js";
import {
    CurrentUserResponse,
    LoginBody,
    LoginResponse,
    TokenPayload,
} from "@/lib/validation/auth/auth.schema.js";

export type AuthService = {
    login: (args: { payload: LoginBody }) => Promise<LoginResponse>;

    current: (args: { authUser: IAuthUser }) => Promise<CurrentUserResponse>;
};

export const createService = (
    jwt: JWT,
    userRepository: UserRepository
): AuthService => ({
    login: async ({ payload }) => {
        const user = await userRepository.findUnique({
            where: { email: payload.email },
            select: {
                id: true,
                email: true,
                password: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const isPasswordValid = await hashing.comparePassword(
            payload.password,
            user.password
        );

        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid credentials");
        }

        const tokenPayload: TokenPayload = {
            userId: user.id,
        };

        const token = jwt.sign(tokenPayload, {
            expiresIn: DEFAULT_TOKEN_EXPIRES_IN,
        });

        await userRepository.update({
            where: { id: user.id },
            data: { 
                token,
                lastLogin: new Date(),
            },
        });

        return {
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                },
                token,
            },
            message: "Login successful",
        };
    },

    current: async ({ authUser }) => {
        const user = await userRepository.findUniqueOrFail({
            where: { id: authUser.userId },
            select: {
                id: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return { data: { currentUser: user } };
    },
});

addDIResolverName(createService, "authService");
