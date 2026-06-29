## Why

Sections 2–7 produce all the operational data — customers, purchase orders, imports, sales, reservations. Section 8 is the payoff: six read-only reports that let the shop see what happened over a date range, plus a best-sellers ranking. It is the final section, adds no new business state, and simply queries and aggregates what already exists.

## What Changes

- **Six report endpoints** under `/api/reports`, each accepting an optional `from`/`to` date range (inclusive):
  - `registration` — customers registered (by `created_at`)
  - `purchase-orders` — POs placed (by `order_date`), with per-order total + line count
  - `imports` — imports received (by `import_date`), with received quantities
  - `sales` — sales made (by `sale_date`), with totals + payment method
  - `reservations` — reservations (by `res_date`), with status, deposit, total, balance
  - `best-sellers` — books ranked by **total quantity sold, descending** (from `sale_details`, optionally within a sale-date range)
- **Date filtering**: when both/either of `from`/`to` are given, only records whose relevant date falls in `[from 00:00, to 23:59:59]` are returned; with no range, all records.
- **Summaries**: each list report returns a small summary (count and the relevant money/qty total) alongside the rows.
- **Frontend**: a Reports view — a report-type selector, two `Calendar` date pickers (from/to), a `DataTable` of results, and a bar `Chart` for best-sellers.

## Capabilities

### New Capabilities
- `reporting`: six date-filterable operational reports (registration, purchase-orders, imports, sales, reservations) plus a best-sellers ranking, queried from existing data.

### Modified Capabilities
<!-- None. Read-only aggregation over existing entities; no requirement or schema changes. -->

## Impact

- **Backend** (`back/`): new `ReportingModule` (`ReportsController`, `ReportsService`). Uses the `EntityManager` for filtered `find`s and a grouped query (QueryBuilder/raw) for best-sellers. Reuses all existing entities + `serialize()` + `{ data, message }`. No writes.
- **Frontend** (`front/`): new `ReportsView` (report Dropdown + `Calendar` from/to + `DataTable` + `Chart` for best-sellers); reports API module; route + menu + dashboard tile (auth-gated). Adds `chart.js` (PrimeVue `Chart` peer dependency).
- **API**: adds `GET /api/reports/registration`, `/purchase-orders`, `/imports`, `/sales`, `/reservations`, `/best-sellers` (all accept `?from=&to=`).
- **Dependencies**: frontend adds `chart.js` for the best-sellers chart; backend none.
- **Data**: no schema change — read-only queries over the existing tables.
