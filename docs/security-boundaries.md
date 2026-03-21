# Security Boundaries

## Overview

This document defines security boundaries, threat models, and protective measures for the Ubon Health Insights Next.js application. Since there is no separate backend, all security controls must be implemented within the Next.js application itself.

## Security Principles

### 1. Defense in Depth
- **Multiple layers** of validation and authorization
- **Never trust client input** - validate everywhere
- **Fail securely** - errors don't leak sensitive information

### 2. Principle of Least Privilege
- **Database users** have minimal required permissions
- **API routes** expose only necessary data
- **Session tokens** are scoped and time-limited

### 3. Secure by Default
- **HTTPS enforced** in production
- **HttpOnly cookies** for sessions
- **CSP headers** prevent XSS

## Authentication & Authorization

### Authentication Strategy
- **NextAuth.js (Auth.js v5)** handles all authentication
- **Database adapter** - sessions stored in MariaDB
- **Credential provider** - email/password (with bcrypt hashing)
- **Optional OAuth** - Google, GitHub for future expansion

### Session Security
```typescript
// lib/auth.ts
export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'database', // JWT also available for stateless
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      },
    },
  },
}
```

### Authorization Patterns

#### Server Component Authorization
```typescript
// app/(dashboard)/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }
  
  // User is authenticated - proceed
  const data = await prisma.healthInsight.findMany({
    where: { userId: session.user.id } // User-scoped query
  })
  
  return <Dashboard data={data} />
}
```

#### Server Action Authorization
```typescript
// actions/insights.ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function deleteInsight(id: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }
  
  // Verify ownership before deletion
  const insight = await prisma.healthInsight.findFirst({
    where: {
      id,
      userId: session.user.id // Critical: user-scoped
    }
  })
  
  if (!insight) {
    throw new Error('Not found or unauthorized')
  }
  
  await prisma.healthInsight.delete({ where: { id } })
}
```

### Role-Based Access Control (Future)
```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      Role     @default(USER)
  // ...
}

enum Role {
  USER
  ADMIN
  HEALTH_PROVIDER
}
```

## Input Validation

### Server-Side Validation (Required)
All inputs validated with **Zod** schemas before database operations:

```typescript
// lib/validators.ts
import { z } from 'zod'

export const createInsightSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  category: z.enum(['nutrition', 'exercise', 'mental', 'sleep']),
  tags: z.array(z.string().max(50)).max(10).optional(),
})

export const updateHealthDataSchema = z.object({
  weight: z.number().min(30).max(300).optional(),
  bloodPressureSystolic: z.number().min(70).max(250).optional(),
  bloodPressureDiastolic: z.number().min(40).max(150).optional(),
  measurementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})
```

### Client-Side Validation (UX Only)
- **React Hook Form** with Zod resolver for form validation
- **Real-time feedback** - improves UX but NOT security boundary
- **Always re-validate on server** - client can be bypassed

## Database Security

### Connection Security
- **Environment variables** - credentials never in code
- **Connection pooling** - Prisma handles connection limits
- **Prepared statements** - Prisma prevents SQL injection by default

### Query Security
```typescript
// ✅ Safe - Prisma handles parameterization
const user = await prisma.user.findUnique({
  where: { email: userInputEmail }
})

// ❌ Never do this - raw SQL with interpolation
const user = await prisma.$queryRaw(
  `SELECT * FROM User WHERE email = ${userInputEmail}`
)

// ✅ Safe - raw SQL with parameters
const user = await prisma.$queryRaw(
  `SELECT * FROM User WHERE email = ${Prisma.sql(userInputEmail)}`
)
```

### Row-Level Security
All queries **must** include user ownership checks:

```typescript
// ✅ Correct pattern
const insights = await prisma.healthInsight.findMany({
  where: {
    userId: session.user.id // User can only see their own data
  }
})

// ❌ Dangerous - missing user scope
const insights = await prisma.healthInsight.findMany({
  where: { published: true } // Exposes all users' data
})
```

## API Security

### Rate Limiting
Implement rate limiting on API routes:

```typescript
// app/api/insights/route.ts
import { Ratelimit } from '@upstash/ratelimit' // or custom implementation
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Too many requests', { status: 429 })
  }
  
  // ... proceed with request
}
```

### CORS Configuration
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: 'https://ubon-health.local' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}
```

### Security Headers
```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}
```

## Content Security Policy (CSP)

### Recommended CSP Header
```
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.vercel-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.vercel-analytics.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### Implementation
Use [next-safe-action](https://github.com/TheEdgarRibeiro/next-safe-action) or custom middleware:

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    connect-src 'self';
    base-uri 'self';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim()
  
  const response = NextResponse.next()
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('x-nonce', nonce)
  
  return response
}
```

## Environment Variable Security

### Required Environment Variables
```bash
# .env.example

# Database
DATABASE_URL="mysql://user:password@localhost:3306/ubon_health"
DIRECT_URL="mysql://user:password@localhost:3306/ubon_health"

# Authentication
AUTH_SECRET="your-secret-key-min-32-characters"
AUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Optional - Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"
```

### Security Rules
- **Never commit** `.env` files to version control
- **Use `.env.example`** as template for team onboarding
- **Rotate secrets** periodically (AUTH_SECRET, DATABASE_URL)
- **Production secrets** - use environment injection (Docker, Vercel, etc.)

## Error Handling & Information Leakage

### Safe Error Responses
```typescript
// app/api/insights/route.ts
export async function POST(request: Request) {
  try {
    // ... operation
    return Response.json({ success: true, data: result })
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    // Log full error server-side
    console.error('Database error:', error)
    
    // Return generic message to client
    return Response.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
```

### Logging Security
- **Never log** passwords, tokens, or full session objects
- **Sanitize PII** in logs (email, health data)
- **Use structured logging** for production observability

## Deployment Security

### Production Checklist
- [ ] HTTPS enforced (redirect HTTP → HTTPS)
- [ ] `AUTH_SECRET` set to cryptographically secure value
- [ ] Database credentials rotated from development
- [ ] `NODE_ENV=production` set
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error pages don't leak stack traces
- [ ] `.env` file not deployed with application
- [ ] Prisma schema matches production database
- [ ] Health check endpoint available (`/api/health`)

### Docker Security (if containerized)
```dockerfile
# Use non-root user
USER node

# Don't copy .env
COPY --chown=node:node . .

# Minimal base image
FROM node:20-alpine
```

## Health Data Specific Considerations

### Data Classification
Health insights are **sensitive personal data**:

- **Encryption at rest** - database-level encryption recommended
- **Encryption in transit** - TLS 1.3 required
- **Access logging** - audit who accessed what data when
- **Data retention** - define and enforce retention policies
- **Right to deletion** - implement user data export/delete

### Future Compliance (Optional)
If targeting healthcare markets:
- **HIPAA** (US) - requires BAA with hosting provider
- **GDPR** (EU) - consent management, data portability
- **PDPA** (Thailand) - local data protection compliance

## Security Testing

### Automated Checks
- `npm audit` - dependency vulnerabilities
- `next lint` - code quality including security anti-patterns
- OWASP ZAP - dynamic application security testing

### Manual Review
- **Code review** - all PRs reviewed for security implications
- **Penetration testing** - periodic external security assessment
- **Threat modeling** - update this document as features expand

---

**Last Updated:** 2026-03-21  
**Review Cadence:** Quarterly or after major feature additions
