-- ============================================================
-- UBON HEALTH INSIGHTS - Migration Plan
-- From Legacy Mock Data to MariaDB Schema
-- Version: 1.0.0
-- ============================================================

-- ============================================================
-- MIGRATION PHASE 1: REFERENCE DATA
-- ============================================================

-- Step 1.1: Insert Amphoe (Districts)
-- Source: amphoeList from mockData.ts
INSERT INTO dim_amphoe (code, name_th, name_en) VALUES
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
('1018', 'สว่างวีระวงศ์', 'Sawang Wirawong');

-- Step 1.2: Insert Sample Tambon (Subdistricts)
-- Note: In production, full tambon data would be loaded from official source
INSERT INTO dim_tambon (amphoe_id, code, name_th) VALUES
((SELECT id FROM dim_amphoe WHERE code = '1006'), '100601', 'บุ่งหวาย'),
((SELECT id FROM dim_amphoe WHERE code = '1006'), '100602', 'หนองช้างใหญ่'),
((SELECT id FROM dim_amphoe WHERE code = '1007'), '100701', 'นาจะหลวย'),
((SELECT id FROM dim_amphoe WHERE code = '1008'), '100801', 'บุ่งไหม'),
((SELECT id FROM dim_amphoe WHERE code = '1009'), '100901', 'เมืองเดช'),
((SELECT id FROM dim_amphoe WHERE code = '1010'), '101001', 'ขุหลุ'),
((SELECT id FROM dim_amphoe WHERE code = '1011'), '101101', 'เขื่องใน'),
((SELECT id FROM dim_amphoe WHERE code = '1012'), '101201', 'พิบูล'),
((SELECT id FROM dim_amphoe WHERE code = '1013'), '101301', 'สำโรง'),
((SELECT id FROM dim_amphoe WHERE code = '1014'), '101401', 'น้ำยืน'),
((SELECT id FROM dim_amphoe WHERE code = '1015'), '101501', 'บุณฑริก'),
((SELECT id FROM dim_amphoe WHERE code = '1016'), '101601', 'โขงเจียม'),
((SELECT id FROM dim_amphoe WHERE code = '1017'), '101701', 'ศรีเมืองใหม่'),
((SELECT id FROM dim_amphoe WHERE code = '1018'), '101801', 'สว่าง');

-- Step 1.3: Insert KPI Categories
INSERT INTO kpi_categories (code, name_th, name_en, color_code, display_order) VALUES
('PPFS', 'การฝากครรภ์ หลังคลอด วางแผนครอบครัว และคัดกรอง', 
 'Pregnancy, Post-partum, Family Planning & Screening', '#3B82F6', 1),
('TTM', 'แพทย์แผนไทย', 'Traditional Thai Medicine', '#10B981', 2);

-- Step 1.4: Insert KPI Definitions
-- PPFS KPIs
INSERT INTO kpi_definitions (category_id, code, name_th, name_en, target_value, target_type, unit, display_order) VALUES
((SELECT id FROM kpi_categories WHERE code = 'PPFS'), 'PPFS-01', 
 'ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์', 'Percentage of pregnant women registered before 12 weeks', 80, 'min', '%', 1),
((SELECT id FROM kpi_categories WHERE code = 'PPFS'), 'PPFS-02',
 'ร้อยละหญิงฝากครรภ์ครบ 5 ครั้งตามเกณฑ์', 'Percentage with 5 prenatal visits', 75, 'min', '%', 2),
((SELECT id FROM kpi_categories WHERE code = 'PPFS'), 'PPFS-03',
 'ร้อยละเด็กแรกเกิดน้ำหนักต่ำกว่า 2,500 กรัม', 'Low birth weight percentage', 7, 'max', '%', 3),
((SELECT id FROM kpi_categories WHERE code = 'PPFS'), 'PPFS-04',
 'ร้อยละเด็กได้รับนมแม่อย่างน้อย 6 เดือน', 'Exclusive breastfeeding 6 months', 50, 'min', '%', 4);

-- TTM KPIs
INSERT INTO kpi_definitions (category_id, code, name_th, name_en, target_value, target_type, unit, display_order) VALUES
((SELECT id FROM kpi_categories WHERE code = 'TTM'), 'TTM-01',
 'อัตราการใช้ยาสมุนไพร', 'Herbal medicine usage rate', 25, 'min', '%', 1),
