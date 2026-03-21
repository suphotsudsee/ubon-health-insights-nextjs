# Table Mapping: Legacy to New Schema

## Mapping Overview

This document maps the legacy mock data structures to the new normalized MariaDB schema.

---

## Legacy Data Sources

The legacy application (`ubon-health-insights`) uses mock TypeScript data defined in `src/data/mockData.ts`:

### Legacy Interfaces

| Legacy Interface | Type | Description | Maps To |
|-----------------|------|-------------|---------|
| `HealthUnit` | Entity | Health service units | `health_units` + `dim_amphoe` |
| `KPIMaster` | Reference | KPI definitions | `kpi_definitions` + `kpi_categories` |
| `FinanceData` | Transaction | Financial records | `finance_records` |
| `KPIResult` | Transaction | KPI performance data | `kpi_results` |

---

## Detailed Mappings

### 1. HealthUnit → health_units + dim_amphoe

#### Legacy Structure (TypeScript)
```typescript
interface HealthUnit {
  id: string;              // "1", "2", ...
  code: string;            // "10601", "10602", ...
  name: string;            // "รพ.สต.บุ่งหวาย"
  moo: string;             // "1"
  tambon: string;          // "บุ่งหวาย"
  amphoe: string;          // "ม่วงสามสิบ"
  affiliation: string;     // "อบจ.อุบลราชธานี"
  male: number;            // 1250
  female: number;          // 1320
  totalPopulation: number; // 2570
  villages: number;        // 8
  households: number;      // 650
  healthVolunteers: number;// 45
  email: string;           // "bungwai@example.com"
}
```

#### New Schema Mapping

**dim_amphoe (Reference Table)**
| Legacy Data | New Column | Transform |
|-------------|------------|-----------|
| `amphoe` (distinct values) | `name_th` | Direct mapping |
| - | `code` | Generated: "10" + district sequence |
| - | `id` | Auto-increment |

**health_units (Entity Table)**
| Legacy Field | New Column | Transform | Notes |
|--------------|------------|-----------|-------|
| `id` | - | Not migrated | New auto-increment ID |
| `code` | `code` | Direct | Keep as VARCHAR(20) |
| `name` | `name` | Direct | Full name "รพ.สต.xxx" |
| - | `short_name` | Derived | Extract "บุ่งหวาย" from name |
| `amphoe` | `amphoe_id` | Lookup | FK to dim_amphoe.id |
| `tambon` | `tambon_id` | Lookup | FK to dim_tambon.id |
| `moo` | `moo` | Direct | VARCHAR(10) |
| `affiliation` | `affiliation` | Direct | Default "อบจ.อุบลราชธานี" |
| `email` | `email` | Direct | VARCHAR(255) |
| - | `phone` | New | NULL initially |
| - | `status` | Default | 'active' |

**Demographic Data Decision:**

Fields `male`, `female`, `totalPopulation`, `villages`, `households`, `healthVolunteers` from legacy are **SNAPSHOT DATA** that should be tracked over time.

**Recommendation:**
Create a separate `health_unit_demographics` table for time-series demographic data:

```sql
CREATE TABLE health_unit_demographics (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    health_unit_id MEDIUMINT UNSIGNED NOT NULL,
    fiscal_period_id SMALLINT UNSIGNED NOT NULL,
    male INT UNSIGNED,
    female INT UNSIGNED,
    total_population INT UNSIGNED,
    villages INT UNSIGNED,
    households INT UNSIGNED,
    health_volunteers INT UNSIGNED,
    recorded_by MEDIUMINT UNSIGNED,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (health_unit_id) REFERENCES health_units(id),
    FOREIGN KEY (fiscal_period_id) REFERENCES fiscal_periods(id),
    UNIQUE KEY uk_demo (health_unit_id, fiscal_period_id)
);
```

---

### 2. KPIMaster → kpi_categories + kpi_definitions

#### Legacy Structure (TypeScript)
```typescript
interface KPIMaster {
  id: string;              // "1", "2", ...
  code: string;            // "PPFS-01", "TTM-01", ...
  name: string;            // "ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์"
  category: string;        // "PPFS", "แพทย์แผนไทย"
  targetPercent: number;   // 80, 75, etc.
  reportLink?: string;     // Optional URL
}
```

#### New Schema Mapping

**kpi_categories (Reference)**
| Legacy Data | New Column | Transform |
|-------------|------------|-----------|
| Distinct `category` values | `code` | "PPFS" → "PPFS", "แพทย์แผนไทย" → "TTM" |
| - | `name_th` | Full name |
| - | `name_en` | Translation |
| - | `color_code` | UI colors |

**kpi_definitions (Master)**
| Legacy Field | New Column | Transform | Notes |
|--------------|------------|-----------|-------|
| `id` | - | Not migrated | New auto-increment ID |
| `code` | `code` | Direct | PPFS-01, etc. |
| `name` | `name_th` | Direct | Thai name |
| - | `name_en` | New | English translation |
| `category` | `category_id` | Lookup | FK to kpi_categories.id |
| `targetPercent` | `target_value` | Store | As DECIMAL |
| `targetPercent` | `target_type` | Infer | 'min' (achieve ≥ target) |
| - | `unit` | Default | '%' for percentages |
| `reportLink` | `report_link` | Direct | Keep URL |
| - | `description` | New | NULL |
| - | `calculation_formula` | New | NULL |
| - | `data_source` | New | NULL |

