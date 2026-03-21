# Bug List - Ubon Health Insights

## Document Information

| Field | Value |
|-------|-------|
| Project | Ubon Health Insights (Next.js) |
| Version | 1.0 |
| Created | 2026-03-21 |
| Last Updated | 2026-03-21 |

---

## Bug Tracking Template

Use this template to document new bugs:

```markdown
### BUG-XXX: [Bug Title]

**Status:** Open / In Progress / Fixed / Verified / Closed
**Severity:** P0 / P1 / P2 / P3
**Priority:** Critical / High / Medium / Low
**Reporter:** [Name]
**Assignee:** [Name]
**Date Reported:** [YYYY-MM-DD]
**Date Fixed:** [YYYY-MM-DD]
**Environment:** [Browser / Device / OS]

**Description:**
[Clear description of the bug]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Evidence:**
- Screenshot: [Link]
- Video: [Link]
- Console Log: [Paste]

**Workaround:**
[If any workaround exists]

**Root Cause:**
[Technical analysis of why bug occurs]

**Fix:**
[Description of fix applied]

**Regression Risk:**
[Risk of fix causing other issues]
```

---

## Pre-Existing Issues from Legacy Application

These issues existed in the legacy Vite + React application and should be addressed in the rebuild.

### LEGACY-001: No Authentication System

**Status:** Open
**Severity:** P0
**Priority:** Critical
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
The legacy application has no authentication system. All pages and data are publicly accessible without login.

**Expected Result:**
System should require authentication to access any data. Role-based access control should limit data visibility based on user role (admin, district user, unit user).

**Impact:**
- Critical security vulnerability
- No audit trail
- No accountability for data changes
- Violates healthcare data protection requirements

**Fix Required:**
Implement complete authentication system with:
- Login/logout functionality
- Session management
- Role-based access control
- MFA for admin accounts

---

### LEGACY-002: No Data Entry Forms

**Status:** Open
**Severity:** P0
**Priority:** Critical
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
The legacy application displays data but has no capability to add, edit, or delete records. All data is hardcoded in mockData.ts.

**Expected Result:**
System should provide CRUD interfaces for:
- Health units (create, read, update, delete)
- KPI results (create, read, update, delete)
- Finance records (create, read, update, delete)

**Impact:**
- System cannot be used in production
- No way to enter real data
- Manual database updates required

**Fix Required:**
Implement data entry forms with validation for all entity types.

---

### LEGACY-003: No Database Integration

**Status:** Open
**Severity:** P0
**Priority:** Critical
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
All data is stored in client-side mock files (mockData.ts). No database connection exists.

**Expected Result:**
Data should be persisted in MariaDB with proper schema, relations, and indexes.

**Impact:**
- Data lost on page refresh
- No data persistence
- No concurrent user support
- No data backup/recovery

**Fix Required:**
- Design and implement database schema
- Create database connection layer
- Implement data access layer
- Seed initial data

---

### LEGACY-004: No Data Export Functionality

**Status:** Open
**Severity:** P2
**Priority:** Medium
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
Users cannot export reports or data to Excel, CSV, or PDF.

**Expected Result:**
Users should be able to:
- Export dashboard data to Excel
- Generate PDF reports
- Download filtered data as CSV

**Impact:**
- Users cannot share reports externally
- Manual screenshot required for documentation
- Difficult to integrate with other systems

**Fix Required:**
Implement export functionality for common formats.

---

### LEGACY-005: No User Management

**Status:** Open
**Severity:** P0
**Priority:** Critical
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
No user accounts, no roles, no permissions system.

**Expected Result:**
Admin should be able to:
- Create/edit/deactivate user accounts
- Assign roles (admin, district admin, unit staff)
- Reset passwords
- View user activity logs

**Impact:**
- No accountability
- Cannot restrict access
- Cannot track who did what

**Fix Required:**
Implement user management module with role-based permissions.

---

### LEGACY-006: Limited Filter Options

**Status:** Open
**Severity:** P3
**Priority:** Low
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
Filter options are limited to fiscal year, district, and quarter. No date range, no custom filtering.

**Expected Result:**
Additional filter options:
- Date range picker
- Custom KPI selection
- Performance threshold filter
- Save filter presets

**Impact:**
- Limited data exploration
- Cannot create custom views

**Fix Required:**
Add advanced filtering capabilities.

---

### LEGACY-007: Static Fiscal Year Options

**Status:** Open
**Severity:** P3
**Priority:** Low
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
Fiscal year options are hardcoded (2565, 2566, 2567). New years require code changes.

