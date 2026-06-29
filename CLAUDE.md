# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project
Bookstore Management System (ລະບົບຈັດການຮ້ານຂາຍປຶ້ມ).
Spec-driven via OpenSpec. Specs are the source of truth — read them before coding.

## Tech Stack (REQUIRED)
- **Backend:** NestJS (TypeScript) + **MikroORM** (`@mikro-orm/nestjs`) — `back/`
- **Frontend:** Vue 3 (`<script setup>`, TypeScript, Vite) + **PrimeVue** (UI) — `front/`
- **Database:** MySQL or PostgreSQL via MikroORM
- **Auth:** JWT (access token) + role guard (admin/staff); OTP for customer registration

Do NOT introduce other frameworks (no Express-only, React, Angular, Prisma, TypeORM) without a spec change.

## Repository Layout
```
back/                 # NestJS API
front/                # Vue 3 app
openspec/
├── project.md
├── specs/            # archived source-of-truth
└── changes/bookstore-system/
    ├── proposal.md   # why + scope
    ├── design.md     # architecture + DBML schema
    ├── tasks.md      # implementation checklist
    └── specs/<capability>/spec.md
```

## Workflow
1. Before any feature, read the relevant `openspec/changes/bookstore-system/specs/<capability>/spec.md`.
2. Implement against `tasks.md`, one section at a time. Tick boxes as you go.
3. Keep behavior aligned with the GIVEN/WHEN/THEN scenarios — they are acceptance criteria.
4. If requirements change, update the spec FIRST, then code.

## Backend Conventions (NestJS + MikroORM)
- One module per capability: `MasterDataModule`, `RegistrationModule`, `PurchasingModule`, `ImportingModule`, `SellingModule`, `ReservationModule`, `ReportingModule`.
- Structure per module: `*.controller.ts`, `*.service.ts`, `dto/`, `entities/`.
- Validation with `class-validator` DTOs. Global `ValidationPipe`.
- MikroORM entities with decorators (`@Entity`, `@Property`, `@ManyToOne`, `@OneToMany`). Inject repositories via `@InjectRepository(Entity)` or use the `EntityManager`.
- Use the MikroORM **Identity Map + Unit of Work**: call `em.flush()` once per request; wrap multi-write operations with `em.transactional(async (em) => {...})`.
- Guards: `JwtAuthGuard` + `RolesGuard` with `@Roles('admin'|'staff')`.
- Stock mutations (import +, sale −) MUST run inside `em.transactional()`.

## Frontend Conventions (Vue 3 + PrimeVue)
- Vite + TypeScript + `<script setup>`.
- **PrimeVue** for UI components: `DataTable`/`Column` for lists, `Dialog` + form inputs (`InputText`, `Dropdown`, `InputNumber`, `Calendar`) for forms, `Toast` for feedback, `Button`, `Tag` for status. Use PrimeVue theme + PrimeIcons.
- Pinia for state, Vue Router for routing, Axios for API.
- One view folder per capability under `src/views/`.
- Reusable form/table wrappers under `src/components/`.

## API Conventions
- REST, prefix `/api`. Resource routes: `/api/books`, `/api/purchase-orders`, `/api/sales`, `/api/reservations`, `/api/reports/...`.
- Header + details transactions accept a parent object with a `lines[]` array in one request.
- Return JSON `{ data, message }`; errors use Nest exception filters.

## Business Rules (must enforce)
- Unique `username` for employees.
- A category/type in use cannot be deleted.
- New books start at `stock = 0`.
- Customer is inactive until `otp_verified = true`.
- Purchase order is `pending` until imported, then `received`; cannot import twice.
- Cannot sell more than available stock.
- Reservation status flow: `booked → ready → completed | cancelled`.

## Commands (fill in once scaffolded)
- Backend dev: `cd back && npm run start:dev`
- Frontend dev: `cd front && npm run dev`
- MikroORM migration: `cd back && npx mikro-orm migration:create` then `npx mikro-orm migration:up`
