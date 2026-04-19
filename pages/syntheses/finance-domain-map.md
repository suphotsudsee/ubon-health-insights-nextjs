---
title: Finance Domain Map
type: synthesis
status: active
created: 2026-04-19
updated: 2026-04-19
tags:
  - synthesis
  - finance
  - domain-map
sources: []
---

# Finance Domain Map

## Role
This note maps the finance domain from page surfaces to actions, APIs, and persistence.

## Main Surfaces
- [app/finance/page.tsx](../../app/finance/page.tsx): finance landing surface.
- [app/finance/dashboard/page.tsx](../../app/finance/dashboard/page.tsx): finance dashboard view.
- [app/finance/list/page.tsx](../../app/finance/list/page.tsx): finance record list.
- [app/finance/income/create/page.tsx](../../app/finance/income/create/page.tsx): income create flow.
- [app/finance/expense/create/page.tsx](../../app/finance/expense/create/page.tsx): expense create flow.
- [components/finance/FinanceDashboard.tsx](../../components/finance/FinanceDashboard.tsx): finance dashboard composition.
- [components/finance/FinanceEntryForm.tsx](../../components/finance/FinanceEntryForm.tsx): finance create/edit form.

## Server Layer
- [src/actions/finance.ts](../../src/actions/finance.ts): finance CRUD and reporting aggregations.
- [src/actions/finance-accounts.ts](../../src/actions/finance-accounts.ts): account synchronization and lookup.
- [src/app/api/finance/records/route.ts](../../src/app/api/finance/records/route.ts): finance records API under `src/`.
- [src/app/api/finance/records/[id]/route.ts](../../src/app/api/finance/records/[id]/route.ts): record-by-id API.
- [src/app/api/finance/import/route.ts](../../src/app/api/finance/import/route.ts): finance import API.
- [src/app/api/finance-accounts/route.ts](../../src/app/api/finance-accounts/route.ts): finance account API.

## App Router Mirror
- [app/api/finance/records/route.ts](../../app/api/finance/records/route.ts)
- [app/api/finance/records/[id]/route.ts](../../app/api/finance/records/[id]/route.ts)
- [app/api/finance/import/route.ts](../../app/api/finance/import/route.ts)
- [app/api/finance-accounts/route.ts](../../app/api/finance-accounts/route.ts)

## Persistence
- [prisma/schema.prisma](../../prisma/schema.prisma): `FinanceRecord`, `FinanceAccount`, `FiscalPeriod`, and `HealthUnit` relations.
- [scripts/import-finance-xlsx.ts](../../scripts/import-finance-xlsx.ts): spreadsheet import path.
- [state/finance-import.xlsx](../../state/finance-import.xlsx): example local import artifact.

## Related
- [dashboard-data-flow.md](./dashboard-data-flow.md)
- [persistence-and-import-pipeline.md](./persistence-and-import-pipeline.md)
- [api-surface-map.md](./api-surface-map.md)
- [../projects/ubon-health-insights-code-map.md](../projects/ubon-health-insights-code-map.md)
