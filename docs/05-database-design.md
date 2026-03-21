# Database Design Document

## Overview

This document defines the MariaDB database schema for **Ubon Health Insights** - a health service unit performance tracking system for รพ.สต. (Sub-district Health Promoting Hospitals) under อบจ.อุบลราชธานี (Ubon Ratchathani Provincial Administrative Organization).

## Database Specifications

| Attribute | Value |
|-----------|-------|
| Database Engine | MariaDB 10.11+ |
| Character Set | utf8mb4_unicode_ci |
| ORM | Prisma |
| Schema Version | 1.0.0 |

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   dim_amphoe    │────<│  health_units   │>────│   dim_tambon    │
│   (Districts)   │     │ (Health Units)  │     │  (Subdistricts) │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
           ▼                     ▼                     ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  kpi_results    │     │ finance_records │     │    users        │
│  (KPI Data)     │     │  (Financial)    │     │ (Accounts)      │
└────────┬────────┘     └─────────────────┘     └─────────────────┘
         │
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│kpi_definitions  │>────│kpi_categories   │
│  (KPI Master)   │     │  (Categories)   │
└─────────────────┘     └─────────────────┘
         ▲
         │
┌─────────────────┐
│ fiscal_periods  │
│ (Time Dimension)│
└─────────────────┘
```

## Table Definitions

### 1. dim_amphoe (Districts Reference)

Reference table for Thailand's amphoe (districts) in Ubon Ratchathani province.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SMALLINT UNSIGNED | PK, AUTO_INCREMENT | Surrogate key |
| code | VARCHAR(10) | UNIQUE, NOT NULL | Administrative code |
| name_th | VARCHAR(100) | NOT NULL | District name (Thai) |
| name_en | VARCHAR(100) | NULL | District name (English) |
| region | VARCHAR(50) | NULL | Geographic region |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | ON UPDATE | Last modification |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY uk_amphoe_code (code)
- INDEX idx_amphoe_name (name_th)

**Data (13 districts):**
- ม่วงสามสิบ, นาจะหลวย, วารินชำราบ, เดชอุดม, ตระการพืชผล, เขื่องใน, พิบูลมังสาหาร, สำโรง, น้ำยืน, บุณฑริก, โขงเจียม, ศรีเมืองใหม่, สว่างวีระวงศ์

---

### 2. dim_tambon (Subdistricts Reference)

Reference table for tambon (subdistricts).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | MEDIUMINT UNSIGNED | PK, AUTO_INCREMENT | Surrogate key |
| amphoe_id | SMALLINT UNSIGNED | FK → dim_amphoe.id | Parent district |
| code | VARCHAR(10) | UNIQUE, NOT NULL | Administrative code |
| name_th | VARCHAR(100) | NOT NULL | Subdistrict name (Thai) |
| name_en | VARCHAR(100) | NULL | Subdistrict name (English) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | ON UPDATE | Last modification |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY uk_tambon_code (code)
- INDEX idx_tambon_name (name_th)
- INDEX idx_tambon_amphoe (amphoe_id)

---

### 3. health_units (Health Service Units)

Core entity representing รพ.สต. (Sub-district Health Promoting Hospitals).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | MEDIUMINT UNSIGNED | PK, AUTO_INCREMENT | Surrogate key |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Unit code (e.g., "10601") |
| name | VARCHAR(200) | NOT NULL | Unit name |
| short_name | VARCHAR(100) | NULL | Abbreviated name |
| amphoe_id | SMALLINT UNSIGNED | FK → dim_amphoe.id | District |
| tambon_id | MEDIUMINT UNSIGNED | FK → dim_tambon.id | Subdistrict |
| moo | VARCHAR(10) | NULL | Village number |
| affiliation | VARCHAR(100) | NULL | Affiliation (e.g., "อบจ.อุบลราชธานี") |
| email | VARCHAR(255) | NULL | Contact email |
| phone | VARCHAR(20) | NULL | Contact phone |
| status | ENUM('active','inactive') | DEFAULT 'active' | Unit status |
| is_deleted | BOOLEAN | DEFAULT FALSE | Soft delete flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | ON UPDATE | Last modification |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY uk_unit_code (code)
- INDEX idx_unit_amphoe (amphoe_id)
- INDEX idx_unit_tambon (tambon_id)
- INDEX idx_unit_status (status)
- INDEX idx_unit_deleted (is_deleted)
- FULLTEXT INDEX ft_unit_name (name, short_name)

---

### 4. kpi_categories (KPI Categories)

Categorization for KPIs (e.g., PPFS, TTM).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TINYINT UNSIGNED | PK, AUTO_INCREMENT | Surrogate key |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Category code (e.g., "PPFS") |
| name_th | VARCHAR(100) | NOT NULL | Category name (Thai) |
| name_en | VARCHAR(100) | NULL | Category name (English) |
| description | TEXT | NULL | Description |
| display_order | TINYINT UNSIGNED | DEFAULT 0 | Sort order |
| color_code | VARCHAR(7) | NULL | UI color (hex) |
| is_active | BOOLEAN | DEFAULT TRUE | Active flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | ON UPDATE | Last modification |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY uk_category_code (code)
- INDEX idx_category_active (is_active)
- INDEX idx_category_order (display_order)

**Initial Data:**
- PPFS: Pregnancy, Post-partum, Family Planning & Screening
- TTM: Traditional Thai Medicine

---

### 5. kpi_definitions (KPI Master Definitions)

Master definitions for all Key Performance Indicators.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SMALLINT UNSIGNED | PK, AUTO_INCREMENT | Surrogate key |
| category_id | TINYINT UNSIGNED | FK → kpi_categories.id | Category |
| code | VARCHAR(20) | UNIQUE, NOT NULL | KPI code (e.g., "PPFS-01") |
| name_th | VARCHAR(200) | NOT NULL | KPI name (Thai) |
| name_en | VARCHAR(200) | NULL | KPI name (English) |
| description | TEXT | NULL | Detailed description |
| unit | VARCHAR(50) | DEFAULT '%' | Measurement unit |
| target_value | DECIMAL(10,2) | NULL | Target value |
| target_type | ENUM('min','max','exact') | DEFAULT 'min' | Target direction |
| calculation_formula | TEXT | NULL | How to calculate |
| data_source | VARCHAR(200) | NULL | Data source reference |
| report_link | VARCHAR(500) | NULL | External report URL |
| display_order | SMALLINT UNSIGNED | DEFAULT 0 | Sort order |
| is_active | BOOLEAN | DEFAULT TRUE | Active flag |
| is_deleted | BOOLEAN | DEFAULT FALSE | Soft delete flag |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | ON UPDATE | Last modification |
| deleted_at | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY uk_kpi_code (code)
- INDEX idx_kpi_category (category_id)
- INDEX idx_kpi_active (is_active)
- INDEX idx_kpi_deleted (is_deleted)
- INDEX idx_kpi_order (display_order)
- FULLTEXT INDEX ft_kpi_name (name_th, name_en)

---

### 6. fiscal_periods (Fiscal Periods)

Time dimension for fiscal year reporting (Thai fiscal year: Oct - Sep).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SMALLINT UNSIGNED | PK, AUTO_INCREMENT | Surrogate key |
| fiscal_year | SMALLINT UNSIGNED | NOT NULL | Buddhist year (e.g., 2567) |
| quarter | TINYINT UNSIGNED | NOT NULL | Quarter (1-4) |
| month | TINYINT UNSIGNED | NOT NULL | Month (1-12) |
| month_name_th | VARCHAR(20) | NOT NULL | Month name (Thai) |
| start_date | DATE | NOT NULL | Period start |
| end_date | DATE | NOT NULL | Period end |
| is_closed | BOOLEAN | DEFAULT FALSE | Closed for edits |
| closed_at | TIMESTAMP | NULL | Close timestamp |
| closed_by | MEDIUMINT UNSIGNED | NULL | Who closed it |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY uk_fiscal_period (fiscal_year, quarter, month)
- INDEX idx_fiscal_year (fiscal_year)
- INDEX idx_fiscal_quarter (fiscal_year, quarter)

---

### 7. kpi_results (KPI Results - Fact Table)

Transactional table for KPI performance data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Surrogate key |
| kpi_id | SMALLINT UNSIGNED | FK → kpi_definitions.id | KPI definition |
| health_unit_id | MEDIUMINT UNSIGNED | FK → health_units.id | Reporting unit |
| fiscal_period_id | SMALLINT UNSIGNED | FK → fiscal_periods.id | Time period |
| target_value | DECIMAL(15,2) | NOT NULL | Target value |
| actual_value | DECIMAL(15,2) | NOT NULL | Actual achieved |
| percentage | DECIMAL(5,2) | NOT NULL | Performance % |
| notes | TEXT | NULL | Additional notes |
| evidence_url | VARCHAR(500) | NULL | Supporting document |
| submitted_by | MEDIUMINT UNSIGNED | NULL | FK → users.id |
| submitted_at | TIMESTAMP | NULL | Submission time |
| reviewed_by | MEDIUMINT UNSIGNED | NULL | FK → users.id |
| reviewed_at | TIMESTAMP | NULL | Review timestamp |
| review_status | ENUM('draft','submitted','approved','rejected') | DEFAULT 'draft' | Workflow status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | ON UPDATE | Last modification |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY uk_kpi_result (kpi_id, health_unit_id, fiscal_period_id)
- INDEX idx_result_kpi (kpi_id)
- INDEX idx_result_unit (health_unit_id)
- INDEX idx_result_period (fiscal_period_id)
- INDEX idx_result_status (review_status)
- INDEX idx_result_percentage (percentage)
- INDEX idx_result_composite (health_unit_id, fiscal_period_id)

---

### 8. finance_records (Financial Records)

Monthly financial data for each health unit.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT UNSIGNED | PK, AUTO_INCREMENT | Surrogate key |
| health_unit_id | MEDIUMINT UNSIGNED | FK → health_units.id | Reporting unit |
| fiscal_period_id | SMALLINT UNSIGNED | FK → fiscal_periods.id | Time period |
| income | DECIMAL(15,2) | NOT NULL | Total income |
| expense | DECIMAL(15,2) | NOT NULL | Total expense |
| balance | DECIMAL(15,2) | NOT NULL | Calculated balance |
| income_breakdown | JSON | NULL | Detailed income categories |
| expense_breakdown | JSON | NULL | Detailed expense categories |
| notes | TEXT | NULL | Additional notes |
| recorder | VARCHAR(100) | NULL | Person recording data |
| submitted_by | MEDIUMINT UNSIGNED | NULL | FK → users.id |
| submitted_at | TIMESTAMP | NULL | Submission time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | ON UPDATE | Last modification |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY uk_finance_record (health_unit_id, fiscal_period_id)
- INDEX idx_finance_unit (health_unit_id)
- INDEX idx_finance_period (fiscal_period_id)
- INDEX idx_finance_composite (health_unit_id, fiscal_period_id)

---

### 9. users (User Accounts)

System users for authentication and audit.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | MEDIUMINT UNSIGNED | PK, AUTO_INCREMENT | Surrogate key |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Login email |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| name | VARCHAR(100) | NOT NULL | Full name |
| role | ENUM('admin','manager','staff','viewer') | DEFAULT 'viewer' | User role |
| health_unit_id | MEDIUMINT UNSIGNED | FK → health_units.id | Associated unit (optional) |
| is_active | BOOLEAN | DEFAULT TRUE | Active flag |
| last_login | TIMESTAMP | NULL | Last login time |
| login_attempts | TINYINT UNSIGNED | DEFAULT 0 | Failed login count |
| locked_until | TIMESTAMP | NULL | Account lock expiry |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | ON UPDATE | Last modification |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY uk_user_email (email)
- INDEX idx_user_role (role)
- INDEX idx_user_unit (health_unit_id)
- INDEX idx_user_active (is_active)

---

### 10. audit_logs (Audit Trail)

Change tracking for compliance and debugging.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Surrogate key |
| table_name | VARCHAR(50) | NOT NULL | Affected table |
| record_id | VARCHAR(50) | NOT NULL | Affected record ID |
| action | ENUM('INSERT','UPDATE','DELETE') | NOT NULL | Operation type |
| old_values | JSON | NULL | Previous values |
| new_values | JSON | NULL | New values |
| changed_by | MEDIUMINT UNSIGNED | FK → users.id | Who made change |
| changed_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | When changed |
| ip_address | VARCHAR(45) | NULL | Client IP |
| user_agent | VARCHAR(500) | NULL | Browser info |

**Indexes:**
- PRIMARY KEY (id)
- INDEX idx_audit_table (table_name)
- INDEX idx_audit_record (table_name, record_id)
- INDEX idx_audit_user (changed_by)
- INDEX idx_audit_time (changed_at)
- INDEX idx_audit_action (action)

---

## Constraints Summary

### Foreign Key Relationships

| Table | Column | References | On Delete | On Update |
|-------|--------|------------|-----------|-----------|
| health_units | amphoe_id | dim_amphoe(id) | RESTRICT | CASCADE |
| health_units | tambon_id | dim_tambon(id) | RESTRICT | CASCADE |
| dim_tambon | amphoe_id | dim_amphoe(id) | RESTRICT | CASCADE |
| kpi_definitions | category_id | kpi_categories(id) | RESTRICT | CASCADE |
| kpi_results | kpi_id | kpi_definitions(id) | RESTRICT | CASCADE |
| kpi_results | health_unit_id | health_units(id) | RESTRICT | CASCADE |
| kpi_results | fiscal_period_id | fiscal_periods(id) | RESTRICT | CASCADE |
| kpi_results | submitted_by | users(id) | SET NULL | CASCADE |
| kpi_results | reviewed_by | users(id) | SET NULL | CASCADE |
| finance_records | health_unit_id | health_units(id) | RESTRICT | CASCADE |
| finance_records | fiscal_period_id | fiscal_periods(id) | RESTRICT | CASCADE |
| finance_records | submitted_by | users(id) | SET NULL | CASCADE |
| users | health_unit_id | health_units(id) | SET NULL | CASCADE |
| audit_logs | changed_by | users(id) | SET NULL | CASCADE |

---

## Partitioning Strategy

### kpi_results Table

Recommended partitioning by fiscal year for performance:

```sql
PARTITION BY RANGE COLUMNS(fiscal_period_id) (
    PARTITION p2024 VALUES LESS THAN (100),
    PARTITION p2025 VALUES LESS THAN (200),
    PARTITION p2026 VALUES LESS THAN (300),
    PARTITION pfuture VALUES LESS THAN MAXVALUE
);
```

### finance_records Table

Same partitioning strategy as kpi_results.

---

## Views for Common Queries

### vw_health_unit_summary

Summary view combining unit info with latest KPI and finance data.

```sql
CREATE VIEW vw_health_unit_summary AS
SELECT 
    hu.id,
    hu.code,
    hu.name,
    hu.short_name,
    a.name_th as amphoe,
    t.name_th as tambon,
    hu.moo,
    hu.status
