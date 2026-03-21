# Feature Inventory

## Project: Ubon Health Insights
**Generated:** 2026-03-21  
**Source:** Legacy Vite + React Application

---

## 1. Core Features Overview

### Summary
| Category | Count | Status |
|----------|-------|--------|
| Pages | 6 | ✅ Implemented |
| Dashboard Components | 4 | ✅ Implemented |
| Data Views | 4 | ✅ Implemented |
| Filter Options | 3 | ✅ Implemented |
| Chart Types | 4 | ✅ Implemented |
| UI Components (shadcn) | 40+ | ✅ Installed |
| Data Tables | 5 | ✅ Implemented |

---

## 2. Page-by-Page Feature Breakdown

### 2.1 Dashboard (`/`)

**Purpose:** Main landing page with system overview and key metrics

**Features:**
| Feature | Description | Data Source |
|---------|-------------|-------------|
| Page Header | Title with fiscal year display | State |
| Filter Bar | Year + District selection | State |
| Stat Cards (4) | Population, volunteers, households, villages | Calculated from mockData |
| PPFS Gauge | Semi-circle gauge showing PPFS average | Calculated from kpiResults |
| TTM Gauge | Semi-circle gauge showing TTM average | Calculated from kpiResults |
| District Bar Chart | Horizontal bar ranking 13 districts | Calculated from kpiResults |
| Recent KPIs Table | Last 8 KPI results with status | kpiResults array |

**User Actions:**
- Select fiscal year (2565-2567)
- Select district filter
- View hover tooltips on charts
- Navigate to other pages

---

### 2.2 Basic Info (`/basic-info`)

**Purpose:** Health unit directory and basic demographic information

**Features:**
| Feature | Description | Data Source |
|---------|-------------|-------------|
| Page Header | Title + subtitle | Static |
| Filter Bar | Year + District | State |
| Search Input | Filter by unit name or code | Client-side filter |
| Summary Cards (4) | Unit count, population, volunteers, households | Calculated |
| Health Unit Cards | Grid of unit detail cards | healthUnits array |

**Unit Card Contents:**
- Unit code (e.g., "10601")
- Unit name (e.g., "รพ.สต.บุ่งหวาย")
- Address (moo, tambon, amphoe)
- Population breakdown (male/female)
- Health volunteer count
- Village count
- Household count

**User Actions:**
- Search units by name/code
- Filter by district
- View unit details in card format

---

### 2.3 Finance (`/finance`)

**Purpose:** Track monthly income, expenses, and balances for health units

**Features:**
| Feature | Description | Data Source |
|---------|-------------|-------------|
| Page Header | Title + subtitle | Static |
| Filter Bar | Year + District | State |
| Income Card | Total income with trend icon | Calculated |
| Expense Card | Total expense with trend icon | Calculated |
| Balance Card | Current balance | Calculated (income - expense) |
| Trend Line Chart | Monthly income vs expense line chart | Aggregated from financeData |
| Finance Detail Table | Month-by-month breakdown | financeData array |

**Chart Specifications:**
- X-axis: Thai months (ตุลาคม-กันยายน)
- Y-axis: Amount in thousands (THB)
- Lines: Green (income), Red (expense)
- Tooltips: Formatted currency

**Table Columns:**
- Month
- Health Unit Name
- Income (THB)
- Expense (THB)
- Balance (THB)

**User Actions:**
- Filter by fiscal year
- Filter by district
- Hover over chart for details
- View financial breakdown by month

---

### 2.4 PPFS (`/ppfs`)

**Purpose:** Track Pregnancy, Post-partum, Family Planning & Screening KPIs

**Features:**
| Feature | Description | Data Source |
|---------|-------------|-------------|
| Page Header | Icon + Title + English subtitle | Static |
| Filter Bar | Year + District + Quarter | State |
| Performance Gauge | Overall PPFS average | Calculated |
| KPI Definitions List | 4 PPFS indicators with targets | kpiMaster array |
| Unit Performance Chart | Bar chart of unit performance | Aggregated from kpiResults |
| Results Table | Detailed KPI results | kpiResults array |

**PPFS KPIs Tracked:**
| Code | Name | Target |
|------|------|--------|
| PPFS-01 | % pregnant women registered before 12 weeks | 80% |
| PPFS-02 | % with 5 prenatal visits as per criteria | 75% |
| PPFS-03 | % low birth weight babies (<2,500g) | 7% |
| PPFS-04 | % infants breastfed ≥6 months | 50% |

**Table Columns:**
- Quarter (Q1-Q4)
- Health Unit Name
- District
- KPI Name
- Target
- Actual
- Status Badge

