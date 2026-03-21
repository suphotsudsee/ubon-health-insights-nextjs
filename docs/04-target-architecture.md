# Target Architecture

## Overview

This document defines the target architecture for **Ubon Health Insights**, a full-stack Next.js application with no separate backend. All business logic, data access, and API routes run within the Next.js application itself.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15+ (App Router only) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | MariaDB 10.11+ |
| ORM | Prisma |
| Authentication | NextAuth.js (Auth.js v5) |
| Deployment | Docker + VPS or Node hosting |

## Architecture Principles

### 1. No Separate Backend
- **All server logic lives in Next.js** using Route Handlers (`app/api/**/route.ts`)
- **Server Components** handle data fetching and business logic
- **Database queries** execute directly from Server Components or API routes
- **No external API layer** - the Next.js app IS the backend

### 2. App Router Only
- **No Pages Router** - all routes use `app/` directory
- **Server Components by default** - Client Components opt-in with `'use client'`
- **Nested layouts** for shared UI structure
- **Streaming and Suspense** for progressive loading

### 3. Type Safety End-to-End
- **Prisma Client** provides full TypeScript types from database schema
- **Zod** for runtime validation of API inputs
- **Shared types** in `@/types` for consistent contracts

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Layouts   │  │   Pages     │  │   API Routes        │ │
│  │  (Server)   │  │  (Server)   │  │  (route.ts)         │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│         └────────────────┼─────────────────────┘            │
│                          │                                  │
│                  ┌───────▼────────┐                         │
│                  │ Server Actions │                         │
│                  │  & Utilities   │                         │
│                  └───────┬────────┘                         │
│                          │                                  │
│                  ┌───────▼────────┐                         │
│                  │   Prisma ORM   │                         │
│                  └───────┬────────┘                         │
└──────────────────────────┼─────────────────────────────────┘
                           │
                           ▼
                  ┌────────────────┐
                  │   MariaDB DB   │
                  │   (10.11+)     │
                  └────────────────┘
```

## Data Flow

### Read Operations (Queries)
1. **Page/Component renders** (Server Component)
2. **Direct Prisma query** executes in component body
3. **Data passed as props** to child components
4. **Client Components receive serialized data**

### Write Operations (Mutations)
1. **User triggers Server Action** or submits form to API route
2. **Input validated with Zod** schema
3. **Prisma mutation** executes (create/update/delete)
4. **Revalidation** triggers (`revalidatePath` or `revalidateTag`)
5. **UI updates** with fresh data

## Key Patterns

### Database Access Pattern
```typescript
// lib/db.ts - Singleton Prisma client
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Server Component Data Fetching
```typescript
// app/dashboard/page.tsx
import { prisma } from '@/lib/db'

export default async function DashboardPage() {
  const insights = await prisma.healthInsight.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })
  
  return <DashboardClient insights={insights} />
}
```

### Server Action Mutation
```typescript
// app/actions/insights.ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createInsightSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.enum(['nutrition', 'exercise', 'mental'])
})

export async function createInsight(formData: FormData) {
  const validated = createInsightSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
    category: formData.get('category')
  })
  
  await prisma.healthInsight.create({ data: validated })
  revalidatePath('/dashboard')
}
```

## Performance Strategy

- **Row-level database queries** - no N+1 problems
- **React cache** for expensive computations
- **Incremental Static Regeneration** for public content
- **Streaming** for large datasets with Suspense boundaries
- **Connection pooling** via Prisma (production ready)

## Scalability Considerations

- **Stateless Next.js instances** - horizontal scaling possible
- **Database connection limits** - use connection pooler (PgBouncer equivalent for MariaDB)
- **Session storage** - database-backed sessions for multi-instance deploys
- **File uploads** - external storage (S3-compatible) not in app filesystem