((SELECT id FROM kpi_categories WHERE code = 'TTM'), 'TTM-02',
 'ร้อยละผู้ป่วยได้รับบริการนวดไทย', 'Thai massage service percentage', 20, 'min', '%', 2),
((SELECT id FROM kpi_categories WHERE code = 'TTM'), 'TTM-03',
 'ร้อยละผู้ป่วยได้รับบริการอบสมุนไพร', 'Herbal steam service percentage', 15, 'min', '%', 3),
((SELECT id FROM kpi_categories WHERE code = 'TTM'), 'TTM-04',
 'ร้อยละผู้ป่วยได้รับบริการประคบสมุนไพร', 'Herbal compress service percentage', 18, 'min', '%', 4);

-- Step 1.5: Insert Fiscal Periods for 2567
INSERT INTO fiscal_periods (fiscal_year, quarter, month, month_name_th, start_date, end_date) VALUES
-- Q1 (Oct-Dec) 2024
(2567, 1, 10, 'ตุลาคม', '2024-10-01', '2024-10-31'),
(2567, 1, 11, 'พฤศจิกายน', '2024-11-01', '2024-11-30'),
(2567, 1, 12, 'ธันวาคม', '2024-12-01', '2024-12-31'),
-- Q2 (Jan-Mar) 2025
(2567, 2, 1, 'มกราคม', '2025-01-01', '2025-01-31'),
(2567, 2, 2, 'กุมภาพันธ์', '2025-02-01', '2025-02-28'),
(2567, 2, 3, 'มีนาคม', '2025-03-01', '2025-03-31'),
-- Q3 (Apr-Jun) 2025
(2567, 3, 4, 'เมษายน', '2025-04-01', '2025-04-30'),
(2567, 3, 5, 'พฤษภาคม', '2025-05-01', '2025-05-31'),
(2567, 3, 6, 'มิถุนายน', '2025-06-01', '2025-06-30'),
-- Q4 (Jul-Sep) 2025
(2567, 4, 7, 'กรกฎาคม', '2025-07-01', '2025-07-31'),
(2567, 4, 8, 'สิงหาคม', '2025-08-01', '2025-08-31'),
(2567, 4, 9, 'กันยายน', '2025-09-01', '2025-09-30');

-- ============================================================
-- MIGRATION PHASE 2: CORE ENTITIES
-- ============================================================

-- Step 2.1: Insert Health Units
-- Source: healthUnits array from mockData.ts
INSERT INTO health_units (code, name, short_name, amphoe_id, moo, tambon_id, affiliation, email) VALUES
('10601', 'รพ.สต.บุ่งหวาย', 'บุ่งหวาย', 
 (SELECT id FROM dim_amphoe WHERE code = '1006'), '1', 
 (SELECT id FROM dim_tambon WHERE code = '100601'),
 'อบจ.อุบลราชธานี', 'bungwai@example.com'),

('10602', 'รพ.สต.หนองช้างใหญ่', 'หนองช้างใหญ่',
 (SELECT id FROM dim_amphoe WHERE code = '1006'), '3',
 (SELECT id FROM dim_tambon WHERE code = '100602'),
 'อบจ.อุบลราชธานี', 'nongchangyai@example.com'),

('10701', 'รพ.สต.นาจะหลวย', 'นาจะหลวย',
 (SELECT id FROM dim_amphoe WHERE code = '1007'), '5',
 (SELECT id FROM dim_tambon WHERE code = '100701'),
 'อบจ.อุบลราชธานี', 'najaluang@example.com'),

('10801', 'รพ.สต.บุ่งไหม', 'บุ่งไหม',
 (SELECT id FROM dim_amphoe WHERE code = '1008'), '2',
 (SELECT id FROM dim_tambon WHERE code = '100801'),
 'อบจ.อุบลราชธานี', 'bungmai@example.com'),

('10901', 'รพ.สต.เมืองเดช', 'เมืองเดช',
 (SELECT id FROM dim_amphoe WHERE code = '1009'), '1',
 (SELECT id FROM dim_tambon WHERE code = '100901'),
 'อบจ.อุบลราชธานี', 'muangdet@example.com'),

('11001', 'รพ.สต.ขุหลุ', 'ขุหลุ',
 (SELECT id FROM dim_amphoe WHERE code = '1010'), '4',
 (SELECT id FROM dim_tambon WHERE code = '101001'),
 'อบจ.อุบลราชธานี', 'khulu@example.com'),

