# System Audit Report

## Project: Ubon Health Insights
**Audit Date:** 2026-03-21  
**Auditor:** Research Analyst Subagent  
**Source:** `C:\fullstack\ubon-health-insights`

---

## 1. Project Overview

This is a health performance tracking dashboard for Sub-District Health Promoting Hospitals (รพ.สต.) under the Ubon Ratchathani Provincial Administrative Organization (อบจ.อุบลราชธานี). The system monitors KPIs across 13 districts covering maternal health (PPFS) and traditional Thai medicine (TTM).

---

## 2. Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 5.4 |
| **Styling** | Tailwind CSS 3.4 |
| **UI Library** | shadcn/ui (Radix + Tailwind) |
| **State Management** | React hooks (useState) |
| **Data Fetching** | TanStack Query (React Query) |
| **Charts** | Recharts |
| **Backend** | Supabase (configured but empty schema) |
| **Testing** | Vitest + React Testing Library |

---

## 3. Project Structure Analysis

```
C:\fullstack\ubon-health-insights
├── src/
│   ├── components/
│   │   ├── dashboard/          # Dashboard-specific components
│   │   │   ├── FilterBar.tsx   # Year/District/Quarter filters
│   │   │   ├── GaugeChart.tsx  # Semi-circular gauge visualization
│   │   │   ├── StatCard.tsx    # Summary statistic cards
│   │   │   └── StatusBadge.tsx # Performance status indicator
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx      # App header with navigation
│   │   │   └── Layout.tsx      # Main page layout wrapper
│   │   └── ui/                 # shadcn/ui components (auto-generated)
│   ├── data/
│   │   └── mockData.ts         # 20,172 bytes of hardcoded mock data
│   ├── hooks/
│   │   ├── use-mobile.tsx      # Mobile breakpoint detection
│   │   └── use-toast.ts        # Toast notification hook
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts       # Supabase client config (has credentials)
│   │       └── types.ts        # Empty database types
│   ├── lib/
│   │   └── utils.ts            # cn() utility for Tailwind
│   ├── pages/
│   │   ├── Dashboard.tsx       # Main overview page
│   │   ├── BasicInfo.tsx       # Health unit basic data
│   │   ├── Finance.tsx         # Financial status tracking
│   │   ├── PPFS.tsx            # Maternal health KPIs
│   │   ├── TTM.tsx             # Traditional medicine KPIs
│   │   ├── Comparison.tsx      # Benchmarking/comparison tools
│   │   └── NotFound.tsx        # 404 page
│   ├── test/
│   │   ├── setup.ts            # Test configuration
│   │   └── example.test.ts     # Placeholder test
│   ├── App.tsx                 # Main app router
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind + custom CSS
├── supabase/
│   └── config.toml             # Minimal config (35 bytes)
├── public/
│   └── placeholder assets
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## 4. Data Architecture (Current State)

### 4.1 Data Source
**ALL DATA IS HARDCODED MOCK DATA** - No database connection in use

Data resides in `src/data/mockData.ts` containing:
- 14 health units across 13 districts
- 8 KPI master definitions
- 12 finance records (3 months × 4 units)
- 16 KPI results (mock performance data)

### 4.2 Data Models

```typescript
// HealthUnit - Sub-district health hospital info
interface HealthUnit {
  id: string;
  code: string;          // e.g., "10601"
  name: string;            // e.g., "รพ.สต.บุ่งหวาย"
  moo: string;
  tambon: string;
  amphoe: string;          // One of 13 districts
  affiliation: string;     // "อบจ.อุบลราชธานี"
  male: number;
  female: number;
  totalPopulation: number;
  villages: number;
  households: number;
  healthVolunteers: number;
  email: string;
}

// KPIMaster - KPI definitions
interface KPIMaster {
  id: string;
  code: string;           // e.g., "PPFS-01"
  name: string;            // Thai description
  category: "PPFS" | "แพทย์แผนไทย"
  targetPercent: number; // Target percentage
  reportLink?: string;
}

