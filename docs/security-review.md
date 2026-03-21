# Security Review - Ubon Health Insights (Next.js)

## Overview

This document outlines the security architecture for the Ubon Health Insights Next.js application, with special considerations for healthcare data (PHI/PII) handling.

---

## 1. Authentication & Session Management

### Current Implementation Guidelines

#### Session Strategy
- **Use HTTP-only, Secure, SameSite cookies** for session tokens
- **Avoid localStorage** for sensitive tokens (XSS vulnerability)
- **Session timeout**: 15-30 minutes for healthcare apps (HIPAA recommendation)
- **Absolute timeout**: Force re-authentication after 8 hours

#### Token Security
```typescript
// Recommended cookie configuration
{
  httpOnly: true,      // Prevent XSS access
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 900,         // 15 minutes
  path: '/'
}
```

#### Session Storage
- Server-side session store (Redis/database) preferred over JWT for healthcare
- If using JWT: sign with RS256, keep payload minimal, never store PHI in token
- Implement session invalidation on logout, password change, privilege change

#### Multi-Factor Authentication (MFA)
- **Required** for admin/clinical staff accounts
- Consider TOTP (Authenticator apps) or WebAuthn
- SMS-based MFA acceptable but less secure

---

## 2. Route Protection

### Middleware Implementation

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  
  // Protected routes
  const protectedPaths = ['/dashboard', '/patients', '/records', '/admin']
  
  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    // Verify session validity (call backend/session store)
    // Check role-based access
    // Check MFA status if required
  }
  
  return NextResponse.next()
}
```

### Role-Based Access Control (RBAC)

| Role | Access Level |
|------|-------------|
| Patient | Own records only |
| Clinician | Assigned patients, clinical functions |
| Admin | System config, user management |
| Auditor | Read-only audit logs |

### API Route Protection
- Validate authentication in every API route handler
- Never trust client-side checks
- Implement server-side authorization for every data access

---

## 3. Input Validation

### Defense in Depth

#### Client-Side Validation
- UX improvement only, **never** security control
- Use libraries like Zod, Yup, or Joi for schema validation

#### Server-Side Validation (Critical)
```typescript
import { z } from 'zod'

const patientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nationalId: z.string().regex(/^\d{13}$/),
  phone: z.string().regex(/^\d{9,10}$/).optional(),
  // Never allow HTML or script tags
  notes: z.string().max(1000).regex(/^[^<>]*$/)
})

// In API route
export async function POST(req: Request) {
  const body = await req.json()
  const validated = patientSchema.safeParse(body)
  
  if (!validated.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }
  
  // Process validated data
}
```

### Validation Rules for Healthcare Data
- **Thai National ID**: 13 digits, validate checksum
- **Date fields**: Reasonable ranges (DOB not in future)
- **Medical codes**: Validate against known dictionaries (ICD-10, CPT)
- **Phone numbers**: Thai format validation
- **Email**: Format + domain verification

### Sanitization
- Strip HTML/script tags from all text inputs
- Use DOMPurify if rich text is required
- Normalize unicode, trim whitespace
- Reject unexpected content types

---

## 4. SQL Injection Prevention

### ORM/Query Builder Usage

**Preferred**: Use Prisma, Drizzle, or similar ORM
```typescript
// Prisma - automatically parameterized
await db.patient.findUnique({
  where: { id: patientId }  // Safe - parameterized
})
```

### If Using Raw SQL
```typescript
// NEVER do this:
const query = `SELECT * FROM patients WHERE id = ${patientId}`

// ALWAYS do this:
const query = 'SELECT * FROM patients WHERE id = $1'
const result = await db.query(query, [patientId])
```

### Next.js Specific Considerations
- API routes often connect to database directly - validate all inputs
- Server Components can access DB - treat props as untrusted
- Use prepared statements for every query with user input
- Implement query allowlisting for dynamic searches

### Additional Protections
- Least privilege database accounts (no DROP, ALTER in app user)
- Input length limits to prevent buffer attacks
- Log suspicious query patterns (SQL keywords in text fields)

---

## 5. Secrets Management

### Environment Variables

#### Development
```env
# .env.local (never commit)
DATABASE_URL="postgresql://..."
SESSION_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_SECRET="auth-secret-min-32-chars"
ENCRYPTION_KEY="32-char-key-for-field-encryption"
```

#### Production
- **Never** commit `.env` files
- Use platform secrets (Vercel, Railway, AWS Parameter Store)
- Rotate secrets quarterly
- Different secrets per environment

### Encryption at Rest

#### For Healthcare Data
```typescript
import { AES, enc } from 'crypto-js'

