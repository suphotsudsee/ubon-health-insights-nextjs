# Security Audit Report — API Routes & Server Actions

**Project:** Ubon Health Insights Next.js  
**Date:** 2026-04-20  
**Scope:** 17 API route files (`app/api/*/route.ts`), 8 server action files (`actions/*.ts`), `lib/auth.ts`, `lib/validators.ts`  
**Stack:** Next.js 16 / Prisma 5 / NextAuth / MariaDB  

---

## Executive Summary

**16 of 17 API route files have zero authentication/authorization checks.** Only `/api/auth/users` validates admin role. All other endpoints — finance, KPI, health units, fiscal periods, dashboard — are fully accessible to unauthenticated users. This is the most critical finding.

Server actions also lack internal auth checks, relying entirely on calling routes — which in most cases don't enforce auth either.

Prisma ORM prevents SQL injection. Zod validation exists in server actions but is underutilized in API routes. Error handling is inconsistent and several GET routes lack try-catch. Race conditions exist in login-attempt tracking and admin-deletion checks.

---

## 1. MISSING AUTHENTICATION & AUTHORIZATION (CRITICAL)

### 1.1 API Routes Without Any Auth Check

| Route | Methods | Auth? |
|---|---|---|
| `/api/auth/users` | GET, POST, PUT, DELETE | ✅ Admin-only |
| `/api/finance/records` | GET, POST | ❌ None |
| `/api/finance/records/[id]` | GET, PUT, DELETE | ❌ None |
| `/api/finance/import` | POST | ❌ None |
| `/api/finance-accounts` | GET, POST | ❌ None |
| `/api/finance-accounts/[id]` | PUT, DELETE | ❌ None |
| `/api/health` | GET | N/A (public healthcheck) |
| `/api/health-units` | GET, POST | ❌ None |
| `/api/health-units/[id]` | GET, PUT, DELETE | ❌ None |
| `/api/kpi-results` | GET, POST | ❌ None |
| `/api/kpi-results/[id]` | GET, PUT, DELETE, PATCH | ❌ None |
| `/api/kpi-definitions` | GET, POST | ❌ None |
| `/api/kpi-definitions/[id]` | PUT, DELETE | ❌ None |
| `/api/kpi-categories` | GET, POST | ❌ None |
| `/api/kpi-categories/[id]` | PUT, DELETE | ❌ None |
| `/api/fiscal-periods` | GET, POST, DELETE | ❌ None |
| `/api/fiscal-periods/[id]` | PUT | ❌ None |
| `/api/dashboard` | GET | ❌ None |

**Impact:** Anyone can create, modify, or delete finance records, KPI data, health units, fiscal periods, and user-adjacent data. The `POST /api/finance/import` endpoint allows arbitrary file uploads without auth.

### 1.2 Missing Role-Based Access in Sensitive Operations

- **`POST /api/finance/import`** — No auth; anyone can bulk-import financial data
- **`DELETE /api/fiscal-periods?fiscalYear=...`** — No auth; anyone can delete entire fiscal years
- **`PATCH /api/kpi-results/[id]` with `action=approve|reject`** — No auth; anyone can approve/reject KPI results that should require manager/admin
- **`GET /api/kpi-definitions?admin=true`** — The `admin=true` query param exposes inactive/soft-deleted definitions without actually checking admin role
- **`GET /api/fiscal-periods?summary=true`** — Exposes usage data without auth

### 1.3 Server Actions Without Auth Checks

Every server action function is callable from server components without auth verification:

- `actions/finance.ts` — `createFinanceRecord`, `updateFinanceRecord`, `deleteFinanceRecord` have no role checks
- `actions/kpi.ts` — `reviewKpiResult()` (approve/reject) has no role check; `submitKpiResult()` has no user-identity check
- `actions/health-units.ts` — `createHealthUnit`, `updateHealthUnit`, `deleteHealthUnit` documented as "admin only" but enforce nothing
- `actions/fiscal-periods.ts` — `closeFiscalPeriod()` and `reopenFiscalPeriod()` documented as "admin only" but enforce nothing
- `actions/settings-admin.ts` — All functions (CRUD for fiscal years, KPI definitions, KPI categories) are admin-only by convention only
- `actions/auth.ts` — `resetUserPassword(userId, newPassword)` has no auth check; any server component could reset any user's password
- `actions/finance-accounts.ts` — All CRUD operations have no auth check

