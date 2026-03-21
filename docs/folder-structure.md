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
