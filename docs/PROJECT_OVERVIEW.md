# Project Overview — Suvlavka

This document provides a concise technical overview of the project structure, main modules and runtime concerns.

## High-level architecture

- Frontend (Nuxt 3)
  - SPA/SSR hybrid with B2B кабинетами для магазинов и админ-операционкой (B2B-first)
  - Key components: `ProductCard`, `ProductPriceBlock`, `Admin*` pages
  - State: Pinia stores (`auth`, `cart`, B2B/admin operational stores)
  - Styling: TailwindCSS

- Backend (NestJS)
  - REST API with controllers grouped by domain (auth, b2b, admin, catalog, orders)
  - Data access: TypeORM + PostgreSQL
  - Redis used for caching and task coordination
  - Authentication: JWT (access token sent via Authorization header)

## Important runtime behavior

- Pricing
  - Основной пользовательский режим — B2B (`store`) c персональными оптовыми ценами.
  - Цены для магазина рассчитываются через `storeContext.discountPercent` и/или `priceInfo.final`.
  - Retail-поведение считается legacy и не является целевым направлением развития.

- B2B / Stores
  - Stores are users with role `store` and have `storeProfile` containing `discountPercent`, `status` and other metadata.
  - Admin UI allows opening a store card in a modal to edit `status`, `discountPercent` and `notes`.

## Developer workflows

- Local dev
  - Quick: `docker-compose up -d` (services: frontend, backend, db, redis)
  - Direct developer run: `cd backend && npm run start:dev`, `cd frontend && npm run dev`

- Migrations
  - TypeORM migrations live in `backend/src/migrations`
  - Generate: `npm run migration:generate -- src/migrations/Name`
  - Run: `npm run migration:run`

## Where to look first in the codebase

- Frontend pages: `frontend/pages/` (account, admin, b2b, product, catalog)
- Common components: `frontend/components/` (ProductCard.vue, ProductPriceBlock.vue)
- Pinia stores: `frontend/stores/`
- Backend controllers / services: `backend/src/*` (search `b2b`, `admin`, `orders`, `catalog`)

## Environment variables

Check `.env.example` for the complete list. Main variables:
- `API_BASE_URL` / `PORT` — runtime host/port values
- `JWT_SECRET` — secret for signing tokens
- `POSTGRES_*` — database credentials
- `REDIS_HOST` — Redis host
- `S3_*` — object storage credentials

## Monitoring & health

- Healthcheck endpoints: `/health/live`, `/health/ready`
- Swagger (dev): `/api/docs`
- Logs: `backend/logs/` — Winston file rotation

## Next recommended docs improvements

- Maintain an `ARCHITECTURE.md` with sequence diagrams of order flow
- Add a `DEPLOYMENT.md` with CI/CD steps and image build reproducibility
- Add an `OPERATIONS.md` with backups and restore procedures