#### Category Mapping

| Legacy Category | New Code | New Name (TH) | New Name (EN) |
|-----------------|----------|---------------|---------------|
| "PPFS" | "PPFS" | "การฝากครรภ์ หลังคลอด วางแผนครอบครัว และคัดกรอง" | "Pregnancy, Post-partum, Family Planning & Screening" |
| "แพทย์แผนไทย" | "TTM" | "แพทย์แผนไทย" | "Traditional Thai Medicine" |

#### KPI Mapping Sample

| Legacy Code | Legacy Name | Category | Target % |
|-------------|-------------|----------|----------|
| PPFS-01 | ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์ | PPFS | 80 |
| PPFS-02 | ร้อยละหญิงฝากครรภ์ครบ 5 ครั้งตามเกณฑ์ | PPFS | 75 |
| PPFS-03 | ร้อยละเด็กแรกเกิดน้ำหนักต่ำกว่า 2,500 กรัม | PPFS | 7 |
| PPFS-04 | ร้อยละเด็กได้รับนมแม่อย่างน้อย 6 เดือน | PPFS | 50 |
| TTM-01 | อัตราการใช้ยาสมุนไพร | TTM | 25 |
| TTM-02 | ร้อยละผู้ป่วยได้รับบริการนวดไทย | TTM | 20 |
| TTM-03 | ร้อยละผู้ป่วยได้รับบริการอบสมุนไพร | TTM | 15 |
| TTM-04 | ร้อยละผู้ป่วยได้รับบริการประคบสมุนไพร | TTM | 18 |

---

### 3. KPIResult → kpi_results

#### Legacy Structure (TypeScript)
```typescript
interface KPIResult {
  id: string;              // "1", "2", ...
  fiscalYear: number;      // 2567
  quarter: number;           // 1, 2, 3, 4
  unitCode: string;        // "10601"
  unitName: string;        // "รพ.สต.บุ่งหวาย"
  amphoe: string;          // "ม่วงสามสิบ"
  kpiCode: string;         // "PPFS-01"
  kpiName: string;         // "ร้อยละหญิงฝากครรภ์..."
  category: string;        // "PPFS"
  target: number;          // 20
  actual: number;          // 18
  percentage: number;      // 90
}
```

#### New Schema Mapping

**kpi_results (Transaction)**
| Legacy Field | New Column | Transform | Notes |
|--------------|------------|-----------|-------|
| `id` | - | Not migrated | New auto-increment ID |
| - | `kpi_id` | Lookup | FK to kpi_definitions.id via kpiCode |
| - | `health_unit_id` | Lookup | FK to health_units.id via unitCode |
| - | `fiscal_period_id` | Lookup | Derived from fiscalYear + quarter |
| `target` | `target_value` | Direct | As DECIMAL(15,2) |
| `actual` | `actual_value` | Direct | As DECIMAL(15,2) |
| `percentage` | `percentage` | Direct | As DECIMAL(5,2) |
| - | `notes` | New | NULL |
| - | `evidence_url` | New | NULL |
| - | `submitted_by` | Default | NULL (system entry) |
| - | `submitted_at` | Default | CURRENT_TIMESTAMP |
| - | `reviewed_by` | Default | NULL |
| - | `reviewed_at` | Default | NULL |
| - | `review_status` | Default | 'approved' (migrated data) |

**Lookup Strategy:**

```typescript
// Pseudocode for migration
function migrateKPIResult(legacy: KPIResult): NewKPIResult {
    const kpi_id = lookupKPIByCode(legacy.kpiCode);
    const health_unit_id = lookupUnitByCode(legacy.unitCode);
    const fiscal_period_id = lookupFiscalPeriod(
        legacy.fiscalYear, 
        legacy.quarter
    );
    
    return {
        kpi_id,
        health_unit_id,
        fiscal_period_id,
        target_value: legacy.target,
        actual_value: legacy.actual,
        percentage: legacy.percentage,
        review_status: 'approved'
    };
}
```

---

### 4. FinanceData → finance_records

#### Legacy Structure (TypeScript)
```typescript
interface FinanceData {
  id: string;              // "1", "2", ...
  fiscalYear: number;      // 2567
  month: string;           // "ตุลาคม", "พฤศจิกายน", ...
  unitCode: string;        // "10601"
  unitName: string;        // "รพ.สต.บุ่งหวาย"
  income: number;          // 150000
  expense: number;         // 120000
  balance: number;         // 30000
  recorder: string;        // "bungwai@example.com"
}
```

#### New Schema Mapping

