## 1. Employee Auth (backend)

- [x] 1.1 Add `LoginDto` (username, password) with class-validator
- [x] 1.2 Implement `AuthService.validateEmployee()` — lookup by username, `bcrypt.compare`, return user payload or null
- [x] 1.3 Implement `AuthService.login()` — sign JWT `{ sub: empId, username, role }`, return `{ access_token, user }`
- [x] 1.4 Add `AuthController` `POST /api/auth/login` (public), wire into `AuthModule` (inject employee repo / EntityManager)
- [x] 1.5 Verify `401` on wrong password and on unknown username (generic message) — both return 401, generic message

## 2. Admin Seeder (backend)

- [x] 2.1 Add `seed:admin` script using MikroORM standalone init + config
- [x] 2.2 Create admin from env (`SEED_ADMIN_USER`/`SEED_ADMIN_PASSWORD`) with bcrypt hash; warn if default password used
- [x] 2.3 Make idempotent — no-op when an admin already exists; run once and confirm login works (verified: 2nd run no-op, login works)

## 3. Employees CRUD (backend)

- [x] 3.1 `CreateEmployeeDto` / `UpdateEmployeeDto` (role enum admin|staff; password optional on update)
- [x] 3.2 `EmployeesService` CRUD; hash password on create and on password change
- [x] 3.3 Duplicate username → `409 Conflict` (pre-check + catch DB unique error)
- [x] 3.4 `EmployeesController` `/api/employees` with `JwtAuthGuard` + `@Roles('admin')` on all routes
- [x] 3.5 Ensure responses never include `password` (verified via `wrap().toObject()` honoring `hidden`)

## 4. Categories & Book Types CRUD (backend)

- [x] 4.1 Categories DTOs + `CategoriesService` CRUD
- [x] 4.2 Block category delete when referenced by a book (`count()` > 0 → `409`)
- [x] 4.3 Book Types DTOs + `BookTypesService` CRUD
- [x] 4.4 Block book-type delete when referenced by a book (`409`)
- [x] 4.5 Controllers `/api/categories`, `/api/book-types` — admin writes, staff reads

## 5. Books CRUD (backend)

- [x] 5.1 `CreateBookDto` / `UpdateBookDto` (title, catId, typeId, price; NO stock)
- [x] 5.2 `BooksService` CRUD — validate category & type exist, force `stock = 0` on create
- [x] 5.3 Ignore any stock value in create/update payloads — NOTE: enforced by rejection (`400` via global `forbidNonWhitelisted`) rather than silent ignore; stock stays server-controlled either way
- [x] 5.4 `BooksController` `/api/books` — admin writes, staff reads

## 6. Customers & Suppliers CRUD (backend)

- [x] 6.1 Customers DTOs + `CustomersService` CRUD (create with `otpVerified = false`)
- [x] 6.2 Suppliers DTOs + `SuppliersService` CRUD
- [x] 6.3 Controllers `/api/customers`, `/api/suppliers` — admin/staff
- [x] 6.4 Register all resources in `MasterDataModule`; import into `AppModule`

## 7. Response Envelope & Validation

- [x] 7.1 Return `{ data, message }` consistently across master-data endpoints
- [x] 7.2 Confirm global `ValidationPipe` rejects unknown/invalid fields with `400`

## 8. Frontend — Auth & Shared UI

- [x] 8.1 Implement real `LoginView` — call `/api/auth/login`, store token+user in auth store, redirect
- [x] 8.2 Add API service modules per resource (employees, categories, book-types, books, customers, suppliers) via `createCrudApi` factory
- [x] 8.3 Build reusable `CrudTable.vue` (DataTable + Column + actions)
- [x] 8.4 Build reusable `CrudDialog.vue` (Dialog + InputText/Select/InputNumber/Password) + `ResourceManager.vue` orchestrator
- [x] 8.5 Add `Toast` feedback + confirm-on-delete (ConfirmDialog)

## 9. Frontend — Management Views

- [x] 9.1 EmployeesView (admin-only) with role Select; password omitted on edit
- [x] 9.2 CategoriesView + BookTypesView (409 delete-block surfaced as a warn toast)
- [x] 9.3 BooksView with category/type Selects (stock shown read-only, not in form)
- [x] 9.4 CustomersView + SuppliersView
- [x] 9.5 Routes + role-aware Menubar; employee route admin-gated via `meta.adminOnly` guard

## 10. Verification

- [x] 10.1 Seed admin + exercise each CRUD end-to-end via the live API (auth, employees, categories, book-types, books, customers, suppliers). NOTE: backend driven via HTTP; the UI was build/transform-verified, not browser-driven
- [x] 10.2 Confirm business rules: duplicate username `409`, category/type delete block `409`, new book `stock = 0` — all verified live
- [x] 10.3 Backend typecheck + frontend typecheck/build pass; boxes ticked
