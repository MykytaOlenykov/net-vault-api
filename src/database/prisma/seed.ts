import { PrismaClient } from "@prisma/client";
import { hashing } from "../../lib/hashing/hashing.js";

const prisma = new PrismaClient();

async function main() {
    // Створюємо адміна користувача
    const adminPassword = await hashing.hashPassword("admin123");

    const adminRole = await prisma.role.findUnique({
        where: { name: "Administrator" },
    });

    if (adminRole) {
        await prisma.user.upsert({
            where: { email: "admin@netvault.io" },
            update: {},
            create: {
                name: "Admin User",
                email: "admin@netvault.io",
                password: adminPassword,
                status: "active",
                userRoles: {
                    create: {
                        roleId: adminRole.id,
                    },
                },
            },
        });

        console.log("Admin user created: admin@netvault.io / admin123");
    } else {
        console.error("Administrator role not found");
    }

    console.log("Seed completed");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
