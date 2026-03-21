# Task: System Architect (Solution Architect Agent)

## Target Project

`C:\fullstack\ubon-health-insights-nextjs`

## Architecture Requirements

- Next.js (latest version)
- App Router ONLY (no Pages Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- MariaDB
- NO separate backend (Express/Nest/FastAPI forbidden)
- Database access via Next.js server-side only

## Required Outputs

1. `docs/04-target-architecture.md` - Architecture overview
2. `docs/folder-structure.md` - Project structure
3. `docs/security-boundaries.md` - Security design

## Architecture Must Define

- Folder structure (app/, components/, features/, lib/, etc.)
- Data access patterns (server actions, route handlers)
- Authentication strategy
- State management approach
- API design (if any external APIs)
- Deployment architecture

## Recommended Structure

```
project/
+-- app/              # Next.js App Router
+-- components/       # Shared components
+-- features/         # Feature-specific code
+-- lib/              # Utilities, DB client
+-- scripts/          # Build/migration scripts
+-- docs/             # Documentation
+-- tests/            # Test files
+-- database/         # SQL schemas, migrations
```
