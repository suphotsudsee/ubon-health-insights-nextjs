# UAT Checklist - Ubon Health Insights

## Document Information

| Field | Value |
|-------|-------|
| Project | Ubon Health Insights (Next.js) |
| Version | 1.0 |
| Created | 2026-03-21 |
| Tester | |
| Date Tested | |

---

## Instructions

1. Complete all test scenarios in order
2. Mark ✓ Pass or ✗ Fail for each item
3. Add comments for any failures
4. Sign off at the end

---

## 1. Pre-Test Setup

### Environment Verification

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1.1 | Application URL is accessible | ☐ Pass ☐ Fail | |
| 1.2 | Login page loads correctly | ☐ Pass ☐ Fail | |
| 1.3 | Test user credentials work | ☐ Pass ☐ Fail | |
| 1.4 | Database connection established | ☐ Pass ☐ Fail | |
| 1.5 | All 13 districts have data | ☐ Pass ☐ Fail | |

---

## 2. Authentication

### Login

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 2.1 | Login with valid credentials | Redirect to dashboard | ☐ Pass ☐ Fail | |
| 2.2 | Login with invalid username | Show error message | ☐ Pass ☐ Fail | |
| 2.3 | Login with invalid password | Show error message | ☐ Pass ☐ Fail | |
| 2.4 | Login with empty fields | Show validation error | ☐ Pass ☐ Fail | |
| 2.5 | Password field is masked | Characters hidden | ☐ Pass ☐ Fail | |
| 2.6 | "Remember me" works (if applicable) | Session persists | ☐ Pass ☐ Fail | |

### Logout

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 2.7 | Logout from dashboard | Redirect to login | ☐ Pass ☐ Fail | |
| 2.8 | Access protected page after logout | Redirect to login | ☐ Pass ☐ Fail | |
| 2.9 | Session cleared on logout | Cannot access via back button | ☐ Pass ☐ Fail | |

### Session Management

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 2.10 | Refresh page while logged in | Stay logged in | ☐ Pass ☐ Fail | |
| 2.11 | Open new tab while logged in | Stay logged in | ☐ Pass ☐ Fail | |
| 2.12 | Session timeout after inactivity | Prompt to re-login | ☐ Pass ☐ Fail | |

### Role-Based Access (If Applicable)

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 2.13 | Admin can access all features | All menus visible | ☐ Pass ☐ Fail | |
| 2.14 | District user can only see own district | Filtered data only | ☐ Pass ☐ Fail | |
| 2.15 | Unit user can only see own unit | Own unit data only | ☐ Pass ☐ Fail | |
| 2.16 | Viewer cannot access edit functions | Edit buttons hidden/disabled | ☐ Pass ☐ Fail | |

---

## 3. Dashboard Page

### Page Load

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 3.1 | Dashboard loads without errors | Page renders completely | ☐ Pass ☐ Fail | |
| 3.2 | Title shows "ภาพรวมระบบติดตามตัวชี้วัด" | Correct title displayed | ☐ Pass ☐ Fail | |
| 3.3 | Subtitle shows fiscal year | "ปีงบประมาณ 2567" | ☐ Pass ☐ Fail | |
| 3.4 | Filter bar visible at top | Year and District dropdowns | ☐ Pass ☐ Fail | |

### Stat Cards

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 3.5 | Total population card shows value | Correct number format | ☐ Pass ☐ Fail | |
| 3.6 | Health volunteers card shows value | Correct number format | ☐ Pass ☐ Fail | |
| 3.7 | Households card shows value | Correct number format | ☐ Pass ☐ Fail | |
| 3.8 | Villages card shows value | Correct number format | ☐ Pass ☐ Fail | |
| 3.9 | Unit count shows correctly | "X หน่วยบริการ" | ☐ Pass ☐ Fail | |

### KPI Gauges

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 3.10 | PPFS gauge displays | Semi-circle gauge visible | ☐ Pass ☐ Fail | |
| 3.11 | PPFS gauge shows correct percentage | Matches calculated average | ☐ Pass ☐ Fail | |
| 3.12 | TTM gauge displays | Semi-circle gauge visible | ☐ Pass ☐ Fail | |
| 3.13 | TTM gauge shows correct percentage | Matches calculated average | ☐ Pass ☐ Fail | |
| 3.14 | Gauges show correct color based on value | Color matches status range | ☐ Pass ☐ Fail | |

