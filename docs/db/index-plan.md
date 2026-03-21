# Database Index Plan

## Overview

This document outlines the indexing strategy for the Ubon Health Insights MariaDB database.

## Indexing Principles

1. **Primary Keys**: Auto-increment unsigned integers for all tables
2. **Foreign Keys**: Indexed automatically when constraints are created
3. **Query Optimization**: Indexes on frequently filtered columns
4. **Composite Indexes**: For multi-column WHERE clauses
5. **Full-Text**: For text search functionality
6. **Covering Indexes**: Include columns needed for queries

---

## Table Index Summary

### dim_amphoe

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| PRIMARY | B-Tree | id | Row identification |
| uk_amphoe_code | UNIQUE | code | District code lookup |
| idx_amphoe_name | INDEX | name_th | District name search |

**Usage:**
```sql
-- Fast lookup by code
SELECT * FROM dim_amphoe WHERE code = '1006';

-- Name search
SELECT * FROM dim_amphoe WHERE name_th LIKE '%ม่วง%';
```

---

### dim_tambon

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| PRIMARY | B-Tree | id | Row identification |
| uk_tambon_code | UNIQUE | code | Subdistrict code lookup |
| idx_tambon_name | INDEX | name_th | Name search |
| idx_tambon_amphoe | INDEX | amphoe_id | District filter |
| fk_tambon_amphoe | FOREIGN KEY | amphoe_id → dim_amphoe(id) | Referential integrity |

**Usage:**
```sql
-- Get tambon by district
SELECT * FROM dim_tambon WHERE amphoe_id = 1;

-- Join with amphoe
SELECT t.*, a.name_th as amphoe 
FROM dim_tambon t
JOIN dim_amphoe a ON t.amphoe_id = a.id
WHERE a.code = '1006';
```

---

### kpi_categories

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| PRIMARY | B-Tree | id | Row identification |
| uk_category_code | UNIQUE | code | Category code lookup |
| idx_category_active | INDEX | is_active | Active filter |
| idx_category_order | INDEX | display_order | Sort order |

**Usage:**
```sql
-- Active categories
SELECT * FROM kpi_categories WHERE is_active = TRUE ORDER BY display_order;

-- By code
SELECT * FROM kpi_categories WHERE code = 'PPFS';
```

---

### kpi_definitions

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| PRIMARY | B-Tree | id | Row identification |
| uk_kpi_code | UNIQUE | code | KPI code lookup |
| idx_kpi_category | INDEX | category_id | Category filter |
| idx_kpi_active | INDEX | is_active | Active filter |
| idx_kpi_deleted | INDEX | is_deleted | Soft delete filter |
| idx_kpi_order | INDEX | display_order | Sort order |
| ft_kpi_name | FULLTEXT | name_th, name_en | Text search |
| fk_kpi_category | FOREIGN KEY | category_id → kpi_categories(id) | Referential integrity |

**Usage:**
```sql
-- KPIs by category
SELECT * FROM kpi_definitions 
WHERE category_id = 1 AND is_active = TRUE;

-- Search KPIs
SELECT * FROM kpi_definitions 
WHERE MATCH(name_th, name_en) AGAINST('ฝากครรภ์' IN NATURAL LANGUAGE MODE);

-- Code lookup
SELECT * FROM kpi_definitions WHERE code = 'PPFS-01';
```

---

### fiscal_periods

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| PRIMARY | B-Tree | id | Row identification |
| uk_fiscal_period | UNIQUE | fiscal_year, quarter, month | Period uniqueness |
| idx_fiscal_year | INDEX | fiscal_year | Year filter |
| idx_fiscal_quarter | INDEX | fiscal_year, quarter | Quarter filter |

**Usage:**
```sql
-- Specific period
SELECT * FROM fiscal_periods 
WHERE fiscal_year = 2567 AND quarter = 1;

-- Year range
SELECT * FROM fiscal_periods 
WHERE fiscal_year BETWEEN 2567 AND 2568;
```

---

### health_units

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| PRIMARY | B-Tree | id | Row identification |
| uk_unit_code | UNIQUE | code | Unit code lookup |
| idx_unit_amphoe | INDEX | amphoe_id | District filter |
| idx_unit_tambon | INDEX | tambon_id | Subdistrict filter |
| idx_unit_status | INDEX | status | Status filter |
| idx_unit_deleted | INDEX | is_deleted | Soft delete filter |
| ft_unit_name | FULLTEXT | name, short_name | Text search |
| fk_unit_amphoe | FOREIGN KEY | amphoe_id → dim_amphoe(id) | Referential integrity |
| fk_unit_tambon | FOREIGN KEY | tambon_id → dim_tambon(id) | Referential integrity |

