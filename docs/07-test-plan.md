# Test Plan - Ubon Health Insights

## Document Information

| Field | Value |
|-------|-------|
| Project | Ubon Health Insights (Next.js Rebuild) |
| Version | 1.0 |
| Created | 2026-03-21 |
| Author | QA Team |
| Status | Draft |

---

## 1. Executive Summary

This test plan defines the testing strategy for rebuilding the Ubon Health Insights application from a Vite + React prototype to a production-ready Next.js application with MariaDB backend.

### Scope

| In Scope | Out of Scope |
|----------|--------------|
| All legacy features | Mobile native app |
| Authentication system | AI/ML enhancements |
| CRUD operations | Multi-language support |
| Report generation | Real-time notifications |
| Dashboard functionality | External integrations |
| Mobile responsiveness | Offline mode |

---

## 2. Testing Objectives

### Primary Objectives
1. **Verify feature parity** - All legacy features must work in new system
2. **Ensure data integrity** - Migrated data must match source
3. **Validate authentication** - Role-based access control works correctly
4. **Confirm responsiveness** - Works on desktop, tablet, and mobile
5. **Performance validation** - Acceptable load times under expected usage
6. **Security verification** - No vulnerabilities in authentication, input handling, data access

### Success Criteria

| Metric | Target |
|--------|--------|
| Test coverage | ≥ 80% |
| P0 bugs | 0 |
| P1 bugs | 0 |
| P2 bugs | < 5 |
| Performance (LCP) | < 2.5s |
| Accessibility | WCAG 2.1 AA |

---

## 3. Test Types

### 3.1 Unit Testing

**Scope:** Individual functions, components, utilities

**Tools:** Vitest, React Testing Library

| Area | Test Cases |
|------|------------|
| Utility functions | Date formatting, number formatting, status calculation |
| Component rendering | All shadcn/ui components, custom components |
| Hook behavior | useIsMobile, useToast, custom hooks |
| Data transformations | KPI calculations, aggregations, filtering |

**Example Test Cases:**
```typescript
// Unit test examples
describe('getStatusInfo', () => {
  it('returns "วิกฤต" for percentage ≤ 20', () => {})
  it('returns "ต่ำกว่าเกณฑ์" for percentage 21-40', () => {})
  it('returns "ปานกลาง" for percentage 41-60', () => {})
  it('returns "ดี" for percentage 61-80', () => {})
  it('returns "ดีมาก" for percentage > 80', () => {})
})

describe('calculateSummaryStats', () => {
  it('calculates total population correctly', () => {})
  it('calculates average PPFS percentage', () => {})
  it('calculates average TTM percentage', () => {})
  it('returns zeros for empty data', () => {})
})
```

### 3.2 Integration Testing

**Scope:** Component interactions, data flow, API calls

**Tools:** Vitest, MSW (Mock Service Worker)

| Area | Test Cases |
|------|------------|
| Filter + Data | Filter changes update displayed data |
| Form submission | Data validation and submission flow |
| Navigation | Route changes, parameter passing |
| Authentication | Login, logout, session management |

### 3.3 End-to-End Testing

**Scope:** Complete user workflows

**Tools:** Playwright

| Workflow | Test Scenarios |
|----------|----------------|
| Dashboard | Load, filter, view charts, navigate |
| Basic Info | Search, filter, view unit details |
| Finance | View trends, compare units |
| PPFS/TTM | View KPIs, filter by quarter, compare |
| Comparison | Switch tabs, view rankings |
| Authentication | Login, logout, session timeout |

### 3.4 Accessibility Testing

**Scope:** WCAG 2.1 AA compliance

**Tools:** axe-core, Lighthouse

| Checkpoint | Requirement |
|------------|-------------|
| Keyboard navigation | All interactive elements accessible via keyboard |
| Screen reader | Proper ARIA labels, semantic HTML |
| Color contrast | Minimum 4.5:1 ratio for text |
| Focus indicators | Visible focus states |
| Alt text | All images have descriptive alt text |

### 3.5 Performance Testing

**Scope:** Load times, responsiveness

**Tools:** Lighthouse, Chrome DevTools

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.8s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Time to Interactive (TTI) | < 3.8s |
| Cumulative Layout Shift (CLS) | < 0.1 |
| First Input Delay (FID) | < 100ms |

