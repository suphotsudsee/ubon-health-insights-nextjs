---
title: API Surface Map
type: synthesis
status: active
created: 2026-04-19
updated: 2026-04-19
tags:
  - synthesis
  - api
  - route-handlers
sources: []
---

# API Surface Map

## Role
This note maps the route-handler surface and highlights that the project currently carries API handlers in both `app/api` and `src/app/api`.

## Main Observation
- There are duplicated or mirrored route families across `app/api` and `src/app/api`.
- Domain understanding should treat both trees as active until consolidation happens.

## Route Families
- Auth
  - [src/app/api/auth/[...nextauth]/route.ts](../../src/app/api/auth/[...nextauth]/route.ts)
  - [app/api/auth/[...nextauth]/route.ts](../../app/api/auth/[...nextauth]/route.ts)
  - [src/app/api/auth/users/route.ts](../../src/app/api/auth/users/route.ts)
  - [app/api/auth/users/route.ts](../../app/api/auth/users/route.ts)
- Finance
  - [src/app/api/finance/records/route.ts](../../src/app/api/finance/records/route.ts)
  - [src/app/api/finance/records/[id]/route.ts](../../src/app/api/finance/records/[id]/route.ts)
  - [src/app/api/finance/import/route.ts](../../src/app/api/finance/import/route.ts)
  - [app/api/finance/records/route.ts](../../app/api/finance/records/route.ts)
  - [app/api/finance/records/[id]/route.ts](../../app/api/finance/records/[id]/route.ts)
  - [app/api/finance/import/route.ts](../../app/api/finance/import/route.ts)
- Finance accounts
  - [src/app/api/finance-accounts/route.ts](../../src/app/api/finance-accounts/route.ts)
  - [src/app/api/finance-accounts/[id]/route.ts](../../src/app/api/finance-accounts/[id]/route.ts)
  - [app/api/finance-accounts/route.ts](../../app/api/finance-accounts/route.ts)
  - [app/api/finance-accounts/[id]/route.ts](../../app/api/finance-accounts/[id]/route.ts)
- KPI
  - [src/app/api/kpi/results/route.ts](../../src/app/api/kpi/results/route.ts)
  - [src/app/api/kpi/results/[id]/route.ts](../../src/app/api/kpi/results/[id]/route.ts)
  - [src/app/api/kpi/categories/route.ts](../../src/app/api/kpi/categories/route.ts)
  - [src/app/api/kpi/categories/[id]/route.ts](../../src/app/api/kpi/categories/[id]/route.ts)
  - [src/app/api/kpi/definitions/route.ts](../../src/app/api/kpi/definitions/route.ts)
  - [src/app/api/kpi/definitions/[id]/route.ts](../../src/app/api/kpi/definitions/[id]/route.ts)
  - [app/api/kpi/results/route.ts](../../app/api/kpi/results/route.ts)
  - [app/api/kpi/results/[id]/route.ts](../../app/api/kpi/results/[id]/route.ts)
  - [app/api/kpi-categories/route.ts](../../app/api/kpi-categories/route.ts)
  - [app/api/kpi-categories/[id]/route.ts](../../app/api/kpi-categories/[id]/route.ts)
  - [app/api/kpi-definitions/route.ts](../../app/api/kpi-definitions/route.ts)
  - [app/api/kpi-definitions/[id]/route.ts](../../app/api/kpi-definitions/[id]/route.ts)
- Health units and periods
  - [src/app/api/health-units/route.ts](../../src/app/api/health-units/route.ts)
  - [src/app/api/health-units/[id]/route.ts](../../src/app/api/health-units/[id]/route.ts)
  - [src/app/api/fiscal-periods/route.ts](../../src/app/api/fiscal-periods/route.ts)
  - [src/app/api/fiscal-periods/[id]/route.ts](../../src/app/api/fiscal-periods/[id]/route.ts)
  - [app/api/health-units/route.ts](../../app/api/health-units/route.ts)
  - [app/api/health-units/[id]/route.ts](../../app/api/health-units/[id]/route.ts)
  - [app/api/fiscal-periods/route.ts](../../app/api/fiscal-periods/route.ts)
  - [app/api/fiscal-periods/[id]/route.ts](../../app/api/fiscal-periods/[id]/route.ts)
- Dashboard and health
  - [app/api/dashboard/route.ts](../../app/api/dashboard/route.ts)
  - [app/api/health/route.ts](../../app/api/health/route.ts)

## Related
- [finance-domain-map.md](./finance-domain-map.md)
- [kpi-domain-map.md](./kpi-domain-map.md)
- [settings-admin-domain-map.md](./settings-admin-domain-map.md)
- [../projects/ubon-health-insights-code-map.md](../projects/ubon-health-insights-code-map.md)
