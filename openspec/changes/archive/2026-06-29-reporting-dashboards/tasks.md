## 1. Reporting — Service (backend)

- [x] 1.1 `ReportRangeDto` (`from?`, `to?` `@IsOptional @IsDateString`) + date-range where helper (`from`→ start-of-day `$gte`, `to`→ end-of-day `$lte`)
- [x] 1.2 `registration(range)` — customers by `createdAt`; `{ rows, summary: { count } }`
- [x] 1.3 `purchaseOrders(range)` — POs by `orderDate`, populated; rows with `lineCount`/`totalCost`; `summary: { count, totalCost }`
- [x] 1.4 `imports(range)` — imports by `importDate`, populated; rows with `totalQty`; `summary: { count, totalQty }`
- [x] 1.5 `sales(range)` — sales by `saleDate`, populated; `summary: { count, totalRevenue }`
- [x] 1.6 `reservations(range)` — reservations by `resDate`, populated; rows with `total`/`balance`; `summary: { count, totalDeposit }`
- [x] 1.7 `bestSellers(range)` — grouped query over `sale_details`⨝`books`⨝`sales`; `SUM(qty)`/`SUM(qty*price)` grouped by book, `ORDER BY qty DESC`; sale-date range filter (raw SQL via `em.getConnection().execute`)

## 2. Reporting — Controller & Module (backend)

- [x] 2.1 `ReportsController` — `GET /api/reports/{registration,purchase-orders,imports,sales,reservations,best-sellers}` with `@Query()` range, under `JwtAuthGuard`
- [x] 2.2 `{ data, message }` envelope
- [x] 2.3 `ReportingModule` + import into `AppModule`

## 3. Frontend — Reports

- [x] 3.1 Add `chart.js`; reports API module (one fn per report taking `{from,to}`)
- [x] 3.2 `ReportsView` — report-type `Select` + two `DatePicker` (from/to) + "Run" (PrimeVue 4: Calendar → DatePicker)
- [x] 3.3 `DataTable` with columns switched per report type (dot-path + date formatting); summary line
- [x] 3.4 Best-sellers — ranked table + PrimeVue `Chart` (bar of books by qty)
- [x] 3.5 Route + menu entry + dashboard tile (auth-gated)

## 4. Verification

- [x] 4.1 All 6 endpoints return data; shapes correct (registration 6, PO totalCost 329.50, imports totalQty 26, sales revenue 37.50, reservations deposit 15.00, best-sellers ranked)
- [x] 4.2 Date filter: today→1, far-past→0, future→0; one-bound and no-bound correct
- [x] 4.3 Best-sellers ranked by total qty sold descending (`ranked_desc=true`); future range → 0 rows
- [x] 4.4 No token → `401`; invalid date → `400`
- [x] 4.5 Backend typecheck + frontend typecheck/build pass (chart.js lazy-loaded); boxes ticked
