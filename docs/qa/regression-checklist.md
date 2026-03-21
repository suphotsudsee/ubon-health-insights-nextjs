# Regression Checklist - Ubon Health Insights

## Document Information

| Field | Value |
|-------|-------|
| Project | Ubon Health Insights (Next.js) |
| Version | 1.0 |
| Created | 2026-03-21 |
| Last Updated | 2026-03-21 |

---

## Purpose

This checklist ensures that previously fixed bugs and core functionality remain working after code changes. Run this checklist:

- Before each release
- After major code changes
- After dependency updates
- After infrastructure changes
- After bug fixes in related areas

---

## Quick Reference: Priority Tests

**Run these first if time is limited:**

1. ✅ Login works
2. ✅ Dashboard loads with data
3. ✅ Filters update all components
4. ✅ Navigation works between all pages
5. ✅ Mobile layout doesn't break
6. ✅ Charts render correctly
7. ✅ Status badges show correct colors

---

## 1. Authentication Regression

### 1.1 Login Flow

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| AUTH-R01 | Valid login | Enter valid credentials, submit | Redirect to dashboard | ☐ | ☐ | |
| AUTH-R02 | Invalid password | Enter invalid password | Error message shown | ☐ | ☐ | |
| AUTH-R03 | Invalid username | Enter invalid username | Error message shown | ☐ | ☐ | |
| AUTH-R04 | Empty fields | Submit with empty fields | Validation errors shown | ☐ | ☐ | |
| AUTH-R05 | Session persist | Login, refresh page | Still logged in | ☐ | ☐ | |
| AUTH-R06 | Session timeout | Wait for timeout | Prompt to re-login | ☐ | ☐ | |
| AUTH-R07 | Logout | Click logout | Redirect to login | ☐ | ☐ | |
| AUTH-R08 | Post-logout access | After logout, try direct URL | Redirect to login | ☐ | ☐ | |

### 1.2 Role-Based Access

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| ROLE-R01 | Admin access | Login as admin, access all pages | All features accessible | ☐ | ☐ | |
| ROLE-R02 | District user | Login as district user | Only own district data | ☐ | ☐ | |
| ROLE-R03 | Unit user | Login as unit user | Only own unit data | ☐ | ☐ | |
| ROLE-R04 | Role persistence | Change role, refresh | New permissions applied | ☐ | ☐ | |
| ROLE-R05 | Unauthorized page | Try accessing admin page as user | Access denied message | ☐ | ☐ | |

---

## 2. Dashboard Regression

### 2.1 Page Load

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| DASH-R01 | Default load | Navigate to / | Page loads without error | ☐ | ☐ | |
| DASH-R02 | Title display | Check page title | "ภาพรวมระบบติดตามตัวชี้วัด" | ☐ | ☐ | |
| DASH-R03 | Filter bar visible | Check filter area | Year and District dropdowns | ☐ | ☐ | |
| DASH-R04 | No console errors | Check browser console | No red errors | ☐ | ☐ | |

### 2.2 Stat Cards

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| STAT-R01 | Population card | Check total population | Correct number, formatted | ☐ | ☐ | |
| STAT-R02 | Volunteers card | Check volunteer count | Correct number | ☐ | ☐ | |
| STAT-R03 | Households card | Check household count | Correct number | ☐ | ☐ | |
| STAT-R04 | Villages card | Check village count | Correct number | ☐ | ☐ | |
| STAT-R05 | Icons visible | Check all stat cards | Icons render correctly | ☐ | ☐ | |

### 2.3 KPI Gauges

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| GAUGE-R01 | PPFS gauge renders | Check gauge component | Semi-circle visible | ☐ | ☐ | |
| GAUGE-R02 | PPFS value correct | Check percentage | Matches calculated average | ☐ | ☐ | |
| GAUGE-R03 | PPFS color correct | Check gauge color | Matches status level | ☐ | ☐ | |
| GAUGE-R04 | TTM gauge renders | Check gauge component | Semi-circle visible | ☐ | ☐ | |
| GAUGE-R05 | TTM value correct | Check percentage | Matches calculated average | ☐ | ☐ | |
| GAUGE-R06 | TTM color correct | Check gauge color | Matches status level | ☐ | ☐ | |

### 2.4 District Chart

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| CHART-R01 | Chart renders | Check district chart | Bar chart visible | ☐ | ☐ | |
| CHART-R02 | All 13 districts | Count bars in chart | All districts shown | ☐ | ☐ | |
| CHART-R03 | Sort order | Check bar order | Highest to lowest | ☐ | ☐ | |
| CHART-R04 | Tooltip | Hover over bar | Tooltip with value | ☐ | ☐ | |
| CHART-R05 | Colors | Check bar colors | Gradient by value | ☐ | ☐ | |

