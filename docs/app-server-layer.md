# Application Server Layer Documentation

## Overview

This document describes the server-side application layer for **Ubon Health Insights** - a health service unit performance tracking system built with Next.js App Router. The architecture follows a **no separate backend** principle where all business logic, data access, and API routes run within the Next.js application.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Application                          │
│                                                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Server Actions │  │  API Routes     │  │  Server         │ │
│  │  (src/actions/) │  │  (src/app/api/) │  │  Components     │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘ │
│           │                    │                      │          │
│           └────────────────────┼──────────────────────┘          │
│                                │                                 │
│                     ┌──────────▼──────────┐                      │
│                     │   lib/db.ts        │                      │
│                     │   (Prisma Client)   │                      │
│                     └──────────┬──────────┘                      │
│                                │                                 │
└────────────────────────────────┼─────────────────────────────────┘
                                 │
                                 ▼
                     ┌─────────────────────┐
                     │    MariaDB 10.11+   │
                     │    (Database)       │
                     └─────────────────────┘
```

## Directory Structure

```
src/
├── actions/                    # Server Actions
│   ├── index.ts               # Re-exports all actions
│   ├── kpi.ts                 # KPI-related server actions
│   ├── finance.ts             # Finance-related server actions
│   ├── auth.ts                # Authentication server actions
│   ├── health-units.ts        # Health unit server actions
│   └── fiscal-periods.ts      # Fiscal period server actions
│
├── app/api/                    # API Route Handlers
│   ├── auth/
│   │   ├── [...nextauth]/     # NextAuth.js authentication
│   │   │   └── route.ts
│   │   └── users/             # User management API
│   │       └── route.ts
│   ├── kpi/
│   │   ├── definitions/       # KPI definitions API
│   │   │   └── route.ts
│   │   └── results/          # KPI results API
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── finance/
│   │   └── records/          # Finance records API
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── health-units/         # Health units API
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   └── fiscal-periods/        # Fiscal periods API
│       └── route.ts
│
├── lib/
│   └── db.ts                  # Prisma client singleton
│
├── types/
│   └── index.ts               # TypeScript type definitions
│
└── prisma/
    └── schema.prisma          # Prisma schema (database models)
```

## Core Components

### 1. Prisma Client (`src/lib/db.ts`)

Singleton Prisma client that prevents multiple database connections during development hot reloading.

```typescript
import { prisma } from '@/lib/db'