**Usage:**
```sql
-- Units by district
SELECT * FROM health_units WHERE amphoe_id = 1 AND status = 'active';

-- Search units
SELECT * FROM health_units 
WHERE MATCH(name, short_name) AGAINST('บุ่งหวาย');

-- Code lookup (fast)
SELECT * FROM health_units WHERE code = '10601';
```

---

### users

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| PRIMARY | B-Tree | id | Row identification |
| uk_user_email | UNIQUE | email | Email lookup/login |
| idx_user_role | INDEX | role | Role filter |
| idx_user_unit | INDEX | health_unit_id | Unit association |
| idx_user_active | INDEX | is_active | Active filter |
| fk_user_unit | FOREIGN KEY | health_unit_id → health_units(id) | Referential integrity |

**Usage:**
```sql
-- Login lookup
SELECT * FROM users WHERE email = 'user@example.com' AND is_active = TRUE;

-- Users by unit
SELECT * FROM users WHERE health_unit_id = 1;

-- By role
SELECT * FROM users WHERE role = 'manager';
```

---

### kpi_results (Critical Performance Table)

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| PRIMARY | B-Tree | id | Row identification |
| uk_kpi_result | UNIQUE | kpi_id, health_unit_id, fiscal_period_id | Data uniqueness |
| idx_result_kpi | INDEX | kpi_id | KPI filter |
| idx_result_unit | INDEX | health_unit_id | Unit filter |
| idx_result_period | INDEX | fiscal_period_id | Period filter |
| idx_result_status | INDEX | review_status | Workflow status |
| idx_result_percentage | INDEX | percentage | Performance filter |
| idx_result_composite | INDEX | health_unit_id, fiscal_period_id | Combined lookup |
| fk_result_kpi | FOREIGN KEY | kpi_id → kpi_definitions(id) | Referential integrity |
| fk_result_unit | FOREIGN KEY | health_unit_id → health_units(id) | Referential integrity |
| fk_result_period | FOREIGN KEY | fiscal_period_id → fiscal_periods(id) | Referential integrity |
| fk_result_submitter | FOREIGN KEY | submitted_by → users(id) | Referential integrity |
| fk_result_reviewer | FOREIGN KEY | reviewed_by → users(id) | Referential integrity |

**Query Patterns:**

```sql
-- Dashboard query (uses idx_result_unit, idx_result_period)
SELECT kr.*, kd.name_th as kpi_name
FROM kpi_results kr
JOIN kpi_definitions kd ON kr.kpi_id = kd.id
WHERE kr.health_unit_id = 1 
  AND kr.fiscal_period_id IN (1, 2, 3);

-- Performance summary by category (uses idx_result_kpi, idx_result_status)
SELECT kc.name_th, AVG(kr.percentage)
FROM kpi_results kr
JOIN kpi_definitions kd ON kr.kpi_id = kd.id
JOIN kpi_categories kc ON kd.category_id = kc.id
WHERE kr.review_status = 'approved'
GROUP BY kc.id;

-- Critical performance (uses idx_result_percentage)
SELECT * FROM kpi_results 
WHERE percentage < 40 AND review_status = 'approved';
```

---

### finance_records

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| PRIMARY | B-Tree | id | Row identification |
| uk_finance_record | UNIQUE | health_unit_id, fiscal_period_id | Data uniqueness |
| idx_finance_unit | INDEX | health_unit_id | Unit filter |
| idx_finance_period | INDEX | fiscal_period_id | Period filter |
| idx_finance_composite | INDEX | health_unit_id, fiscal_period_id | Combined lookup |
| fk_finance_unit | FOREIGN KEY | health_unit_id → health_units(id) | Referential integrity |
| fk_finance_period | FOREIGN KEY | fiscal_period_id → fiscal_periods(id) | Referential integrity |
| fk_finance_submitter | FOREIGN KEY | submitted_by → users(id) | Referential integrity |

**Usage:**
```sql
-- Monthly finance report
SELECT * FROM finance_records 
WHERE health_unit_id = 1 AND fiscal_period_id BETWEEN 1 AND 12;

-- Balance calculation
SELECT SUM(income), SUM(expense), SUM(balance)
FROM finance_records
WHERE fiscal_period_id IN (SELECT id FROM fiscal_periods WHERE fiscal_year = 2567);
```

---

