# Руководство по разработке (DEVELOPMENT)

Этот документ описывает, как запустить проект **Souvenir Shop** локально и как устроена структура фронтенда и бэкенда.

---

## 1. Требования

- Node.js **18+**
- npm / pnpm / yarn (в примерах — `npm`)
- Docker + docker-compose (желательно, но не обязательно для старта)
- Git

Для продвинутой разработки (позже):

- Postgres и Redis (локально или в Docker)
- Инструменты для тестов (Playwright, Vitest, Jest) — будут добавляться постепенно.

---

## 2. Структура репозитория

```text
souvenir-shop-v2/
├── ARCHITECTURE_AND_DEPLOYMENT.md
├── CONTRIBUTING.md
├── DEVELOPMENT.md
├── ROADMAP.md
├── README.md
├── docker-compose.yml           # (будет расширяться)
├── frontend/                    # Nuxt 3 (Vue 3, TS, PWA, Tailwind)
└── backend/                     # NestJS (TS) API
```

---

## 3. Frontend (Nuxt 3, PWA, Tailwind, Pinia)

### 3.1. Установка зависимостей

```bash
cd frontend
npm install
```

### 3.2. Запуск dev-сервера

```bash
npm run dev
```

По умолчанию: `http://localhost:3000`.

В скелете уже есть:

- базовые pages:
  - `/` — главная,
  - `/catalog`,
  - `/catalog/[slug]`,
  - `/product/[id]`,
  - `/cart`,
  - `/b2b/...` (заглушки).
- layouts:
  - `default` — публичный,
  - `b2b` — для кабинета магазина.
- подключены:
  - Pinia (`stores/`),
  - PWA-модуль,
  - TailwindCSS (базовая конфигурация).

### 3.3. Сборка

```bash
npm run build
npm run preview
```

`preview` поднимает локальный сервер с продакшн-сборкой.

---

## 4. Backend (NestJS)

### 4.1. Установка зависимостей

```bash
cd backend
npm install
```

### 4.2. Запуск dev-сервера

```bash
npm run start:dev
```

По умолчанию API будет на `http://localhost:4000`.

В скелете:

- базовый `AppController` с:
  - `GET /health` — проверка,
  - `GET /api/catalog/categories` — заглушка,
  - `GET /api/catalog/products` — заглушка,
  - `GET /api/catalog/products/:id` — заглушка.

Эти эндпойнты используются фронтендом для отображения тестового каталога.

---

## 5. Связка frontend и backend

В dev-режиме:

- frontend → `http://localhost:3000`
- backend → `http://localhost:4000`

Nuxt получает `NUXT_PUBLIC_API_BASE_URL` из `.env`:

Создайте `frontend/.env`:

```bash
NUXT_PUBLIC_API_BASE_URL=http://localhost:4000
NUXT_PUBLIC_APP_NAME=Souvenir Shop
NUXT_PUBLIC_PWA_ENABLED=true
```

Фронтенд будет вызывать API так:

- `/api/catalog/categories`
- `/api/catalog/products`

с baseURL, указанным в конфиге.

---

## 6. Docker и docker-compose (набросок)

На раннем этапе можно запускать всё вручную. Далее планируется:

`docker-compose.yml`:

- `frontend` (Nuxt dev/prod),
- `backend` (NestJS),
- `db` (Postgres),
- `redis` (Redis).

Базовый сценарий:

```bash
docker-compose up --build
```

---

## 7. Тестирование

Пока тесты минимальны и могут быть заглушками. План:

- Frontend:
  - Vitest для unit-тестов;
  - Playwright для e2e.
- Backend:
  - Jest (NestJS по умолчанию).

Команды (будут добавляться в `package.json`):

```bash
# Frontend
npm run test:unit
npm run test:e2e

# Backend
npm test
```

---

## 8. Работа с PWA в dev-режиме

В dev-режиме PWA и сервис-воркеры могут кэшировать устаревшие ресурсы.

Если проявляются странности (не обновляется контент):

- очистите кэш браузера;
- отключите SW в dev через DevTools;
- перезапустите dev-сервер Nuxt.

---

## 9. Локальное хранение изображений

На старте:

- Изображения сохраняются в папку, например `backend/uploads/` (или отдельную директорию на сервере).
- URL вида `/media/products/...` маппятся на эту папку.

На этапе реального бекенда:

- будет реализован сервис для загрузки и выдачи изображений;
- предусмотрен слой абстракции, чтобы затем перенести хранение в другое место без переписывания фронта.

---

## 10. Полезные команды (сводка)

```bash
# Frontend
cd frontend
npm install
npm run dev
npm run build
npm run preview

# Backend
cd backend
npm install
npm run start:dev
npm run build
npm run start:prod
```

Если что-то идёт не так — первым делом проверьте:

- установлен ли Node нужной версии,
- заданы ли переменные окружения,
- доступен ли backend по адресу, указанному во фронтенде.