### 3.6 Security Testing

**Scope:** OWASP Top 10, healthcare data protection

| Vulnerability | Test Cases |
|---------------|------------|
| Injection | SQL injection, XSS attempts |
| Broken auth | Session hijacking, credential stuffing |
| Sensitive data | PHI exposure, unauthorized access |
| Access control | IDOR, privilege escalation |
| Security misconfig | Headers, error messages |

### 3.7 Cross-Browser Testing

**Scope:** Browser compatibility

| Browser | Version | Priority |
|---------|---------|----------|
| Chrome | Latest 2 versions | High |
| Firefox | Latest 2 versions | High |
| Safari | Latest 2 versions | High |
| Edge | Latest 2 versions | Medium |
| Samsung Internet | Latest | Medium |

### 3.8 Mobile Testing

**Scope:** Responsive design, touch interactions

| Device Type | Viewport | Priority |
|-------------|----------|----------|
| Desktop | 1920x1080 | High |
| Desktop | 1366x768 | High |
| Tablet | 768x1024 (iPad) | High |
| Tablet | 1024x768 (landscape) | Medium |
| Mobile | 375x667 (iPhone SE) | High |
| Mobile | 360x640 (Android) | High |

---

## 4. Feature-Based Test Matrix

### 4.1 Dashboard Page

| Test ID | Category | Test Case | Priority |
|---------|----------|-----------|----------|
| DASH-001 | Display | Page loads with correct title | P1 |
| DASH-002 | Display | All stat cards render with correct values | P1 |
| DASH-003 | Display | PPFS gauge shows correct percentage | P1 |
| DASH-004 | Display | TTM gauge shows correct percentage | P1 |
| DASH-005 | Display | District bar chart renders 13 districts | P1 |
| DASH-006 | Display | Recent KPIs table shows data | P1 |
| DASH-007 | Filter | Fiscal year filter updates all data | P1 |
| DASH-008 | Filter | District filter filters units correctly | P1 |
| DASH-009 | Filter | Filter reset works correctly | P2 |
| DASH-010 | Navigation | Nav links to other pages work | P1 |
| DASH-011 | Responsive | Stat cards stack on mobile | P1 |
| DASH-012 | Responsive | Charts resize appropriately | P2 |
| DASH-013 | Chart | Tooltip shows correct values on hover | P2 |
| DASH-014 | Chart | Bar colors reflect performance status | P1 |
| DASH-015 | Status | Status badges show correct color/label | P1 |

### 4.2 Basic Info Page

| Test ID | Category | Test Case | Priority |
|---------|----------|-----------|----------|
| INFO-001 | Display | Summary cards show correct totals | P1 |
| INFO-002 | Display | Health unit cards render all units | P1 |
| INFO-003 | Display | Each card shows correct demographics | P1 |
| INFO-004 | Search | Search by unit name works | P1 |
| INFO-005 | Search | Search by unit code works | P1 |
| INFO-006 | Search | Clear search shows all units | P2 |
| INFO-007 | Filter | District filter works correctly | P1 |
| INFO-008 | Filter | Combined search + filter works | P2 |
| INFO-009 | Display | Unit code displays correctly | P1 |
| INFO-010 | Display | Address format is correct (หมู่ ต. อ.) | P2 |
| INFO-011 | Responsive | Cards stack on mobile | P1 |
| INFO-012 | Navigation | Click unit card shows details | P2 |

### 4.3 Finance Page

| Test ID | Category | Test Case | Priority |
|---------|----------|-----------|----------|
| FIN-001 | Display | Income card shows correct total | P1 |
| FIN-002 | Display | Expense card shows correct total | P1 |
| FIN-003 | Display | Balance card shows correct value | P1 |
| FIN-004 | Display | Line chart renders correctly | P1 |
| FIN-005 | Display | Finance table shows all records | P1 |
| FIN-006 | Filter | Fiscal year filter works | P1 |
| FIN-007 | Filter | District filter works | P1 |
| FIN-008 | Chart | Chart shows monthly trend | P1 |
| FIN-009 | Chart | Legend displays correctly | P2 |
| FIN-010 | Chart | Tooltip shows formatted currency | P2 |
| FIN-011 | Table | Currency values formatted correctly | P1 |
| FIN-012 | Table | Balance shows positive/negative correctly | P1 |
| FIN-013 | Calculation | Income - Expense = Balance | P1 |
| FIN-014 | Responsive | Chart scrolls horizontally on mobile | P1 |

