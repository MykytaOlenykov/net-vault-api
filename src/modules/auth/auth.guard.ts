import { FastifyRequest } from "fastify";
import { UnauthorizedError } from "@/lib/errors/errors.js";
import { tokenPayloadSchema } from "@/lib/validation/auth/auth.schema.js";

function extractTokenFromHeader(request: FastifyRequest): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];

    return type === "Bearer" ? token : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Authenticate = any;

export const authenticate = async (request: FastifyRequest) => {
    const token = extractTokenFromHeader(request);

    if (!token) {
        throw new UnauthorizedError();
    }

    try {
        const decoded = request.server.jwt.verify(token);

        const result = await tokenPayloadSchema.safeParseAsync(decoded);

        if (!result.success) {
            throw new UnauthorizedError();
        }

        const { userId } = result.data;

        const userRepository = request.server.di.resolve("userRepository");

        const user = await userRepository.findUnique({
            where: { id: userId },
            select: {
                id: true,
                token: true,
            },
        });

        if (!user || user.token !== token) {
            throw new UnauthorizedError();
        }

        request.authUser = {
            userId: user.id,
        };
    } catch {
        throw new UnauthorizedError();
    }
};
