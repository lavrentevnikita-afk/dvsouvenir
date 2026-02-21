# 🌿 Souvenir Shop

Souvenir Shop — это B2B-платформа для заказов сувенирной продукции только от наших магазинов-партнёров.

Проект создаётся с акцентом на:
- минималистичный, премиальный дизайн;
- быстрый и лёгкий каталог;
- удобную работу на мобильных устройствах (PWA);
- прозрачную, расширяемую архитектуру.

## 🚀 Быстрый старт

### Требования
- Node.js 18+ 
- Docker и Docker Compose
- Git

### Установка и запуск

```bash
# Клонировать репозиторий
git clone https://github.com/lavrentevnikita-afk/suvlavka.git
cd suvlavka

# Создать .env файл из примера
cp .env.example .env

# Запустить все сервисы через Docker
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
# API Docs (Swagger): http://localhost:4000/api/docs
# Health Check: http://localhost:4000/health/ready
```

### Переменные окружения

Основные переменные в `.env`:
- `JWT_SECRET` - секретный ключ для JWT (обязательно изменить!)
- `POSTGRES_*` - настройки PostgreSQL
- `REDIS_HOST` - хост Redis для кэширования
- `S3_*` - настройки S3-совместимого хранилища (Yandex Cloud)
- `CORS_ORIGINS` - разрешенные домены для CORS

См. `.env.example` для полного списка.

## 🛠 Технологии

**Frontend:**
- Nuxt 3, Vue 3, TypeScript
- Pinia (state management)
- TailwindCSS
- PWA (@vite-pwa/nuxt)

**Backend:**
- NestJS (TypeScript)
- PostgreSQL 16
- Redis 7 (кэширование)
- TypeORM (миграции)
- Winston (логирование)
- Swagger (API документация)

**Безопасность:**
- Helmet.js (security headers)
- Rate limiting (защита от DDoS)
- CORS (контроль доступа)
- JWT authentication
- Input validation (class-validator)

**Инфраструктура:**
# 🌿 Suvlavka — Souvenir & B2B platform

Suvlavka — B2B-платформа для работы с заказами партнерских магазинов (без фокуса на розничный сценарий).

Ключевые цели проекта:
- Чистый, понятный UI и отличная мобильная поддержка (PWA-ready)
- Быстрый каталог и удобные фильтры
- Прозрачная архитектура с разделением frontend / backend

---

## 🚀 Быстрый старт (локально)

Требования:
- Node.js 18+
- Docker & Docker Compose (рекомендуется для локальной развёртки)

Локальный запуск через Docker:

```bash
git clone <repo-url>
cd suvlavka
cp .env.example .env
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:4000
```

Локальный запуск без Docker:

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run start:dev

# Frontend
cd ../frontend
npm install
npm run dev
```

---

## 📁 Структура репозитория (кратко)

- `backend/` — NestJS API, TypeORM, миграции, админные эндпоинты
- `frontend/` — Nuxt 3 + Vue 3 + Pinia + TailwindCSS (магазин + админка + B2B)
- `docs/` — техническая документация
- `docker-compose.yml` — локальная среда

---

## 🧭 Архитектура и важные детали

- Backend: NestJS, PostgreSQL (TypeORM), Redis для кэша, JWT auth
- Frontend: Nuxt 3, компоненты ProductCard, ProductPriceBlock, B2B и Admin layouts
- API: REST-эндпоинты, Swagger в dev (`/api/docs`)

Подробное описание архитектуры: [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)

---

## 🛠 Технологии

- Frontend: Nuxt 3, Vue 3, TypeScript, Pinia, TailwindCSS
- Backend: NestJS, TypeScript, TypeORM, PostgreSQL, Redis
- Инфраструктура: Docker, docker-compose

---

## 🧩 Особенности и поведение цен (B2B)

- На карточке товара отображаются розничная и оптовая цены.
- Если оптовая цена отсутствует — показывается только розничная.
- Если оптовая цена равна розничной, автоматически применяется минимальная скидка 5% в UI.
- Для пользователей с ролью `store` оптовая цена рассчитывается с учётом их `storeContext.discountPercent`.

---

## 🧪 Разработка

Backend (dev):
```bash
cd backend
npm install
npm run start:dev
```

Frontend (dev):
```bash
cd frontend
npm install
npm run dev
```

Сборка production:
```bash
cd frontend
npm run build

cd ../backend
npm run build
```

---

## 📚 Документация

- Технические документы находятся в папке `docs/`.
- Начать обзор Архитектуры и быстрый вход — [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md).

---

## 🤝 Вклад

См. [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

---

## Контакты

Автор: Nikita Lavrentev (lavrentevnikita-afk)

---

_Последнее обновление: 31 января 2026_