**Recommendation:** Create a middleware helper (`requireAuth()` / `requireRole()`) and apply it to every route. Server actions should internally verify auth via `auth()` from `@/lib/auth`.

---

## 2. INPUT VALIDATION ISSUES (HIGH)

### 2.1 API Routes Don't Use `lib/validators.ts`

The file `lib/validators.ts` contains well-defined Zod schemas with `z.coerce`, `.max(100)` limits, etc., but **no API route imports or uses it**. Routes parse query parameters with raw `parseInt()` and type casts.

### 2.2 `parseInt()` Without NaN Guard in Finance Routes

```typescript
// app/api/finance/records/route.ts:44
const fiscalYear = parseInt(searchParams.get('fiscalYear') || '2567')
```
If `fiscalYear` is a non-numeric string like `"abc"`, `parseInt` returns `NaN`, which gets passed to Prisma — causing a query error or unexpected behavior.

Same issue at lines 44, 47, 63, 65, 82–86, 93, 98–99, 105.

### 2.3 Unbounded `pageSize` Enables DoS

```typescript
// app/api/finance/records/route.ts:101-103
pageSize: searchParams.get('pageSize') 
  ? parseInt(searchParams.get('pageSize')!) 
  : 20,
```
No maximum limit. An attacker can request `pageSize=1000000` to exhaust memory/DB. The `lib/validators.ts` has `max(100)` but isn't used.

Same in `app/api/kpi-results/route.ts:46-48`.

### 2.4 Unsafe Type Casts Without Runtime Validation

```typescript
// kpi-results/route.ts:32
reviewStatus: searchParams.get('reviewStatus') as KpiResultFilters['reviewStatus'],

// health-units/route.ts:84
status: searchParams.get('status') as 'active' | 'inactive' | undefined,

// finance/records/route.ts:105
sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
```
These TypeScript `as` casts provide zero runtime protection. An attacker can pass `sortOrder=DROP` and it bypasses type checking at runtime.

### 2.5 `sortBy` Not Validated Against Allowlist

```typescript
sortBy: searchParams.get('sortBy') || 'createdAt',
```
`sortBy` is passed directly to Prisma `orderBy: { [sortBy]: sortOrder }`. While Prisma won't allow arbitrary SQL, invalid field names cause unhandled 500 errors. No allowlist validation.

### 2.6 `resetUserPassword` — No Password Validation

```typescript
// actions/auth.ts:394-424
export async function resetUserPassword(userId: number, newPassword: string) {
  // No validation on newPassword — no min length, no complexity check
  const passwordHash = await hashPassword(newPassword)
```
Missing: minimum length, complexity, or Zod schema validation.

### 2.7 Finance Import — No File Type or Size Validation

```typescript
// app/api/finance/import/route.ts
const file = formData.get("file");
if (!(file instanceof File)) { ... }
// No check on file.type, file.size, or file extension
```
Accepts any file (not just `.xlsx`/`.xls`), with no size limit.

**Recommendation:** Apply Zod schemas from `lib/validators.ts` in API routes for all query/body params. Add `pageSize` max of 100, validate `sortBy` against allowlists, add `file.type` and `file.size` checks on upload.

---

## 3. ERROR HANDLING ISSUES (MEDIUM)

### 3.1 GET Routes Without try-catch

These GET routes have no try-catch wrapping — an unhandled Prisma/database error returns a raw 500 with a stack trace in development mode:

- `app/api/finance/records/route.ts` — GET
- `app/api/finance-accounts/route.ts` — GET
- `app/api/health-units/route.ts` — GET
- `app/api/kpi-results/route.ts` — GET
- `app/api/kpi-categories/route.ts` — GET
- `app/api/kpi-definitions/route.ts` — GET

