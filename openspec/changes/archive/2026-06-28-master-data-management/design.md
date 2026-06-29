## Context

Section 1 delivered the runnable skeleton: NestJS + MikroORM v6 (decorator entities), a migrated MySQL schema (14 tables), `JwtAuthGuard` / `RolesGuard` / `@Roles`, and a Vue 3 + PrimeVue shell with a Pinia auth store, Axios JWT interceptor, and a route guard. The guards and store are inert because no login endpoint exists and no master data can be created. This change makes the system operable by adding employee authentication and CRUD for the six master entities, reusing — not replacing — the Section 1 infrastructure. Source of truth: [specs/master-data/spec.md](../bookstore-system/specs/master-data/spec.md) and CLAUDE.md business rules.

## Goals / Non-Goals

**Goals:**
- Working employee login (`POST /api/auth/login`) returning a JWT and user payload compatible with the existing `JwtStrategy` (`sub`, `username`, `role`).
- A deterministic way to bootstrap the first admin (seeder), since employee CRUD is admin-gated.
- CRUD for employees, categories, book-types, books, customers, suppliers with the three enforced rules: unique username (hashed password), referential-delete protection on category/book-type, default `stock = 0`.
- Reusable PrimeVue CRUD UI (DataTable + Dialog) with role-aware access.

**Non-Goals:**
- Customer OTP registration flow (Section 3 / `registration`).
- Stock mutation logic (Sections 5/6 — import/sale).
- Password reset, refresh tokens, account lockout, pagination/search beyond basic list (can be added later without spec change).

## Decisions

- **Login identity = employee `username`.** Customers authenticate via a different flow (OTP, Section 3); the JWT `role` claim (`admin`|`staff`) drives `RolesGuard`. Alternative (single unified user table) rejected — the data model already separates `employees` and `customers`.
- **Password hashing with bcryptjs.** Already installed; entity field is `@Property({ hidden: true })` so it is never serialized. Hash on create and on password change in update.
- **First admin via a seeder script (`pnpm seed:admin`), not a public endpoint.** A self-registration endpoint for admins would be a security hole. The seeder is idempotent (no-op if an admin exists) and reads credentials from env with safe defaults. Alternative (manual SQL insert) rejected — password must be bcrypt-hashed by the app.
- **Referential-delete check via `count()` before remove.** On `DELETE /api/categories/:id` (and book-types), count referencing books; if > 0 throw `409 ConflictException`. Chosen over relying on a DB FK error because it yields a clear, localized message and avoids leaking driver errors.
- **`stock` is server-controlled.** The Book create DTO omits `stock`; the entity default (`0`) applies. Update DTO also omits `stock` — stock only moves through import/sale transactions in later sections.
- **Response envelope `{ data, message }`** per API conventions, via a thin interceptor or explicit controller returns; errors use Nest exception filters (default HTTP exceptions are sufficient).
- **Role gating:** writes to employees are admin-only; categories/book-types/books/customers/suppliers writes admin-only, reads available to admin and staff. Enforced with `@Roles('admin')` on mutating handlers + `JwtAuthGuard` globally on the module.
- **Frontend reuse:** two generic components — `CrudTable.vue` (wraps `DataTable`/`Column`) and `CrudDialog.vue` (wraps `Dialog` + form fields) — parameterized per entity to avoid six near-duplicate views.

## Risks / Trade-offs

- **Seeder credentials in env** → ship a `.env.example` default and require change in production; seeder logs a warning if the default password is used.
- **No pagination on list endpoints** → fine for expected master-data volumes; revisit with `DataTable` lazy mode if datasets grow. No spec change needed.
- **bcrypt cost vs. latency** → use default cost (10); acceptable for low-frequency login.
- **Duplicate username race** → rely on the DB `unique` constraint as the final guard; catch the driver unique error and return `409` even if a pre-check passes.
- **Two `master-data` specs now exist** (this change + `bookstore-system`) → this change's spec is the active contract for implementation; the bookstore-system umbrella remains the high-level reference.
