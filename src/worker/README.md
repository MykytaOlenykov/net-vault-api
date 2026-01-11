

Встановлення залежностей

```sh
npm install
```

## Команди для роботи з докером
```sh
# запускаємо контейнер
docker compose up -d

# щоб зайти в контейнер
docker exec -it net-vault-node-api bash

# застосовуємо міграції
npm run prisma:migrate:apply

# після першого запуску може знадобитись зупинити контейнер і запустити його ще раз через докер компоуз щоб все запрацювало коректно
```


після першого запуску може знадобитись зупинити контейнер і запустити його ще раз через докер компоуз щоб все запрацювало коректно


Структура модуля

```sh
worker/
├── index.ts                      # entrypoint, bootstrap
├── worker.ts                     # BullMQ Worker lifecycle
├── worker.const.ts               # enums, constants
├── worker.utils.ts               # logger, helpers
│
├── infrastructure/               # низькорівневі інтеграції
│   ├── prisma/
│   │   └── client.ts             # Prisma client
│   ├── redis/
│   │   └── client.ts             # Redis factory
│   └── queues/
│       └── backup.queue.ts
│
├── processors/                   # BullMQ job routers (thin)
│   └── backup.processor.ts
│
├── handlers/                     # job handlers (workflow-level)
│   ├── checkBackupSchedule.handler.ts
│   └── createBackup.handler.ts
│
├── domain/                       # ядро NetVault (business logic)
│   ├── connectors/               # transport layer
│   │   ├── connector.interface.ts
│   │   ├── ssh.connector.ts
│   │   └── telnet.connector.ts
│   │
│   ├── expect/                   # expect-like engine
│   │   ├── expect.engine.ts
│   │   ├── prompt.matcher.ts
│   │   └── paging.handler.ts
│   │
│   ├── templates/                # command chains
│   │   ├── template.interface.ts
│   │   ├── template.runner.ts
│   │   └── vendors/
│   │       ├── cisco.template.ts
│   │       ├── huawei.template.ts
│   │       └── juniper.template.ts
│   │
│   ├── backup/                   # backup workflow parts
│   │   ├── backup.service.ts
│   │   ├── dedup.service.ts
│   │   ├── diff.service.ts
│   │   └── config.normalizer.ts
│   │
│   └── devices/
│       └── device.service.ts
│
├── repositories/                 # DB access (Prisma)
│   ├── device.repository.ts
│   ├── config.repository.ts
│   ├── template.repository.ts
│   └── audit.repository.ts
│
├── types/                        # shared TS types
│   ├── jobs.ts
│   ├── devices.ts
│   └── templates.ts
│
└── README.md

```