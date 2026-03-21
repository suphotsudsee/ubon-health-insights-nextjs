# Developer Guide - Ubon Health Insights

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Development Environment](#development-environment)
3. [Code Standards](#code-standards)
4. [Database Development](#database-development)
5. [API Development](#api-development)
6. [Frontend Development](#frontend-development)
7. [Testing](#testing)
8. [Authentication & Security](#authentication--security)
9. [Deployment Pipeline](#deployment-pipeline)
10. [Contributing Guidelines](#contributing-guidelines)

---

## Project Architecture

### Directory Structure
```
ubon-health-insights-nextjs/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # Auth group routes
│   │   ├── login/
│   │   └── register/
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── health-metrics/
│   │   └── users/
│   ├── dashboard/           # Dashboard pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── charts/              # Chart components
│   ├── forms/               # Form components
│   └── layout/              # Layout components
├── lib/                     # Utility functions
│   ├── db.ts                # Database client
│   ├── utils.ts             # Helper functions
│   └── api/                 # API utilities
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript types
├── prisma/                  # Prisma schema & migrations
│   ├── schema.prisma
│   └── migrations/
├── public/                  # Static assets
├── styles/                  # Global styles
├── tests/                   # Test files
├── docs/                    # Documentation
├── .env.example             # Environment template
├── next.config.js           # Next.js config
├── tailwind.config.ts       # Tailwind config
├── tsconfig.json            # TypeScript config
└── package.json
```

### Tech Stack Details

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Next.js 14+ | React framework with App Router |
| Language | TypeScript | Type-safe JavaScript |
| Styling | Tailwind CSS | Utility-first CSS |
| Components | shadcn/ui | Pre-built accessible components |
| ORM | Prisma | Database ORM |
| Auth | NextAuth.js | Authentication |
| Charts | Recharts | Data visualization |
| Forms | React Hook Form + Zod | Form handling & validation |
| Testing | Jest + React Testing Library | Unit testing |
| State | Zustand / React Context | State management |

---

## Development Environment

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd ubon-health-insights-nextjs

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local

# 4. Configure your .env.local with:
# - Database connection
# - NextAuth secret
# - Any API keys

# 5. Initialize database
npx prisma migrate dev
npx prisma generate

# 6. Seed data (optional)
npx prisma db seed

# 7. Start development server
npm run dev
```

### VS Code Extensions (Recommended)
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **Prisma** - Prisma schema support
- **Thunder Client** - API testing
- **GitLens** - Git visualization

### Development Workflow

```
feature-branch workflow:

main (production)
  ↓
feature/your-feature-name ← create from main
  ↓
commit → push → PR → review → merge to main
```

---

## Code Standards

### TypeScript Conventions

```typescript
// Use explicit types for function parameters and returns
function calculateBMI(weight: number, height: number): number {
  return weight / (height * height);
}

// Use interfaces for object shapes
interface HealthMetric {
  id: string;
  userId: string;
  type: 'weight' | 'blood_pressure' | 'heart_rate';
  value: number;
  unit: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Use type for unions/intersections
type MetricType = 'weight' | 'blood_pressure' | 'heart_rate';
type Optional<T> = T | undefined;

// Avoid 'any' - use 'unknown' if type is truly unknown
function processData(data: unknown): HealthMetric {
  // Type guard
  if (isHealthMetric(data)) {
    return data;
  }
  throw new Error('Invalid data');
}
```

### React Component Patterns

```typescript
// Use functional components with explicit return types
interface DashboardCardProps {
  title: string;
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}

export function DashboardCard({ 
  title, 
  value, 
  trend = 'neutral',
  icon 
}: DashboardCardProps): JSX.Element {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="mt-2">
        <span className="text-2xl font-bold">{value}</span>
        {trend !== 'neutral' && (
          <TrendIndicator direction={trend} />
        )}
      </div>
    </div>
  );
}

// Custom hooks
type UseHealthMetricsOptions = {
  userId: string;
  startDate?: Date;
  endDate?: Date;
};

export function useHealthMetrics({ userId, startDate, endDate }: UseHealthMetricsOptions) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch logic
  }, [userId, startDate, endDate]);

  return { metrics, loading, error, refetch };
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `DashboardCard.tsx` |
| Hooks | camelCase, prefix 'use' | `useHealthMetrics.ts` |
| Utils | camelCase | `formatDate.ts` |
| Types/Interfaces | PascalCase | `HealthMetric` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Files | kebab-case | `health-metrics.ts` |

### File Organization

```
components/
├── ui/                      # Reusable UI primitives
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── charts/                  # Chart components
│   ├── line-chart.tsx
│   └── bar-chart.tsx
├── forms/                   # Form-specific components
│   ├── metric-form.tsx
│   └── user-profile-form.tsx
└── layout/                  # Layout components
    ├── sidebar.tsx
    └── header.tsx

app/
├── layout.tsx               # Root layout
├── page.tsx                 # Home page
├── dashboard/
│   ├── layout.tsx           # Dashboard layout
│   ├── page.tsx             # Dashboard home
│   └── metrics/
│       ├── page.tsx         # Metrics list
│       └── [id]/
│           └── page.tsx     # Metric detail
```

---

## Database Development

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  metrics   HealthMetric[]
  reports   Report[]

  @@map("users")
}

model HealthMetric {
  id          String      @id @default(cuid())
  userId      String      @map("user_id")
  type        MetricType
  value       Decimal     @db.Decimal(10, 2)
  unit        String
  recordedAt  DateTime    @map("recorded_at")
  notes       String?
  createdAt   DateTime    @default(now()) @map("created_at")
  updatedAt   DateTime    @updatedAt @map("updated_at")

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([type, recordedAt])
  @@map("health_metrics")
}

enum Role {
  USER
  ADMIN
  HEALTHCARE_PROVIDER
}

enum MetricType {
  WEIGHT
  BLOOD_PRESSURE_SYSTOLIC
  BLOOD_PRESSURE_DIASTOLIC
  HEART_RATE
  BLOOD_GLUCOSE
  TEMPERATURE
}
```

### Migration Workflow

```bash
# 1. Modify schema.prisma

# 2. Create migration
npx prisma migrate dev --name add_user_preferences

# 3. Generate client
npx prisma generate

# 4. (Optional) Seed data
npx prisma db seed

# For production
npx prisma migrate deploy
```

### Database Client Usage

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Usage in API routes
import { prisma } from '@/lib/db';

export async function GET() {
  const metrics = await prisma.healthMetric.findMany({
    where: { userId: session.user.id },
    orderBy: { recordedAt: 'desc' },
    take: 100,
  });
  
  return Response.json({ metrics });
}

// With relations
const userWithMetrics = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    metrics: {
      where: { type: 'WEIGHT' },
      orderBy: { recordedAt: 'desc' },
      take: 10,
    },
  },
});
```

---

## API Development

### Route Handlers

```typescript
// app/api/health-metrics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const createMetricSchema = z.object({
  type: z.enum(['WEIGHT', 'BLOOD_PRESSURE', 'HEART_RATE']),
  value: z.number().positive(),
  unit: z.string(),
  recordedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// GET /api/health-metrics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const metrics = await prisma.healthMetric.findMany({
      where: {
        userId: session.user.id,
        ...(type && { type }),
        ...(startDate && endDate && {
          recordedAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      orderBy: { recordedAt: 'desc' },
    });

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/health-metrics
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validated = createMetricSchema.parse(body);

    const metric = await prisma.healthMetric.create({
      data: {
        ...validated,
        userId: session.user.id,
        recordedAt: validated.recordedAt 
          ? new Date(validated.recordedAt) 
          : new Date(),
      },
    });

    return NextResponse.json({ metric }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create metric:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Dynamic Routes

```typescript
// app/api/health-metrics/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: { id: string };
}

// GET /api/health-metrics/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  // ... fetch single metric
}

// PATCH /api/health-metrics/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  // ... update metric
}

// DELETE /api/health-metrics/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  // ... delete metric
}
```

---

## Frontend Development

### Server Components (Default)

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DashboardStats } from '@/components/dashboard-stats';
import { RecentMetrics } from '@/components/recent-metrics';
import { LoadingSkeleton } from '@/components/loading-skeleton';

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }

  // Fetch data on server
  const metrics = await prisma.healthMetric.findMany({
    where: { userId: session.user.id },
    take: 10,
    orderBy: { recordedAt: 'desc' },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardStats userId={session.user.id} />
      </Suspense>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Metrics</h2>
        <RecentMetrics initialData={metrics} />
      </div>
    </div>
  );
}
```

### Client Components

```typescript
'use client';

// components/metric-form.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const formSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  value: z.number().positive('Value must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function MetricForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '',
      value: 0,
      unit: '',
      notes: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/health-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast({
        title: 'Success',
        description: 'Metric recorded successfully',
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save metric',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="type">Metric Type</Label>
        <Input {...form.register('type')} />
        {form.formState.errors.type && (
          <p className="text-sm text-red-500">
            {form.formState.errors.type.message}
          </p>
        )}
      </div>
      
      <div>
        <Label htmlFor="value">Value</Label>
        <Input 
          type="number" 
          step="0.01"
          {...form.register('value', { valueAsNumber: true })} 
        />
      </div>
      
      <div>
        <Label htmlFor="unit">Unit</Label>
        <Input {...form.register('unit')} placeholder="e.g., kg, bpm" />
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input {...form.register('notes')} />
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Metric'}
      </Button>
    </form>
  );
}
```

### Data Visualization

```typescript
// components/health-chart.tsx
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

interface HealthChartProps {
  data: Array<{
    date: Date;
    value: number;
  }>;
  title: string;
  color?: string;
}

export function HealthChart({ data, title, color = '#3b82f6' }: HealthChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: format(new Date(item.date), 'MMM dd'),
  }));

  return (
    <div className="w-full h-[300px]">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="formattedDate"
            tick={{ fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px' }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## Testing

### Unit Tests

```typescript
// tests/components/dashboard-card.test.tsx
import { render, screen } from '@testing-library/react';
import { DashboardCard } from '@/components/dashboard-card';

describe('DashboardCard', () => {
  it('renders title and value', () => {
    render(<DashboardCard title="Weight" value="70 kg" />);
    
    expect(screen.getByText('Weight')).toBeInTheDocument();
    expect(screen.getByText('70 kg')).toBeInTheDocument();
  });

  it('displays trend indicator when provided', () => {
    render(<DashboardCard title="Weight" value="70 kg" trend="up" />);
    
    expect(screen.getByTestId('trend-up')).toBeInTheDocument();
  });
});
```

### API Tests

```typescript
// tests/api/health-metrics.test.ts
import { GET, POST } from '@/app/api/health-metrics/route';
import { prisma } from '@/lib/db';

jest.mock('@/lib/db', () => ({
  prisma: {
    healthMetric: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('GET /api/health-metrics', () => {
  it('returns metrics for authenticated user', async () => {
    const mockMetrics = [
      { id: '1', type: 'WEIGHT', value: 70 },
    ];
    
    (prisma.healthMetric.findMany as jest.Mock).mockResolvedValue(mockMetrics);
    
    const response = await GET(new Request('http://localhost/api/health-metrics'));
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.metrics).toEqual(mockMetrics);
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific file
npm run test -- dashboard-card.test.tsx
```

---

## Authentication & Security

### NextAuth Configuration

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Implement credentials validation
        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
};
```

### Protected Routes

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Additional role-based checks
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (req.nextauth.token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
  },
  {
    callbacks: {
      authorized({ req, token }) {
        if (token) return true;
        return false;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/api/health-metrics/:path*'],
};
```

---

## Deployment Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Type check
        run: npx tsc --noEmit
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## Contributing Guidelines

### Commit Convention

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Build/config changes

Example:
```
feat(metrics): add blood pressure tracking

- Add new MetricType for blood pressure
- Update form to handle dual values
- Add chart visualization

Closes #123
```

### Code Review Checklist

- [ ] TypeScript types are correct
- [ ] Error handling implemented
- [ ] Tests added/updated
- [ ] No console.log statements
- [ ] Environment variables documented
- [ ] Responsive design considered
- [ ] Accessibility checks pass

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [NextAuth.js Docs](https://next-auth.js.org/)
- [shadcn/ui Docs](https://ui.shadcn.com/)

---

**Last Updated:** 2026-03-21  
**Document Version:** 1.0