**Expected Result:**
Fiscal year options should be dynamic based on available data or current date.

**Impact:**
- Manual update required each year
- Risk of forgetting to update

**Fix Required:**
Generate fiscal year options dynamically.

---

### LEGACY-008: Minimal Accessibility

**Status:** Open
**Severity:** P2
**Priority:** Medium
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
The legacy application has minimal accessibility support. No ARIA labels, poor keyboard navigation, untested screen reader compatibility.

**Expected Result:**
WCAG 2.1 AA compliance with:
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus indicators

**Impact:**
- Excludes users with disabilities
- May violate accessibility regulations

**Fix Required:**
Implement accessibility features throughout the application.

---

### LEGACY-009: No Error Boundaries

**Status:** Open
**Severity:** P2
**Priority:** Medium
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
Application does not handle errors gracefully. If a component crashes, the entire app may break.

**Expected Result:**
- Error boundaries around major sections
- User-friendly error messages
- Fallback UI for failed components
- Error logging to backend

**Impact:**
- Poor user experience on errors
- No recovery from failures

**Fix Required:**
Implement React error boundaries and error handling.

---

### LEGACY-010: No Loading States

**Status:** Open
**Severity:** P3
**Priority:** Low
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
When data is loading, there are no skeleton loaders or loading indicators.

**Expected Result:**
- Skeleton loaders for content areas
- Loading spinners for buttons
- Progress indicators for long operations

**Impact:**
- Perceived slow performance
- Users may think app is frozen

**Fix Required:**
Add loading states and skeleton components.

---

### LEGACY-011: Hardcoded District List

**Status:** Open
**Severity:** P3
**Priority:** Low
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
The 13 districts (amphoeList) are hardcoded in mockData.ts.

**Expected Result:**
Districts should be loaded from database and cached for dropdowns.

**Impact:**
- Requires code change to add districts
- Not configurable

**Fix Required:**
Store districts in database with proper schema.

---

### LEGACY-012: No Audit Trail

**Status:** Open
**Severity:** P1
**Priority:** High
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
No logging of user actions. Cannot track who did what and when.

**Expected Result:**
All data changes should be logged with:
- User ID
- Timestamp
- Action type (create, update, delete)
- Before and after values

**Impact:**
- No accountability
- Cannot investigate issues
- Cannot recover from accidental changes

**Fix Required:**
Implement audit logging for all CRUD operations.

---

### LEGACY-013: No Data Validation on Client

**Status:** Open
**Severity:** P1
**Priority:** High
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
Since data is hardcoded, there's no validation of inputs. The application has never validated user input.

**Expected Result:**
Comprehensive input validation:
- Client-side for UX
- Server-side for security
- Type checking
- Range validation
- Business rule validation

**Impact:**
- Risk of invalid data
- Potential security vulnerabilities

**Fix Required:**
Implement Zod schemas for all input types.

---

### LEGACY-014: No Internationalization

**Status:** Open
**Severity:** P4
**Priority:** Low
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
All text is in Thai. No i18n support.

**Expected Result:**
Future consideration for multi-language support (Thai, English).

**Impact:**
- Limited to Thai-speaking users
- May need for reports to central government

**Fix Required:**
Consider i18n library (next-intl) for future expansion.

---

### LEGACY-015: Mock KPI Results

**Status:** Open
**Severity:** P0
**Priority:** Critical
**Reporter:** QA Team
**Date Reported:** 2026-03-21

**Description:**
KPI results in mockData.ts are limited and don't cover all quarters or all KPIs for all units.

**Expected Result:**
Complete KPI results for:
- All 14 health units
- All 8 KPIs (4 PPFS + 4 TTM)
- All 4 quarters
- Multiple fiscal years

**Impact:**
- Testing not representative of real data
- Aggregation calculations untested at scale

**Fix Required:**
Generate complete seed data or use production data structure.

---

## Expected New Bugs During Development

These are potential issues that may arise during the Next.js rebuild:

### NEW-001: Authentication Redirect Loop

**Status:** Open
**Severity:** P1
**Priority:** High
**Reporter:** To be determined
**Date Reported:** TBD

**Description:**
Potential issue with middleware redirect causing infinite loops.

**Symptoms:**
- User stuck on login page
- Browser shows "too many redirects"
- Session cookie not set correctly

**Prevention:**
- Test redirect logic thoroughly
- Check cookie settings
- Verify middleware conditions

---

### NEW-002: Server Component Hydration Errors

**Status:** Open
**Severity:** P2
**Priority:** Medium
**Reporter:** To be determined
**Date Reported:** TBD

**Description:**
React hydration mismatches between server and client rendering.