Compare with `app/api/dashboard/route.ts` which correctly wraps in try-catch.

### 3.2 ZodError Returns Generic "Validation Error"

All server actions catch `z.ZodError` and return:
```typescript
return { success: false, error: 'Validation error' }
```
The specific field errors from Zod are discarded. Callers cannot determine which fields failed. The API routes that pass Zod error `data` back (`details: result.data`) expose the raw Zod issue objects — inconsistent approach.

### 3.3 `console.error` May Log Sensitive Data

```typescript
console.error('Error creating finance record:', error)
```
The full `error` object (which may include user-submitted data, Prisma query details) is logged server-side. This is a minor risk for log extraction attacks.

**Recommendation:** Wrap all route handlers in try-catch. Use a structured error formatter. Return Zod field errors in a safe format. Sanitize log output.

---

## 4. RACE CONDITIONS (MEDIUM)

### 4.1 Login Attempt Tracking — Non-Atomic Read-Modify-Write

```typescript
// actions/auth.ts:293-311
const newAttempts = user.loginAttempts + 1  // READ
if (newAttempts >= 5) {
  await prisma.user.update({
    data: { loginAttempts: newAttempts, lockedUntil: ... }  // WRITE
  })
}
```
Two concurrent login attempts for the same user both read `loginAttempts = 4`, each compute `5`, but only one triggers lockout. This allows a 6th attempt before the account is properly locked.

**Fix:** Use atomic increment:
```typescript
const result = await prisma.user.update({
  where: { id: user.id },
  data: { loginAttempts: { increment: 1 } },
})
if (result.loginAttempts >= 5) { /* lock account */ }
```

### 4.2 Delete Last Admin — Check Not in Transaction

```typescript
// actions/auth.ts:227-231
const adminCount = await prisma.user.count({ where: { role: 'admin' } })
if (adminCount <= 1) { return error }
await prisma.user.delete({ where: { id } })
```
Between the count check and the delete, another concurrent request could delete a different admin, making this the last admin. Should wrap in `$transaction`.

### 4.3 Finance Record / KPI Result Duplicate Checks

The find-then-create pattern in `createFinanceRecord()`, `createKpiResult()`, `createUser()`, and `createHealthUnit()` is technically a race condition but is **protected by database unique constraints** — the second insert will throw a Prisma unique constraint error. However, this error is not specifically caught; it falls through to the generic catch block returning "Failed to create..." which is misleading.

**Recommendation:** Use `$transaction` for check-then-mutate operations. Catch `Prisma.PrismaClientKnownRequestError` with code `P2002` for unique constraint violations specifically.

---

## 5. SQL INJECTION ASSESSMENT (LOW RISK)

Prisma ORM is used exclusively for all database queries. No `$queryRaw` or `$executeRaw` calls were found in any reviewed file. Parameterized queries are inherent to Prisma's query builder. **SQL injection risk is minimal.**

The dynamic `sortBy` field in `orderBy: { [sortBy]: sortOrder }` only allows Prisma model field names — Prisma will reject unknown fields with a type error, not inject SQL.

---

## 6. OTHER SECURITY CONCERNS

### 6.1 No API Rate Limiting

No rate limiting middleware is applied to any API route. Combined with no auth, this means anyone can:
- Brute-force enumeration of records by ID
- Flood the database with large `pageSize` queries
- Bulk-create/delete data
- Spam the finance import endpoint with large files

### 6.2 Long-Lived JWT Sessions

```typescript
// lib/auth.ts:96-97
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
},
```
30-day JWT tokens without rotation or refresh mechanism. Compromised tokens remain valid for a full month.

### 6.3 `trustHost: true` in NextAuth Config

```typescript
// lib/auth.ts:16
trustHost: true,
```
This broadens the accepted `NEXTAUTH_URL` values. In deployments where the host header can be manipulated, this could aid in certain attacks. Should only be enabled when necessary.

### 6.4 File Upload — No Virus Scanning

The finance import accepts binary file uploads that are immediately parsed and processed. No virus/malware scanning before processing.

### 6.5 Missing CSRF Protection on API Routes

