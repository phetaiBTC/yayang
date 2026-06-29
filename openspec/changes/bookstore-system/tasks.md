# Tasks: Bookstore Management System (NestJS + MikroORM + Vue + PrimeVue)

## 1. Setup
- [x] 1.1 Scaffold backend: `nest new back` (pre-existing scaffold; uses pnpm)
- [x] 1.2 Scaffold frontend: `npm create vite@latest front -- --template vue-ts` (pre-existing scaffold; uses pnpm)
- [x] 1.3 Install backend deps: @mikro-orm/core, @mikro-orm/nestjs, @mikro-orm/mysql (MySQL chosen), @mikro-orm/migrations, @mikro-orm/reflection, class-validator, @nestjs/jwt, @nestjs/passport, passport-jwt, bcryptjs, @nestjs/config, dotenv (MikroORM pinned to v6 — v7 dropped the decorator API the spec requires)
- [x] 1.4 Add entities (from design.md) + mikro-orm.config.ts; migration:create + migration:up applied (15 tables created in MySQL `bookstore`)
- [x] 1.5 Register MikroOrmModule.forRoot + global ValidationPipe
- [x] 1.6 Auth: JwtAuthGuard + RolesGuard + @Roles decorator
- [x] 1.7 Install frontend deps: primevue, @primeuix/themes, primeicons, pinia, vue-router, axios; register PrimeVue + Aura theme in main.ts; Axios client with JWT interceptor

## 2. Master Data
### Backend (MasterDataModule)
- [ ] 2.1 Employees CRUD (unique username, hash password)
- [ ] 2.2 Categories CRUD (block delete if referenced by a book)
- [ ] 2.3 BookTypes CRUD
- [ ] 2.4 Books CRUD (stock defaults to 0)
- [ ] 2.5 Customers CRUD
- [ ] 2.6 Suppliers CRUD
### Frontend
- [ ] 2.7 PrimeVue views: DataTable + Dialog forms per entity (admin-gated)

## 3. Registration
- [ ] 3.1 POST /api/register (create customer, otp_verified=false)
- [ ] 3.2 Generate + send OTP (cache)
- [ ] 3.3 POST /api/register/verify-otp (set otp_verified=true)
- [ ] 3.4 Frontend: registration + OTP entry views

## 4. Purchasing
- [ ] 4.1 GET /api/books for selection
- [ ] 4.2 POST /api/purchase-orders (header + lines[], status=pending, reject empty)
- [ ] 4.3 Frontend (PrimeVue): create PO view (DataTable lines + Dialog)

## 5. Importing
- [ ] 5.1 GET PO bill, block if status=received
- [ ] 5.2 POST /api/imports → em.transactional: create import + details, stock += qty, PO status=received
- [ ] 5.3 Frontend: import-from-PO view

## 6. Selling
- [ ] 6.1 Add lines with stock validation
- [ ] 6.2 POST /api/sales → em.transactional: save sale + details, compute total, stock -= qty
- [ ] 6.3 Frontend (PrimeVue): POS sale view (DataTable + Dialog) + payment Dropdown

## 7. Reservation
- [ ] 7.1 POST /api/reservations (header + lines[], status=booked)
- [ ] 7.2 Record deposit
- [ ] 7.3 Generate reservation bill
- [ ] 7.4 PATCH status (booked→ready→completed/cancelled)
- [ ] 7.5 Mark ready-eligible when stock imported
- [ ] 7.6 Frontend: reserve + status tracking views

## 8. Reporting
- [ ] 8.1 GET /api/reports/registration (date filter)
- [ ] 8.2 GET /api/reports/purchase-orders
- [ ] 8.3 GET /api/reports/imports
- [ ] 8.4 GET /api/reports/sales
- [ ] 8.5 GET /api/reports/reservations
- [ ] 8.6 GET /api/reports/best-sellers (rank by qty sold desc)
- [ ] 8.7 Frontend (PrimeVue): report views with Calendar filters + DataTable/Chart