**User Actions:**
- Filter by year, district, quarter
- View KPI definitions
- Compare unit performance
- See detailed results with color-coded status

---

### 2.5 TTM (`/ttm`)

**Purpose:** Track Traditional Thai Medicine service metrics

**Features:**
| Feature | Description | Data Source |
|---------|-------------|-------------|
| Page Header | Icon + Title + English subtitle | Static |
| Filter Bar | Year + District + Quarter | State |
| Performance Gauge | Overall TTM average | Calculated |
| KPI Definitions List | 4 TTM indicators with targets | kpiMaster array |
| Unit Performance Chart | Bar chart of unit performance | Aggregated from kpiResults |
| Results Table | Detailed TTM results | kpiResults array |

**TTM KPIs Tracked:**
| Code | Name | Target |
|------|------|--------|
| TTM-01 | Herbal medicine usage rate | 25% |
| TTM-02 | % patients receiving Thai massage | 20% |
| TTM-03 | % receiving herbal steam treatment | 15% |
| TTM-04 | % receiving herbal compression | 18% |

**User Actions:**
- Filter by year, district, quarter
- View TTM service metrics
- Compare unit performance
- Track traditional medicine adoption

---

### 2.6 Comparison (`/comparison`)

**Purpose:** Benchmarking and comparative analysis across districts and units

**Features:**
| Feature | Description | Data Source |
|---------|-------------|-------------|
| Page Header | Icon + Title + subtitle | Static |
| Filter Bar | Year + District | State |
| Tab Navigation | 3 views: District, Unit, Finance | State |

**Tab 1: District Comparison**
| Feature | Description |
|---------|-------------|
| Stacked Bar Chart | PPFS vs TTM performance by district |
| Ranking Table | 13 districts ranked by overall performance |
| Medal Rankings | Top 3 districts highlighted |

**Tab 2: Unit Comparison**
| Feature | Description |
|---------|-------------|
| Performance Chart | Top 10 units by average performance |
| District Scoping | When district selected, shows only that district's units |

**Tab 3: Finance Comparison**
| Feature | Description |
|---------|-------------|
| Income vs Expense Chart | Grouped bar chart by unit |
| Finance Summary Table | Income, expense, balance by unit |
| Color Coding | Green (positive), Red (negative) balance |

**User Actions:**
- Switch between comparison views
- Filter by fiscal year
- Filter by district (scoped to that district)
- View rankings
- Compare financial health

---

### 2.7 Not Found (404)

**Purpose:** Error page for unmatched routes

**Features:**
- Error code display
- Friendly message in Thai
- Link back to dashboard

---

## 3. Reusable Components

### 3.1 Dashboard Components (`src/components/dashboard/`)

| Component | Props | Usage |
|-----------|-------|-------|
| FilterBar | fiscalYear, setFiscalYear, amphoe, setAmphoe, quarter?, setQuarter?, showQuarter? | Dashboard, BasicInfo, Finance, PPFS, TTM, Comparison |
| GaugeChart | value, label, maxValue? | Dashboard, PPFS, TTM |
| StatCard | title, value, subtitle, icon, variant? | Dashboard |
| StatusBadge | percentage, showLabel?, size? | PPFS, TTM, Comparison tables |

### 3.2 Layout Components (`src/components/layout/`)

| Component | Purpose |
|-----------|---------|
| Header | Sticky header with logo, title, and navigation |
| Layout | Page wrapper with header, main content area, and footer |
| NavLinks | Navigation links with active state styling |

### 3.3 shadcn/ui Components (`src/components/ui/`)

| Category | Components |
|----------|------------|
| **Layout** | card, sheet, tabs, accordion, collapsible, separator, resizable, scroll-area |
| **Forms** | button, input, textarea, checkbox, radio-group, switch, select, label, form, calendar, date-picker |
| **Feedback** | alert, toast, sonner, progress, skeleton |
| **Overlay** | dialog, drawer, popover, tooltip, hover-card, alert-dialog, context-menu |
| **Data Display** | table, badge, avatar, breadcrumb, navigation-menu, menubar, pagination |
| **Media** | aspect-ratio, carousel |
| **Utilities** | command, slider, toggle, toggle-group, input-otp |
| **Charts** | chart (recharts wrapper) |

---

## 4. Data Visualization Features

### 4.1 Chart Types Used

| Chart Type | Library | Pages Used |
|------------|---------|------------|
| Semi-circle Gauge | SVG + CSS | Dashboard, PPFS, TTM |
| Horizontal Bar Chart | Recharts | Dashboard (districts), PPFS, TTM |
| Line Chart | Recharts | Finance (trends) |
| Grouped Bar Chart | Recharts | Comparison (finance) |
| Stacked Bar Chart | Recharts | Comparison (districts) |