### 2.5 Filters

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| FILT-R01 | Year filter | Change fiscal year | All components update | ☐ | ☐ | |
| FILT-R02 | District filter | Select district | Only district data shown | ☐ | ☐ | |
| FILT-R03 | "ทั้งหมด" option | Select all districts | All data shown | ☐ | ☐ | |
| FILT-R04 | Combined filters | Change both filters | Correct intersection | ☐ | ☐ | |
| FILT-R05 | Filter persistence | Refresh after filter | Filter state maintained | ☐ | ☐ | |

---

## 3. Basic Info Regression

### 3.1 Page Load

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| INFO-R01 | Navigation | Click "ข้อมูลพื้นฐาน" | Page loads | ☐ | ☐ | |
| INFO-R02 | Title | Check page title | "ข้อมูลพื้นฐานหน่วยบริการ" | ☐ | ☐ | |
| INFO-R03 | Search box | Check search input | Input field visible | ☐ | ☐ | |

### 3.2 Health Unit Display

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| UNIT-R01 | All units display | Check card grid | All units shown | ☐ | ☐ | |
| UNIT-R02 | Card layout | Check unit cards | All fields visible | ☐ | ☐ | |
| UNIT-R03 | Population detail | Check population section | Male/female breakdown | ☐ | ☐ | |
| UNIT-R04 | Address format | Check address display | "หมู่ X ต.XXX อ.XXX" | ☐ | ☐ | |

### 3.3 Search and Filter

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| SRCH-R01 | Search by name | Type unit name | Matching units shown | ☐ | ☐ | |
| SRCH-R02 | Search by code | Type unit code | Matching unit shown | ☐ | ☐ | |
| SRCH-R03 | Clear search | Clear input | All units shown | ☐ | ☐ | |
| SRCH-R04 | District filter | Select district | Only that district | ☐ | ☐ | |
| SRCH-R05 | Combined | Search + filter | Both applied | ☐ | ☐ | |

---

## 4. Finance Regression

### 4.1 Page Load

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| FIN-R01 | Navigation | Click "สถานะเงินบำรุง" | Page loads | ☐ | ☐ | |
| FIN-R02 | Title | Check page title | "สถานะเงินบำรุง" | ☐ | ☐ | |

### 4.2 Summary Cards

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| CARD-R01 | Income card | Check total income | Correct value, green | ☐ | ☐ | |
| CARD-R02 | Expense card | Check total expense | Correct value, red | ☐ | ☐ | |
| CARD-R03 | Balance card | Check balance | Income - Expense | ☐ | ☐ | |
| CARD-R04 | Currency format | Check number format | Thai Baht format | ☐ | ☐ | |

### 4.3 Trend Chart

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| TC-R01 | Chart renders | Check line chart | Chart visible | ☐ | ☐ | |
| TC-R02 | Income line | Check green line | Correct data | ☐ | ☐ | |
| TC-R03 | Expense line | Check red line | Correct data | ☐ | ☐ | |
| TC-R04 | X-axis labels | Check month labels | Thai months | ☐ | ☐ | |
| TC-R05 | Tooltip | Hover over point | Value in Baht | ☐ | ☐ | |

### 4.4 Finance Table

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| FT-R01 | Table renders | Check finance table | All rows visible | ☐ | ☐ | |
| FT-R02 | Column headers | Check columns | Month, Unit, Income, Expense, Balance | ☐ | ☐ | |
| FT-R03 | Color coding | Check value colors | Green/Red as expected | ☐ | ☐ | |
| FT-R04 | Calculation | Verify one row | Balance = Income - Expense | ☐ | ☐ | |

---

## 5. PPFS Regression

### 5.1 Page Load

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| PPFS-R01 | Navigation | Click "ตัวชี้วัด PPFS" | Page loads | ☐ | ☐ | |
| PPFS-R02 | Title | Check page title | "ตัวชี้วัด PPFS" | ☐ | ☐ | |
| PPFS-R03 | Subtitle | Check English subtitle | "Pregnancy, Post-partum..." | ☐ | ☐ | |

### 5.2 KPI Definitions

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| KPI-R01 | All PPFS KPIs | Count KPI cards | 4 KPIs shown | ☐ | ☐ | |
| KPI-R02 | KPI codes | Check code format | PPFS-01 to PPFS-04 | ☐ | ☐ | |
| KPI-R03 | KPI names | Check Thai names | Correct names | ☐ | ☐ | |
| KPI-R04 | Target display | Check target % | XX% format | ☐ | ☐ | |