### District Comparison Chart

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 3.15 | Bar chart displays 13 districts | All districts shown | ☐ Pass ☐ Fail | |
| 3.16 | Bars sorted by performance | Highest to lowest | ☐ Pass ☐ Fail | |
| 3.17 | Hover tooltip shows correct values | District name and percentage | ☐ Pass ☐ Fail | |
| 3.18 | Chart colors reflect performance | Color scale applied | ☐ Pass ☐ Fail | |

### Recent KPIs Table

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 3.19 | Table shows KPI results | Data rows visible | ☐ Pass ☐ Fail | |
| 3.20 | Table columns correct | Unit, District, KPI, Target, Actual, Status | ☐ Pass ☐ Fail | |
| 3.21 | Status badges show correct colors | Color matches performance | ☐ Pass ☐ Fail | |
| 3.22 | Status labels in Thai | วิกฤต/ต่ำกว่าเกณฑ์/ปานกลาง/ดี/ดีมาก | ☐ Pass ☐ Fail | |

### Filters

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 3.23 | Fiscal year filter changes data | Data updates on selection | ☐ Pass ☐ Fail | |
| 3.24 | District filter changes data | Only selected district shown | ☐ Pass ☐ Fail | |
| 3.25 | "ทั้งหมด" shows all districts | All 13 districts data | ☐ Pass ☐ Fail | |
| 3.26 | Filters affect all components | Cards, gauges, charts, table update | ☐ Pass ☐ Fail | |

---

## 4. Basic Info Page

### Page Load

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 4.1 | Page loads without errors | Full page renders | ☐ Pass ☐ Fail | |
| 4.2 | Title shows "ข้อมูลพื้นฐานหน่วยบริการ" | Correct title displayed | ☐ Pass ☐ Fail | |
| 4.3 | All filters visible | Year, District, Search | ☐ Pass ☐ Fail | |

### Summary Cards

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 4.4 | Unit count card displays | Number with icon | ☐ Pass ☐ Fail | |
| 4.5 | Total population displays | Number with comma formatting | ☐ Pass ☐ Fail | |
| 4.6 | Volunteer count displays | Correct number | ☐ Pass ☐ Fail | |
| 4.7 | Household count displays | Correct number | ☐ Pass ☐ Fail | |

### Health Unit Cards

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 4.8 | All health units display as cards | Card grid visible | ☐ Pass ☐ Fail | |
| 4.9 | Card shows unit code | "รหัส: XXXXX" format | ☐ Pass ☐ Fail | |
| 4.10 | Card shows unit name | Full name displayed | ☐ Pass ☐ Fail | |
| 4.11 | Card shows address | "หมู่ X ต.XXX อ.XXX" | ☐ Pass ☐ Fail | |
| 4.12 | Card shows population breakdown | "ชาย X / หญิง X" | ☐ Pass ☐ Fail | |
| 4.13 | Card shows volunteer count | "X คน" | ☐ Pass ☐ Fail | |
| 4.14 | Card shows village count | "X หมู่บ้าน" | ☐ Pass ☐ Fail | |
| 4.15 | Card shows household count | Number formatted | ☐ Pass ☐ Fail | |

### Search and Filter

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 4.16 | Search by unit name | Matching units shown | ☐ Pass ☐ Fail | |
| 4.17 | Search by unit code | Matching unit shown | ☐ Pass ☐ Fail | |
| 4.18 | Clear search shows all units | All units visible | ☐ Pass ☐ Fail | |
| 4.19 | Filter by district | Only that district's units | ☐ Pass ☐ Fail | |
| 4.20 | Combine search + filter | Both conditions apply | ☐ Pass ☐ Fail | |
| 4.21 | No results message (if applicable) | Friendly message shown | ☐ Pass ☐ Fail | |

---

## 5. Finance Page

### Page Load

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 5.1 | Page loads without errors | Full page renders | ☐ Pass ☐ Fail | |
| 5.2 | Title shows "สถานะเงินบำรุง" | Correct title displayed | ☐ Pass ☐ Fail | |