**Symptoms:**
- "Hydration failed" warnings in console
- UI flickering on load
- Interactive elements not working

**Prevention:**
- Ensure consistent rendering
- Use suppressHydrationWarning where needed
- Test with strict mode

---

### NEW-003: Chart Rendering Issues

**Status:** Open
**Severity:** P2
**Priority:** Medium
**Reporter:** To be determined
**Date Reported:** TBD

**Description:**
Recharts may have issues with SSR or responsive containers.

**Symptoms:**
- Charts not rendering
- Width/height errors
- Charts disappear on resize

**Prevention:**
- Use dynamic imports for charts
- Set explicit dimensions
- Test on different screen sizes

---

### NEW-004: Database Connection Pool Exhaustion

**Status:** Open
**Severity:** P1
**Priority:** High
**Reporter:** To be determined
**Date Reported:** TBD

**Description:**
Serverless functions may exhaust database connection pools.

**Symptoms:**
- "Too many connections" errors
- Slow response times
- Intermittent failures

**Prevention:**
- Use connection pooling correctly
- Implement connection caching
- Monitor pool usage

---

### NEW-005: Date/Timezone Handling

**Status:** Open
**Severity:** P2
**Priority:** Medium
**Reporter:** To be determined
**Date Reported:** TBD

**Description:**
Server and client may have different timezones, affecting fiscal year calculations.

**Symptoms:**
- Wrong fiscal year displayed
- Dates off by one day
- Reports showing wrong period

**Prevention:**
- Use UTC for storage
- Convert to Thailand timezone for display
- Test around year boundaries

---

## Bug Status Summary

| Status | Count |
|--------|-------|
| Open | 21 |
| In Progress | 0 |
| Fixed | 0 |
| Verified | 0 |
| Closed | 0 |

## Bug Severity Summary

| Severity | Count |
|----------|-------|
| P0 - Critical | 4 |
| P1 - High | 5 |
| P2 - Medium | 6 |
| P3 - Low | 5 |
| P4 - Enhancement | 1 |

---

## Bug Tracking Process

### Reporting a Bug

1. **Identify** - Find the bug during testing or use
2. **Document** - Fill out the bug template completely
3. **Prioritize** - Assign severity and priority
4. **Assign** - Assign to appropriate developer
5. **Track** - Add to this document and issue tracker

### Bug Lifecycle

```
Open → In Progress → Fixed → Verified → Closed
         ↓              ↓         ↓
      Reopened      Reopened   Reopened
```

### Severity Definitions

| Severity | Definition | Response Time |
|----------|------------|---------------|
| P0 | System down, data loss, security breach | 1 hour |
| P1 | Major feature broken, no workaround | 4 hours |
| P2 | Feature impaired, workaround exists | 24 hours |
| P3 | Minor issue, cosmetic | 72 hours |
| P4 | Enhancement suggestion | Next release |

### Priority Definitions

| Priority | Definition |
|----------|------------|
| Critical | Blocks release, must fix immediately |
| High | Significant impact, fix this sprint |
| Medium | Moderate impact, fix soon |
| Low | Minor impact, fix when possible |

---

## Regression Testing After Bug Fixes

When a bug is fixed, perform these tests:

### General Regression

| # | Test Area | Status |
|---|-----------|--------|
| 1 | Login/logout | ☐ |
| 2 | Navigation between pages | ☐ |
| 3 | Filter changes | ☐ |
| 4 | Chart rendering | ☐ |
| 5 | Table display | ☐ |

### Area-Specific Regression

For each bug fix, test:
1. The fixed functionality
2. Related functionality
3. Adjacent pages/features
4. Mobile/desktop views

---

## Bug Metrics to Track

| Metric | Target |
|--------|--------|
| Open bugs < 1 week | 100% |
| Open bugs < 1 month | 90% |
| P0 bugs | 0 open |
| P1 bugs | < 5 open |
| Bug resolution time | < 72 hours avg |
| Regression rate | < 5% |

---

## Appendix: Common Bug Categories

### Authentication Bugs
- Login failures
- Session timeouts
- Permission errors
- Role-based access failures

### Data Display Bugs
- Missing data
- Incorrect calculations
- Wrong formatting
- Sorting issues

### UI/UX Bugs
- Layout breaks
- Responsive issues
- Color inconsistencies
- Accessibility failures

### Performance Bugs
- Slow page loads
- Memory leaks
- Infinite re-renders
- Network timeouts

### Integration Bugs
- API failures
- Database errors
- Authentication service issues
- Third-party library conflicts

---

**Document End**