FROM health_units hu
LEFT JOIN dim_amphoe a ON hu.amphoe_id = a.id
LEFT JOIN dim_tambon t ON hu.tambon_id = t.id
WHERE hu.is_deleted = FALSE;
```

### vw_kpi_performance_latest

Latest KPI performance across all units.

```sql
CREATE VIEW vw_kpi_performance_latest AS
SELECT 
    kr.id,
    kd.code as kpi_code,
    kd.name_th as kpi_name,
    kc.name_th as category,
    hu.name as unit_name,
    a.name_th as amphoe,
    fp.fiscal_year,
    fp.quarter,
    kr.target_value,
    kr.actual_value,
    kr.percentage,
    kr.review_status
FROM kpi_results kr
JOIN kpi_definitions kd ON kr.kpi_id = kd.id
JOIN kpi_categories kc ON kd.category_id = kc.id
JOIN health_units hu ON kr.health_unit_id = hu.id
JOIN dim_amphoe a ON hu.amphoe_id = a.id
JOIN fiscal_periods fp ON kr.fiscal_period_id = fp.id
WHERE kr.review_status = 'approved';
```

### vw_finance_summary

Financial summary with running totals.

```sql
CREATE VIEW vw_finance_summary AS
SELECT 
    fr.id,
    hu.code as unit_code,
    hu.name as unit_name,
    a.name_th as amphoe,
    fp.fiscal_year,
    fp.month_name_th as month,
    fr.income,
    fr.expense,
    fr.balance,
    fr.recorder