### 5.3 Performance Gauge

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| PG-R01 | Gauge renders | Check PPFS gauge | Visible | ☐ | ☐ | |
| PG-R02 | Value correct | Check percentage | Calculated average | ☐ | ☐ | |
| PG-R03 | Color correct | Check color | Matches status | ☐ | ☐ | |

### 5.4 Results Table

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| RT-R01 | Table renders | Check results table | Data rows shown | ☐ | ☐ | |
| RT-R02 | Column headers | Check columns | Quarter, Unit, District, etc. | ☐ | ☐ | |
| RT-R03 | Status badges | Check badge colors | Color + Thai label | ☐ | ☐ | |

### 5.5 Quarter Filter

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| QF-R01 | Q1 filter | Select Q1 | Only Q1 data | ☐ | ☐ | |
| QF-R02 | Q2 filter | Select Q2 | Only Q2 data | ☐ | ☐ | |
| QF-R03 | Q3 filter | Select Q3 | Only Q3 data | ☐ | ☐ | |
| QF-R04 | Q4 filter | Select Q4 | Only Q4 data | ☐ | ☐ | |
| QF-R05 | All quarters | Select "ทั้งหมด" | All data shown | ☐ | ☐ | |

---

## 6. TTM Regression

### 6.1 Page Load

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| TTM-R01 | Navigation | Click "ตัวชี้วัดแพทย์แผนไทย" | Page loads | ☐ | ☐ | |
| TTM-R02 | Title | Check page title | "ตัวชี้วัดแพทย์แผนไทย" | ☐ | ☐ | |
| TTM-R03 | Subtitle | Check English subtitle | "Traditional Thai Medicine" | ☐ | ☐ | |

### 6.2 KPI Definitions

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| TTMKPI-R01 | All TTM KPIs | Count KPI cards | 4 KPIs shown | ☐ | ☐ | |
| TTMKPI-R02 | KPI codes | Check code format | TTM-01 to TTM-04 | ☐ | ☐ | |
| TTMKPI-R03 | Card styling | Check accent color | Teal/green theme | ☐ | ☐ | |

### 6.3 Performance and Results

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| TTMPG-R01 | Gauge renders | Check TTM gauge | Visible | ☐ | ☐ | |
| TTMPG-R02 | Value correct | Check percentage | Calculated average | ☐ | ☐ | |
| TTMRT-R01 | Table renders | Check results table | TTM data shown | ☐ | ☐ | |

---

## 7. Comparison Regression

### 7.1 Page Load

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| COMP-R01 | Navigation | Click "เปรียบเทียบผลงาน" | Page loads | ☐ | ☐ | |
| COMP-R02 | Title | Check page title | "เปรียบเทียบผลงาน" | ☐ | ☐ | |
| COMP-R03 | Tabs visible | Check tab list | 3 tabs visible | ☐ | ☐ | |

### 7.2 Amphoe Tab

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| AMP-R01 | Default tab | Check initial state | Amphoe tab active | ☐ | ☐ | |
| AMP-R02 | Stacked chart | Check bar chart | PPFS + TTM stacked | ☐ | ☐ | |
| AMP-R03 | All districts | Count bars | 13 districts | ☐ | ☐ | |
| AMP-R04 | Ranking table | Check table | All 13 districts ranked | ☐ | ☐ | |
| AMP-R05 | Top 3 style | Check top rows | Highlighted badges | ☐ | ☐ | |

### 7.3 Unit Tab

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| UNIT-R01 | Switch to Unit tab | Click unit tab | Unit content shown | ☐ | ☐ | |
| UNIT-R02 | Bar chart | Check performance chart | Top units shown | ☐ | ☐ | |
| UNIT-R03 | District filter | Select district | Only that district's units | ☐ | ☐ | |

### 7.4 Finance Tab

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| FIN-R01 | Switch to Finance tab | Click finance tab | Finance content shown | ☐ | ☐ | |
| FIN-R02 | Grouped bar chart | Check chart | Income + Expense grouped | ☐ | ☐ | |
| FIN-R03 | Finance table | Check table | All units with balance | ☐ | ☐ | |
| FIN-R04 | Balance color | Check balance column | Green positive, red negative | ☐ | ☐ | |

---

## 8. Mobile Responsiveness Regression