**finance_records (Transaction)**
| Legacy Field | New Column | Transform | Notes |
|--------------|------------|-----------|-------|
| `id` | - | Not migrated | New auto-increment ID |
| - | `health_unit_id` | Lookup | FK via unitCode |
| - | `fiscal_period_id` | Lookup | Derived from fiscalYear + month |
| `income` | `income` | Direct | DECIMAL(15,2) |
| `expense` | `expense` | Direct | DECIMAL(15,2) |
| `balance` | `balance` | Validate | Should = income - expense |
| - | `income_breakdown` | New | JSON NULL |
| - | `expense_breakdown` | New | JSON NULL |
| - | `notes` | New | NULL |
| `recorder` | `recorder` | Direct | VARCHAR(100) |
| - | `submitted_by` | Lookup | FK to users.id via recorder email |
| - | `submitted_at` | Default | CURRENT_TIMESTAMP |

**Month to Fiscal Period Mapping:**

| Month (TH) | Month (EN) | Month Number | Quarter |
|------------|------------|--------------|---------|
| ตุลาคม | October | 10 | Q1 |
| พฤศจิกายน | November | 11 | Q1 |
| ธันวาคม | December | 12 | Q1 |
| มกราคม | January | 1 | Q2 |
| กุมภาพันธ์ | February | 2 | Q2 |
| มีนาคม | March | 3 | Q2 |
| เมษายน | April | 4 | Q3 |
| พฤษภาคม | May | 5 | Q3 |
| มิถุนายน | June | 6 | Q3 |
| กรกฎาคม | July | 7 | Q4 |
| สิงหาคม | August | 8 | Q4 |
| กันยายน | September | 9 | Q4 |

---

## Data Volume Estimates

### Legacy Data Count

| Entity | Legacy Count | Expected Growth |
|--------|--------------|-----------------|
| Health Units | 14 | ~20-30 over 5 years |
| KPI Categories | 2 | Stable (2-5) |
| KPI Definitions | 8 | ~50-100 over 5 years |
| KPI Results (per year) | ~112 | ~800/year (8 KPIs × 100 units) |
| Finance Records (per year) | ~168 | ~1,200/year (12 months × 100 units) |

### Projected Size (5 years)

| Table | Row Count | Est. Size |
|-------|-----------|-----------|
| health_units | 30 | < 1 MB |
| dim_amphoe | 13 | < 1 MB |
| dim_tambon | ~200 | < 1 MB |
| kpi_categories | 5 | < 1 MB |
| kpi_definitions | 100 | < 1 MB |
| fiscal_periods | 60 | < 1 MB |
| **kpi_results** | **4,000** | **~2 MB** |
| **finance_records** | **6,000** | **~3 MB** |
| users | 50 | < 1 MB |
| audit_logs | 50,000 | ~20 MB |
| **TOTAL** | | **~30 MB** |

---

## Migration Priority

### Phase 1: Reference Data (Required First)
1. `dim_amphoe` - 13 rows
2. `dim_tambon` - ~200 rows
3. `kpi_categories` - 2 rows
4. `kpi_definitions` - 8 rows
5. `fiscal_periods` - Seed for current + 2 years

### Phase 2: Core Entities
6. `health_units` - 14 rows
7. `users` - Create admin + sample users

### Phase 3: Transactional Data
8. `kpi_results` - ~112 rows
9. `finance_records` - ~168 rows
10. `health_unit_demographics` - Optional

### Phase 4: Audit
11. Enable audit logging triggers

---

## Validation Queries

### Verify Migration Complete

```sql
-- Check all reference data loaded
SELECT 'dim_amphoe' as table_name, COUNT(*) as count FROM dim_amphoe
UNION ALL
SELECT 'dim_tambon', COUNT(*) FROM dim_tambon
UNION ALL
SELECT 'kpi_categories', COUNT(*) FROM kpi_categories
UNION ALL
SELECT 'kpi_definitions', COUNT(*) FROM kpi_definitions
UNION ALL
SELECT 'fiscal_periods', COUNT(*) FROM fiscal_periods
UNION ALL
SELECT 'health_units', COUNT(*) FROM health_units;

-- Check transactional data
SELECT 
    (SELECT COUNT(*) FROM kpi_results) as kpi_results_count,
    (SELECT COUNT(*) FROM finance_records) as finance_records_count;

-- Verify referential integrity
SELECT 'orphaned kpi_results' as check_type, COUNT(*) 
FROM kpi_results kr
LEFT JOIN kpi_definitions kd ON kr.kpi_id = kd.id
WHERE kd.id IS NULL;
```

---

## Rollback Strategy

### Before Migration
```sql
-- Backup existing tables (if any)
mysqldump -u user -p ubon_health_insights > backup_pre_migration.sql
```

### After Migration (Validation Failed)
```sql
-- If validation fails, restore from backup
mysql -u user -p ubon_health_insights < backup_pre_migration.sql
```

### Soft Rollback (Keep Data)
```sql
-- Mark migrated data as draft for review
UPDATE kpi_results SET review_status = 'draft' WHERE submitted_at > NOW() - INTERVAL 1 DAY;
UPDATE finance_records SET submitted_by = NULL WHERE submitted_at > NOW() - INTERVAL 1 DAY;
```
