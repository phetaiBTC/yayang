## Why

Section 1 (Setup) is complete: NestJS + MikroORM (v6, decorator API), MySQL schema (14 tables migrated), JWT/role guards, and the Vue + PrimeVue shell with an auth store and route guard. None of it is usable yet because there is no way to log in and no data to manage. Master Data is the foundation every later capability (purchasing, importing, selling, reservation, reporting) reads from, so it must come first.

## What Changes

- **Employee login**: add `POST /api/auth/login` (username + password → JWT `{ access_token, user }`) so the guards and the front-end auth store wired in Section 1 become functional.
- **Admin seeding**: provide a one-time seeder/CLI to create the first `admin` employee, resolving the chicken-and-egg of employee CRUD requiring an admin to already exist.
- **Six CRUD resources** under `MasterDataModule`: employees, categories, book-types, books, customers, suppliers — each `GET/POST/PATCH/DELETE /api/<resource>`.
- **Business-rule enforcement**: unique employee `username` (bcrypt-hashed password, never returned); category/book-type cannot be deleted while referenced by a book; new books always start at `stock = 0`.
- **Front-end**: a real `LoginView`, reusable PrimeVue `DataTable` + `Dialog` CRUD wrappers, and one admin-gated management view per entity.

## Capabilities

### New Capabilities
- `employee-auth`: employee authentication — login endpoint issuing JWT, password hashing, and first-admin seeding.
- `master-data`: CRUD management of the six core lookup/master entities with their business rules (unique username, referential-delete protection, default stock).

### Modified Capabilities
<!-- None. This change introduces new capabilities only. -->

## Impact

- **Backend** (`back/`): new `MasterDataModule` (employees, categories, book-types, books, customers, suppliers — controller/service/dto each); `AuthService` + `AuthController` added to the existing `auth/`; a seeder script. Reuses existing entities, `JwtAuthGuard`, `RolesGuard`, `@Roles`.
- **Frontend** (`front/`): real `LoginView`, reusable `CrudTable`/`CrudDialog` components, six management views, per-resource API services, role-aware routing/menu. Reuses the existing Axios client and Pinia auth store.
- **API**: adds `/api/auth/login`, `/api/employees`, `/api/categories`, `/api/book-types`, `/api/books`, `/api/customers`, `/api/suppliers`.
- **Dependencies**: none new (bcryptjs, JWT, class-validator, PrimeVue already installed in Section 1).
- **Data**: no schema change — operates on tables created by the Section 1 migration.
