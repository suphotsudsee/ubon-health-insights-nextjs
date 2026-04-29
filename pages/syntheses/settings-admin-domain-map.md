---
title: Settings Admin Domain Map
type: synthesis
status: active
created: 2026-04-19
updated: 2026-04-29
tags:
  - synthesis
  - settings
  - admin
  - domain-map
sources: []
---

# Settings Admin Domain Map

## Role
This note maps the administrative surfaces used to manage reference data, fiscal periods, and settings-related control flows.

## Main Surface
- [app/settings/page.tsx](../../app/settings/page.tsx): settings/admin screen.
- [components/settings/SettingsDashboard.tsx](../../components/settings/SettingsDashboard.tsx): main settings UI composition, including user and health unit import buttons.
- [components/settings/FinanceSettingsSection.tsx](../../components/settings/FinanceSettingsSection.tsx): finance-specific settings section.

## Server Layer
- [src/actions/settings-admin.ts](../../src/actions/settings-admin.ts): fiscal year creation, fiscal period admin updates, KPI category admin, and KPI definition admin.
- [src/actions/fiscal-periods.ts](../../src/actions/fiscal-periods.ts): fiscal period operational action layer.
- [src/actions/auth.ts](../../src/actions/auth.ts): user management and access control used by admin flows.

## API Surfaces
- [src/app/api/fiscal-periods/route.ts](../../src/app/api/fiscal-periods/route.ts)
- [src/app/api/fiscal-periods/[id]/route.ts](../../src/app/api/fiscal-periods/[id]/route.ts)
- [src/app/api/auth/users/route.ts](../../src/app/api/auth/users/route.ts)
- [app/api/fiscal-periods/route.ts](../../app/api/fiscal-periods/route.ts)
- [app/api/fiscal-periods/[id]/route.ts](../../app/api/fiscal-periods/[id]/route.ts)
- [app/api/auth/users/route.ts](../../app/api/auth/users/route.ts)
- [app/api/auth/users/import/route.ts](../../app/api/auth/users/import/route.ts): imports staff users from the bundled user CSV.
- [app/api/health-units/import-basic/route.ts](../../app/api/health-units/import-basic/route.ts): imports baseline health unit and demographic data from the bundled basic data CSV.

## Data Scope
- Fiscal year and month scaffolding
- KPI category and definition governance
- User management and permissions
- Staff user import from CSV
- Health unit baseline and demographic import from CSV
- Finance account/admin support surfaces

## Related
- [../projects/settings-import-buttons-2026-04-29.md](../projects/settings-import-buttons-2026-04-29.md)
- [auth-and-access-control.md](./auth-and-access-control.md)
- [kpi-domain-map.md](./kpi-domain-map.md)
- [api-surface-map.md](./api-surface-map.md)
- [../projects/ubon-health-insights-code-map.md](../projects/ubon-health-insights-code-map.md)