### 8.1 Mobile Viewport (375px)

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| MOB-R01 | Dashboard cards | Resize to 375px | Cards stack vertically | ☐ | ☐ | |
| MOB-R02 | Tables | Check tables | Horizontal scroll | ☐ | ☐ | |
| MOB-R03 | Charts | Check charts | Readable size | ☐ | ☐ | |
| MOB-R04 | Filter bar | Check filters | Stack vertically | ☐ | ☐ | |
| MOB-R05 | Navigation | Check header | Hamburger menu | ☐ | ☐ | |
| MOB-R06 | Touch targets | Check buttons | Min 44x44px | ☐ | ☐ | |
| MOB-R07 | No horizontal scroll | Check content | Fits viewport | ☐ | ☐ | |

### 8.2 Tablet Viewport (768px)

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| TAB-R01 | Card grid | Resize to 768px | 2-column grid | ☐ | ☐ | |
| TAB-R02 | Charts | Check charts | Proper size | ☐ | ☐ | |
| TAB-R03 | Navigation | Check header | Horizontal nav | ☐ | ☐ | |

### 8.3 Desktop Viewport (1440px)

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| DESK-R01 | Card grid | Resize to 1440px | 4-column grid | ☐ | ☐ | |
| DESK-R02 | Charts | Check charts | Full width | ☐ | ☐ | |
| DESK-R03 | Full layout | Check all pages | No breaks | ☐ | ☐ | |

---

## 9. Cross-Browser Regression

### 9.1 Chrome

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| CHR-R01 | Dashboard | Open in Chrome | Works correctly | ☐ | ☐ | |
| CHR-R02 | Charts | Check all charts | Render properly | ☐ | ☐ | |
| CHR-R03 | Filters | Test all filters | Work correctly | ☐ | ☐ | |
| CHR-R04 | Navigation | Click all nav links | Navigate correctly | ☐ | ☐ | |

### 9.2 Firefox

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| FF-R01 | Dashboard | Open in Firefox | Works correctly | ☐ | ☐ | |
| FF-R02 | Charts | Check all charts | Render properly | ☐ | ☐ | |
| FF-R03 | Filters | Test all filters | Work correctly | ☐ | ☐ | |
| FF-R04 | Navigation | Click all nav links | Navigate correctly | ☐ | ☐ | |

### 9.3 Safari

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| SAF-R01 | Dashboard | Open in Safari | Works correctly | ☐ | ☐ | |
| SAF-R02 | Charts | Check all charts | Render properly | ☐ | ☐ | |
| SAF-R03 | Filters | Test all filters | Work correctly | ☐ | ☐ | |
| SAF-R04 | Navigation | Click all nav links | Navigate correctly | ☐ | ☐ | |

### 9.4 Edge

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| EDG-R01 | Dashboard | Open in Edge | Works correctly | ☐ | ☐ | |
| EDG-R02 | Charts | Check all charts | Render properly | ☐ | ☐ | |
| EDG-R03 | Filters | Test all filters | Work correctly | ☐ | ☐ | |
| EDG-R04 | Navigation | Click all nav links | Navigate correctly | ☐ | ☐ | |

---

## 10. Data Integrity Regression

### 10.1 Calculations

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| CALC-R01 | Population total | Compare with seed data | Matches database | ☐ | ☐ | |
| CALC-R02 | PPFS average | Manual calculation | Matches displayed | ☐ | ☐ | |
| CALC-R03 | TTM average | Manual calculation | Matches displayed | ☐ | ☐ | |
| CALC-R04 | Finance balance | Income - Expense | Equals balance | ☐ | ☐ | |
| CALC-R05 | Status color | Check percentage ranges | Correct color applied | ☐ | ☐ | |

### 10.2 Status Badge Logic

| Range | Label | Color | Test |
|-------|-------|-------|------|
| ≤20% | วิกฤต | Red | ☐ Pass ☐ Fail |
| 21-40% | ต่ำกว่าเกณฑ์ | Orange | ☐ Pass ☐ Fail |
| 41-60% | ปานกลาง | Yellow | ☐ Pass ☐ Fail |
| 61-80% | ดี | Green | ☐ Pass ☐ Fail |
| >80% | ดีมาก | Blue | ☐ Pass ☐ Fail |

### 10.3 Filter Accuracy

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| FILT-R06 | Year filter | Select year, count records | Matches database | ☐ | ☐ | |
| FILT-R07 | District filter | Select district, verify units | Correct units shown | ☐ | ☐ | |
| FILT-R08 | Quarter filter | Select quarter, check KPIs | Correct quarter data | ☐ | ☐ | |

---

## 11. Performance Regression

### 11.1 Load Times

