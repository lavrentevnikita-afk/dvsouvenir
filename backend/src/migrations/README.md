# Database Migrations

## Статус

База данных уже содержит все необходимые таблицы. Схема синхронизирована с entity.

## Важно для production

В production режиме **synchronize: false** в data-source.ts. Это означает, что любые изменения схемы БД должны выполняться через миграции.

## Команды для работы с миграциями

```bash
# Создать новую миграцию на основе изменений в entity
npm run migration:generate src/migrations/MigrationName

# Создать пустую миграцию
npm run typeorm -- migration:create src/migrations/MigrationName

# Применить все pending миграции
npm run migration:run

# Откатить последнюю миграцию
npm run migration:revert

# Посмотреть статус миграций
npm run migration:show
```

## Workflow для изменения схемы

1. Изменить entity (например, добавить поле в User)
2. Сгенерировать миграцию: `npm run migration:generate src/migrations/AddFieldToUser`
3. Проверить сгенерированную миграцию в `src/migrations/`
4. Применить миграцию: `npm run migration:run`
5. Закоммитить миграцию в git

## Текущее состояние

- ✅ synchronize: false (безопасно для production)
- ✅ Все таблицы созданы и актуальны
- ✅ Схема соответствует entity
- ⚠️ Миграции не созданы (таблицы были созданы через auto-sync)

## Рекомендация

При следующем изменении схемы БД используйте команды выше для создания миграции. Текущее состояние БД считается "baseline" - все будущие изменения должны идти через миграции.