### 4.2 Color Coding System (5-Level)

| Range | Label | Color | Emoji |
|-------|-------|-------|-------|
| ≤20% | Critical | Red (#ef4444) | 🔴 |
| ≤40% | Low | Orange (#f97316) | 🟠 |
| ≤60% | Medium | Yellow (#eab308) | 🟡 |
| ≤80% | Good | Green (#22c55e) | 🟢 |
| >80% | Excellent | Blue (#0ea5e9) | 🔵 |

---

## 5. Filtering System

### 5.1 Available Filters

| Filter | Type | Options | Pages |
|--------|------|---------|-------|
| Fiscal Year | Dropdown | 2565, 2566, 2567 | All pages |
| District (Amphoe) | Dropdown | All + 13 districts | All pages |
| Quarter | Dropdown | All + Q1-Q4 | PPFS, TTM |
| Search | Text Input | Free text | BasicInfo |

### 5.2 Filter Behavior
- **Year Filter:** Filters data by fiscalYear field
- **District Filter:** Filters units and their associated data
- **Quarter Filter:** Filters KPI results by quarter
- **Search:** Client-side text matching on unit name/code

---

## 6. Data Export/Print Features

**Current Status:** ❌ NOT IMPLEMENTED

The following features are NOT present in the legacy code:
- Data export to Excel/CSV
- PDF report generation
- Print-friendly views
- Data download functionality

---

## 7. User Management Features

**Current Status:** ❌ NOT IMPLEMENTED

Missing features:
- User authentication
- Login/logout
- Role-based access control
- User profile management
- Password reset

---

## 8. Data Entry Features

**Current Status:** ❌ NOT IMPLEMENTED

Missing features:
- KPI data entry forms
- Financial data entry
- Health unit information editing
- Bulk data import
- Data validation workflows

---

## 9. Notification Features

**Current Status:** ⚠️ PARTIALLY IMPLEMENTED

| Feature | Status | Notes |
|---------|--------|-------|
| Toast notifications | ✅ | Components installed (toast, sonner) |
| Toast usage | ❌ | Not used in any page |
| Alerts | ✅ | Alert component available |
| Real-time updates | ❌ | No WebSocket or SSE |

---

## 10. Responsive Design Features

| Feature | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Navigation | Horizontal nav | Horizontal nav | Hamburger menu |
| Stat Cards | 4-column grid | 2-column grid | 1-column stack |
| Unit Cards | 3-column grid | 2-column grid | 1-column stack |
| Charts | Full size | Scaled | Horizontal scroll |
| Tables | Full display | Horizontal scroll | Horizontal scroll |
| Filter Bar | Horizontal | Wrap | Vertical stack |

**Breakpoints:**
- Mobile: < 768px (useIsMobile hook)
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 11. Accessibility Features

**Current Status:** ⚠️ MINIMAL

| Feature | Status |
|---------|--------|
| Semantic HTML | ⚠️ Basic (nav, main, header, footer) |
| ARIA labels | ❌ Not implemented |
| Keyboard navigation | ⚠️ Native browser only |
| Screen reader support | ❌ Not tested |
| Color contrast | ✅ Government healthcare theme |
| Focus indicators | ⚠️ Default browser styles |

---

## 12. Missing Features (Not in Legacy)

### Critical for Production
1. ✅ User authentication system
2. ✅ Database integration (currently mock data only)
3. ✅ Data entry forms for KPIs
4. ✅ Data entry forms for finances
5. ✅ User role management
6. ✅ Audit logging
7. ✅ Data export functionality

### Nice to Have
1. Real-time dashboard updates
2. Push notifications
3. Mobile app
4. Multi-language support (currently Thai only)
5. Advanced reporting with date ranges
6. Data import from Excel
7. Email alerts for low performance

---

## 13. Feature Priority for Rebuild

### Phase 1: MVP (Must Have)
- [ ] Dashboard with real data
- [ ] Basic Info page
- [ ] Finance tracking
- [ ] PPFS KPI view
- [ ] TTM KPI view
- [ ] Comparison/Benchmarking
- [ ] User authentication
- [ ] Database integration

### Phase 2: Essential (Should Have)
- [ ] Data entry forms
- [ ] Data export (Excel/PDF)
- [ ] User roles (admin, district, unit)
- [ ] Audit logging
- [ ] Advanced filtering

### Phase 3: Enhancement (Could Have)
- [ ] Real-time updates
- [ ] Email notifications
- [ ] Mobile optimization
- [ ] Offline mode

### Phase 4: Future (Won't Have Now)
- [ ] Mobile app
- [ ] AI insights
- [ ] Multi-language

---

**End of Feature Inventory**