// KPIResult - Performance data
interface KPIResult {
  id: string;
  fiscalYear: number;      // Thai Buddhist year (2567)
  quarter: number;         // 1-4
  unitCode: string;
  unitName: string;
  amphoe: string;
  kpiCode: string;
  kpiName: string;
  category: string;
  target: number;
  actual: number;
  percentage: number;      // Calculated performance %
}

// FinanceData - Monthly financial records
interface FinanceData {
  id: string;
  fiscalYear: number;
  month: string;           // Thai month names
  unitCode: string;
  unitName: string;
  income: number;
  expense: number;
  balance: number;
  recorder: string;        // Email of recorder
}
```

### 4.3 13 Districts Covered
1. ม่วงสามสิบ
2. นาจะหลวย
3. วารินชำราบ
4. เดชอุดม
5. ตระการพืชผล
6. เขื่องใน
7. พิบูลมังสาหาร
8. สำโรง
9. น้ำยืน
10. บุณฑริก
11. โขงเจียม
12. ศรีเมืองใหม่
13. สว่างวีระวงศ์

---

## 5. Routing & Navigation

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Main overview with stats, gauges, and charts |
| `/basic-info` | BasicInfo | Health unit directory with search/filter |
| `/finance` | Finance | Monthly income/expense tracking |
| `/ppfs` | PPFS | Maternal health KPIs (Pregnancy, Post-partum, Family Planning, Screening) |
| `/ttm` | TTM | Traditional Thai Medicine metrics |
| `/comparison` | Comparison | Benchmarking across districts and units |
| `*` | NotFound | 404 error page |

**Navigation Pattern:** Sticky header with desktop nav + mobile hamburger menu using Sheet component.

---

## 6. Key Components Analysis

### 6.1 FilterBar.tsx
- **Purpose:** Shared filtering component across pages
- **Filters:** Fiscal year (2565-2567), District (13 options), Quarter (1-4, optional)
- **Props Interface:** Well-defined with optional showQuarter flag
- **Usage:** Dashboard, BasicInfo, Finance, PPFS, TTM, Comparison

### 6.2 Dashboard.tsx
- **Stats Display:** Population total, health volunteers, households, villages
- **Visualizations:** 
  - 2 Gauge charts (PPFS & TTM averages)
  - Horizontal bar chart (district performance ranking)
  - Recent KPI results table
- **Filtering:** Real-time recalculation based on selected district

### 6.3 GaugeChart.tsx
- **Type:** Semi-circular gauge (180°)
- **Color Scale:** 5-level status system
  - ≤20%: Critical (Red)
  - ≤40%: Low (Orange)
  - ≤60%: Medium (Yellow)
  - ≤80%: Good (Green)
  - >80%: Excellent (Blue)

### 6.4 StatusBadge.tsx
- **Display:** Emoji + percentage + label
- **Sizes:** sm, md, lg
- **Used in:** Tables throughout the app

---

## 7. State Management

### Current Approach: Local State Only
- `useState` for filter values (fiscalYear, amphoe, quarter)
- Client-side filtering of mock data arrays
- No global state manager (no Redux, Zustand, or Context)

### React Query Setup
- Configured in App.tsx but only for future use
- No actual API calls being made
- QueryClient initialized but unused for data fetching

---

## 8. Styling System

### Theme: Government Healthcare
- **Primary:** Deep Navy Blue (hsl 213 50% 20%)
- **Accent:** Teal (hsl 168 70% 38%) - Healthcare association
- **Font:** Sarabun (Thai Google Font)
- **Status Colors:** 5-level traffic light system

### CSS Variables in :root
- 25+ CSS variables for theming
- Dark mode support defined but untested
- Custom animation keyframes (fade-in, slide-up, scale-in)

### Tailwind Configuration
- Custom color extensions for status levels
- Container max-width: 1400px
- Border radius base: 0.75rem

---

## 9. Testing Setup

| Aspect | Status |
|--------|--------|
| Framework | Vitest + React Testing Library |
| Config | `vitest.config.ts` present |
| Setup | `src/test/setup.ts` mocks matchMedia |
| Tests | Only 1 placeholder test exists |
| Coverage | 0% (no actual tests) |

---

## 10. Build & Development

### Scripts Available
```json
{
  "dev": "vite",              // Port 8080
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "eslint ."
}
```

### Vite Configuration
- Host: `::` (IPv6)
- Port: 8080
- HMR: Overlay disabled
- Path alias: `@/` → `./src`
- Plugin: lovable-tagger (development only)

---

## 11. Security Findings

### ⚠️ Critical Issues

1. **Exposed Supabase Credentials**
   - File: `src/integrations/supabase/client.ts`
   - Issue: Hardcoded URL and anon key in source code
   - Risk: Anyone can access the Supabase project

### Moderate Issues

2. **No Input Validation**
   - Search inputs in BasicInfo.tsx not sanitized
   - No form validation library usage

3. **No Authentication**
   - No login/logout functionality
   - No protected routes
   - All data is public

4. **Mock Data Contains Fake PII**
   - Example emails in mock data: `bungwai@example.com`
   - Low risk since mock, but pattern shows no privacy consideration

---

## 12. Integration Points

### Supabase (Configured but Unused)
- Client initialized with hardcoded credentials
- Database types file generated but empty (`{ [_ in never]: never }`)
- No actual Supabase queries in the codebase
- Project appears to be purely frontend with mock data

### External Dependencies
- Google Fonts (Sarabun)
- Lucide icons (via lucide-react)
- Recharts for visualization

---

## 13. Code Quality Metrics

| Metric | Status |
|--------|--------|
| TypeScript | Strict mode not enabled |
| ESLint | Configured (eslint.config.js) |
| Component Types | Prop interfaces defined |
| Comments | Minimal (mostly Thai UI text) |
| Dead Code | None identified |
| Circular Dependencies | None detected |

---

## 14. Business Logic

### PPFS KPIs (Maternal Health)
1. % of pregnant women registered before 12 weeks
2. % with 5 prenatal visits as per criteria
3. % of low birth weight babies (<2,500g)
4. % of infants breastfed for at least 6 months

### TTM KPIs (Traditional Thai Medicine)
1. Herbal medicine usage rate
2. % of patients receiving Thai massage
3. % receiving herbal steam treatment
4. % receiving herbal compression

### Financial Tracking
- Monthly income/expense per health unit
- Running balance calculation
- Fiscal year following Thai calendar (Oct-Sep)

---

## 15. Critical Findings Summary

| # | Finding | Severity |
|---|---------|----------|
| 1 | All data is hardcoded mock data | **CRITICAL** |
| 2 | Supabase credentials exposed in code | **CRITICAL** |
| 3 | No actual database integration exists | HIGH |
| 4 | No authentication system | HIGH |
| 5 | No API layer for data operations | HIGH |
| 6 | No test coverage | MEDIUM |
| 7 | Thai fiscal year (B.E.) used | INFO |
| 8 | Data limited to 14 units (not full 13 districts × multiple units) | MEDIUM |

---

## 16. Dependencies Summary

### Production (29 total)
- React 18.3.1
- React Router DOM 6.30.1
- TanStack Query 5.83.0
- Supabase JS 2.90.1
- Recharts 2.15.4
- 30+ Radix UI primitives (via shadcn)

### Development
- Vite 5.4.19
- TypeScript 5.8.3
- Vitest 3.2.4
- ESLint 9.32.0

---

## 17. Recommendations for Rebuild

1. **Database Design:** MariaDB with proper relational schema for health units, KPIs, monthly reports
2. **Authentication:** Implement role-based access (admin, district manager, unit staff)
3. **Data Layer:** Migrate from mock data to actual API calls
4. **State Management:** Consider Zustand or Redux Toolkit for complex filter states
5. **Security:** Remove hardcoded credentials, use environment variables
6. **Testing:** Add component and integration tests
7. **Forms:** Add input validation with Zod or Yup
8. **Performance:** Implement data virtualization for large tables

---

**End of Audit Report**
