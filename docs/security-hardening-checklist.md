# Security Hardening Checklist - Ubon Health Insights (Next.js)

## Purpose

This checklist ensures systematic security hardening for the healthcare application. Complete each section before going to production.

---

## 🔐 Authentication & Authorization

### Session Management
- [ ] HTTP-only cookies enabled for all session tokens
- [ ] Secure flag set (HTTPS-only)
- [ ] SameSite=strict or lax configured
- [ ] Session timeout ≤ 30 minutes (HIPAA recommendation)
- [ ] Absolute session timeout ≤ 8 hours
- [ ] Session invalidation on logout works
- [ ] Session invalidation on password change works
- [ ] Session invalidation on privilege change works
- [ ] Concurrent session limits enforced (optional)
- [ ] Session tokens are cryptographically secure (≥ 256 bits)

### Authentication
- [ ] Password requirements: min 12 chars, complexity enforced
- [ ] Password hashing: bcrypt (cost ≥ 12) or argon2
- [ ] Account lockout after 5 failed attempts
- [ ] Lockout duration: 15-30 minutes or progressive
- [ ] MFA enabled for admin/clinical roles
- [ ] MFA method: TOTP or WebAuthn preferred
- [ ] Password reset tokens expire in ≤ 1 hour
- [ ] Password reset tokens single-use only
- [ ] No user enumeration in login/error messages
- [ ] "Remember me" uses separate long-lived token

### Authorization
- [ ] RBAC implemented (Patient, Clinician, Admin, Auditor)
- [ ] Every API route checks authentication
- [ ] Every API route checks authorization (not just auth)
- [ ] IDOR prevention: users can't access others' records
- [ ] Middleware protects all dashboard/patient routes
- [ ] Server-side checks for all data mutations
- [ ] Role checks in Server Components
- [ ] API routes return 403 (not 404) for authZ failures

---

## 🛡️ Input Validation & Sanitization

### Validation Implementation
- [ ] Schema validation library in use (Zod, Yup, or Joi)
- [ ] All API routes validate input before processing
- [ ] Client-side validation present (UX only)
- [ ] Server-side validation never trusts client checks
- [ ] All string inputs have max length limits
- [ ] Numeric inputs have min/max bounds
- [ ] Enum values validated against allowed set
- [ ] Date fields validated for reasonable ranges
- [ ] Email format validation + domain verification
- [ ] Phone number format validation (Thai format)
- [ ] National ID validation (13 digits + checksum)

### Sanitization
- [ ] HTML/script tags stripped from all text inputs
- [ ] DOMPurify used if rich text required
- [ ] Unicode normalization applied
- [ ] Whitespace trimmed from inputs
- [ ] Content-Type validated on file uploads
- [ ] File upload extensions allowlisted
- [ ] File upload size limits enforced
- [ ] Path traversal prevention in file operations
- [ ] No eval(), Function(), or dynamic code execution

### Healthcare-Specific Validation
- [ ] Medical codes validated against ICD-10/CPT dictionaries
- [ ] Lab values checked for physiologically reasonable ranges
- [ ] Medication dosages validated against standard ranges
- [ ] Date of birth not in future
- [ ] Admission/discharge dates logically consistent
- [ ] National ID checksum validation implemented

---

## 🗄️ SQL Injection Prevention

### Query Safety
- [ ] ORM used (Prisma, Drizzle, or similar)
- [ ] If raw SQL: prepared statements for ALL queries
- [ ] No string concatenation in SQL queries
- [ ] No template literals with user input in queries
- [ ] Stored procedures use parameterized inputs
- [ ] Dynamic query builders use parameterization
- [ ] Search/filter inputs parameterized
- [ ] Sort/order inputs allowlisted (not direct column names)
- [ ] Table/collection names never from user input

### Database Security
- [ ] Database user has least privilege (no DROP, ALTER)
- [ ] Separate read-only user for analytics
- [ ] Connection strings in environment variables (not code)
- [ ] Database credentials rotated quarterly
- [ ] Query logging enabled for security auditing
- [ ] Slow query monitoring enabled
- [ ] Connection pooling configured properly

---

## 🔑 Secrets Management

### Environment Variables
- [ ] .env files in .gitignore
- [ ] No secrets in source code
- [ ] No secrets in commit history (check with git log -p)
- [ ] Different secrets per environment (dev/staging/prod)
- [ ] Secrets stored in platform secret manager (Vercel, AWS, etc.)
- [ ] DATABASE_URL uses strong password
- [ ] SESSION_SECRET ≥ 32 characters
- [ ] NEXTAUTH_SECRET ≥ 32 characters
- [ ] All crypto keys ≥ 256 bits