| # | Test | Metric | Target | Pass | Fail | Notes |
|---|------|--------|--------|------|------|-------|
| PERF-R01 | Dashboard FCP | First Contentful Paint | < 1.8s | ☐ | ☐ | |
| PERF-R02 | Dashboard LCP | Largest Contentful Paint | < 2.5s | ☐ | ☐ | |
| PERF-R03 | Dashboard TTI | Time to Interactive | < 3.8s | ☐ | ☐ | |
| PERF-R04 | Dashboard CLS | Cumulative Layout Shift | < 0.1 | ☐ | ☐ | |

### 11.2 Filter Response

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| RESP-R01 | Year filter | Change year | Updates < 500ms | ☐ | ☐ | |
| RESP-R02 | District filter | Change district | Updates < 500ms | ☐ | ☐ | |
| RESP-R03 | Quarter filter | Change quarter | Updates < 500ms | ☐ | ☐ | |

### 11.3 Chart Rendering

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| CHART-R06 | Gauge render | Load page | Visible < 1s | ☐ | ☐ | |
| CHART-R07 | Bar chart render | Load page | Visible < 1s | ☐ | ☐ | |
| CHART-R08 | Line chart render | Load finance page | Visible < 1s | ☐ | ☐ | |

---

## 12. Security Regression

### 12.1 Authentication

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| SEC-R01 | Unauthenticated access | Try to access protected page | Redirect to login | ☐ | ☐ | |
| SEC-R02 | Direct URL access | Enter URL directly without login | Redirect to login | ☐ | ☐ | |
| SEC-R03 | Session expire | Wait for timeout | Prompt to re-login | ☐ | ☐ | |
| SEC-R04 | Cookie security | Check cookie attributes | HttpOnly, Secure | ☐ | ☐ | |

### 12.2 Authorization

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| AUTH-R01 | Role restriction | Access admin page as user | Access denied | ☐ | ☐ | |
| AUTH-R02 | Data scope | View data as district user | Only own district | ☐ | ☐ | |
| AUTH-R03 | API protection | Call API without token | 401 Unauthorized | ☐ | ☐ | |

### 12.3 Input Validation

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| INP-R01 | XSS attempt | Enter script in search | Sanitized output | ☐ | ☐ | |
| INP-R02 | SQL injection | Try SQL in input | Error or sanitized | ☐ | ☐ | |
| INP-R03 | Large input | Enter very long text | Truncated or handled | ☐ | ☐ | |

---

## 13. Accessibility Regression

| # | Test | Steps | Expected Result | Pass | Fail | Notes |
|---|------|-------|-----------------|------|------|-------|
| ACC-R01 | Tab navigation | Press Tab key | All elements reachable | ☐ | ☐ | |
| ACC-R02 | Focus visible | Check focus state | Visible outline | ☐ | ☐ | |
| ACC-R03 | Alt text | Check all images | Alt text present | ☐ | ☐ | |
| ACC-R04 | Form labels | Check input labels | Labels associated | ☐ | ☐ | |
| ACC-R05 | Color contrast | Check text/background | 4.5:1 minimum | ☐ | ☐ | |
| ACC-R06 | Screen reader | Test with NVDA | Content readable | ☐ | ☐ | |

---

## Regression Test Execution Log

### Test Run Information

| Field | Value |
|-------|-------|
| Date | |
| Tester | |
| Build Version | |
| Environment | |
| Browser | |
| Device | |

### Summary

| Category | Passed | Failed | Blocked | N/A |
|----------|--------|--------|---------|-----|
| Authentication | | | | |
| Dashboard | | | | |
| Basic Info | | | | |
| Finance | | | | |
| PPFS | | | | |
| TTM | | | | |
| Comparison | | | | |
| Mobile | | | | |
| Cross-Browser | | | | |
| Data Integrity | | | | |
| Performance | | | | |
| Security | | | | |
| Accessibility | | | | |
| **Total** | | | | |

### Issues Found

| # | Test ID | Description | Severity | Status |
|---|---------|-------------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

### Notes

```
[Add any additional notes or observations here]
```

### Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Tester | | | |
| QA Lead | | | |

---

## Quick Run Checklist

For rapid regression, run only these critical tests:

- [ ] Login works
- [ ] Dashboard loads with data
- [ ] All navigation links work
- [ ] Year filter updates data
- [ ] District filter updates data
- [ ] Charts render on all pages
- [ ] Status badges show correct colors
- [ ] Tables display correctly
- [ ] Mobile layout doesn't break
- [ ] No console errors

---

**Document End**