### 4.4 PPFS Page

| Test ID | Category | Test Case | Priority |
|---------|----------|-----------|----------|
| PPFS-001 | Display | Page header shows correct title/icon | P2 |
| PPFS-002 | Display | Performance gauge shows correct value | P1 |
| PPFS-003 | Display | KPI definitions list shows all PPFS KPIs | P1 |
| PPFS-004 | Display | KPI targets displayed correctly | P1 |
| PPFS-005 | Display | Unit performance chart renders | P1 |
| PPFS-006 | Display | Results table shows filtered data | P1 |
| PPFS-007 | Filter | Fiscal year filter works | P1 |
| PPFS-008 | Filter | District filter works | P1 |
| PPFS-009 | Filter | Quarter filter works | P1 |
| PPFS-010 | Filter | Combined filters work together | P1 |
| PPFS-011 | Calculation | Average percentage calculated correctly | P1 |
| PPFS-012 | Status | Status badges reflect correct performance | P1 |
| PPFS-013 | Sort | Units sorted by performance (optional) | P3 |

### 4.5 TTM Page

| Test ID | Category | Test Case | Priority |
|---------|----------|-----------|----------|
| TTM-001 | Display | Page header shows correct title/icon | P2 |
| TTM-002 | Display | Performance gauge shows correct value | P1 |
| TTM-003 | Display | KPI definitions list shows all TTM KPIs | P1 |
| TTM-004 | Display | KPI targets displayed correctly | P1 |
| TTM-005 | Display | Unit performance chart renders | P1 |
| TTM-006 | Display | Results table shows filtered data | P1 |
| TTM-007 | Filter | Fiscal year filter works | P1 |
| TTM-008 | Filter | District filter works | P1 |
| TTM-009 | Filter | Quarter filter works | P1 |
| TTM-010 | Filter | Combined filters work together | P1 |

### 4.6 Comparison Page

| Test ID | Category | Test Case | Priority |
|---------|----------|-----------|----------|
| COMP-001 | Display | Page loads with default tab (Amphoe) | P1 |
| COMP-002 | Tab | District tab shows amphoe comparison | P1 |
| COMP-003 | Tab | Unit tab shows unit comparison | P1 |
| COMP-004 | Tab | Finance tab shows finance comparison | P1 |
| COMP-005 | Chart | Stacked bar chart shows PPFS + TTM | P1 |
| COMP-006 | Chart | Ranking table shows all 13 districts | P1 |
| COMP-007 | Chart | Top 3 rankings highlighted | P2 |
| COMP-008 | Table | Status badges in ranking table | P1 |
| COMP-009 | Filter | District filter scopes unit view | P1 |
| COMP-010 | Filter | Fiscal year filter updates all tabs | P1 |
| COMP-011 | Finance | Income vs Expense chart renders | P1 |
| COMP-012 | Finance | Finance table shows balance | P1 |
| COMP-013 | Finance | Balance color shows positive/negative | P2 |

### 4.7 Authentication (New Feature)

| Test ID | Category | Test Case | Priority |
|---------|----------|-----------|----------|
| AUTH-001 | Login | Valid credentials authenticate user | P1 |
| AUTH-002 | Login | Invalid credentials show error | P1 |
| AUTH-003 | Login | Empty fields show validation error | P1 |
| AUTH-004 | Login | Session persists across page refresh | P1 |
| AUTH-005 | Logout | Logout clears session | P1 |
| AUTH-006 | Logout | Logout redirects to login page | P1 |
| AUTH-007 | Session | Session timeout after inactivity | P1 |
| AUTH-008 | Session | Absolute timeout after 8 hours | P2 |
| AUTH-009 | Access | Unauthenticated users redirected to login | P1 |
| AUTH-010 | Access | Protected routes require authentication | P1 |
| AUTH-011 | Role | Role-based access control enforced | P1 |
| AUTH-012 | Role | Unauthorized access shows appropriate error | P2 |
| AUTH-013 | MFA | MFA challenge for admin accounts | P2 |