FROM finance_records fr
JOIN health_units hu ON fr.health_unit_id = hu.id
JOIN dim_amphoe a ON hu.amphoe_id = a.id
JOIN fiscal_periods fp ON fr.fiscal_period_id = fp.id;
```

---

## Stored Procedures

### sp_calculate_kpi_percentage

Calculate percentage achievement for a KPI result.

```sql
DELIMITER $$
CREATE PROCEDURE sp_calculate_kpi_percentage(
    IN p_kpi_id SMALLINT UNSIGNED,
    IN p_target DECIMAL(15,2),
    IN p_actual DECIMAL(15,2),
    OUT p_percentage DECIMAL(5,2)
)
BEGIN
    DECLARE v_target_type ENUM('min','max','exact');
    
    SELECT target_type INTO v_target_type 
    FROM kpi_definitions WHERE id = p_kpi_id;
    
    CASE v_target_type
        WHEN 'min' THEN SET p_percentage = ROUND((p_actual / p_target) * 100, 2);
        WHEN 'max' THEN SET p_percentage = ROUND((1 - (p_actual / p_target)) * 100, 2);
        WHEN 'exact' THEN SET p_percentage = ROUND((1 - ABS(p_actual - p_target) / p_target) * 100, 2);
    END CASE;
    
    IF p_percentage > 100 THEN SET p_percentage = 100;
    ELSEIF p_percentage < 0 THEN SET p_percentage = 0;
    END IF;
END$$
DELIMITER ;
```

---

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Tables | lowercase, plural, descriptive | `health_units`, `kpi_results` |
| Views | lowercase, vw_ prefix | `vw_health_unit_summary` |
| Columns | lowercase, snake_case | `target_value`, `created_at` |
| Primary Keys | id | `id` |
| Foreign Keys | {table}_id | `health_unit_id`, `kpi_id` |
| Indexes | idx_{table}_{column} | `idx_kpi_category` |
| Unique Constraints | uk_{table}_{column} | `uk_kpi_code` |

---

## Assumptions

1. **Fiscal Year**: Thai fiscal year starts October 1 (month 10) and ends September 30 (month 9)
2. **Currency**: All monetary values stored in Thai Baht (THB)
3. **Language**: Primary data in Thai, English fields optional
4. **Time Zone**: Asia/Bangkok (UTC+7)
5. **Soft Deletes**: All main entities support soft delete via `is_deleted` flag
6. **Audit Trail**: All changes tracked in `audit_logs` table
7. **13 Districts**: Fixed reference data for Ubon Ratchathani's 13 districts
8. **KPI Categories**: PPFS and TTM as initial categories, extensible