### Summary Cards

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 5.3 | Income card shows total | Green color, trend icon | ☐ Pass ☐ Fail | |
| 5.4 | Expense card shows total | Red color, trend icon | ☐ Pass ☐ Fail | |
| 5.5 | Balance card shows difference | Primary color, wallet icon | ☐ Pass ☐ Fail | |
| 5.6 | Values formatted as Thai Baht | "฿X,XXX,XXX" format | ☐ Pass ☐ Fail | |

### Trend Chart

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 5.7 | Line chart displays | Chart visible | ☐ Pass ☐ Fail | |
| 5.8 | X-axis shows Thai months | ตุลาคม, พฤศจิกายน, etc. | ☐ Pass ☐ Fail | |
| 5.9 | Income line is green | Visual distinction | ☐ Pass ☐ Fail | |
| 5.10 | Expense line is red | Visual distinction | ☐ Pass ☐ Fail | |
| 5.11 | Tooltip shows formatted values | Baht format on hover | ☐ Pass ☐ Fail | |
| 5.12 | Legend displays correctly | "รายรับ" and "รายจ่าย" | ☐ Pass ☐ Fail | |

### Finance Table

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 5.13 | Table displays finance records | All rows visible | ☐ Pass ☐ Fail | |
| 5.14 | Month column in Thai | Thai month names | ☐ Pass ☐ Fail | |
| 5.15 | Unit name column correct | Full unit names | ☐ Pass ☐ Fail | |
| 5.16 | Income column shows green values | Positive format | ☐ Pass ☐ Fail | |
| 5.17 | Expense column shows red values | Negative/expense format | ☐ Pass ☐ Fail | |
| 5.18 | Balance column shows bold values | Bold text | ☐ Pass ☐ Fail | |
| 5.19 | Balance shows correct sign | Positive/negative | ☐ Pass ☐ Fail | |

### Filters

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 5.20 | Fiscal year filter works | Data updates | ☐ Pass ☐ Fail | |
| 5.21 | District filter works | Only selected district | ☐ Pass ☐ Fail | |

---

## 6. PPFS Page

### Page Load

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 6.1 | Page loads without errors | Full page renders | ☐ Pass ☐ Fail | |
| 6.2 | Title shows "ตัวชี้วัด PPFS" | Correct Thai title | ☐ Pass ☐ Fail | |
| 6.3 | Subtitle shows English | "Pregnancy, Post-partum..." | ☐ Pass ☐ Fail | |

### KPI Definition Section

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 6.4 | PPFS KPI cards display | 4 KPI definitions | ☐ Pass ☐ Fail | |
| 6.5 | KPI codes shown (PPFS-01 to PPFS-04) | Codes visible | ☐ Pass ☐ Fail | |
| 6.6 | KPI names in Thai | Full Thai names | ☐ Pass ☐ Fail | |
| 6.7 | Target percentages shown | "XX%" format | ☐ Pass ☐ Fail | |

### Performance Gauge

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 6.8 | Gauge displays correctly | Semi-circle visible | ☐ Pass ☐ Fail | |
| 6.9 | Gauge shows average percentage | Calculated value | ☐ Pass ☐ Fail | |
| 6.10 | Gauge color matches status | Performance-based color | ☐ Pass ☐ Fail | |
| 6.11 | Result count displayed | "จาก X รายการ" | ☐ Pass ☐ Fail | |

### Unit Performance Chart

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 6.12 | Bar chart displays units | Horizontal bars | ☐ Pass ☐ Fail | |
| 6.13 | Bars show percentage values | Correct percentages | ☐ Pass ☐ Fail | |
| 6.14 | Tooltip shows unit name | Full name on hover | ☐ Pass ☐ Fail | |
| 6.15 | Colors match performance level | Color scale applied | ☐ Pass ☐ Fail | |

### Results Table

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 6.16 | Table shows KPI results | All filtered results | ☐ Pass ☐ Fail | |
| 6.17 | Quarter column shows Q1-Q4 | Quarter format | ☐ Pass ☐ Fail | |
| 6.18 | Unit name, district columns | Correct data | ☐ Pass ☐ Fail | |
| 6.19 | KPI name column | Thai KPI names | ☐ Pass ☐ Fail | |
| 6.20 | Target and actual columns | Numeric values | ☐ Pass ☐ Fail | |
| 6.21 | Status badges show correctly | Color + label | ☐ Pass ☐ Fail | |