---

## 5. Data Validation Test Cases

### 5.1 Health Units CRUD

| Test ID | Operation | Test Case | Priority |
|---------|-----------|-----------|----------|
| UNIT-001 | Create | Create new health unit with valid data | P1 |
| UNIT-002 | Create | Validation error for missing required fields | P1 |
| UNIT-003 | Create | Validation error for invalid national ID format | P1 |
| UNIT-004 | Create | Validation error for duplicate unit code | P1 |
| UNIT-005 | Read | View all health units with pagination | P1 |
| UNIT-006 | Read | Search health units by name | P1 |
| UNIT-007 | Read | Filter health units by district | P1 |
| UNIT-008 | Update | Update health unit details | P1 |
| UNIT-009 | Update | Partial update preserves other fields | P2 |
| UNIT-010 | Delete | Soft delete preserves data integrity | P2 |

### 5.2 KPI Results CRUD

| Test ID | Operation | Test Case | Priority |
|---------|-----------|-----------|----------|
| KPI-001 | Create | Create new KPI result entry | P1 |
| KPI-002 | Create | Validate fiscal year is current or past | P1 |
| KPI-003 | Create | Validate quarter is 1-4 | P1 |
| KPI-004 | Create | Validate KPI code exists in master | P1 |
| KPI-005 | Create | Validate percentage calculation (actual/target) | P1 |
| KPI-006 | Read | View KPI results with filters | P1 |
| KPI-007 | Read | Aggregate by amphoe | P1 |
| KPI-008 | Update | Modify KPI result | P1 |
| KPI-009 | Delete | Delete KPI result with authorization | P2 |

### 5.3 Finance Data CRUD

| Test ID | Operation | Test Case | Priority |
|---------|-----------|-----------|----------|
| FIN-001 | Create | Create finance record with valid data | P1 |
| FIN-002 | Create | Validation error for negative income | P1 |
| FIN-003 | Create | Validation error for future month | P2 |
| FIN-004 | Create | Validate unit exists | P1 |
| FIN-005 | Read | View finance records by month | P1 |
| FIN-006 | Read | Aggregate income/expense by period | P1 |
| FIN-007 | Update | Modify finance record | P1 |
| FIN-008 | Delete | Delete finance record with authorization | P2 |

---

## 6. Report Testing

### 6.1 Dashboard Reports

| Test ID | Report | Test Case | Priority |
|---------|--------|-----------|----------|
| RPT-001 | Dashboard | Population summary matches database total | P1 |
| RPT-002 | Dashboard | Volunteer count is accurate | P1 |
| RPT-003 | Dashboard | Household count is accurate | P1 |
| RPT-004 | Dashboard | PPFS average is calculated correctly | P1 |
| RPT-005 | Dashboard | TTM average is calculated correctly | P1 |
| RPT-006 | Dashboard | District rankings are correct | P1 |
| RPT-007 | Dashboard | Recent KPIs table shows latest 8 | P2 |

### 6.2 Finance Reports

| Test ID | Report | Test Case | Priority |
|---------|--------|-----------|----------|
| RPT-010 | Finance | Total income matches sum of all records | P1 |
| RPT-011 | Finance | Total expense matches sum of all records | P1 |
| RPT-012 | Finance | Balance = Income - Expense | P1 |
| RPT-013 | Finance | Monthly trend chart shows correct data | P1 |
| RPT-014 | Finance | Currency formatting is consistent | P2 |

### 6.3 Comparison Reports

| Test ID | Report | Test Case | Priority |
|---------|--------|-----------|----------|
| RPT-020 | Comparison | Amphoe performance averages correct | P1 |
| RPT-021 | Comparison | Unit performance averages correct | P1 |
| RPT-022 | Comparison | Finance balance by unit correct | P1 |
| RPT-023 | Comparison | Rankings sorted correctly | P1 |
| RPT-024 | Comparison | Stacked bar shows PPFS + TTM = Total | P2 |

---

## 7. Validation Testing

### 7.1 Input Validation

| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Unit Code | 5 digits, numeric | "รหัสหน่วยบริการต้องเป็นตัวเลข 5 หลัก" |
| Unit Name | Required, 1-200 chars | "กรุณาระบุชื่อหน่วยบริการ" |
| Population | Positive integer | "จำนวนประชากรต้องเป็นตัวเลขบวก" |
| Fiscal Year | 4 digits, 2565-2575 | "ปีงบประมาณไม่ถูกต้อง" |
| Quarter | 1-4 | "ไตรมาสต้องเป็น 1, 2, 3 หรือ 4" |
| KPI Target | Positive number | "เป้าหมายต้องเป็นตัวเลขบวก" |
| KPI Actual | Non-negative number | "ผลงานต้องเป็นตัวเลขไม่ติดลบ" |
| Income | Non-negative number | "รายรับต้องเป็นตัวเลขไม่ติดลบ" |
| Expense | Non-negative number | "รายจ่ายต้องเป็นตัวเลขไม่ติดลบ" |
| Email | Valid email format | "รูปแบบอีเมลไม่ถูกต้อง" |

### 7.2 Business Rule Validation

| Rule | Description | Test |
|------|-------------|------|
| Percentage calculation | actual/target * 100 | Validate for all KPI results |
| Fiscal year constraint | Current or past years only | Reject future years |
| Quarter constraint | Only 4 quarters per year | Reject Q0 or Q5 |
| Unique constraint | Unit code must be unique | Reject duplicate codes |
| Referential integrity | Unit must exist for finance/KPI records | Reject orphan records |

---

## 8. Mobile & Cross-Browser Testing

### 8.1 Responsive Breakpoints

| Breakpoint | Width | Key Tests |
|-------------|-------|-----------|
| Mobile S | 320px | Content fits, no horizontal scroll |
| Mobile M | 375px | Cards stack, tables scroll |
| Mobile L | 425px | Touch targets 44px minimum |
| Tablet | 768px | Navigation adapts, grid changes |
| Laptop | 1024px | Full layout |
| Desktop | 1440px | Optimal viewing |
| 4K | 2560px | No overflow, readable text |

### 8.2 Mobile-Specific Tests

| Test ID | Test Case | Priority |
|---------|-----------|----------|
| MOB-001 | Touch targets minimum 44x44px | P1 |
| MOB-002 | No horizontal scroll on content | P1 |
| MOB-003 | Tables scroll horizontally | P1 |
| MOB-004 | Filter bar wraps or collapses | P2 |
| MOB-005 | Charts resize or scroll | P1 |
| MOB-006 | Navigation hamburger menu works | P1 |
| MOB-007 | Form inputs are touch-friendly | P1 |
| MOB-008 | Virtual keyboard doesn't break layout | P2 |

### 8.3 Browser Compatibility Tests

| Test ID | Browser | Test Case | Priority |
|---------|---------|-----------|----------|
| BRW-001 | Chrome | All features work correctly | P1 |
| BRW-002 | Firefox | All features work correctly | P1 |
| BRW-003 | Safari | All features work correctly | P1 |
| BRW-004 | Edge | All features work correctly | P2 |
| BRW-005 | All | Charts render correctly | P1 |
| BRW-006 | All | Filters work correctly | P1 |
| BRW-007 | All | Forms submit correctly | P1 |
| BRW-008 | All | Authentication works | P1 |
| BRW-009 | Safari | Date picker compatibility | P2 |
| BRW-010 | All | Currency formatting consistent | P1 |

---

## 9. Test Environment

### 9.1 Environment Requirements

| Environment | Purpose | Configuration |
|-------------|---------|---------------|
| Development | Unit/Integration testing | Local Docker, mock data |
| Staging | UAT, E2E testing | Production-like, real DB |
| Production | Smoke testing post-deploy | Live system |

### 9.2 Test Data Requirements

| Data Type | Volume | Source |
|-----------|--------|--------|
| Health Units | 14 units (all districts) | Migrated from legacy |
| KPI Master | 8 KPI definitions | Seed data |
| KPI Results | 16+ results (all units) | Migrated from legacy |
| Finance Records | 12+ monthly records | Migrated from legacy |
| Users | 10+ (admin, district, unit roles) | Test accounts |

### 9.3 Test Accounts

| Role | Purpose | Permissions |
|------|---------|-------------|
| Admin | Full system access | All features |
| District User | District-level access | Own district data only |
| Unit User | Unit-level access | Own unit data only |
| Viewer | Read-only | Dashboard and reports only |

