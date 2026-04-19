# Folder Structure

## Project Layout

Current top-level structure in this repository:

```text
ubon-health-insights-nextjs/
|-- app/                # Next.js App Router pages and legacy app/api routes
|-- components/         # UI and feature components
|-- data/               # Seed and mock data files
|-- database/           # SQL review and migration planning docs
|-- docs/               # Project documentation
|-- lib/                # Shared utilities outside src/
|-- meta/               # Wiki governance pages
|-- pages/              # LLM-maintained wiki pages
|-- prisma/             # Prisma schema and seed script
|-- public/             # Static assets
|-- raw/                # Immutable wiki source material
|-- scripts/            # Operational and import scripts
|-- src/                # Main application server logic, actions, APIs, types, utilities
|-- state/              # Local runtime/import state files
|-- templates/          # Wiki template folder
|-- .obsidian/          # Obsidian vault settings
|-- CLAUDE.md           # Wiki schema and operating rules
|-- index.md            # Wiki index
|-- log.md              # Wiki operation log
|-- Dockerfile
|-- docker-compose.yml
|-- next.config.ts
|-- package.json
`-- README.md
```

## Application Structure

### `app/`
Primary Next.js App Router entrypoint for pages, layouts, and some route handlers.

```text
app/
|-- api/                        # Route handlers still mounted under app/api
|   |-- auth/
|   |-- finance/
|   |-- finance-accounts/
|   |-- fiscal-periods/
|   |-- health-units/
|   |-- kpi-categories/
|   |-- kpi-definitions/
|   |-- kpi/
|   |-- dashboard/
|   `-- health/
|-- basic-info/page.tsx
|-- comparison/page.tsx
|-- finance/
|   |-- dashboard/page.tsx
|   |-- expense/create/page.tsx
|   |-- income/create/page.tsx
|   |-- list/page.tsx
|   `-- page.tsx
|-- login/page.tsx
|-- ppfs/page.tsx
|-- settings/page.tsx
|-- ttm/page.tsx
|-- error.tsx
|-- globals.css
|-- layout.tsx
|-- loading.tsx
|-- not-found.tsx
`-- page.tsx
```

### `src/`
Main implementation area for backend-oriented code and newer route handlers.

```text
src/
|-- actions/                    # Server-side actions by domain
|   |-- auth.ts
|   |-- finance.ts
|   |-- finance-accounts.ts
|   |-- fiscal-periods.ts
|   |-- health-units.ts
|   |-- kpi.ts
|   |-- settings-admin.ts
|   `-- index.ts
|-- app/api/                    # Route handlers mirrored or migrated here
|   |-- auth/
|   |-- finance/
|   |-- finance-accounts/
|   |-- fiscal-periods/
|   |-- health-units/
|   `-- kpi/
|-- lib/                        # Domain utilities and data shaping
|   |-- auth.ts
|   |-- dashboard-data.ts
|   |-- dashboard-utils.ts
|   |-- db.ts
|   |-- finance-import.ts
|   |-- utils.ts
|   `-- validators.ts
`-- types/
    `-- index.ts
```

### `components/`
React components grouped mostly by feature.

```text
components/
|-- dashboard/                  # Dashboard widgets and data hooks
|-- finance/                    # Finance dashboard and forms
|-- layout/                     # Shared layout shell pieces
|-- providers/                  # React providers
|-- settings/                   # Settings UI
`-- ui/                         # Reusable low-level UI primitives
```

## Data And Operations

### `prisma/`
- `schema.prisma`: source of truth for the database schema
- `seed.ts`: seed process

### `scripts/`
- bootstrap, standalone startup, and finance import scripts

### `data/`
- mock and seed JSON/TS payloads used for demo or import flows

### `state/`
- local execution artifacts such as task queues, import workbooks, and logs

### `database/`
- SQL review documents and migration planning files rather than runtime code

## Documentation

### `docs/`
Project documentation, planning artifacts, audits, QA docs, deployment docs, and role/task briefs.

Notable subfolders:
- `docs/db/`: database-specific reference docs
- `docs/qa/`: QA checklists and bug tracking docs

## Wiki / Obsidian Layer

This repository now also acts as an Obsidian vault and LLM-maintained wiki.

### Root wiki files
- `CLAUDE.md`: rules for how the wiki is maintained
- `index.md`: first file to read when navigating the wiki
- `log.md`: append-only operational history

### `raw/`
Immutable source captures for the wiki.

```text
raw/
|-- assets/
|-- inbox/
`-- sources/
```

### `pages/`
Derived wiki pages maintained by the agent.

```text
pages/
|-- areas/
|-- daily/
|-- people/
|-- projects/
|-- queries/
|-- sources/
|-- syntheses/
`-- topics/
```

### `meta/`
- governance and wiki structure docs such as `folder-conventions.md`

### `templates/`
- reserved for reusable wiki templates

### `.obsidian/`
- local Obsidian settings for using this repo as a vault

## Current Conventions

### App code
- `app/` holds user-facing routes and some route handlers.
- `src/app/api/` holds additional route handlers and should be treated as active server code.
- `src/actions/` is the main action layer.
- `components/` is feature-grouped rather than strictly atomic.

### Wiki content
- `raw/` is immutable source material.
- `pages/` is LLM-authored derived knowledge.
- `index.md` and `log.md` are required maintenance files.

## Notes

- `node_modules/` exists in the repo root but is intentionally excluded from Obsidian visibility and not listed as part of the working structure.
- `.next/` and other generated artifacts may appear locally but are not considered part of the maintained source structure.
- This document should be updated whenever the active source layout changes materially.