### Filters

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 6.22 | Fiscal year filter works | Data updates | ☐ Pass ☐ Fail | |
| 6.23 | District filter works | Data filtered | ☐ Pass ☐ Fail | |
| 6.24 | Quarter filter works | Q1/Q2/Q3/Q4 | ☐ Pass ☐ Fail | |
| 6.25 | All filters combined work | Correct intersection | ☐ Pass ☐ Fail | |

---

## 7. TTM Page

### Page Load

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 7.1 | Page loads without errors | Full page renders | ☐ Pass ☐ Fail | |
| 7.2 | Title shows "ตัวชี้วัดแพทย์แผนไทย" | Correct Thai title | ☐ Pass ☐ Fail | |
| 7.3 | Subtitle shows "Traditional Thai Medicine" | English subtitle | ☐ Pass ☐ Fail | |

### KPI Definition Section

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 7.4 | TTM KPI cards display | 4 KPI definitions | ☐ Pass ☐ Fail | |
| 7.5 | KPI codes shown (TTM-01 to TTM-04) | Codes visible | ☐ Pass ☐ Fail | |
| 7.6 | KPI names in Thai | Full Thai names | ☐ Pass ☐ Fail | |
| 7.7 | Target percentages shown | "XX%" format | ☐ Pass ☐ Fail | |
| 7.8 | Card styling matches TTM theme | Accent color | ☐ Pass ☐ Fail | |

### Performance Gauge

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 7.9 | Gauge displays correctly | Semi-circle visible | ☐ Pass ☐ Fail | |
| 7.10 | Gauge shows TTM average | Calculated value | ☐ Pass ☐ Fail | |
| 7.11 | Gauge color matches status | Performance-based color | ☐ Pass ☐ Fail | |

### Results Table and Filters

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 7.12 | Table shows TTM results | Filtered results | ☐ Pass ☐ Fail | |
| 7.13 | All filters work | Year, District, Quarter | ☐ Pass ☐ Fail | |
| 7.14 | Status badges correct | Color + Thai label | ☐ Pass ☐ Fail | |

---

## 8. Comparison Page

### Page Load

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 8.1 | Page loads without errors | Full page renders | ☐ Pass ☐ Fail | |
| 8.2 | Title shows "เปรียบเทียบผลงาน" | Correct Thai title | ☐ Pass ☐ Fail | |
| 8.3 | Three tabs visible | รายอำเภอ, รายหน่วย, การเงิน | ☐ Pass ☐ Fail | |

### Amphoe Comparison Tab

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 8.4 | Tab displays by default | First tab active | ☐ Pass ☐ Fail | |
| 8.5 | Stacked bar chart shows 13 districts | All districts visible | ☐ Pass ☐ Fail | |
| 8.6 | PPFS bars (dark blue) visible | Color distinction | ☐ Pass ☐ Fail | |
| 8.7 | TTM bars (teal) visible | Color distinction | ☐ Pass ☐ Fail | |
| 8.8 | Legend shows PPFS and TTM | Legend visible | ☐ Pass ☐ Fail | |
| 8.9 | Ranking table shows all districts | 13 rows | ☐ Pass ☐ Fail | |
| 8.10 | Ranking column (1-13) correct | Ordered by performance | ☐ Pass ☐ Fail | |
| 8.11 | Top 3 rankings highlighted | Medal/badge styling | ☐ Pass ☐ Fail | |
| 8.12 | PPFS, TTM, Total columns correct | Calculated values | ☐ Pass ☐ Fail | |

### Unit Comparison Tab

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 8.13 | Tab switches on click | Unit tab content | ☐ Pass ☐ Fail | |
| 8.14 | Bar chart shows top 10 units | Limited to 10 | ☐ Pass ☐ Fail | |
| 8.15 | Performance bars sorted | Highest to lowest | ☐ Pass ☐ Fail | |
| 8.16 | Tooltip shows full unit name | Complete name | ☐ Pass ☐ Fail | |
| 8.17 | Colors match performance | Color scale | ☐ Pass ☐ Fail | |
| 8.18 | District filter scopes results | Only selected district's units | ☐ Pass ☐ Fail | |