---

## 10. Defect Management

### 10.1 Severity Levels

| Severity | Definition | Response Time |
|----------|------------|---------------|
| P0 - Critical | System down, data loss, security breach | Immediate |
| P1 - High | Major feature broken, no workaround | 4 hours |
| P2 - Medium | Feature impaired, workaround exists | 24 hours |
| P3 - Low | Minor issue, cosmetic | 72 hours |
| P4 - Enhancement | Improvement suggestion | Next release |

### 10.2 Bug Report Template

```markdown
## Bug Report

**ID:** BUG-XXX
**Title:** [Brief description]
**Severity:** P0/P1/P2/P3
**Priority:** High/Medium/Low

### Description
[Detailed description of the bug]

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Expected Result
[What should happen]

### Actual Result
[What actually happened]

### Environment
- Browser: [Chrome/Firefox/Safari/etc]
- Device: [Desktop/Mobile/Tablet]
- OS: [Windows/macOS/iOS/Android]
- Screen size: [width x height]

### Attachments
[Screenshots, videos, logs]

### Notes
[Any additional context]
```

---

## 11. Test Schedule

### 11.1 Phases

| Phase | Duration | Activities |
|-------|----------|------------|
| Test Planning | 2 days | Review requirements, create test cases |
| Unit Testing | 3 days | Write and execute unit tests |
| Integration Testing | 3 days | Test component interactions |
| System Testing | 5 days | End-to-end testing |
| UAT | 3 days | User acceptance testing |
| Regression | 2 days | Final regression testing |
| Sign-off | 1 day | Documentation and approval |

### 11.2 Milestones

| Milestone | Target Date |
|-----------|-------------|
| Test plan approved | Day 2 |
| Unit tests complete | Day 5 |
| Integration tests complete | Day 8 |
| System tests complete | Day 13 |
| UAT complete | Day 16 |
| Regression complete | Day 18 |
| Go-live ready | Day 19 |

---

## 12. Deliverables

| Deliverable | Format | Due |
|-------------|--------|-----|
| Test Plan | Markdown | Day 2 |
| Test Cases | Markdown | Day 5 |
| Test Scripts | TypeScript | Day 8 |
| Bug Reports | Markdown | Ongoing |
| Test Execution Report | Markdown | Day 16 |
| Final Report | Markdown | Day 19 |

---

## 13. Approvals

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Dev Lead | | | |
| PM | | | |
| Stakeholder | | | |

---

## 14. Appendix

### A. Status Badge Color Reference

| Range | Label (Thai) | Color | Hex |
|-------|-------------|-------|-----|
| ≤20% | วิกฤต | Red | #ef4444 |
| 21-40% | ต่ำกว่าเกณฑ์ | Orange | #f97316 |
| 41-60% | ปานกลาง | Yellow | #eab308 |
| 61-80% | ดี | Green | #22c55e |
| >80% | ดีมาก | Blue | #0ea5e9 |

### B. Filter Options Reference

| Filter | Values | Default |
|--------|--------|---------|
| Fiscal Year | 2565, 2566, 2567 | Current year |
| District | ทั้งหมด, 13 districts | ทั้งหมด |
| Quarter | ทั้งหมด, Q1, Q2, Q3, Q4 | ทั้งหมด |

### C. KPI Definitions

| Code | Name (Thai) | Target |
|------|-------------|--------|
| PPFS-01 | ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์ | 80% |
| PPFS-02 | ร้อยละหญิงฝากครรภ์ครบ 5 ครั้งตามเกณฑ์ | 75% |
| PPFS-03 | ร้อยละเด็กแรกเกิดน้ำหนักต่ำกว่า 2,500 กรัม | 7% |
| PPFS-04 | ร้อยละเด็กได้รับนมแม่อย่างน้อย 6 เดือน | 50% |
| TTM-01 | อัตราการใช้ยาสมุนไพร | 25% |
| TTM-02 | ร้อยละผู้ป่วยได้รับบริการนวดไทย | 20% |
| TTM-03 | ร้อยละผู้ป่วยได้รับบริการอบสมุนไพร | 15% |
| TTM-04 | ร้อยละผู้ป่วยได้รับบริการประคบสมุนไพร | 18% |

---

**Document End**