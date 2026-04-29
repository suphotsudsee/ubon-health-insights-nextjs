---
title: Settings Import Buttons 2026-04-29
type: project
status: active
created: 2026-04-29
updated: 2026-04-29
tags:
  - project
  - settings
  - admin
  - import
  - users
  - health-units
  - coolify
sources:
  - ../../data/user-state-phoubon.csv
  - ../../data/health-units-basic.csv
---

# Settings Import Buttons 2026-04-29

## Goal
Add admin-facing import buttons in the Settings screen so production users can import user accounts and health unit baseline data through the app UI after a Coolify deploy.

## User Import
- UI entrypoint: [components/settings/SettingsDashboard.tsx](../../components/settings/SettingsDashboard.tsx)
- API endpoint: [app/api/auth/users/import/route.ts](../../app/api/auth/users/import/route.ts)
- CSV source in image: [data/user-state-phoubon.csv](../../data/user-state-phoubon.csv)
- Behavior:
  - Reads staff name, email, and health unit code fields from the bundled CSV.
  - Creates or updates users by email.
  - Sets role to `staff`.
  - Links `healthUnitId` by `health_units.code`.
  - Sets password to `12345678!`.

## Health Unit Import
- UI entrypoint: [components/settings/SettingsDashboard.tsx](../../components/settings/SettingsDashboard.tsx)
- API endpoint: [app/api/health-units/import-basic/route.ts](../../app/api/health-units/import-basic/route.ts)
- CSV source in image: [data/health-units-basic.csv](../../data/health-units-basic.csv)
- Behavior:
  - Reads unit code/name, email, moo, tambon, amphoe, population, household, village, elderly, volunteer, temple, school, and health station fields.
  - Creates missing amphoe/tambon references when needed.
  - Creates or updates `health_units` by code.
  - Upserts `health_unit_demographics` for the latest fiscal period.

## Deploy Checklist
- Deploy latest code to Coolify.
- Open Settings as an admin.
- In the users tab, click the user import button.
- In the health units tab, click the basic data import button.
- Confirm the success message and refresh the page if the visible counts do not update.

## Verification
- Local checks passed:
  - `npm run check:text`
  - `npx tsc --noEmit`
  - `npm run build`

## Related
- [settings-admin-domain-map.md](../syntheses/settings-admin-domain-map.md)
- [api-surface-map.md](../syntheses/api-surface-map.md)
- [persistence-and-import-pipeline.md](../syntheses/persistence-and-import-pipeline.md)
- [ubon-health-insights-code-map.md](./ubon-health-insights-code-map.md)