### Finance Comparison Tab

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 8.19 | Tab switches on click | Finance content | ☐ Pass ☐ Fail | |
| 8.20 | Grouped bar chart displays | Income + Expense bars | ☐ Pass ☐ Fail | |
| 8.21 | Income bars (green) visible | Visual distinction | ☐ Pass ☐ Fail | |
| 8.22 | Expense bars (red) visible | Visual distinction | ☐ Pass ☐ Fail | |
| 8.23 | Finance table shows all units | Unit, Income, Expense, Balance | ☐ Pass ☐ Fail | |
| 8.24 | Balance shows correct sign | Green positive, red negative | ☐ Pass ☐ Fail | |
| 8.25 | Values formatted as currency | Thai Baht format | ☐ Pass ☐ Fail | |

---

## 9. Navigation & Layout

### Header

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 9.1 | Logo displays | "รพ.สต. อบจ.อุบลราชธานี" | ☐ Pass ☐ Fail | |
| 9.2 | Navigation links visible | All menu items | ☐ Pass ☐ Fail | |
| 9.3 | Active link highlighted | Current page indicator | ☐ Pass ☐ Fail | |
| 9.4 | Navigation responsive | Hamburger menu on mobile | ☐ Pass ☐ Fail | |

### Footer

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 9.5 | Footer displays | "© 2567 องค์การบริหาร..." | ☐ Pass ☐ Fail | |
| 9.6 | Subtitle shows | "ระบบติดตามตัวชี้วัด..." | ☐ Pass ☐ Fail | |

### Layout

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 9.7 | Consistent layout across pages | Same header/footer | ☐ Pass ☐ Fail | |
| 9.8 | Responsive grid adjusts | Cards stack on mobile | ☐ Pass ☐ Fail | |
| 9.9 | No horizontal scroll | Fits viewport | ☐ Pass ☐ Fail | |

---

## 10. Mobile Responsiveness

### Mobile Viewport (375px)

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 10.1 | Dashboard cards stack vertically | 1 column grid | ☐ Pass ☐ Fail | |
| 10.2 | Tables scroll horizontally | Scrollable without break | ☐ Pass ☐ Fail | |
| 10.3 | Charts resize appropriately | Readable on small screen | ☐ Pass ☐ Fail | |
| 10.4 | Filter inputs stack vertically | No overflow | ☐ Pass ☐ Fail | |
| 10.5 | Navigation hamburger menu works | Menu opens/closes | ☐ Pass ☐ Fail | |
| 10.6 | Touch targets ≥ 44x44px | All interactive elements | ☐ Pass ☐ Fail | |
| 10.7 | Text is readable | Minimum 16px body | ☐ Pass ☐ Fail | |

### Tablet Viewport (768px)

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 10.8 | Cards 2-column grid | Proper layout | ☐ Pass ☐ Fail | |
| 10.9 | Charts visible | Not cut off | ☐ Pass ☐ Fail | |
| 10.10 | Filter bar wraps properly | No overflow | ☐ Pass ☐ Fail | |
| 10.11 | Navigation visible or collapsed | Appropriate for width | ☐ Pass ☐ Fail | |

### Desktop Viewport (1440px)

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 10.12 | Cards 4-column grid | Full layout | ☐ Pass ☐ Fail | |
| 10.13 | Charts use full width | Optimal display | ☐ Pass ☐ Fail | |
| 10.14 | All navigation visible | Horizontal menu | ☐ Pass ☐ Fail | |

---

## 11. Error Handling

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 11.1 | Invalid URL shows 404 | Not found page | ☐ Pass ☐ Fail | |
| 11.2 | Network error shows message | User-friendly error | ☐ Pass ☐ Fail | |
| 11.3 | Empty state for no data | Friendly message | ☐ Pass ☐ Fail | |
| 11.4 | Large dataset doesn't crash | Paginated or virtualized | ☐ Pass ☐ Fail | |
| 11.5 | Invalid filter shows message | Clear feedback | ☐ Pass ☐ Fail | |

---

## 12. Data Validation (If Entry Forms Exist)