### Encryption
- [ ] Encryption at rest for PHI fields
- [ ] Field-level encryption for: National ID, phone, diagnoses
- [ ] Encryption key not stored in same location as data
- [ ] Key management via cloud KMS (production)
- [ ] Key rotation procedure documented
- [ ] Encryption library audited/maintained (crypto-js, libsodium)
- [ ] TLS 1.2+ enforced for all connections
- [ ] HSTS header enabled

### Password/Token Hashing
- [ ] Passwords hashed with bcrypt (cost ≥ 12) or argon2
- [ ] API tokens hashed before storage
- [ ] Reset tokens are random (crypto.randomBytes)
- [ ] Tokens have sufficient entropy (≥ 128 bits)

---

## 🏥 Healthcare Data Protection (HIPAA/PDPA)

### PHI Handling
- [ ] PHI identified and documented
- [ ] PHI encrypted at rest
- [ ] PHI encrypted in transit (TLS)
- [ ] Minimum necessary access enforced
- [ ] Patient data segmented by access role
- [ ] Audit logging for all PHI access
- [ ] Audit logs include: user, action, resource, timestamp, IP
- [ ] Audit logs immutable (write-only, no delete)
- [ ] Audit log retention ≥ 6 years (HIPAA)

### Access Controls
- [ ] Unique user accounts (no shared logins)
- [ ] Emergency "break-glass" access with audit trail
- [ ] Patient consent tracking implemented
- [ ] Data sharing preferences recorded
- [ ] Automatic logout on inactivity
- [ ] Session binding to IP/device (optional)

### Data Rights
- [ ] Patient data export functionality
- [ ] Patient data deletion/anonymization (where legal)
- [ ] Data portability in standard format
- [ ] Consent withdrawal mechanism
- [ ] Rectification process for incorrect data

### Compliance Documentation
- [ ] Business Associate Agreement (BAA) with hosting provider
- [ ] Data Processing Agreement (DPA) for PDPA
- [ ] Privacy policy published
- [ ] Notice of Privacy Practices available
- [ ] Breach notification procedure documented
- [ ] Incident response plan documented
- [ ] Workforce training on HIPAA/PDPA completed

---

## 🌐 Network & Transport Security

### HTTPS/TLS
- [ ] HTTPS enforced (no HTTP fallback)
- [ ] TLS 1.2 minimum (1.3 preferred)
- [ ] Valid SSL certificate (not self-signed in prod)
- [ ] Certificate auto-renewal configured
- [ ] HSTS header set (min 1 year, includeSubDomains)
- [ ] OCSP stapling enabled
- [ ] Perfect Forward Secrecy (PFS) ciphers

### Security Headers
- [ ] X-Frame-Options: DENY or SAMEORIGIN
- [ ] X-Content-Type-Options: nosniff
- [ ] X-XSS-Protection: 1; mode=block (legacy)
- [ ] Content-Security-Policy configured
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] Permissions-Policy configured (disable unnecessary features)
- [ ] Cache-Control for sensitive pages (no-store)

### CORS
- [ ] CORS allowlist configured (not wildcard *)
- [ ] Credentials flag set appropriately
- [ ] Preflight caching configured
- [ ] Methods restricted to necessary verbs
- [ ] Headers restricted to necessary headers

---

## 📊 Monitoring & Logging

### Security Logging
- [ ] Authentication attempts logged (success + failure)
- [ ] Authorization failures logged
- [ ] Input validation failures logged
- [ ] Rate limit hits logged
- [ ] Suspicious patterns logged (bulk access, unusual hours)
- [ ] Admin actions logged
- [ ] Data exports logged
- [ ] Configuration changes logged
- [ ] Log retention ≥ 1 year

### Monitoring
- [ ] Real-time alerting on security events
- [ ] Dashboard for security metrics
- [ ] Failed login spike detection
- [ ] Unusual data access pattern detection
- [ ] Geographic anomaly detection (optional)
- [ ] Integration with SIEM (optional)

### Log Security
- [ ] Logs don't contain sensitive data (PHI, passwords, tokens)
- [ ] Log access restricted to security team
- [ ] Log integrity protection (write-only)
- [ ] Log backup encrypted

---

## 🚦 Rate Limiting & DoS Protection

### Rate Limiting
- [ ] Rate limiting on all API routes
- [ ] Stricter limits on auth endpoints (login, register, reset)
- [ ] Rate limits by IP + user ID (prevent proxy bypass)
- [ ] Rate limit headers returned (X-RateLimit-*)
- [ ] Graceful degradation when limit hit (429, not 500)
- [ ] Rate limit bypass for trusted IPs (optional)

