---
title: KPI Domain Map
type: synthesis
status: active
created: 2026-04-19
updated: 2026-04-19
tags:
  - synthesis
  - kpi
  - domain-map
sources: []
---

# KPI Domain Map

## Role
This note maps KPI definitions, KPI result entry, review, and reporting surfaces.

## Main Surfaces
- [app/page.tsx](../../app/page.tsx): top-level KPI-oriented dashboard summary.
- [app/ppfs/page.tsx](../../app/ppfs/page.tsx): PPFS category surface.
- [app/ttm/page.tsx](../../app/ttm/page.tsx): Thai traditional medicine KPI surface.
- [app/comparison/page.tsx](../../app/comparison/page.tsx): cross-unit comparison page.

## Server Layer
- [src/actions/kpi.ts](../../src/actions/kpi.ts): KPI definition fetch, KPI result CRUD, review workflow, and aggregations.
- [src/app/api/kpi/results/route.ts](../../src/app/api/kpi/results/route.ts): results collection endpoint.
- [src/app/api/kpi/results/[id]/route.ts](../../src/app/api/kpi/results/[id]/route.ts): result item endpoint.
- [src/app/api/kpi/categories/route.ts](../../src/app/api/kpi/categories/route.ts): category endpoint.
- [src/app/api/kpi/categories/[id]/route.ts](../../src/app/api/kpi/categories/[id]/route.ts): category item endpoint.
- [src/app/api/kpi/definitions/route.ts](../../src/app/api/kpi/definitions/route.ts): definition endpoint.
- [src/app/api/kpi/definitions/[id]/route.ts](../../src/app/api/kpi/definitions/[id]/route.ts): definition item endpoint.

## App Router Mirror
- [app/api/kpi/results/route.ts](../../app/api/kpi/results/route.ts)
- [app/api/kpi/results/[id]/route.ts](../../app/api/kpi/results/[id]/route.ts)
- [app/api/kpi-categories/route.ts](../../app/api/kpi-categories/route.ts)
- [app/api/kpi-categories/[id]/route.ts](../../app/api/kpi-categories/[id]/route.ts)
- [app/api/kpi-definitions/route.ts](../../app/api/kpi-definitions/route.ts)
- [app/api/kpi-definitions/[id]/route.ts](../../app/api/kpi-definitions/[id]/route.ts)

## Persistence
- [prisma/schema.prisma](../../prisma/schema.prisma): `KpiCategory`, `KpiDefinition`, `KpiResult`, and `FiscalPeriod`.
- [src/actions/settings-admin.ts](../../src/actions/settings-admin.ts): admin maintenance for KPI categories and definitions.

## Related
- [dashboard-data-flow.md](./dashboard-data-flow.md)
- [settings-admin-domain-map.md](./settings-admin-domain-map.md)
- [api-surface-map.md](./api-surface-map.md)
- [../projects/ubon-health-insights-code-map.md](../projects/ubon-health-insights-code-map.md)
