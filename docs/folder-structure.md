<<<<<<< HEAD
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
=======
# Folder Structure

## Project Layout

```
ubon-health-insights-nextjs/
├── app/                          # App Router (required)
│   ├── (auth)/                   # Route group for auth pages
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # Route group for authenticated areas
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   ├── insights/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── new/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── api/                      # API routes (backend endpoints)
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── insights/
│   │   │   └── route.ts
│   │   └── health-data/
│   │       └── route.ts
│   ├── globals.css               # Global styles (Tailwind base)
│   ├── layout.tsx                # Root layout (required)
│   ├── page.tsx                  # Home page (landing)
│   ├── loading.tsx               # Global loading UI
│   └── error.tsx                 # Global error UI
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── ... (auto-generated)
│   ├── dashboard/                # Dashboard-specific components
│   │   ├── insights-list.tsx
│   │   ├── stats-card.tsx
│   │   └── chart-widget.tsx
│   ├── forms/                    # Form components
│   │   ├── insight-form.tsx
│   │   └── login-form.tsx
│   └── shared/                   # Reusable across app
│       ├── header.tsx
│       ├── footer.tsx
│       └── nav.tsx
├── lib/                          # Utility libraries
│   ├── db.ts                     # Prisma client singleton
│   ├── auth.ts                   # NextAuth configuration
│   ├── utils.ts                  # cn() helper, utilities
│   └── validators.ts             # Zod schemas
├── prisma/                       # Database layer
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Auto-generated migrations
│   └── seed.ts                   # Database seeding
├── types/                        # TypeScript types
│   ├── index.ts                  # Export all types
│   ├── insight.ts                # Health insight types
│   └── user.ts                   # User types
├── hooks/                        # Custom React hooks
│   ├── use-insights.ts           # Insights data fetching
│   └── use-session.ts            # Session management
├── actions/                      # Server Actions
│   ├── insights.ts               # Insight CRUD actions
│   ├── auth.ts                   # Authentication actions
│   └── health-data.ts            # Health data actions
├── docs/                         # Project documentation
│   ├── 04-target-architecture.md
│   ├── folder-structure.md       # This file
│   └── security-boundaries.md
├── public/                       # Static assets
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
├── .env                          # Environment variables (local)
├── .env.example                  # Environment template
├── .gitignore
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── components.json               # shadcn/ui configuration
├── package.json
└── README.md
```

## Directory Conventions

### `app/` - Application Core
- **Route groups** `(auth)`, `(dashboard)` organize pages without affecting URL
- **Every page** is a `page.tsx` file in its directory
- **Layouts** are `layout.tsx` files (nested, composable)
- **Loading states** via `loading.tsx` (automatic Suspense boundary)
- **Error handling** via `error.tsx` (error boundary)

### `components/` - UI Building Blocks
- **`ui/`** - shadcn/ui components (treat as immutable, re-run generator for updates)
- **Domain folders** - Components scoped to features (`dashboard/`, `forms/`)
- **`shared/`** - Components used across multiple features

### `lib/` - Business Logic & Utilities
- **Single responsibility** - Each file does one thing well
- **Database singleton** - Prevents multiple Prisma client instances
- **Auth config** - Centralized NextAuth setup
- **Validators** - Zod schemas for runtime type checking

### `actions/` - Server Actions
- **All mutations** live here (create, update, delete operations)
- **Marked `'use server'`** - runs exclusively on server
- **Named exports** - each export is an invokable action
- **Revalidation** - trigger cache invalidation after mutations

### `prisma/` - Data Layer
- **Schema** - Single source of truth for database structure
- **Migrations** - Version-controlled schema changes
- **Seed** - Development/test data population

### `types/` - Type Definitions
- **Domain types** - Organized by entity (user, insight, health-data)
- **Re-exported** - `types/index.ts` exports all for easy importing
- **No business logic** - Pure type definitions only

### `hooks/` - Custom Hooks
- **Data fetching** - Encapsulate React Query or SWR logic
- **State management** - Complex state logic extracted from components
- **Client-only** - All hooks run in browser context

## Import Path Aliases

Configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/actions/*": ["./actions/*"],
      "@/app/*": ["./app/*"]
    }
  }
}
```

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `InsightCard.tsx` |
| Server Actions | camelCase | `createInsight.ts` |
| Utilities | camelCase | `utils.ts` |
| Types | camelCase | `insight.ts` |
| Routes | kebab-case | `health-data.ts` |
| Styles | kebab-case | `globals.css` |

## Component Colocation

For complex features, consider colocation:

```
app/
└── (dashboard)/
    └── insights/
        ├── page.tsx              # Main page
        ├── insight-card.tsx      # Component used only here
        ├── insight-form.tsx      # Form used only here
        └── actions.ts            # Actions for this feature only
```

This keeps related code together and improves maintainability.
>>>>>>> 2fcc77a (refactor: remove src/ duplicate, add finance accountCode)
