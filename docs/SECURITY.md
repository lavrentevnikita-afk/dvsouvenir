# Руководство по безопасности

## 🔒 Обзор

Этот документ описывает меры безопасности, реализованные в проекте, и рекомендации для production развертывания.

---

## ✅ Реализованные меры безопасности

### 1. **Аутентификация и авторизация**

- **JWT токены**: Использование bearer tokens для аутентификации
- **Защита паролей**: Bcrypt с 10 rounds для хеширования
- **Role-based access control (RBAC)**: 5 ролей (guest, customer, store, manager, admin)
- **Guards**: `JwtAuthGuard`, `RolesGuard` для защиты endpoints

### 2. **Rate Limiting**

Глобальный rate limiter настроен через `@nestjs/throttler`:

```typescript
// Глобальные лимиты
- Default: 100 req/min
- Auth endpoints: 5 req/min (login, register)
- Password reset: 3 req/min (forgot-password, reset-password)
```

**Защищенные endpoints:**
- `/api/auth/login` - 5 попыток/минуту
- `/api/auth/register` - 5 попыток/минуту
- `/api/auth/forgot-password` - 3 попытки/минуту (защита от спама)
- `/api/auth/reset-password` - 3 попытки/минуту

### 3. **Валидация данных**

- **class-validator**: Все DTO имеют декораторы валидации
- **ValidationPipe**: Глобальная валидация с `whitelist: true`, `forbidNonWhitelisted: true`
- **Трансформация**: Автоматическая конвертация типов через `transform: true`

### 4. **SQL Injection защита**

- **TypeORM Query Builder**: Параметризованные запросы
- **Raw SQL**: Использование placeholders (`$1`, `$2`) вместо конкатенации строк
- Пример безопасного запроса:
  ```typescript
  const cityLike = city ? `%${city}%` : undefined
  const params = cityLike ? [from, to, cityLike] : [from, to]
  const whereCity = cityLike ? `AND (sp.city ILIKE $3)` : ''
  ```

### 5. **CORS настройка**

```typescript
cors: {
  origin: process.env.CORS_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}
```

### 6. **Error handling**

- **AllExceptionsFilter**: Глобальный обработчик ошибок
- **Winston logging**: Структурированное логирование в файлы
- **Request ID**: Каждый запрос имеет уникальный ID для трейсинга

### 7. **Password reset механизм**

- Одноразовые токены с TTL (1 час)
- Токены сохраняются в БД с timestamp
- Проверка срока действия перед использованием
- Токен удаляется после успешного сброса пароля

### 8. **Environment variables**

- `.env` файл в `.gitignore` (НЕ попадает в git)
- `.env.example` с placeholder значениями для документации
- ConfigService для безопасного доступа к переменным окружения

---

## ⚠️ КРИТИЧЕСКИЕ действия перед production

### 🔴 1. Смените ВСЕ секреты

**В `.env` файле замените следующие значения:**

```bash
# ОБЯЗАТЕЛЬНО смените на случайную строку длиной 64+ символов
JWT_SECRET=<сгенерируйте криптостойкий секрет>

# Yandex Object Storage credentials
S3_ACCESS_KEY_ID=<ваш реальный ключ>
S3_SECRET_ACCESS_KEY=<ваш реальный секретный ключ>
S3_BUCKET=<имя вашего бакета>

# Database passwords
POSTGRES_PASSWORD=<сильный пароль для БД>

# Admin accounts (НЕ используйте дефолтные пароли!)
ADMIN_PASSWORD=<сильный пароль для админа>
MANAGER_PASSWORD=<сильный пароль для менеджера>

# Email SMTP (реальные credentials)
SMTP_USER=<ваш email>
SMTP_PASSWORD=<app-specific password>
```

**Генерация криптостойких секретов:**

```bash
# Linux/macOS
openssl rand -hex 64

# PowerShell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
```

### 🔴 2. Обновите CORS origins

В production НЕ используйте `*`. Укажите ТОЛЬКО ваши домены:

```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 🔴 3. Настройте NODE_ENV

```bash
NODE_ENV=production
```

Это отключит:
- TypeORM synchronize (используйте миграции!)
- Подробное логирование ошибок
- Swagger документацию

### 🔴 4. Настройте SMTP для production

Не используйте личный Gmail в production! Рекомендуемые сервисы:
- **SendGrid** (12k emails/month бесплатно)
- **Mailgun** (5k emails/month бесплатно)
- **AWS SES** (очень дешево)

### 🔴 5. Настройте SSL/TLS

- Используйте HTTPS для frontend и backend
- Настройте SSL сертификаты (Let's Encrypt бесплатно)
- Редирект с HTTP на HTTPS

### 🔴 6. Database security

```bash
# НЕ используйте дефолтные credentials!
POSTGRES_USER=<уникальное имя пользователя>
POSTGRES_PASSWORD=<сложный пароль 20+ символов>

# Ограничьте доступ к PostgreSQL по IP
# В docker-compose.yml не публикуйте порт 5432 наружу
```

### 🔴 7. Включите helmet (опционально)

В `main.ts` раскомментируйте:

```typescript
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}))
```

---

## 🛡️ Дополнительные рекомендации

### 1. Регулярные обновления

```bash
# Проверяйте уязвимости в зависимостях
npm audit

# Обновляйте зависимости
npm update
```

### 2. Мониторинг и алерты

- Настройте мониторинг логов (ELK, Grafana)
- Алерты на критические ошибки
- Мониторинг rate limiting срабатываний (возможная атака)

### 3. Backup стратегия

- Автоматический backup БД (ежедневно)
- Backup загруженных файлов (если используете локальное хранилище)
- Тестируйте восстановление из backup'ов

### 4. Firewall и сеть

- Настройте firewall (только 80, 443 порты открыты)
- PostgreSQL и Redis только внутри Docker сети
- Rate limiting на nginx/балансировщике уровня

### 5. Логирование

- НЕ логируйте пароли, токены, секретные ключи
- Используйте structured logging (Winston)
- Ротация логов (не допускайте переполнения диска)

### 6. Error handling

- НЕ показывайте stack traces пользователям в production
- Возвращайте generic error messages
- Детали ошибок только в логах

---

## 📋 Checklist перед запуском

- [ ] Все секреты в `.env` заменены на уникальные
- [ ] `.env` файл НЕ попал в git (проверить: `git ls-files .env`)
- [ ] `NODE_ENV=production` установлен
- [ ] CORS настроен только на production домены
- [ ] SSL сертификаты установлены
- [ ] Database credentials уникальные и сильные
- [ ] Admin/Manager пароли заменены (НЕ дефолтные!)
- [ ] SMTP настроен на production сервис
- [ ] Rate limiting протестирован
- [ ] Backup strategy настроена
- [ ] Мониторинг и алерты настроены
- [ ] Firewall правила применены
- [ ] Логи ротируются
- [ ] TypeORM synchronize=false (используйте миграции!)

---

## 🚨 Что делать при обнаружении уязвимости

1. **НЕ публикуйте** детали уязвимости публично
2. Напишите на: **security@suvlavka.com** (настроить почту)
3. Укажите:
   - Описание уязвимости
   - Шаги для воспроизведения
   - Возможное влияние
4. Мы ответим в течение 48 часов

---

## 📚 Дополнительные ресурсы

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
- [Node.js Security Checklist](https://github.com/goldbergyoni/nodebestpractices#6-security-best-practices)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)

---

**Последнее обновление:** 29 января 2026  
**Версия:** 1.0.0
