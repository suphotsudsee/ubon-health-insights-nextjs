-- ============================================================
-- UBON HEALTH INSIGHTS - MariaDB Schema
-- Database: ubon_health_insights
-- Version: 1.0.0
-- Generated: 2025-03-21
-- ============================================================

-- Drop database if exists (for clean deployment)
-- DROP DATABASE IF EXISTS ubon_health_insights;

-- Create database with UTF-8 support
CREATE DATABASE IF NOT EXISTS ubon_health_insights
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE ubon_health_insights;

-- ============================================================
-- REFERENCE TABLES
-- ============================================================

-- Districts reference table
CREATE TABLE IF NOT EXISTS dim_amphoe (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL COMMENT 'Administrative district code',
    name_th VARCHAR(100) NOT NULL COMMENT 'District name in Thai',
    name_en VARCHAR(100) DEFAULT NULL COMMENT 'District name in English',
    region VARCHAR(50) DEFAULT NULL COMMENT 'Geographic region',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_amphoe_code (code),
    INDEX idx_amphoe_name (name_th)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Reference table for districts (amphoe) in Ubon Ratchathani';

-- Subdistricts reference table
CREATE TABLE IF NOT EXISTS dim_tambon (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    amphoe_id SMALLINT UNSIGNED NOT NULL COMMENT 'Parent district FK',
    code VARCHAR(10) NOT NULL COMMENT 'Administrative subdistrict code',
    name_th VARCHAR(100) NOT NULL COMMENT 'Subdistrict name in Thai',
    name_en VARCHAR(100) DEFAULT NULL COMMENT 'Subdistrict name in English',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_tambon_code (code),
    INDEX idx_tambon_name (name_th),
    INDEX idx_tambon_amphoe (amphoe_id),
    CONSTRAINT fk_tambon_amphoe FOREIGN KEY (amphoe_id) 
        REFERENCES dim_amphoe(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Reference table for subdistricts (tambon)';

-- KPI categories
CREATE TABLE IF NOT EXISTS kpi_categories (
    id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL COMMENT 'Category code (e.g., PPFS, TTM)',
    name_th VARCHAR(100) NOT NULL COMMENT 'Category name in Thai',
    name_en VARCHAR(100) DEFAULT NULL COMMENT 'Category name in English',
    description TEXT DEFAULT NULL COMMENT 'Detailed description',
    display_order TINYINT UNSIGNED DEFAULT 0 COMMENT 'UI sort order',
    color_code VARCHAR(7) DEFAULT NULL COMMENT 'UI color hex code',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active flag',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_category_code (code),
    INDEX idx_category_active (is_active),
    INDEX idx_category_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='KPI category classifications';

-- KPI definitions master table
CREATE TABLE IF NOT EXISTS kpi_definitions (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id TINYINT UNSIGNED NOT NULL COMMENT 'FK to category',
    code VARCHAR(20) NOT NULL COMMENT 'KPI code (e.g., PPFS-01)',
    name_th VARCHAR(200) NOT NULL COMMENT 'KPI name in Thai',
    name_en VARCHAR(200) DEFAULT NULL COMMENT 'KPI name in English',
    description TEXT DEFAULT NULL COMMENT 'Detailed description',
    unit VARCHAR(50) DEFAULT '%' COMMENT 'Measurement unit',
    target_value DECIMAL(10,2) DEFAULT NULL COMMENT 'Target value',
    target_type ENUM('min','max','exact') DEFAULT 'min' COMMENT 'Target direction',
    calculation_formula TEXT DEFAULT NULL COMMENT 'Calculation method',
    data_source VARCHAR(200) DEFAULT NULL COMMENT 'Data source reference',
    report_link VARCHAR(500) DEFAULT NULL COMMENT 'External report URL',
    display_order SMALLINT UNSIGNED DEFAULT 0 COMMENT 'UI sort order',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active flag',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT 'Soft delete flag',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
    
    UNIQUE KEY uk_kpi_code (code),
    INDEX idx_kpi_category (category_id),
    INDEX idx_kpi_active (is_active),
    INDEX idx_kpi_deleted (is_deleted),
    INDEX idx_kpi_order (display_order),
    FULLTEXT INDEX ft_kpi_name (name_th, name_en),
    CONSTRAINT fk_kpi_category FOREIGN KEY (category_id) 
        REFERENCES kpi_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Master definitions for Key Performance Indicators';

-- Fiscal periods time dimension
CREATE TABLE IF NOT EXISTS fiscal_periods (
    id SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fiscal_year SMALLINT UNSIGNED NOT NULL COMMENT 'Buddhist year (e.g., 2567)',
    quarter TINYINT UNSIGNED NOT NULL COMMENT 'Quarter (1-4)',
    month TINYINT UNSIGNED NOT NULL COMMENT 'Month (1-12)',
    month_name_th VARCHAR(20) NOT NULL COMMENT 'Month name in Thai',
    start_date DATE NOT NULL COMMENT 'Period start date',
    end_date DATE NOT NULL COMMENT 'Period end date',
    is_closed BOOLEAN DEFAULT FALSE COMMENT 'Closed for edits',
    closed_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Close timestamp',
    closed_by MEDIUMINT UNSIGNED DEFAULT NULL COMMENT 'Who closed it',
    
    UNIQUE KEY uk_fiscal_period (fiscal_year, quarter, month),
    INDEX idx_fiscal_year (fiscal_year),
    INDEX idx_fiscal_quarter (fiscal_year, quarter)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Time dimension for fiscal year reporting';

-- ============================================================
-- CORE ENTITY TABLES
-- ============================================================

-- Health service units (รพ.สต.)
CREATE TABLE IF NOT EXISTS health_units (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL COMMENT 'Unit code (e.g., 10601)',
    name VARCHAR(200) NOT NULL COMMENT 'Unit full name',
    short_name VARCHAR(100) DEFAULT NULL COMMENT 'Abbreviated name',
    amphoe_id SMALLINT UNSIGNED NOT NULL COMMENT 'District FK',
    tambon_id MEDIUMINT UNSIGNED DEFAULT NULL COMMENT 'Subdistrict FK',
    moo VARCHAR(10) DEFAULT NULL COMMENT 'Village number',
    affiliation VARCHAR(100) DEFAULT 'อบจ.อุบลราชธานี' COMMENT 'Affiliation',
    email VARCHAR(255) DEFAULT NULL COMMENT 'Contact email',
    phone VARCHAR(20) DEFAULT NULL COMMENT 'Contact phone',
    status ENUM('active','inactive') DEFAULT 'active' COMMENT 'Unit status',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT 'Soft delete flag',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete timestamp',
    
    UNIQUE KEY uk_unit_code (code),
    INDEX idx_unit_amphoe (amphoe_id),
    INDEX idx_unit_tambon (tambon_id),
    INDEX idx_unit_status (status),
    INDEX idx_unit_deleted (is_deleted),
    FULLTEXT INDEX ft_unit_name (name, short_name),
    CONSTRAINT fk_unit_amphoe FOREIGN KEY (amphoe_id) 
        REFERENCES dim_amphoe(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_unit_tambon FOREIGN KEY (tambon_id) 
        REFERENCES dim_tambon(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Health service units (Sub-district Health Promoting Hospitals)';

-- User accounts
CREATE TABLE IF NOT EXISTS users (
    id MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL COMMENT 'Login email',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Hashed password',
    name VARCHAR(100) NOT NULL COMMENT 'Full name',
    role ENUM('admin','manager','staff','viewer') DEFAULT 'viewer' COMMENT 'User role',
    health_unit_id MEDIUMINT UNSIGNED DEFAULT NULL COMMENT 'Associated unit',
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Active flag',
    last_login TIMESTAMP NULL DEFAULT NULL COMMENT 'Last login time',
    login_attempts TINYINT UNSIGNED DEFAULT 0 COMMENT 'Failed login count',
    locked_until TIMESTAMP NULL DEFAULT NULL COMMENT 'Account lock expiry',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_user_email (email),
    INDEX idx_user_role (role),
    INDEX idx_user_unit (health_unit_id),
    INDEX idx_user_active (is_active),
    CONSTRAINT fk_user_unit FOREIGN KEY (health_unit_id) 
        REFERENCES health_units(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='System user accounts for authentication';

-- Add FK to fiscal_periods for closed_by
ALTER TABLE fiscal_periods 
    ADD CONSTRAINT fk_fp_closed_by FOREIGN KEY (closed_by) 
    REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- TRANSACTIONAL TABLES
-- ============================================================

-- KPI results fact table
CREATE TABLE IF NOT EXISTS kpi_results (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kpi_id SMALLINT UNSIGNED NOT NULL COMMENT 'FK to KPI definition',
    health_unit_id MEDIUMINT UNSIGNED NOT NULL COMMENT 'FK to health unit',
    fiscal_period_id SMALLINT UNSIGNED NOT NULL COMMENT 'FK to fiscal period',
    target_value DECIMAL(15,2) NOT NULL COMMENT 'Target value',
    actual_value DECIMAL(15,2) NOT NULL COMMENT 'Actual achieved',
    percentage DECIMAL(5,2) NOT NULL COMMENT 'Performance percentage',
    notes TEXT DEFAULT NULL COMMENT 'Additional notes',
    evidence_url VARCHAR(500) DEFAULT NULL COMMENT 'Supporting document URL',
    submitted_by MEDIUMINT UNSIGNED DEFAULT NULL COMMENT 'Submitted by user',
    submitted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Submission time',
    reviewed_by MEDIUMINT UNSIGNED DEFAULT NULL COMMENT 'Reviewed by user',
    reviewed_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Review timestamp',
    review_status ENUM('draft','submitted','approved','rejected') DEFAULT 'draft' COMMENT 'Workflow status',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_kpi_result (kpi_id, health_unit_id, fiscal_period_id),
    INDEX idx_result_kpi (kpi_id),
    INDEX idx_result_unit (health_unit_id),
    INDEX idx_result_period (fiscal_period_id),
    INDEX idx_result_status (review_status),
    INDEX idx_result_percentage (percentage),
    INDEX idx_result_composite (health_unit_id, fiscal_period_id),
    CONSTRAINT fk_result_kpi FOREIGN KEY (kpi_id) 
        REFERENCES kpi_definitions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_result_unit FOREIGN KEY (health_unit_id) 
        REFERENCES health_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_result_period FOREIGN KEY (fiscal_period_id) 
        REFERENCES fiscal_periods(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_result_submitter FOREIGN KEY (submitted_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_result_reviewer FOREIGN KEY (reviewed_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='KPI performance results by unit and period';

-- Finance records
CREATE TABLE IF NOT EXISTS finance_records (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    health_unit_id MEDIUMINT UNSIGNED NOT NULL COMMENT 'FK to health unit',
    fiscal_period_id SMALLINT UNSIGNED NOT NULL COMMENT 'FK to fiscal period',
    income DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Total income',
    expense DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Total expense',
    balance DECIMAL(15,2) NOT NULL DEFAULT 0 COMMENT 'Calculated balance',
    income_breakdown JSON DEFAULT NULL COMMENT 'Detailed income categories',
    expense_breakdown JSON DEFAULT NULL COMMENT 'Detailed expense categories',
    notes TEXT DEFAULT NULL COMMENT 'Additional notes',
    recorder VARCHAR(100) DEFAULT NULL COMMENT 'Person recording data',
    submitted_by MEDIUMINT UNSIGNED DEFAULT NULL COMMENT 'Submitted by user',
    submitted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Submission time',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_finance_record (health_unit_id, fiscal_period_id),
    INDEX idx_finance_unit (health_unit_id),
    INDEX idx_finance_period (fiscal_period_id),
    INDEX idx_finance_composite (health_unit_id, fiscal_period_id),
    CONSTRAINT fk_finance_unit FOREIGN KEY (health_unit_id) 
        REFERENCES health_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_finance_period FOREIGN KEY (fiscal_period_id) 
        REFERENCES fiscal_periods(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_finance_submitter FOREIGN KEY (submitted_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Monthly financial records by health unit';

-- Health unit demographics (time-series)
CREATE TABLE IF NOT EXISTS health_unit_demographics (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    health_unit_id MEDIUMINT UNSIGNED NOT NULL COMMENT 'FK to health unit',
    fiscal_period_id SMALLINT UNSIGNED NOT NULL COMMENT 'FK to fiscal period',
    male INT UNSIGNED DEFAULT NULL COMMENT 'Male population',
    female INT UNSIGNED DEFAULT NULL COMMENT 'Female population',
    total_population INT UNSIGNED DEFAULT NULL COMMENT 'Total population',
    villages INT UNSIGNED DEFAULT NULL COMMENT 'Number of villages',
    households INT UNSIGNED DEFAULT NULL COMMENT 'Number of households',
    health_volunteers INT UNSIGNED DEFAULT NULL COMMENT 'Number of health volunteers',
    recorded_by MEDIUMINT UNSIGNED DEFAULT NULL COMMENT 'Recorded by user',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_demo (health_unit_id, fiscal_period_id),
    INDEX idx_demo_unit (health_unit_id),
    INDEX idx_demo_period (fiscal_period_id),
    CONSTRAINT fk_demo_unit FOREIGN KEY (health_unit_id) 
        REFERENCES health_units(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_demo_period FOREIGN KEY (fiscal_period_id) 
        REFERENCES fiscal_periods(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_demo_recorder FOREIGN KEY (recorded_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Demographic data snapshots by period';

-- ============================================================
-- AUDIT TABLE
-- ============================================================

-- Audit logs for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL COMMENT 'Affected table',
    record_id VARCHAR(50) NOT NULL COMMENT 'Affected record ID',
    action ENUM('INSERT','UPDATE','DELETE') NOT NULL COMMENT 'Operation type',
    old_values JSON DEFAULT NULL COMMENT 'Previous values',
    new_values JSON DEFAULT NULL COMMENT 'New values',
    changed_by MEDIUMINT UNSIGNED DEFAULT NULL COMMENT 'Who made change',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'When changed',
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'Client IP',
    user_agent VARCHAR(500) DEFAULT NULL COMMENT 'Browser info',
    
    INDEX idx_audit_table (table_name),
    INDEX idx_audit_record (table_name, record_id),
    INDEX idx_audit_user (changed_by),
    INDEX idx_audit_time (changed_at),
    INDEX idx_audit_action (action),
    CONSTRAINT fk_audit_user FOREIGN KEY (changed_by) 
        REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit trail for data changes';

-- ============================================================
-- VIEWS
-- ============================================================

-- Health unit summary view
CREATE OR REPLACE VIEW vw_health_unit_summary AS
SELECT 
    hu.id,
    hu.code,
    hu.name,
    hu.short_name,
    a.name_th as amphoe,
    t.name_th as tambon,
    hu.moo,
    hu.email,
    hu.phone,
    hu.affiliation,
    hu.status,
    hu.created_at,
    hu.updated_at
FROM health_units hu
LEFT JOIN dim_amphoe a ON hu.amphoe_id = a.id
LEFT JOIN dim_tambon t ON hu.tambon_id = t.id
WHERE hu.is_deleted = FALSE;

-- KPI performance latest view
CREATE OR REPLACE VIEW vw_kpi_performance_latest AS
SELECT 
    kr.id,
    kd.code as kpi_code,
    kd.name_th as kpi_name,
    kc.code as category_code,
    kc.name_th as category,
    hu.code as unit_code,
    hu.name as unit_name,
    a.name_th as amphoe,
    fp.fiscal_year,
    fp.quarter,
    fp.month_name_th as month,
    kr.target_value,
    kr.actual_value,
    kr.percentage,
    kr.review_status,
    kr.notes
FROM kpi_results kr
JOIN kpi_definitions kd ON kr.kpi_id = kd.id
JOIN kpi_categories kc ON kd.category_id = kc.id
JOIN health_units hu ON kr.health_unit_id = hu.id
JOIN dim_amphoe a ON hu.amphoe_id = a.id
JOIN fiscal_periods fp ON kr.fiscal_period_id = fp.id
WHERE kr.review_status = 'approved';

-- Finance summary view
CREATE OR REPLACE VIEW vw_finance_summary AS
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
    fr.recorder,
    fr.submitted_at
FROM finance_records fr
JOIN health_units hu ON fr.health_unit_id = hu.id
JOIN dim_amphoe a ON hu.amphoe_id = a.id
JOIN fiscal_periods fp ON fr.fiscal_period_id = fp.id;

-- Dashboard summary view
CREATE OR REPLACE VIEW vw_dashboard_summary AS
SELECT 
    hu.id as health_unit_id,
    hu.name as unit_name,
    a.name_th as amphoe,
    fp.fiscal_year,
    fp.quarter,
    -- PPFS Average
    (SELECT AVG(kr.percentage) 
     FROM kpi_results kr 
     JOIN kpi_definitions kd ON kr.kpi_id = kd.id
     JOIN kpi_categories kc ON kd.category_id = kc.id
     WHERE kr.health_unit_id = hu.id 
     AND kr.fiscal_period_id = fp.id
     AND kc.code = 'PPFS') as ppfs_avg,
    -- TTM Average
    (SELECT AVG(kr.percentage) 
     FROM kpi_results kr 
     JOIN kpi_definitions kd ON kr.kpi_id = kd.id
     JOIN kpi_categories kc ON kd.category_id = kc.id
     WHERE kr.health_unit_id = hu.id 
     AND kr.fiscal_period_id = fp.id
     AND kc.code = 'TTM') as ttm_avg,
    -- Finance
    (SELECT fr.balance FROM finance_records fr 
     WHERE fr.health_unit_id = hu.id 
     AND fr.fiscal_period_id = fp.id) as balance
FROM health_units hu
JOIN dim_amphoe a ON hu.amphoe_id = a.id
CROSS JOIN fiscal_periods fp
WHERE hu.is_deleted = FALSE
AND hu.status = 'active';

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER $$

-- Calculate KPI percentage based on target type
CREATE PROCEDURE IF NOT EXISTS sp_calculate_kpi_percentage(
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

-- Get KPI summary by amphoe and period
CREATE PROCEDURE IF NOT EXISTS sp_get_kpi_summary(
    IN p_fiscal_year SMALLINT UNSIGNED,
    IN p_quarter TINYINT UNSIGNED,
    IN p_category_code VARCHAR(20)
)
BEGIN
    SELECT 
        a.name_th as amphoe,
        COUNT(DISTINCT hu.id) as unit_count,
        AVG(kr.percentage) as avg_percentage,
        MIN(kr.percentage) as min_percentage,
        MAX(kr.percentage) as max_percentage
    FROM kpi_results kr
    JOIN kpi_definitions kd ON kr.kpi_id = kd.id
    JOIN kpi_categories kc ON kd.category_id = kc.id
    JOIN health_units hu ON kr.health_unit_id = hu.id
    JOIN dim_amphoe a ON hu.amphoe_id = a.id
    JOIN fiscal_periods fp ON kr.fiscal_period_id = fp.id
    WHERE fp.fiscal_year = p_fiscal_year
    AND (p_quarter IS NULL OR fp.quarter = p_quarter)
    AND (p_category_code IS NULL OR kc.code = p_category_code)
    AND kr.review_status = 'approved'
    GROUP BY a.id, a.name_th
    ORDER BY avg_percentage DESC;
END$$

-- Validate and update balance
CREATE PROCEDURE IF NOT EXISTS sp_update_finance_balance(
    IN p_finance_id INT UNSIGNED
)
BEGIN
    UPDATE finance_records 
    SET balance = income - expense
    WHERE id = p_finance_id;
END$$

DELIMITER ;

-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER $$

-- Auto-calculate balance on finance insert/update
CREATE TRIGGER IF NOT EXISTS trg_finance_calc_balance
BEFORE INSERT ON finance_records
FOR EACH ROW
BEGIN
    SET NEW.balance = NEW.income - NEW.expense;
END$$

CREATE TRIGGER IF NOT EXISTS trg_finance_calc_balance_update
BEFORE UPDATE ON finance_records
FOR EACH ROW
BEGIN
    SET NEW.balance = NEW.income - NEW.expense;
END$$

-- Audit log for KPI results
CREATE TRIGGER IF NOT EXISTS trg_audit_kpi_results_insert
AFTER INSERT ON kpi_results
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_at)
    VALUES ('kpi_results', NEW.id, 'INSERT', 
            JSON_OBJECT('kpi_id', NEW.kpi_id, 'health_unit_id', NEW.health_unit_id, 
                       'percentage', NEW.percentage), 
            NOW());
END$$

CREATE TRIGGER IF NOT EXISTS trg_audit_kpi_results_update
AFTER UPDATE ON kpi_results
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_at)
    VALUES ('kpi_results', NEW.id, 'UPDATE', 
            JSON_OBJECT('percentage', OLD.percentage, 'review_status', OLD.review_status),
            JSON_OBJECT('percentage', NEW.percentage, 'review_status', NEW.review_status),
            NOW());
END$$

CREATE TRIGGER IF NOT EXISTS trg_audit_kpi_results_delete
AFTER DELETE ON kpi_results
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, changed_at)
    VALUES ('kpi_results', OLD.id, 'DELETE', 
            JSON_OBJECT('kpi_id', OLD.kpi_id, 'health_unit_id', OLD.health_unit_id),
            NOW());
END$$

DELIMITER ;

-- ============================================================
-- SEED DATA - REFERENCE TABLES
-- ============================================================

-- Insert amphoe (districts)
INSERT INTO dim_amphoe (code, name_th, name_en) VALUES
('1001', 'เมืองอุบลราชธานี', 'Mueang Ubon Ratchathani'),
('1006', 'ม่วงสามสิบ', 'Muang Sam Sip'),
('1007', 'นาจะหลวย', 'Na Chaluai'),
('1008', 'วารินชำราบ', 'Warinchamrap'),
('1009', 'เดชอุดม', 'Det Udom'),
('1010', 'ตระการพืชผล', 'Trakan Phuet Phon'),
('1011', 'เขื่องใน', 'Khueang Nai'),
('1012', 'พิบูลมังสาหาร', 'Phibun Mangsahan'),
('1013', 'สำโรง', 'Samrong'),
('1014', 'น้ำยืน', 'Nam Yuen'),
('1015', 'บุณฑริก', 'Buntharik'),
('1016', 'โขงเจียม', 'Khong Chiam'),
('1017', 'ศรีเมืองใหม่', 'Si Mueang Mai'),
('1018', 'สว่างวีระวงศ์', 'Sawang Wirawong')
ON DUPLICATE KEY UPDATE name_th = VALUES(name_th), name_en = VALUES(name_en);

-- Insert KPI categories
INSERT INTO kpi_categories (code, name_th, name_en, color_code, display_order) VALUES
('PPFS', 'การฝากครรภ์ หลังคลอด วางแผนครอบครัว และคัดกรอง', 
 'Pregnancy, Post-partum, Family Planning & Screening', '#3B82F6', 1),
('TTM', 'แพทย์แผนไทย', 'Traditional Thai Medicine', '#10B981', 2)
ON DUPLICATE KEY UPDATE name_th = VALUES(name_th), name_en = VALUES(name_en);

-- Insert KPI definitions
INSERT INTO kpi_definitions (category_id, code, name_th, name_en, target_value, target_type, unit, display_order) VALUES
-- PPFS KPIs
((SELECT id FROM kpi_categories WHERE code = 'PPFS'), 'PPFS-01', 
 'ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์', 'Percentage of pregnant women registered before 12 weeks', 80, 'min', '%', 1),
((SELECT id FROM kpi_categories WHERE code = 'PPFS'), 'PPFS-02',
 'ร้อยละหญิงฝากครรภ์ครบ 5 ครั้งตามเกณฑ์', 'Percentage with 5 prenatal visits', 75, 'min', '%', 2),
((SELECT id FROM kpi_categories WHERE code = 'PPFS'), 'PPFS-03',
 'ร้อยละเด็กแรกเกิดน้ำหนักต่ำกว่า 2,500 กรัม', 'Low birth weight percentage', 7, 'max', '%', 3),
((SELECT id FROM kpi_categories WHERE code = 'PPFS'), 'PPFS-04',
 'ร้อยละเด็กได้รับนมแม่อย่างน้อย 6 เดือน', 'Exclusive breastfeeding 6 months', 50, 'min', '%', 4),
-- TTM KPIs
((SELECT id FROM kpi_categories WHERE code = 'TTM'), 'TTM-01',
 'อัตราการใช้ยาสมุนไพร', 'Herbal medicine usage rate', 25, 'min', '%', 1),
((SELECT id FROM kpi_categories WHERE code = 'TTM'), 'TTM-02',
 'ร้อยละผู้ป่วยได้รับบริการนวดไทย', 'Thai massage service percentage', 20, 'min', '%', 2),
((SELECT id FROM kpi_categories WHERE code = 'TTM'), 'TTM-03',
 'ร้อยละผู้ป่วยได้รับบริการอบสมุนไพร', 'Herbal steam service percentage', 15, 'min', '%', 3),
((SELECT id FROM kpi_categories WHERE code = 'TTM'), 'TTM-04',
 'ร้อยละผู้ป่วยได้รับบริการประคบสมุนไพร', 'Herbal compress service percentage', 18, 'min', '%', 4)
ON DUPLICATE KEY UPDATE name_th = VALUES(name_th), target_value = VALUES(target_value);

-- Insert fiscal periods for 2567 (2024-2025)
INSERT INTO fiscal_periods (fiscal_year, quarter, month, month_name_th, start_date, end_date) VALUES
-- Q1 (Oct-Dec)
(2567, 1, 10, 'ตุลาคม', '2024-10-01', '2024-10-31'),
(2567, 1, 11, 'พฤศจิกายน', '2024-11-01', '2024-11-30'),
(2567, 1, 12, 'ธันวาคม', '2024-12-01', '2024-12-31'),
-- Q2 (Jan-Mar)
(2567, 2, 1, 'มกราคม', '2025-01-01', '2025-01-31'),
(2567, 2, 2, 'กุมภาพันธ์', '2025-02-01', '2025-02-28'),
(2567, 2, 3, 'มีนาคม', '2025-03-01', '2025-03-31'),
-- Q3 (Apr-Jun)
(2567, 3, 4, 'เมษายน', '2025-04-01', '2025-04-30'),
(2567, 3, 5, 'พฤษภาคม', '2025-05-01', '2025-05-31'),
(2567, 3, 6, 'มิถุนายน', '2025-06-01', '2025-06-30'),
-- Q4 (Jul-Sep)
(2567, 4, 7, 'กรกฎาคม', '2025-07-01', '2025-07-31'),
(2567, 4, 8, 'สิงหาคม', '2025-08-01', '2025-08-31'),
(2567, 4, 9, 'กันยายน', '2025-09-01', '2025-09-30')
ON DUPLICATE KEY UPDATE month_name_th = VALUES(month_name_th);

-- ============================================================
-- VALIDATION QUERIES (Run after setup)
-- ============================================================

-- Verify table creation
-- SELECT table_name, table_rows 
-- FROM information_schema.tables 
-- WHERE table_schema = 'ubon_health_insights';

-- Verify reference data
-- SELECT * FROM dim_amphoe;
-- SELECT * FROM kpi_categories;
-- SELECT * FROM kpi_definitions;
-- SELECT * FROM fiscal_periods;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
