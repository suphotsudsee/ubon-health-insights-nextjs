---
title: App Shell And Navigation
type: synthesis
status: active
created: 2026-04-19
updated: 2026-04-19
tags:
  - synthesis
  - app-shell
  - navigation
sources: []
---

# App Shell And Navigation

## Role
This note maps how the user enters the application and moves across the main pages.

## Main Flow
- The root layout wraps the app with the auth provider and shared header.
- The header defines the primary navigation and changes behavior based on session state.
- The home page functions as the main dashboard surface.

## Key Files
- [app/layout.tsx](../../app/layout.tsx): root shell, metadata, header mount, footer, and auth provider wiring.
- [components/layout/Header.tsx](../../components/layout/Header.tsx): main navigation, mobile sheet navigation, login/logout controls.
- [components/providers/AuthProvider.tsx](../../components/providers/AuthProvider.tsx): client-side auth session provider.
- [app/page.tsx](../../app/page.tsx): dashboard-style landing page.
- [app/login/page.tsx](../../app/login/page.tsx): login entrypoint.
- [app/settings/page.tsx](../../app/settings/page.tsx): authenticated settings/admin surface.

## Important Routes
- [app/basic-info/page.tsx](../../app/basic-info/page.tsx)
- [app/comparison/page.tsx](../../app/comparison/page.tsx)
- [app/finance/dashboard/page.tsx](../../app/finance/dashboard/page.tsx)
- [app/ppfs/page.tsx](../../app/ppfs/page.tsx)
- [app/ttm/page.tsx](../../app/ttm/page.tsx)

## Related
- [dashboard-data-flow.md](./dashboard-data-flow.md)
- [auth-and-access-control.md](./auth-and-access-control.md)
- [../projects/ubon-health-insights-code-map.md](../projects/ubon-health-insights-code-map.md)