### Health Unit Form

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 12.1 | Required field validation | Error message shown | ☐ Pass ☐ Fail | |
| 12.2 | Unit code format validation | 5 digits required | ☐ Pass ☐ Fail | |
| 12.3 | Duplicate code validation | Error on duplicate | ☐ Pass ☐ Fail | |
| 12.4 | Population number validation | Must be positive | ☐ Pass ☐ Fail | |

### KPI Entry Form

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 12.5 | Fiscal year validation | Current or past years | ☐ Pass ☐ Fail | |
| 12.6 | Quarter validation | 1-4 only | ☐ Pass ☐ Fail | |
| 12.7 | Percentage calculation | Auto-calculate from target/actual | ☐ Pass ☐ Fail | |
| 12.8 | KPI code must exist | Master reference check | ☐ Pass ☐ Fail | |

### Finance Entry Form

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 12.9 | Income non-negative | Error on negative | ☐ Pass ☐ Fail | |
| 12.10 | Expense non-negative | Error on negative | ☐ Pass ☐ Fail | |
| 12.11 | Unit reference validation | Must exist in system | ☐ Pass ☐ Fail | |

---

## 13. Accessibility

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 13.1 | Tab navigation works | All elements reachable | ☐ Pass ☐ Fail | |
| 13.2 | Focus indicators visible | Clear focus states | ☐ Pass ☐ Fail | |
| 13.3 | Screen reader compatible | Proper ARIA labels | ☐ Pass ☐ Fail | |
| 13.4 | Color contrast adequate | WCAG AA compliant | ☐ Pass ☐ Fail | |
| 13.5 | Images have alt text | Descriptive alt text | ☐ Pass ☐ Fail | |
| 13.6 | Form labels associated | Labels linked to inputs | ☐ Pass ☐ Fail | |

---

## 14. Performance

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 14.1 | Dashboard loads < 3 seconds | Performance acceptable | ☐ Pass ☐ Fail | |
| 14.2 | Page transitions smooth | No janky scrolling | ☐ Pass ☐ Fail | |
| 14.3 | Charts render quickly | Visible within 1s | ☐ Pass ☐ Fail | |
| 14.4 | Filter changes respond | Updates within 500ms | ☐ Pass ☐ Fail | |
| 14.5 | Large tables don't lag | Smooth scrolling | ☐ Pass ☐ Fail | |

---

## 15. Browser Compatibility

### Chrome (Latest)

| # | Test Scenario | Status | Notes |
|---|---------------|--------|-------|
| 15.1 | All features work | ☐ Pass ☐ Fail | |

### Firefox (Latest)

| # | Test Scenario | Status | Notes |
|---|---------------|--------|-------|
| 15.2 | All features work | ☐ Pass ☐ Fail | |

### Safari (Latest)

| # | Test Scenario | Status | Notes |
|---|---------------|--------|-------|
| 15.3 | All features work | ☐ Pass ☐ Fail | |

### Edge (Latest)

| # | Test Scenario | Status | Notes |
|---|---------------|--------|-------|
| 15.4 | All features work | ☐ Pass ☐ Fail | |

---

## 16. Security

| # | Test Scenario | Expected Result | Status | Notes |
|---|---------------|-----------------|--------|-------|
| 16.1 | Protected pages require login | Redirect to login | ☐ Pass ☐ Fail | |
| 16.2 | Direct URL access blocked without auth | Redirect to login | ☐ Pass ☐ Fail | |
| 16.3 | Logout clears session | Cannot access via back | ☐ Pass ☐ Fail | |
| 16.4 | No sensitive data in URL | PHI not exposed | ☐ Pass ☐ Fail | |
| 16.5 | XSS attempts blocked | Input sanitized | ☐ Pass ☐ Fail | |
| 16.6 | SQL injection blocked | Parameterized queries | ☐ Pass ☐ Fail | |

---

## Sign-Off

### Tester Declaration

I confirm that I have tested all items in this checklist and recorded the results accurately.

| Field | Value |
|-------|-------|
| Tester Name | |
| Tester Role | |
| Date Completed | |
| Signature | |

### Issues Found

| # | Issue ID | Description | Severity | Status |
|---|----------|-------------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

### Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Project Manager | | | |
| Stakeholder | | | |

---

**Document End**