('11101', 'รพ.สต.เขื่องใน', 'เขื่องใน',
 (SELECT id FROM dim_amphoe WHERE code = '1011'), '1',
 (SELECT id FROM dim_tambon WHERE code = '101101'),
 'อบจ.อุบลราชธานี', 'khuangnai@example.com'),

('11201', 'รพ.สต.พิบูลมังสาหาร', 'พิบูลมังสาหาร',
 (SELECT id FROM dim_amphoe WHERE code = '1012'), '2',
 (SELECT id FROM dim_tambon WHERE code = '101201'),
 'อบจ.อุบลราชธานี', 'phibun@example.com'),

('11301', 'รพ.สต.สำโรง', 'สำโรง',
 (SELECT id FROM dim_amphoe WHERE code = '1013'), '3',
 (SELECT id FROM dim_tambon WHERE code = '101301'),
 'อบจ.อุบลราชธานี', 'samrong@example.com'),

('11401', 'รพ.สต.น้ำยืน', 'น้ำยืน',
 (SELECT id FROM dim_amphoe WHERE code = '1014'), '1',
 (SELECT id FROM dim_tambon WHERE code = '101401'),
 'อบจ.อุบลราชธานี', 'namyuen@example.com'),

('11501', 'รพ.สต.บุณฑริก', 'บุณฑริก',
 (SELECT id FROM dim_amphoe WHERE code = '1015'), '2',
 (SELECT id FROM dim_tambon WHERE code = '101501'),
 'อบจ.อุบลราชธานี', 'buntharik@example.com'),

('11601', 'รพ.สต.โขงเจียม', 'โขงเจียม',
 (SELECT id FROM dim_amphoe WHERE code = '1016'), '1',
 (SELECT id FROM dim_tambon WHERE code = '101601'),
 'อบจ.อุบลราชธานี', 'khongjiam@example.com'),

('11701', 'รพ.สต.ศรีเมืองใหม่', 'ศรีเมืองใหม่',
 (SELECT id FROM dim_amphoe WHERE code = '1017'), '4',
 (SELECT id FROM dim_tambon WHERE code = '101701'),
 'อบจ.อุบลราชธานี', 'srimuangmai@example.com'),

('11801', 'รพ.สต.สว่างวีระวงศ์', 'สว่างวีระวงศ์',
 (SELECT id FROM dim_amphoe WHERE code = '1018'), '1',
 (SELECT id FROM dim_tambon WHERE code = '101801'),
 'อบจ.อุบลราชธานี', 'sawang@example.com');

-- Step 2.2: Create Admin User
INSERT INTO users (email, password_hash, name, role, is_active) VALUES
('admin@ubonhealth.go.th', '$2b$10$HashedPasswordHere', 'System Administrator', 'admin', TRUE);

-- Note: In production, use proper password hashing like bcrypt
-- This is a placeholder - replace with actual hashed password

-- Step 2.3: Create Staff Users for Health Units
INSERT INTO users (email, password_hash, name, role, health_unit_id, is_active) VALUES
('bungwai@example.com', '$2b$10$Hashed', 'เจ้าหน้าที่ รพ.สต.บุ่งหวาย', 'staff', 
 (SELECT id FROM health_units WHERE code = '10601'), TRUE),
('najaluang@example.com', '$2b$10$Hashed', 'เจ้าหน้าที่ รพ.สต.นาจะหลวย', 'staff',
 (SELECT id FROM health_units WHERE code = '10701'), TRUE),
('bungmai@example.com', '$2b$10$Hashed', 'เจ้าหน้าที่ รพ.สต.บุ่งไหม', 'staff',
 (SELECT id FROM health_units WHERE code = '10801'), TRUE),
('muangdet@example.com', '$2b$10$Hashed', 'เจ้าหน้าที่ รพ.สต.เมืองเดช', 'staff',
 (SELECT id FROM health_units WHERE code = '10901'), TRUE);

-- ============================================================
-- MIGRATION PHASE 3: TRANSACTIONAL DATA
-- ============================================================

-- Step 3.1: Insert KPI Results (Q1 2567)
-- Source: kpiResults array from mockData.ts

