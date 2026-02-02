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

    // Створюємо теги
    await prisma.tag.upsert({
        where: { id: "104e8a25-3124-40c9-8d82-b03ebd64a9f3" },
        update: {},
        create: {
            id: "104e8a25-3124-40c9-8d82-b03ebd64a9f3",
            name: "Cisco",
        },
    });

    await prisma.tag.upsert({
        where: { id: "91324510-4403-43ee-9166-a104f7a226e6" },
        update: {},
        create: {
            id: "91324510-4403-43ee-9166-a104f7a226e6",
            name: "Huawei",
        },
    });

    console.log("Tags created: Cisco, Huawei");

    // Створюємо типи пристроїв
    await prisma.deviceType.upsert({
        where: { id: "7c6e582e-b22c-4893-9931-c60b204a3024" },
        update: {},
        create: {
            id: "7c6e582e-b22c-4893-9931-c60b204a3024",
            vendor: "huawei 2326",
            configCommand:
                "screen-length 0 temporary\ndisplay current-configuration",
        },
    });

    await prisma.deviceType.upsert({
        where: { id: "22c9c52e-2245-4f2c-93b5-940fed481c5d" },
        update: {},
        create: {
            id: "22c9c52e-2245-4f2c-93b5-940fed481c5d",
            vendor: "cisco nxos",
            configCommand: "terminal length 0\nshow startup-config",
        },
    });

    console.log("Device types created: huawei 2326, cisco nxos");

    // Створюємо облікові дані
    await prisma.credential.upsert({
        where: { id: "afa5446f-bae9-481e-904b-0f3b27c9802b" },
        update: {},
        create: {
            id: "afa5446f-bae9-481e-904b-0f3b27c9802b",
            username: "preart",
            secretRef: "__SECRET_SERVICE_DEVELOPMENT__",
        },
    });

    await prisma.credential.upsert({
        where: { id: "1b01b447-83b9-4673-92f2-b8b921132361" },
        update: {},
        create: {
            id: "1b01b447-83b9-4673-92f2-b8b921132361",
            username: "preart",
            secretRef: "__SECRET_SERVICE_DEVELOPMENT__",
        },
    });

    await prisma.credential.upsert({
        where: { id: "66f93878-f0a6-46e2-ae0d-4a2d96664c8a" },
        update: {},
        create: {
            id: "66f93878-f0a6-46e2-ae0d-4a2d96664c8a",
            username: "preart",
            secretRef: "__SECRET_SERVICE_DEVELOPMENT__",
        },
    });

    console.log("Credentials created for user: preart");

    // Створюємо пристрої
    await prisma.device.upsert({
        where: { id: "83507b99-b7f8-4e55-abb1-bb0d89fd1e48" },
        update: {},
        create: {
            id: "83507b99-b7f8-4e55-abb1-bb0d89fd1e48",
            name: "Cisco Nexus telnet",
            ipAddress: "10.10.1.27",
            port: 23,
            deviceTypeId: "22c9c52e-2245-4f2c-93b5-940fed481c5d",
            credentialId: "1b01b447-83b9-4673-92f2-b8b921132361",
            backupSchedule: "0 10 1 1 *",
            isActive: true,
            protocol: "Telnet",
        },
    });

    await prisma.device.upsert({
        where: { id: "08937285-cb44-436b-8723-afd3b6d2ffd1" },
        update: {},
        create: {
            id: "08937285-cb44-436b-8723-afd3b6d2ffd1",
            name: "Cisco Nexus SSH",
            ipAddress: "10.10.1.27",
            port: 22,
            deviceTypeId: "22c9c52e-2245-4f2c-93b5-940fed481c5d",
            credentialId: "afa5446f-bae9-481e-904b-0f3b27c9802b",
            backupSchedule: "0 10 1 1 *",
            isActive: true,
            protocol: "SSH",
        },
    });

    await prisma.device.upsert({
        where: { id: "5de6e965-43f4-4ef3-915e-171be8b6007a" },
        update: {},
        create: {
            id: "5de6e965-43f4-4ef3-915e-171be8b6007a",
            name: "Huawei S2326 Telnet",
            ipAddress: "10.10.14.140",
            port: 23,
            deviceTypeId: "7c6e582e-b22c-4893-9931-c60b204a3024",
            credentialId: "66f93878-f0a6-46e2-ae0d-4a2d96664c8a",
            backupSchedule: "0 10 1 1 *",
            isActive: true,
            protocol: "Telnet",
        },
    });

    console.log(
        "Devices created: Cisco Nexus telnet, Cisco Nexus SSH, Huawei S2326 Telnet"
    );

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