// Encrypt sensitive fields before storing
const encryptField = (value: string, key: string) => {
  return AES.encrypt(value, key).toString()
}

const decryptField = (encrypted: string, key: string) => {
  const bytes = AES.decrypt(encrypted, key)
  return bytes.toString(enc.Utf8)
}
```

#### Field-Level Encryption
- **Encrypt**: National ID, phone, medical record numbers, diagnoses
- **Hash** (one-way): Passwords (use bcrypt/argon2)
- **Tokenize**: Consider for searchable encrypted fields

### Key Management
- Use cloud KMS (AWS KMS, GCP KMS, Azure Key Vault) for production
- Never hardcode keys in source
- Implement key rotation strategy
- Separate encryption keys per tenant/environment

### Secrets Rotation
- Automate rotation where possible
- Revoke old sessions on secret rotation
- Audit log all secret access/rotation

---

## 6. Healthcare Data Considerations (HIPAA/Thai PDPA)

### Protected Health Information (PHI)
- Patient names, DOB, national ID
- Medical record numbers
- Diagnosis codes, treatment data
- Contact information
- Healthcare utilization data

### Compliance Requirements

#### Access Logging
```typescript
// Log every PHI access
await db.auditLog.create({
  data: {
    userId: session.userId,
    action: 'READ_PATIENT_RECORD',
    resourceId: patientId,
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.headers.get('user-agent')
  }
})
```

#### Data Minimization
- Only collect necessary data
- Anonymize for analytics where possible
- Implement data retention policies
- Support patient data export/deletion requests

#### Breach Notification
- Detect unauthorized access patterns
- Alert on bulk exports, unusual access times
- Maintain incident response procedure
- Know regulatory notification timelines (HIPAA: 60 days, PDPA: as required)

#### Business Associate Agreements
- Ensure hosting provider signs BAA (HIPAA)
- Document data processing agreements (PDPA)
- Vet all third-party integrations

### Additional Healthcare Security Controls

| Control | Implementation |
|---------|---------------|
| Break-glass access | Emergency override with audit trail |
| Patient consent tracking | Record consent for data sharing |
| Minimum necessary | Role-based data filtering |
| De-identification | Anonymization for research/analytics |
| Audit reports | Regular access review reports |

---

## 7. Additional Security Layers

### Rate Limiting
```typescript
// Use Vercel KV or Redis for rate limiting
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
  analytics: true
})
```

### CORS Configuration
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [{
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type,Authorization' },
        { key: 'Access-Control-Allow-Credentials', value: 'true' },
      ]
    }]
  }
}
```

### Security Headers
```typescript
// middleware.ts
response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
response.headers.set('Permissions-Policy', 'camera=(), microphone=()')
response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'")
```

### Dependency Security
- Run `npm audit` regularly
- Use Dependabot/Snyk for automated alerts
- Pin dependency versions
- Review supply chain (npm packages with wide access)

---

## 8. Security Testing Checklist

- [ ] Penetration testing before launch
- [ ] OWASP Top 10 coverage verified
- [ ] AuthZ bypass testing (IDOR)
- [ ] Session fixation testing
- [ ] XSS testing (all input vectors)
- [ ] SQLi testing (all query paths)
- [ ] CSRF token validation
- [ ] Rate limiting effectiveness
- [ ] Error messages don't leak info
- [ ] Logging captures security events
- [ ] Secrets not in version control
- [ ] TLS 1.2+ enforced everywhere
- [ ] HSTS enabled
- [ ] Backup encryption verified
- [ ] Disaster recovery tested

---

## 9. Incident Response

### Immediate Actions
1. Contain: Isolate affected systems
2. Assess: Determine scope of breach
3. Preserve: Save logs for forensics
4. Notify: Legal/compliance team
5. Remediate: Fix vulnerability
6. Review: Post-incident analysis

### Contact List
- Security lead: [TBD]
- Legal counsel: [TBD]
- Hosting provider security: [TBD]
- Regulatory body contact: [TBD]

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-03-21 | myBOT | Initial security review |

---

**Next Steps**: 
1. Implement security controls per this review
2. Complete security-hardening-checklist.md
3. Schedule penetration test
4. Establish ongoing security monitoring
