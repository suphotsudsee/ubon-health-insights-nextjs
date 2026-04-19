---
title: Auth And Access Control
type: synthesis
status: active
created: 2026-04-19
updated: 2026-04-19
tags:
  - synthesis
  - auth
  - access-control
sources: []
---

# Auth And Access Control

## Role
This note maps the authentication path and the authorization rules that scope user access to health unit data.

## Main Flow
- Session context is mounted at the root layout.
- The header reads session state to switch public vs authenticated navigation.
- Auth routes and actions validate credentials and enforce role-based scope.
- Access rules are tied to user role and associated health unit or district.

## Key Files
- [components/providers/AuthProvider.tsx](../../components/providers/AuthProvider.tsx): NextAuth session provider.
- [src/lib/auth.ts](../../src/lib/auth.ts): authentication integration utilities.
- [src/actions/auth.ts](../../src/actions/auth.ts): user CRUD, password flow, login verification, and access checks.
- [src/app/api/auth/[...nextauth]/route.ts](../../src/app/api/auth/[...nextauth]/route.ts): auth route handler under `src/`.
- [app/api/auth/[...nextauth]/route.ts](../../app/api/auth/[...nextauth]/route.ts): mirrored auth route under `app/`.
- [app/login/page.tsx](../../app/login/page.tsx): login surface.

## Access Model
- `admin`: global access.
- `manager`: district-scoped access derived from the manager's health unit.
- `staff` and `viewer`: own-unit access.

## Related
- [app-shell-and-navigation.md](./app-shell-and-navigation.md)
- [persistence-and-import-pipeline.md](./persistence-and-import-pipeline.md)
- [../projects/ubon-health-insights-code-map.md](../projects/ubon-health-insights-code-map.md)