// Example usage
const users = await prisma.user.findMany()
```

**Features:**
- Singleton pattern for development hot reload safety
- Query logging in development mode
- Transaction helper (`withTransaction`)
- Connection health check (`checkDatabaseConnection`)

### 2. Prisma Schema (`prisma/schema.prisma`)

Database models mirroring the MariaDB schema with full TypeScript type generation.

**Models:**
- `DimAmphoe` - Districts reference
- `DimTambon` - Subdistricts reference
- `KpiCategory` - KPI categories (PPFS, TTM)
- `KpiDefinition` - KPI master definitions
- `FiscalPeriod` - Time dimension
- `HealthUnit` - Health service units
- `User` - System users
- `KpiResult` - KPI performance data
- `FinanceRecord` - Financial records
- `HealthUnitDemographic` - Demographics
- `AuditLog` - Audit trail

### 3. TypeScript Types (`src/types/index.ts`)

Custom type definitions extending Prisma-generated types.

**Key Types:**
- `ApiResponse<T>` - Standard API response wrapper
- `KpiResultWithRelations` - KPI result with joined data
- `FinanceRecordWithRelations` - Finance record with joined data
- `HealthUnitWithRelations` - Health unit with location data
- `KpiResultFilters` - Query filter parameters
- `CreateKpiResultInput` - Input DTOs
- `PerformanceLevel` - KPI performance classification

### 4. Server Actions (`src/actions/`)

Server-side functions marked with `'use server'` for mutations and data fetching.

#### KPI Actions (`kpi.ts`)

| Action | Description |
|--------|-------------|
| `getKpiDefinitions` | Get all active KPI definitions |
| `getKpiDefinitionsByCategory` | Get KPIs by category code |
| `getKpiDefinition` | Get single KPI definition |
| `getKpiResults` | Get KPI results with filtering |
| `getKpiResult` | Get single KPI result |
| `createKpiResult` | Create new KPI result |
| `updateKpiResult` | Update KPI result |
| `deleteKpiResult` | Delete KPI result |
| `submitKpiResult` | Submit for review |
| `reviewKpiResult` | Approve/reject result |
| `getKpiPerformanceSummary` | Category performance averages |
| `getDistrictPerformance` | District ranking |
| `getRecentKpiResults` | Latest approved results |

#### Finance Actions (`finance.ts`)

| Action | Description |
|--------|-------------|
| `getFinanceRecords` | Get records with filtering |
| `getFinanceRecord` | Get single record |
| `createFinanceRecord` | Create new record |
| `updateFinanceRecord` | Update record |
| `deleteFinanceRecord` | Delete record |
| `getFinanceSummary` | Totals by year/district |
| `getFinanceTrends` | Monthly trends |
| `getFinanceByUnit` | Aggregation by unit |

#### Auth Actions (`auth.ts`)

| Action | Description |
|--------|-------------|
| `getUsers` | List all users (admin) |
| `getUser` | Get single user |
| `createUser` | Create user (admin) |
| `updateUser` | Update user (admin) |
| `deleteUser` | Delete user (admin) |
| `verifyCredentials` | Login authentication |
| `changePassword` | Password change |
| `resetUserPassword` | Admin password reset |
| `hasRole` | Role check helper |
| `canAccessHealthUnit` | Permission check |
| `getAccessibleHealthUnits` | Get user's units |

#### Health Units Actions (`health-units.ts`)

| Action | Description |
|--------|-------------|
| `getHealthUnits` | List with filtering |
| `getHealthUnit` | Get single unit |
| `getHealthUnitWithDemographics` | With population data |
| `createHealthUnit` | Create unit (admin) |
| `updateHealthUnit` | Update unit (admin) |
| `deleteHealthUnit` | Soft delete (admin) |
| `getDemographics` | Historical demographics |
| `upsertDemographics` | Create/update demographics |
| `getDashboardStats` | Summary statistics |
| `getDistricts` | Reference data |
| `getSubdistricts` | Reference data |

#### Fiscal Periods Actions (`fiscal-periods.ts`)

| Action | Description |
|--------|-------------|
| `getFiscalPeriods` | Get all periods |
| `getFiscalPeriodsByYear` | Filter by year |
| `getFiscalPeriodsByQuarter` | Filter by quarter |
| `getCurrentFiscalPeriod` | Current period |
| `getAvailableFiscalYears` | Year list |
| `closeFiscalPeriod` | Lock period |
| `reopenFiscalPeriod` | Unlock period |

### 5. API Routes (`src/app/api/`)

REST-like API endpoints using Next.js Route Handlers.

#### KPI API

```
GET    /api/kpi/results                    # List KPI results
POST   /api/kpi/results                    # Create KPI result
GET    /api/kpi/results/[id]               # Get single result
PUT    /api/kpi/results/[id]               # Update result
DELETE /api/kpi/results/[id]               # Delete result
PATCH  /api/kpi/results/[id]               # Submit/review (action: submit|approve|reject)
GET    /api/kpi/definitions                # List KPI definitions
GET    /api/kpi/definitions?category=PPFS # By category
```

#### Finance API

```
GET    /api/finance/records                # List records
POST   /api/finance/records                # Create record
GET    /api/finance/records/[id]           # Get single record
PUT    /api/finance/records/[id]           # Update record
DELETE /api/finance/records/[id]           # Delete record
GET    /api/finance/records?summary=true   # Summary totals
GET    /api/finance/records?trends=true    # Monthly trends
GET    /api/finance/records?byUnit=true    # Grouped by unit
```

#### Health Units API

```
GET    /api/health-units                   # List units
POST   /api/health-units                   # Create unit
GET    /api/health-units/[id]              # Get single unit
PUT    /api/health-units/[id]              # Update unit
DELETE /api/health-units/[id]              # Delete unit
GET    /api/health-units?stats=true        # Dashboard stats
GET    /api/health-units?districts=true    # List districts
GET    /api/health-units?subdistricts=true # List subdistricts
```

#### Fiscal Periods API

```
GET    /api/fiscal-periods                 # List all periods
GET    /api/fiscal-periods?current=true    # Current period
GET    /api/fiscal-periods?years=true      # Available years
GET    /api/fiscal-periods?year=2567       # By year
GET    /api/fiscal-periods?year=2567&quarter=1  # By quarter
```

#### Authentication API

```
POST   /api/auth/[...nextauth]             # NextAuth.js handler
GET    /api/auth/users                      # List users
POST   /api/auth/users                      # Create user
PUT    /api/auth/users                      # Update user
DELETE /api/auth/users?id=123              # Delete user
```

## Data Flow Patterns

### Read Operations (Server Components)

```typescript
// app/dashboard/page.tsx
import { getKpiPerformanceSummary, getRecentKpiResults } from '@/actions'

