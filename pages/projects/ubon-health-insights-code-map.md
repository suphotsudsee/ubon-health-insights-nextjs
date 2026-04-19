---
title: Ubon Health Insights Code Map
type: project
status: active
created: 2026-04-19
updated: 2026-04-19
tags:
  - project
  - codebase
  - architecture
sources: []
---

# Ubon Health Insights Code Map

## Purpose
This note is the hub for navigating the active codebase through wiki pages. It links to architecture notes that in turn link to important code files.

## Core Surfaces
- [App Shell And Navigation](../syntheses/app-shell-and-navigation.md)
- [Dashboard Data Flow](../syntheses/dashboard-data-flow.md)
- [Auth And Access Control](../syntheses/auth-and-access-control.md)
- [Persistence And Import Pipeline](../syntheses/persistence-and-import-pipeline.md)
- [Finance Domain Map](../syntheses/finance-domain-map.md)
- [KPI Domain Map](../syntheses/kpi-domain-map.md)
- [Settings Admin Domain Map](../syntheses/settings-admin-domain-map.md)
- [API Surface Map](../syntheses/api-surface-map.md)

## Entry Files
- [package.json](../../package.json)
- [app/layout.tsx](../../app/layout.tsx)
- [app/page.tsx](../../app/page.tsx)
- [README.md](../../README.md)
- [docs/folder-structure.md](../../docs/folder-structure.md)

## Active Runtime Shape
- `app/` holds the user-facing routes and some legacy `app/api` handlers.
- `src/` holds the main server logic, action layer, utilities, and a second `src/app/api` route surface.
- `components/` is feature-grouped UI.
- `prisma/` and `scripts/` define the persistence and import workflow.

## Related
- [../topics/second-brain.md](../topics/second-brain.md)
- [../syntheses/2026-04-19-second-brain-operating-model.md](../syntheses/2026-04-19-second-brain-operating-model.md)
