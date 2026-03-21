# Risks and Gaps Analysis

## Project: Ubon Health Insights Rebuild
**Analysis Date:** 2026-03-21  
**Source:** Legacy Vite/React Application  
**Target:** Next.js + MariaDB Rebuild

---

## 1. Critical Risks 🔴

### Risk 1: Data is Completely Mock-Based

| Attribute | Details |
|-----------|---------|
| **Risk Level** | CRITICAL |
| **Description** | The entire application runs on hardcoded mock data. No database integration exists. |
| **Evidence** | All data imports from `src/data/mockData.ts` (20KB of hardcoded arrays) |
| **Impact** | Cannot go to production; system has zero persistence |
| **Likelihood** | Confirmed - 100% |

**Affected Data:**
- 14 health units (รพ.สต.) - incomplete dataset
- 12 finance records (only 3 months × 4 units)
- 16 KPI results (only Q1 data for partial units)
- 8 KPI definitions

**Mitigation:**
- Design full MariaDB schema before any code is written
- Create migration scripts to populate real data
- Implement CRUD APIs for data entry
- Add data validation layer

---

### Risk 2: Exposed Supabase Credentials

| Attribute | Details |
|-----------|---------|
| **Risk Level** | CRITICAL |
| **Description** | Supabase URL and anon key hardcoded in source file |
| **File** | `src/integrations/supabase/client.ts` |
| **Credentials Found** | `https://tibjzwwzavgcgjlnbfgm.supabase.co` + JWT anon key |
| **Impact** | Unauthorized database access; potential data breach |
| **Likelihood** | Immediate - credentials are in git history |

**Immediate Actions Required:**
1. Rotate Supabase credentials immediately
2. Remove from git history (or assume compromised)
3. Never commit credentials again
4. Use environment variables exclusively

---

### Risk 3: No Authentication System

| Attribute | Details |
|-----------|---------|
| **Risk Level** | CRITICAL |
| **Description** | Application has no login/logout or user identification |
| **Evidence** | No auth routes, no protected routes, no session management |
| **Impact** | Anyone can access all data; no audit trail; no role separation |
| **Business Risk** | Health data exposure; compliance violations |

**Required for Rebuild:**
- Authentication system (NextAuth.js or custom JWT)
- Role-based access control (RBAC)
- Session management
- Password policies
- Account lockout mechanisms

---

## 2. High Priority Gaps 🟠

### Gap 1: Incomplete Data Coverage

| Metric | Current | Expected |
|--------|---------|----------|
| Health Units | 14 | 100+ (13 districts × ~8 units each) |
| Finance Records | 12 | 1,200+ (100 units × 12 months) |
| KPI Results | 16 | 3,200+ (100 units × 8 KPIs × 4 quarters) |
| Districts Covered | 13/13 | Complete |

**Gap:** The mock data represents only 2% of expected production data volume.

**Implications:**
- No performance testing possible with realistic data
- UI not tested with large datasets
- No pagination implemented (may crash with real data)
- Aggregation calculations may be slow

---

### Gap 2: No Data Entry Interface

**Current State:** Read-only application

**Missing:**
- KPI data entry forms
- Monthly finance entry
- Health unit information editing
- Bulk data import tools
- Data validation workflows
- Approval workflows

**Business Impact:**
- Staff cannot input their data
- Manual process outside system
- Data inconsistency likely
- Delayed reporting

---

### Gap 3: No Data Export/Reporting

**Missing Features:**
- Excel export
- PDF report generation
- Printable views
- Scheduled reports
- Email reports

**User Impact:**
- Cannot share data with stakeholders
- Cannot archive reports
- Manual copy-paste required
- No offline capability

---

### Gap 4: Thai Fiscal Year Complexity

**Challenge:** The system uses Thai Buddhist Calendar (B.E.)

**Current Year:** 2567 B.E. = 2024 C.E.

**Fiscal Year Structure:**
- Starts: October 1 (ตุลาคม)
- Ends: September 30 (กันยายน)
- Months: ตุลาคม, พฤศจิกายน, ธันวาคม, มกราคม, กุมภาพันธ์, มีนาคม, เมษายน, พฤษภาคม, มิถุนายน, กรกฎาคม, สิงหาคม, กันยายน

**Risk:** Date handling libraries may not support Thai fiscal year natively. Custom logic required.

---

## 3. Technical Debt Gaps 🟡

### Gap 5: Zero Test Coverage

| Metric | Value |
|--------|-------|
| Test Framework | Vitest (configured) |
| Test Files | 2 |
| Actual Tests | 1 placeholder test |
| Coverage | 0% |

**Risk:** No regression protection; bugs may be introduced during rebuild.

**Required:**
- Unit tests for utilities
- Component tests for UI
- Integration tests for data flow
- E2E tests for critical paths

---

### Gap 6: State Management Limitations

**Current:** React useState only

**Issues:**
- Filter state not shared between pages
- No URL synchronization for filters
- No state persistence
- Complex prop drilling in some components

**Rebuild Requirement:**
- URL query parameters for filters
- Global state for user preferences
- Session storage for unsaved forms

---

### Gap 7: Error Handling Deficiency

**Current State:**
- No error boundaries
- No 500 error page
- No API error handling (no APIs)
- No form validation errors
- Generic "Not Found" page only

**Required:**
- Error boundaries for each route
- API error handling with retry
- Form validation with user feedback
- Network error handling

---

### Gap 8: No Accessibility Implementation

**Violations:**
- Missing ARIA labels
- No keyboard navigation
- No screen reader testing
- Focus management absent
- No color-blind friendly indicators (only color-based status)

**Impact:**
- Violates WCAG guidelines
- Excludes users with disabilities
- Potential legal compliance issues

---