### health_unit_demographics

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| PRIMARY | B-Tree | id | Row identification |
| uk_demo | UNIQUE | health_unit_id, fiscal_period_id | Data uniqueness |
| idx_demo_unit | INDEX | health_unit_id | Unit filter |
| idx_demo_period | INDEX | fiscal_period_id | Period filter |
| fk_demo_unit | FOREIGN KEY | health_unit_id → health_units(id) | Referential integrity |
| fk_demo_period | FOREIGN KEY | fiscal_period_id → fiscal_periods(id) | Referential integrity |
| fk_demo_recorder | FOREIGN KEY | recorded_by → users(id) | Referential integrity |

**Usage:**
```sql
-- Population trend
SELECT fp.fiscal_year, fp.month_name_th, 
       SUM(hud.total_population)
FROM health_unit_demographics hud
JOIN fiscal_periods fp ON hud.fiscal_period_id = fp.id
GROUP BY fp.fiscal_year, fp.month_name_th;
```

---

### audit_logs

| Index Name | Type | Columns | Purpose |
|------------|------|---------|---------|
| PRIMARY | B-Tree | id | Row identification |
| idx_audit_table | INDEX | table_name | Table filter |
| idx_audit_record | INDEX | table_name, record_id | Record lookup |
| idx_audit_user | INDEX | changed_by | User filter |
| idx_audit_time | INDEX | changed_at | Time filter |
| idx_audit_action | INDEX | action | Action filter |
| fk_audit_user | FOREIGN KEY | changed_by → users(id) | Referential integrity |

**Usage:**
```sql
-- Audit trail for record
SELECT * FROM audit_logs 
WHERE table_name = 'kpi_results' AND record_id = '123'
ORDER BY changed_at DESC;

-- Recent changes by user
SELECT * FROM audit_logs 
WHERE changed_by = 1 AND changed_at > DATE_SUB(NOW(), INTERVAL 7 DAY);
```

---

## Performance Considerations

### Index Selectivity

| Table | Primary Index | Secondary Index Selectivity |
|-------|---------------|----------------------------|
| dim_amphoe | 13 rows | High (unique) |
| dim_tambon | ~200 rows | High (unique) |
| kpi_categories | 2-5 rows | High (unique) |
| kpi_definitions | ~100 rows | High (unique) |
| fiscal_periods | 60 rows | High (unique composite) |
| health_units | ~30 rows | High (unique) |
| users | ~50 rows | High (unique) |
| kpi_results | ~4,000 rows | Medium (period-based) |
| finance_records | ~6,000 rows | Medium (period-based) |

### Recommended Composite Indexes

For frequently joined queries, consider these composite indexes:

```sql
-- Dashboard: Unit + Period + Status
CREATE INDEX idx_result_dash 
ON kpi_results(health_unit_id, fiscal_period_id, review_status);

-- Report: Period + KPI
CREATE INDEX idx_result_report 
ON kpi_results(fiscal_period_id, kpi_id);

-- Finance: Unit + Period (covering index)
CREATE INDEX idx_finance_report 
ON finance_records(health_unit_id, fiscal_period_id, income, expense, balance);
```

### Index Maintenance

```sql
-- Analyze table statistics
ANALYZE TABLE kpi_results;
ANALYZE TABLE finance_records;

-- Check index usage
SELECT 
    table_name,
    index_name,
    cardinality
FROM information_schema.statistics
WHERE table_schema = 'ubon_health_insights'
ORDER BY table_name, index_name;

-- Rebuild fragmented indexes (rarely needed in MariaDB)
OPTIMIZE TABLE kpi_results;
OPTIMIZE TABLE finance_records;
```

### Query Optimization Tips

1. **Use EXPLAIN**: Check query execution plans
2. **Covering Indexes**: Include columns in index to avoid table lookups
3. **Index Hints**: Only when necessary: `USE INDEX (idx_name)`
4. **Avoid Wildcards**: Leading wildcards prevent index usage
5. **Update Statistics**: After bulk loads, run `ANALYZE TABLE`

---

## Migration Index Strategy

During data migration:

1. **Before Migration**: Drop non-essential indexes for faster INSERT
2. **Migration**: Keep PRIMARY KEY and UNIQUE constraints for data integrity
3. **After Migration**: Recreate all indexes with `ALTER TABLE ... ADD INDEX`
4. **Analyze**: Run `ANALYZE TABLE` for query optimizer

```sql
-- Example: Temporarily disable indexes for bulk load
ALTER TABLE kpi_results DISABLE KEYS;
-- ... bulk insert ...
ALTER TABLE kpi_results ENABLE KEYS;
ANALYZE TABLE kpi_results;
```