export default async function DashboardPage() {
  const summary = await getKpiPerformanceSummary(2567)
  const recentResults = await getRecentKpiResults(10)
  
  return <DashboardClient summary={summary.data} recent={recentResults.data} />
}
```

### Write Operations (Server Actions)

```typescript
// app/ppfs/new/page.tsx (Client Component)
'use client'

import { createKpiResult } from '@/actions'
import { useRouter } from 'next/navigation'

export function NewKpiForm() {
  const router = useRouter()
  
  async function handleSubmit(formData: FormData) {
    const result = await createKpiResult({
      kpiId: Number(formData.get('kpiId')),
      healthUnitId: Number(formData.get('healthUnitId')),
      fiscalPeriodId: Number(formData.get('fiscalPeriodId')),
      targetValue: Number(formData.get('targetValue')),
      actualValue: Number(formData.get('actualValue')),
    })
    
    if (result.success) {
      router.push('/ppfs')
    }
  }
  
  return <form action={handleSubmit}>...</form>
}
```

### API Routes (External Access)

```typescript
// External system integration
const response = await fetch('/api/kpi/results?fiscalYear=2567&quarter=1')
const { results, total } = await response.json()
```

## Environment Variables

Required environment variables (`.env`):

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/ubon_health_insights"

# Authentication
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Application
NODE_ENV="development"
```

## Database Migrations

After modifying `schema.prisma`:

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name description_of_change

# Deploy to production
npx prisma migrate deploy
```

## Seeding Data

Create seed script at `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed reference tables
  await prisma.kpiCategory.createMany({
    data: [
      { code: 'PPFS', nameTh: 'การฝากครรภ์ หลังคลอด วางแผนครอบครัว และคัดกรอง', displayOrder: 1 },
      { code: 'TTM', nameTh: 'แพทย์แผนไทย', displayOrder: 2 },
    ],
    skipDuplicates: true,
  })
  
  // Seed KPI definitions
  // ... more seeding
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run seeding:

```bash
npx prisma db seed
```

## Error Handling

All server actions return a consistent `ApiResponse` type:

```typescript
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

**Usage example:**

```typescript
const result = await getKpiResults({ fiscalYear: 2567 })

if (!result.success) {
  // Handle error
  console.error(result.error)
  return
}

// Use data
const kpiResults = result.data.results
```

## Performance Considerations

1. **Prisma Query Optimization**
   - Use `select` to limit returned fields
   - Use `include` for necessary relations only
   - Create database indexes for frequent filters

2. **Caching Strategy**
   - Use `revalidatePath` after mutations
   - Use `revalidateTag` for related data
   - Consider React Cache for expensive computations

3. **Pagination**
   - Always paginate large datasets
   - Default page size: 20 items
   - Support cursor-based pagination for infinite scroll

## Security

1. **Authentication**: NextAuth.js with credentials provider
2. **Authorization**: Role-based access control (admin, manager, staff, viewer)
3. **Input Validation**: Zod schemas for all inputs
4. **SQL Injection**: Prisma parameterized queries
5. **Rate Limiting**: Consider adding rate limiting for production

## Testing

```bash
# Run tests
npm test

# Run specific test file
npm test -- kpi.test.ts

# Run with coverage
npm run test:coverage
```

## Deployment

1. Set production environment variables
2. Run database migrations
3. Build the application: `npm run build`
4. Start the server: `npm start`

For Docker deployment:

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Future Enhancements

- [ ] Add audit logging middleware
- [ ] Implement real-time updates with WebSockets
- [ ] Add data export (Excel/PDF)
- [ ] Implement email notifications
- [ ] Add bulk data import
- [ ] Create admin dashboard for user management
- [ ] Add data validation workflows

---

**Last Updated:** 2026-03-21  
**Version:** 1.0.0