## 4. Architecture Risks 🟡

### Risk 4: Client-Side Calculation Performance

**Current:** All aggregations calculated client-side from mock arrays

**Risk:** With real data volume (100+ units, 1000+ records), client-side calculation will cause:
- Slow initial load
- Janky UI during filtering
- Memory issues on mobile devices
- Poor user experience

**Solution:**
- Server-side aggregation via SQL
- Database indexes for query optimization
- Pagination for large tables
- Caching strategy

---

### Risk 5: Supabase Abandoned

**Status:** Supabase client configured but never used

**Implications:**
- May indicate abandoned migration plan
- No existing schema to reference
- Team may lack Supabase experience
- Decision needed: MariaDB vs Supabase

**Recommendation:**
Proceed with MariaDB as specified in requirements, but document why Supabase was considered and rejected.

---

### Risk 6: Vite → Next.js Migration Complexity

**Differences:**
| Aspect | Vite (Current) | Next.js (Target) |
|--------|----------------|------------------|
| Router | React Router DOM | App Router (file-based) |
| SSR | Client-side only | Server-side default |
| Data Fetching | Client hooks | Server components |
| API Routes | None | Route handlers |
| Build Output | Static | Static/Server hybrid |

**Risk:** Significant architectural shift required. Team must understand:
- Server Components vs Client Components
- Route handlers for API
- Data fetching patterns
- Caching strategies

---

## 5. Business Logic Gaps 🟡

### Gap 9: No User Role Definitions

**Unclear Requirements:**
- Who enters data? (Unit staff? District officers?)
- Who approves? 
- Who can see all districts vs own district only?
- Admin capabilities?

**Required Analysis:**
Interview stakeholders to define:
- Actor types
- Permission matrix
- Workflow approvals
- Data ownership rules

---

### Gap 10: KPI Calculation Logic Undocumented

**Current:** Simple percentage = (actual / target) × 100

**Questions:**
- Is this accurate for all KPI types?
- Some KPIs are "lower is better" (e.g., low birth weight %)
- How are targets determined?
- What about quarterly aggregation?

**Risk:** Incorrect performance metrics if logic is wrong.

---

## 6. Security Gaps 🟠

### Gap 11: No Input Validation

**Vulnerabilities:**
- Search input in BasicInfo.tsx not sanitized
- No XSS protection on displayed data
- No SQL injection protection (no queries)
- No rate limiting

**Rebuild Required:**
- Zod validation for all inputs
- Sanitization for display
- Prepared statements for DB
- Rate limiting middleware

---

### Gap 12: No Audit Trail

**Missing:**
- Who created each record?
- When was data last modified?
- What was changed?
- Who accessed sensitive data?

**Compliance Risk:** Health data regulations may require audit logging.

---

## 7. Deployment Gaps 🟡

### Gap 13: No Production Configuration

**Missing Files:**
- Dockerfile
- docker-compose.yml
- Environment variable documentation
- CI/CD pipeline
- Deployment scripts

**Risk:** Cannot deploy to production without these.

---

### Gap 14: No Backup/Recovery Plan

**Missing:**
- Database backup strategy
- Disaster recovery procedures
- Data retention policies

---

## 8. Risk Matrix

| Risk | Severity | Likelihood | Impact | Priority |
|------|----------|------------|--------|----------|
| Mock data only | Critical | Certain | Complete | P0 |
| Exposed credentials | Critical | Immediate | High | P0 |
| No authentication | Critical | Certain | Complete | P0 |
| Incomplete data coverage | High | Certain | High | P1 |
| No data entry | High | Certain | High | P1 |
| No test coverage | Medium | Probable | Medium | P2 |
| State management gaps | Medium | Probable | Medium | P2 |
| Thai fiscal year | Medium | Certain | Medium | P2 |
| No accessibility | Medium | Certain | Low | P3 |
| No audit trail | High | Probable | High | P2 |

---

## 9. Mitigation Strategies

### Immediate Actions (Before Rebuild)

1. **Rotate Supabase Credentials**
   - Invalidate exposed key
   - Generate new credentials
   - Store in secure vault

2. **Gather Real Data Samples**
   - Request actual health unit list
   - Sample KPI data from recent quarters
   - Sample financial records
   - Validate data models with stakeholders

3. **Define User Roles**
   - Stakeholder interviews
   - Document permission matrix
   - Identify workflow owners

4. **Confirm Thai Fiscal Year Logic**
   - Document month ordering
   - Confirm year crossover handling
   - Test date calculations

### During Rebuild

5. **Database-First Design**
   - Design schema before UI
   - Create migration scripts
   - Seed with realistic data volume

6. **Authentication First**
   - Implement auth before feature development
   - Test RBAC early
   - Secure all routes

7. **TDD Approach**
   - Write tests before features
   - Maintain >80% coverage
   - Include integration tests

8. **Server-Side Aggregation**
   - Move calculations to SQL/database
   - Implement caching
   - Add pagination

### Before Deployment

9. **Security Audit**
   - Penetration testing
   - Dependency vulnerability scan
   - Code review

10. **Accessibility Audit**
    - WCAG 2.1 AA compliance
    - Screen reader testing
    - Keyboard navigation

11. **Load Testing**
    - Test with realistic data volume
    - Concurrent user simulation
    - Performance benchmarking

---

## 10. Success Criteria for Rebuild

| Criterion | Target |
|-----------|--------|
| Database | MariaDB with full schema |
| Data | Real data migration complete |
| Auth | Role-based login working |
| Tests | >80% coverage |
| Performance | <2s initial load with full data |
| Security | No critical vulnerabilities |
| Accessibility | WCAG 2.1 AA compliant |
| Documentation | Complete deployment guide |

---

**End of Risks and Gaps Analysis**