-- Get IDs for lookups
SET @kpi_ppfs_01 = (SELECT id FROM kpi_definitions WHERE code = 'PPFS-01');
SET @kpi_ppfs_02 = (SELECT id FROM kpi_definitions WHERE code = 'PPFS-02');
SET @kpi_ttm_01 = (SELECT id FROM kpi_definitions WHERE code = 'TTM-01');
SET @kpi_ttm_02 = (SELECT id FROM kpi_definitions WHERE code = 'TTM-02');
SET @period_q1 = (SELECT id FROM fiscal_periods WHERE fiscal_year = 2567 AND quarter = 1 AND month = 10);

-- Unit 10601: รพ.สต.บุ่งหวาย (ม่วงสามสิบ)
SET @unit_10601 = (SELECT id FROM health_units WHERE code = '10601');
INSERT INTO kpi_results (kpi_id, health_unit_id, fiscal_period_id, target_value, actual_value, percentage, review_status, submitted_at) VALUES
(@kpi_ppfs_01, @unit_10601, @period_q1, 20, 18, 90.00, 'approved', NOW()),
(@kpi_ttm_01, @unit_10601, @period_q1, 100, 35, 35.00, 'approved', NOW());

-- Unit 10602: รพ.สต.หนองช้างใหญ่ (ม่วงสามสิบ)
SET @unit_10602 = (SELECT id FROM health_units WHERE code = '10602');
INSERT INTO kpi_results (kpi_id, health_unit_id, fiscal_period_id, target_value, actual_value, percentage, review_status, submitted_at) VALUES
(@kpi_ppfs_01, @unit_10602, @period_q1, 15, 12, 80.00, 'approved', NOW()),
(@kpi_ttm_01, @unit_10602, @period_q1, 80, 20, 25.00, 'approved', NOW());

-- Unit 10701: รพ.สต.นาจะหลวย (นาจะหลวย)
SET @unit_10701 = (SELECT id FROM health_units WHERE code = '10701');
INSERT INTO kpi_results (kpi_id, health_unit_id, fiscal_period_id, target_value, actual_value, percentage, review_status, submitted_at) VALUES
(@kpi_ppfs_01, @unit_10701, @period_q1, 25, 15, 60.00, 'approved', NOW()),
(@kpi_ttm_01, @unit_10701, @period_q1, 120, 18, 15.00, 'approved', NOW());

-- Unit 10801: รพ.สต.บุ่งไหม (วารินชำราบ)
SET @unit_10801 = (SELECT id FROM health_units WHERE code = '10801');
INSERT INTO kpi_results (kpi_id, health_unit_id, fiscal_period_id, target_value, actual_value, percentage, review_status, submitted_at) VALUES
(@kpi_ppfs_01, @unit_10801, @period_q1, 18, 16, 88.89, 'approved', NOW()),
(@kpi_ttm_01, @unit_10801, @period_q1, 90, 14, 15.56, 'approved', NOW());

-- Unit 10901: รพ.สต.เมืองเดช (เดชอุดม)
SET @unit_10901 = (SELECT id FROM health_units WHERE code = '10901');
INSERT INTO kpi_results (kpi_id, health_unit_id, fiscal_period_id, target_value, actual_value, percentage, review_status, submitted_at) VALUES
(@kpi_ppfs_01, @unit_10901, @period_q1, 30, 28, 93.33, 'approved', NOW()),
(@kpi_ttm_01, @unit_10901, @period_q1, 150, 60, 40.00, 'approved', NOW());

-- Unit 11001: รพ.สต.ขุหลุ (ตระการพืชผล)
SET @unit_11001 = (SELECT id FROM health_units WHERE code = '11001');
INSERT INTO kpi_results (kpi_id, health_unit_id, fiscal_period_id, target_value, actual_value, percentage, review_status, submitted_at) VALUES
(@kpi_ppfs_01, @unit_11001, @period_q1, 12, 10, 83.33, 'approved', NOW()),
(@kpi_ttm_01, @unit_11001, @period_q1, 70, 45, 64.29, 'approved', NOW());

-- Unit 11101: รพ.สต.เขื่องใน (เขื่องใน)
SET @unit_11101 = (SELECT id FROM health_units WHERE code = '11101');
INSERT INTO kpi_results (kpi_id, health_unit_id, fiscal_period_id, target_value, actual_value, percentage, review_status, submitted_at) VALUES
(@kpi_ppfs_01, @unit_11101, @period_q1, 22, 11, 50.00, 'approved', NOW()),
(@kpi_ttm_01, @unit_11101, @period_q1, 100, 30, 30.00, 'approved', NOW());