Server actions have Next.js built-in CSRF via closure. API routes (`/api/*`) do not have CSRF token validation. A cross-origin form submission could trigger state-changing operations (POST, PUT, DELETE).

### 6.6 KPI Review Authorship Not Tracked

```typescript
// actions/kpi.ts:518-524
await prisma.kpiResult.update({
  where: { id },
  data: {
    reviewStatus: status,
    reviewedAt: new Date(),
    // No reviewedBy field set — who approved/rejected is not recorded
  },
})
```
No `reviewedBy` field is set, making it impossible to audit who approved or rejected a KPI result.

### 6.7 Fiscal Period Closure Not Enforced in Mutations

`closeFiscalPeriod()` sets `isClosed = true`, but `createFinanceRecord()`, `updateFinanceRecord()`, `createKpiResult()`, and `updateKpiResult()` do **not check** if the fiscal period is closed. Users can still modify data in closed periods.

---

## 7. Summary of Findings by Severity

### Critical (Fix Immediately)
1. **16/17 API routes have no authentication** — all data is publicly readable/writable
2. **All server actions lack internal auth checks** — callable from any server component without role verification
3. **`resetUserPassword()` has no auth or validation** — can reset any user's password to a 1-char string
4. **KPI approve/reject has no role check** — anyone can approve/reject KPI submissions
5. **Fiscal period closure not enforced** — data can be modified after period is closed

### High (Fix Before Production)
6. **Unbounded `pageSize`** enables memory/DB exhaustion
7. **`parseInt()` without NaN checks** causes query failures on invalid input
8. **Unsafe type casts** (reviewStatus, status, sortOrder) bypass runtime validation
9. **Finance import accepts any file type/size** — no `.xlsx` check, no size limit
10. **No API rate limiting** — susceptible to enumeration and flooding
11. **Missing `reviewedBy` tracking** — no audit trail for KPI approvals

### Medium (Fix Soon)
12. **Race condition in login-attempt tracking** — allows bypassing lockout by 1 attempt
13. **Race condition in delete-last-admin** — non-atomic check-then-delete
14. **GET routes without try-catch** — unhandled errors leak stack traces in dev mode
15. **No CSRF protection on API routes** — state-changing endpoints vulnerable
16. **`resetUserPassword` lacks password validation** — no minimum length
17. **Generic ZodError responses** — clients can't determine which fields failed

### Low (Address in Hardening Phase)
18. **`sortBy` not validated against allowlist** — causes 500 errors, not injection
19. **30-day JWT maxAge without rotation** — long compromise window
20. **`trustHost: true`** — verify this is needed in deployment
21. **No virus scanning on file uploads**
22. **`console.error` may log sensitive Prisma query details**
23. **KPI definitions `admin=true` query param exposes inactive definitions without auth**

---

## 8. Recommended Fixes (Priority Order)

1. **Add auth middleware** — Create a shared `requireAuth()` / `requireRole()` helper. Apply to ALL routes except `/api/auth/[...nextauth]` and `/api/health`.
2. **Add auth to server actions** — Each mutation action should call `auth()` and verify role before proceeding.
3. **Enforce fiscal period closure** — Check `isClosed` in `createFinanceRecord`, `updateFinanceRecord`, `createKpiResult`, `updateKpiResult`.
4. **Validate input in API routes** — Use schemas from `lib/validators.ts` for all query params and body payloads. Add `pageSize` max of 100, validate `sortBy` allowlist.
5. **Add file upload constraints** — Validate MIME type, limit file size (e.g., 10MB).
6. **Fix race conditions** — Use `prisma.user.update({ data: { loginAttempts: { increment: 1 } } })` for atomic counter. Use `$transaction` for delete-last-admin.
7. **Wrap GET routes in try-catch** — Prevent unhandled 500 errors.
8. **Add rate limiting** — Implement via middleware (e.g., `next-rate-limit` or custom).
9. **Track KPI review authorship** — Set `reviewedBy` in `reviewKpiResult()`.
10. **Add password validation to `resetUserPassword`** — Apply `changePasswordSchema` or equivalent.