### DDoS Protection
- [ ] WAF enabled (Vercel, Cloudflare, AWS WAF)
- [ ] Bot protection enabled
- [ ] Geographic blocking if applicable
- [ ] Traffic anomaly detection
- [ ] Auto-scaling configured for traffic spikes

---

## 📦 Dependency & Supply Chain Security

### Dependencies
- [ ] npm audit run regularly (weekly)
- [ ] Critical vulnerabilities fixed within 24 hours
- [ ] High vulnerabilities fixed within 1 week
- [ ] Dependabot/Snyk enabled
- [ ] Dependency versions pinned (no ^ or ~ in prod)
- [ ] package-lock.json committed
- [ ] CI fails on known vulnerabilities

### Supply Chain
- [ ] Minimal dependencies (audit what you import)
- [ ] Third-party packages reviewed before use
- [ ] No packages with excessive permissions
- [ ] Build reproducibility verified
- [ ] CI/CD pipeline secured (no secret leakage)

---

## 🧪 Security Testing

### Automated Testing
- [ ] SAST (Static Analysis) in CI (ESLint security plugin, SonarQube)
- [ ] DAST (Dynamic Analysis) before release (OWASP ZAP)
- [ ] Dependency scanning in CI
- [ ] Secret scanning in CI (detect leaked secrets)
- [ ] IaC scanning if using Terraform/CloudFormation

### Manual Testing
- [ ] OWASP Top 10 coverage verified
- [ ] Authentication bypass testing
- [ ] Authorization bypass testing (IDOR)
- [ ] Session fixation testing
- [ ] XSS testing (all input vectors)
- [ ] SQLi testing (all query paths)
- [ ] CSRF token validation testing
- [ ] Path traversal testing
- [ ] SSRF testing (if external URLs accepted)
- [ ] Business logic abuse testing

### Penetration Testing
- [ ] External pen test before launch
- [ ] Annual pen test scheduled
- [ ] Pen test after major changes
- [ ] All findings remediated
- [ ] Re-test for critical findings

---

## 🔄 Incident Response & Recovery

### Preparation
- [ ] Incident response plan documented
- [ ] Security team contacts defined
- [ ] Escalation procedure documented
- [ ] Legal counsel contact available
- [ ] PR/communications plan for breaches
- [ ] Regulatory notification timelines known

### Detection
- [ ] Security monitoring active 24/7
- [ ] Alert thresholds configured
- [ ] On-call rotation for security alerts
- [ ] Log aggregation centralized

### Response
- [ ] Containment procedure documented
- [ ] Forensics preservation procedure
- [ ] Eradication steps documented
- [ ] Recovery procedure tested
- [ ] Post-incident review process

### Recovery
- [ ] Backups encrypted
- [ ] Backup testing regular (restore drills)
- [ ] RTO (Recovery Time Objective) defined
- [ ] RPO (Recovery Point Objective) defined
- [ ] Disaster recovery plan tested annually

---

## ✅ Pre-Launch Security Gate

### Must Complete Before Production
- [ ] All critical vulnerabilities resolved
- [ ] Penetration test completed
- [ ] Security headers verified
- [ ] HTTPS enforced
- [ ] Authentication tested end-to-end
- [ ] Authorization tested for all roles
- [ ] Audit logging verified
- [ ] Secrets rotated from defaults
- [ ] .env files not in version control
- [ ] Security team sign-off obtained
- [ ] Compliance review completed (HIPAA/PDPA)
- [ ] Incident response plan approved

---

## 📋 Ongoing Security Maintenance

### Weekly
- [ ] Review security alerts (Dependabot, Snyk)
- [ ] Check failed login spikes
- [ ] Review unusual access patterns

### Monthly
- [ ] Run npm audit
- [ ] Review access logs for anomalies
- [ ] Verify backup integrity
- [ ] Review user permissions

### Quarterly
- [ ] Rotate secrets
- [ ] Review incident response plan
- [ ] Security training refresh
- [ ] Access certification review

### Annually
- [ ] Penetration test
- [ ] Disaster recovery drill
- [ ] Compliance audit
- [ ] Security policy review

---

## Version History

| Version | Date | Author | Status |
|---------|------|--------|--------|
| 1.0 | 2026-03-21 | myBOT | Created |

---

**Owner**: Security Lead [TBD]  
**Next Review**: 2026-06-21  
**Status**: Draft - Pending Implementation