-- Unit 11201: รพ.สต.พิบูลมังสาหาร (พิบูลมังสาหาร)
SET @unit_11201 = (SELECT id FROM health_units WHERE code = '11201');
INSERT INTO kpi_results (kpi_id, health_unit_id, fiscal_period_id, target_value, actual_value, percentage, review_status, submitted_at) VALUES
(@kpi_ppfs_01, @unit_11201, @period_q1, 28, 24, 85.71, 'approved', NOW()),
(@kpi_ttm_01, @unit_11201, @period_q1, 130, 78, 60.00, 'approved', NOW());

-- Step 3.2: Insert Finance Records
-- Source: financeData array from mockData.ts

SET @period_oct = (SELECT id FROM fiscal_periods WHERE fiscal_year = 2567 AND month = 10);
SET @period_nov = (SELECT id FROM fiscal_periods WHERE fiscal_year = 2567 AND month = 11);
SET @period_dec = (SELECT id FROM fiscal_periods WHERE fiscal_year = 2567 AND month = 12);

-- Unit 10601: รพ.สต.บุ่งหวาย
SET @user_bungwai = (SELECT id FROM users WHERE email = 'bungwai@example.com');
INSERT INTO finance_records (health_unit_id, fiscal_period_id, income, expense, recorder, submitted_by, submitted_at) VALUES
(@unit_10601, @period_oct, 150000.00, 120000.00, 'bungwai@example.com', @user_bungwai, NOW()),
(@unit_10601, @period_nov, 145000.00, 115000.00, 'bungwai@example.com', @user_bungwai, NOW()),
(@unit_10601, @period_dec, 160000.00, 140000.00, 'bungwai@example.com', @user_bungwai, NOW());

-- Unit 10701: รพ.สต.นาจะหลวย
SET @user_najaluang = (SELECT id FROM users WHERE email = 'najaluang@example.com');
INSERT INTO finance_records (health_unit_id, fiscal_period_id, income, expense, recorder, submitted_by, submitted_at) VALUES
(@unit_10701, @period_oct, 180000.00, 150000.00, 'najaluang@example.com', @user_najaluang, NOW()),
(@unit_10701, @period_nov, 175000.00, 160000.00, 'najaluang@example.com', @user_najaluang, NOW()),
(@unit_10701, @period_dec, 190000.00, 170000.00, 'najaluang@example.com', @user_najaluang, NOW());

-- Unit 10801: รพ.สต.บุ่งไหม
SET @user_bungmai = (SELECT id FROM users WHERE email = 'bungmai@example.com');
INSERT INTO finance_records (health_unit_id, fiscal_period_id, income, expense, recorder, submitted_by, submitted_at) VALUES
(@unit_10801, @period_oct, 120000.00, 110000.00, 'bungmai@example.com', @user_bungmai, NOW()),
(@unit_10801, @period_nov, 125000.00, 120000.00, 'bungmai@example.com', @user_bungmai, NOW()),
(@unit_10801, @period_dec, 130000.00, 125000.00, 'bungmai@example.com', @user_bungmai, NOW());

-- Unit 10901: รพ.สต.เมืองเดช
SET @user_muangdet = (SELECT id FROM users WHERE email = 'muangdet@example.com');
INSERT INTO finance_records (health_unit_id, fiscal_period_id, income, expense, recorder, submitted_by, submitted_at) VALUES
(@unit_10901, @period_oct, 220000.00, 180000.00, 'muangdet@example.com', @user_muangdet, NOW()),
(@unit_10901, @period_nov, 230000.00, 190000.00, 'muangdet@example.com', @user_muangdet, NOW()),
(@unit_10901, @period_dec, 240000.00, 200000.00, 'muangdet@example.com', @user_muangdet, NOW());

-- Step 3.3: Insert Demographic Snapshots (Q1)
-- Source: HealthUnit interface population data from mockData.ts

