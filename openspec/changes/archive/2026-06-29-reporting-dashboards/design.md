## Context

All operational entities exist and are populated by Sections 2–7, each carrying a timestamp set on insert: `Customer.createdAt`, `PurchaseOrder.orderDate`, `Import.importDate`, `Sale.saleDate`, `Reservation.resDate`, and `SaleDetail` for best-sellers. The design's reporting note says reports are "query from existing entities via EntityManager / QueryBuilder — no new tables". This change adds a thin read-only layer over that data, reusing the established `{ data, message }` envelope, `serialize()`, and `JwtAuthGuard`.

## Goals / Non-Goals

**Goals:**
- Six report endpoints, each filterable by an inclusive `from`/`to` date range on its natural date field.
- A best-sellers ranking by total quantity sold, descending, optionally within a sale-date range.
- A small per-report summary (count + relevant total) for at-a-glance numbers.
- A single frontend Reports view with date pickers, a results table, and a chart for best-sellers.

**Non-Goals:**
- New persisted data, materialized views, or scheduled/exported reports (CSV/PDF).
- Pagination of report rows (volumes are modest; revisit with lazy tables if needed).
- Per-role data scoping or fine-grained permissions beyond "authenticated".
- Caching — queries run live each request.

## Decisions

- **Shared date-range filter.** A `ReportRangeDto { from?, to? }` (`@IsOptional @IsDateString`) read via `@Query`. A helper builds a MikroORM where-clause on the entity's date field: `from` → `$gte start-of-day`, `to` → `$lte end-of-day` (so `to` includes the whole day). Missing bounds are simply omitted; missing both → no date filter.
- **Five list reports via `em.find` + populate + compute.** Each loads the relevant entity in range with its relations and maps to a row shape, reusing the per-row computations from earlier sections (PO `totalCost`/`lineCount`, import `totalQty`, reservation `total`/`balance`). Each returns `{ rows, summary }` where summary holds `count` and the natural total (PO cost, sales revenue, import qty, reservation deposits, registrations count).
- **Best-sellers via a grouped query.** A single SQL aggregation over `sale_details` joined to `books` (title) and `sales` (date filter): `SUM(qty)` and `SUM(qty*price)` grouped by book, `ORDER BY total_qty DESC`. Run through `em.getConnection().execute(sql, params)` for a clean grouped result without fighting entity hydration; numeric `SUM`s (returned as strings by the driver) are cast to numbers in the mapper. The date filter applies to the parent sale's `sale_date`.
- **Read-only + auth.** All endpoints `GET`, under `JwtAuthGuard` (admin + staff). No writes, no transactions.
- **Envelope.** `{ data, message }`; for list reports `data = { rows, summary }`, for best-sellers `data = rows`.
- **Frontend: one `ReportsView`.** A report-type `Select`, two `Calendar` inputs (from/to), a "Run" action, and a `DataTable` whose columns switch per report type. Best-sellers additionally renders a PrimeVue `Chart` (bar) of the top books by quantity. Dates are sent as `YYYY-MM-DD`.
- **`chart.js` dependency.** PrimeVue's `Chart` wraps chart.js; it is added as a frontend dependency. If it were omitted, the table alone would still satisfy the report — the chart is an enhancement for best-sellers, matching the spec's "DataTable/Chart".

## Risks / Trade-offs

- **Raw SQL for best-sellers** ties that one query to the SQL dialect (MySQL). Acceptable: the project is committed to MySQL, and the entity-based reports stay portable. The query is parameterized (no injection).
- **Inclusive `to` via end-of-day** depends on server timezone; for a single-shop deployment this matches user expectation. A timezone-aware range is a future refinement.
- **No pagination** means very large date ranges return everything; fine at bookstore scale, and the summary gives totals without scrolling. Lazy `DataTable` is the escape hatch.
- **Live queries each request** (no cache) keep data fresh at a small per-call cost — appropriate for an internal tool.
- **Adding `chart.js`** grows the frontend bundle slightly; isolated to the Reports route (lazy-loaded), so it does not affect the rest of the app.
