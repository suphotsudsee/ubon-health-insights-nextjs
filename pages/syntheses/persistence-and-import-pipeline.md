---
title: Persistence And Import Pipeline
type: synthesis
status: active
created: 2026-04-19
updated: 2026-04-19
tags:
  - synthesis
  - database
  - imports
sources: []
---

# Persistence And Import Pipeline

## Role
This note maps how the system stores core entities and how seed/import scripts move data into the database.

## Main Flow
- Prisma defines the schema and generated client.
- A singleton database client is exposed through shared library code.
- Server actions and route handlers read and write through Prisma.
- Seed and import scripts populate KPI, finance, and transfer-related data.

## Key Files
- [prisma/schema.prisma](../../prisma/schema.prisma): canonical schema for units, users, KPI, finance, demographics, and audit logs.
- [prisma/seed.ts](../../prisma/seed.ts): base seed entrypoint.
- [src/lib/db.ts](../../src/lib/db.ts): Prisma singleton, transaction helper, and connection checks.
- [scripts/seed-demo-data.ts](../../scripts/seed-demo-data.ts): demo data seeding.
- [scripts/import-finance-xlsx.ts](../../scripts/import-finance-xlsx.ts): finance import path.
- [scripts/import-transfer-csv.ts](../../scripts/import-transfer-csv.ts): transfer import path.
- [src/actions/finance.ts](../../src/actions/finance.ts): finance data mutation/query layer.
- [src/actions/kpi.ts](../../src/actions/kpi.ts): KPI action layer.
- [src/actions/health-units.ts](../../src/actions/health-units.ts): health unit and demographic action layer.

## Core Entities
- Health units
- Users
- KPI categories, definitions, and results
- Fiscal periods
- Finance records
- Health unit demographics
- Audit logs

## Related
- [dashboard-data-flow.md](./dashboard-data-flow.md)
- [auth-and-access-control.md](./auth-and-access-control.md)
- [../projects/ubon-health-insights-code-map.md](../projects/ubon-health-insights-code-map.md)
