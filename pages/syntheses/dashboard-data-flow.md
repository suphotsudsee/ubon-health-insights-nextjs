---
title: Dashboard Data Flow
type: synthesis
status: active
created: 2026-04-19
updated: 2026-04-19
tags:
  - synthesis
  - dashboard
  - data-flow
sources: []
---

# Dashboard Data Flow

## Role
This note maps the main read path for dashboard data from UI to API to shaping utilities.

## Main Flow
1. The landing page renders dashboard widgets and filter state.
2. A client hook fetches `/api/dashboard`.
3. Route handlers aggregate health unit, KPI, and finance data.
4. Shared utility code shapes the response for UI components.

## Key Files
- [app/page.tsx](../../app/page.tsx): dashboard entry page and chart composition.
- [components/dashboard/useDashboardData.ts](../../components/dashboard/useDashboardData.ts): client fetch hook for `/api/dashboard`.
- [components/dashboard/StatCard.tsx](../../components/dashboard/StatCard.tsx): KPI summary tiles.
- [components/dashboard/GaugeChart.tsx](../../components/dashboard/GaugeChart.tsx): gauge visualization.
- [components/dashboard/FilterBar.tsx](../../components/dashboard/FilterBar.tsx): top-level filters.
- [app/api/dashboard/route.ts](../../app/api/dashboard/route.ts): app-router API entry for dashboard data.
- [src/lib/dashboard-data.ts](../../src/lib/dashboard-data.ts): dashboard assembly helpers.
- [src/lib/dashboard-utils.ts](../../src/lib/dashboard-utils.ts): transformation helpers used by dashboard logic.

## Observations
- The dashboard is currently client-driven at the top page level.
- The UI depends on a custom hook rather than server-rendered data fetch on the page itself.
- This page is the clearest example of `app/ -> components/ -> api -> src/lib` flow.

## Related
- [app-shell-and-navigation.md](./app-shell-and-navigation.md)
- [persistence-and-import-pipeline.md](./persistence-and-import-pipeline.md)
- [../projects/ubon-health-insights-code-map.md](../projects/ubon-health-insights-code-map.md)