INSERT INTO health_unit_demographics (health_unit_id, fiscal_period_id, male, female, total_population, villages, households, health_volunteers) VALUES
(@unit_10601, @period_oct, 1250, 1320, 2570, 8, 650, 45),
(@unit_10602, @period_oct, 980, 1050, 2030, 6, 480, 35),
(@unit_10701, @period_oct, 1500, 1580, 3080, 10, 780, 55),
(@unit_10801, @period_oct, 1100, 1180, 2280, 7, 560, 40),
(@unit_10901, @period_oct, 1800, 1920, 3720, 12, 920, 65),
(@unit_11001, @period_oct, 890, 950, 1840, 5, 420, 28),
(@unit_11101, @period_oct, 1350, 1420, 2770, 9, 680, 48),
(@unit_11201, @period_oct, 1650, 1750, 3400, 11, 850, 58),
(@unit_11301, @period_oct, 780, 850, 1630, 5, 380, 25),
(@unit_11401, @period_oct, 920, 980, 1900, 6, 450, 32),
(@unit_11501, @period_oct, 1050, 1120, 2170, 7, 520, 38),
(@unit_11601, @period_oct, 680, 720, 1400, 4, 320, 22),
(@unit_11701, @period_oct, 1150, 1220, 2370, 8, 580, 42),
(@unit_11801, @period_oct, 850, 920, 1770, 6, 420, 30);

-- ============================================================
-- MIGRATION PHASE 4: POST-MIGRATION VALIDATION
-- ============================================================

-- Validation Query 1: Count migrated records
SELECT 'Reference Tables' as category, 'dim_amphoe' as table_name, COUNT(*) as count FROM dim_amphoe
UNION ALL SELECT 'Reference Tables', 'dim_tambon', COUNT(*) FROM dim_tambon
UNION ALL SELECT 'Reference Tables', 'kpi_categories', COUNT(*) FROM kpi_categories
UNION ALL SELECT 'Reference Tables', 'kpi_definitions', COUNT(*) FROM kpi_definitions
UNION ALL SELECT 'Reference Tables', 'fiscal_periods', COUNT(*) FROM fiscal_periods
UNION ALL SELECT 'Core Entities', 'health_units', COUNT(*) FROM health_units
UNION ALL SELECT 'Core Entities', 'users', COUNT(*) FROM users
UNION ALL SELECT 'Transactions', 'kpi_results', COUNT(*) FROM kpi_results
UNION ALL SELECT 'Transactions', 'finance_records', COUNT(*) FROM finance_records
UNION ALL SELECT 'Transactions', 'health_unit_demographics', COUNT(*) FROM health_unit_demographics
ORDER BY category, table_name;

-- Validation Query 2: Check orphaned records
SELECT 'kpi_results' as table_name, COUNT(*) as orphaned_count
FROM kpi_results kr
LEFT JOIN kpi_definitions kd ON kr.kpi_id = kd.id
LEFT JOIN health_units hu ON kr.health_unit_id = hu.id
LEFT JOIN fiscal_periods fp ON kr.fiscal_period_id = fp.id
WHERE kd.id IS NULL OR hu.id IS NULL OR fp.id IS NULL
UNION ALL
SELECT 'finance_records', COUNT(*)
FROM finance_records fr
LEFT JOIN health_units hu ON fr.health_unit_id = hu.id
LEFT JOIN fiscal_periods fp ON fr.fiscal_period_id = fp.id
WHERE hu.id IS NULL OR fp.id IS NULL;

-- Validation Query 3: Sample data integrity check
SELECT 
    hu.name as unit_name,
    hu.code as unit_code,
    a.name_th as amphoe,
    COUNT(DISTINCT kr.id) as kpi_results,
    COUNT(DISTINCT fr.id) as finance_records
FROM health_units hu
JOIN dim_amphoe a ON hu.amphoe_id = a.id
LEFT JOIN kpi_results kr ON hu.id = kr.health_unit_id
LEFT JOIN finance_records fr ON hu.id = fr.health_unit_id
GROUP BY hu.id, hu.name, hu.code, a.name_th
ORDER BY a.name_th, hu.name;

-- ============================================================
-- ROLLBACK PROCEDURES (Use with caution)
-- ============================================================

-- To rollback transaction data only:
-- DELETE FROM audit_logs;
-- DELETE FROM kpi_results;
-- DELETE FROM finance_records;
-- DELETE FROM health_unit_demographics;

-- To rollback everything (DESTRUCTIVE):
-- DROP TABLE IF EXISTS audit_logs;
-- DROP TABLE IF EXISTS kpi_results;
-- DROP TABLE IF EXISTS finance_records;
-- DROP TABLE IF EXISTS health_unit_demographics;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS health_units;
-- DROP TABLE IF EXISTS fiscal_periods;
-- DROP TABLE IF EXISTS kpi_definitions;
-- DROP TABLE IF EXISTS kpi_categories;
-- DROP TABLE IF EXISTS dim_tambon;
-- DROP TABLE IF EXISTS dim_amphoe;
