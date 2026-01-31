# Інструкція з використання Seed скрипту

## Що робить seed скрипт

Seed скрипт автоматично створює:
- **4 ролі**: Administrator, Operator, Viewer, Auditor
- **Адміна користувача**: 
  - Email: `admin@netvault.io`
  - Password: `admin123`
  - Status: `active`
  - Role: `Administrator`

## Як викликати seed скрипт

### Варіант 1: Через Docker контейнер (рекомендовано)

```bash
# Виконати seed всередині Docker контейнера
docker compose exec nodejs npm run prisma:seed
```

### Варіант 2: З хост-машини

**Важливо:** Спочатку змініть `DATABASE_URL` в `.env` файлі:

```env
DATABASE_URL="postgresql://postgres:12345@localhost:5432/postgres"
```

Потім виконайте:

```bash
npm run prisma:seed
```

Після виконання поверніть `DATABASE_URL` назад:
```env
DATABASE_URL="postgresql://postgres:12345@postgresdb:5432/postgres"
```

### Варіант 3: Прямий виклик через tsx

```bash
# З хост-машини (після зміни DATABASE_URL)
npx tsx src/database/prisma/seed.ts
```

## Порядок виконання

1. **Спочатку застосуйте міграції:**
   ```bash
   docker compose exec nodejs npm run prisma:migrate:apply
   ```

2. **Потім виконайте seed:**
   ```bash
   docker compose exec nodejs npm run prisma:seed
   ```
## Примітки

- Seed скрипт використовує `upsert`, тому його можна запускати багато разів без помилок
- Якщо адмін вже існує, він не буде перезаписаний
- Ролі також не будуть дублюватися завдяки `upsert`

## Усунення проблем

Якщо виникає помилка "Cannot find module", переконайтеся що:
1. Prisma клієнт згенерований: `npm run prisma:generate`
2. Всі залежності встановлені: `npm install`
3. DATABASE_URL правильно налаштований

