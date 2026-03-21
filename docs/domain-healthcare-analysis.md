# Healthcare Domain Analysis - Ubon Health Insights

**Document Version:** 1.0  
**Analysis Date:** 2026-03-21  
**Analyst:** myBOT (Healthcare Analyst Agent)  
**Legacy Codebase:** C:\fullstack\ubon-health-insights  
**Target System:** C:\fullstack\ubon-health-insights-nextjs

---

## Executive Summary

This document analyzes the healthcare domain requirements for the Ubon Health Insights system, which tracks KPI performance for **รพ.สต. (Sub-district Health Promoting Hospitals)** under **อบจ.อุบลราชธานี (Ubon Ratchathani Provincial Administrative Organization)** across 13 districts.

### Key Findings

| Domain Area | Status | Priority |
|-------------|--------|----------|
| Thai Health Data Standards | Requires 43-file compliance | P0 |
| Patient Data Privacy (PDPA) | No current implementation | P0 |
| Audit Logging | Not implemented | P0 |
| Actor/Workflow Mapping | Undefined | P1 |

---

## 1. Thai Health Data Standards (43 Files Compliance)

### 1.1 Overview of 43-File Standards

The "43 Files" (43 แฟ้ม) is Thailand's National Health Data Standards established by the Ministry of Public Health. This standard defines 43 core data files for health information exchange across all public health facilities.

**Relevance to This System:**
- รพ.สต. facilities must comply with 43-file standards for data reporting
- KPI calculations depend on accurate data from these files
- Interoperability with national health systems requires 43-file format alignment

### 1.2 Core 43 Files Relevant to This System

| File Code | File Name | Thai Name | Relevance |
|-----------|-----------|-----------|-----------|
| **01** | Person | ข้อมูลบุคคล | Patient demographics, population data |
| **02** | Address | ข้อมูลที่อยู่ | Patient address by tambon/amphoe |
| **03** | Insurance | ข้อมูลสิทธิการรักษา | Health insurance coverage |
| **04** | Diagnosis | ข้อมูลการวินิจฉัย | ICD-10 diagnosis codes |
| **05** | Procedure | ข้อมูลหัตถการ | Medical procedures |
| **06** | Drug | ข้อมูลการใช้ยา | Medication dispensing |
| **07** | Lab | ข้อมูลผลการตรวจทางเทคนิคการแพทย์ | Laboratory results |
| **08** | Radiology | ข้อมูลผลการตรวจทางรังสีวินิจฉัย | Radiology results |
| **09** | Admission | ข้อมูลการนอนรักษาในโรงพยาบาล | Inpatient admissions |
| **10** | Discharge | ข้อมูลการจำหน่าย | Discharge summaries |
| **11** | Death | ข้อมูลการเสียชีวิต | Mortality data |
| **12** | ANC | ข้อมูลการดูแลหญิงตั้งครรภ์ | Antenatal care (PPFS KPIs) |
| **13** | Labor & Delivery | ข้อมูลการคลอด | Delivery records (PPFS KPIs) |
| **14** | Postpartum | ข้อมูลการดูแลหลังคลอด | Postpartum care (PPFS KPIs) |
| **15** | Family Planning | ข้อมูลการวางแผนครอบครัว | Family planning (PPFS KPIs) |
| **16** | Immunization | ข้อมูลการให้ภูมิคุ้มกันโรค | Child immunization |
| **17** | Growth & Development | ข้อมูลการติดตามเด็ก | Child development tracking |
| **18** | NCD Screening | ข้อมูลการคัดกรอง NCD | Non-communicable disease screening |
| **19** | Chronic Care | ข้อมูลการดูแลโรคเรื้อรัง | Chronic disease management |
| **20** | Mental Health | ข้อมูลสุขภาพจิต | Mental health services |
| **21** | Dental | ข้อมูลทันตกรรม | Dental services |
| **22** | Thai Traditional Medicine | ข้อมูลแพทย์แผนไทย | TTM KPIs (นวด, อบ, ประคบ) |
| **23** | Referral | ข้อมูลการส่งต่อ | Patient referrals |
| **24** | Health Volunteer | ข้อมูล อสม. | Community health volunteers |
| **25** | Health Center | ข้อมูลหน่วยบริการ | Health facility master data |
| **26-43** | Various | Various | Additional clinical & admin data |

### 1.3 PPFS KPIs Mapped to 43 Files

**PPFS (Pregnancy, Post-partum, Family Planning & Screening)** KPIs directly correlate with 43-file data:

| KPI Code | KPI Name | Source 43 Files | Calculation |
|----------|----------|-----------------|-------------|
| PPFS-01 | ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์ | File 12 (ANC) | (ANC visits <12 weeks / Total pregnancies) × 100 |
| PPFS-02 | ร้อยละหญิงฝากครรภ์ครบ 5 ครั้งตามเกณฑ์ | File 12 (ANC) | (Complete 5 ANC visits / Total pregnancies) × 100 |
| PPFS-03 | ร้อยละเด็กแรกเกิดน้ำหนักต่ำกว่า 2,500 กรัม | File 13 (Labor) | (Low birth weight / Total births) × 100 |
| PPFS-04 | ร้อยละเด็กได้รับนมแม่อย่างน้อย 6 เดือน | File 14 (Postpartum) | (Exclusive breastfeeding 6 months / Total infants) × 100 |

### 1.4 TTM KPIs Mapped to 43 Files

**TTM (Traditional Thai Medicine)** KPIs correlate with File 22:

| KPI Code | KPI Name | Source 43 Files | Calculation |
|----------|----------|-----------------|-------------|
| TTM-01 | อัตราการใช้ยาสมุนไพร | File 22 | (Patients receiving herbal medicine / Total OPD) × 100 |
| TTM-02 | ร้อยละผู้ป่วยได้รับบริการนวดไทย | File 22 | (Patients receiving Thai massage / Total patients) × 100 |
| TTM-03 | ร้อยละผู้ป่วยได้รับบริการอบสมุนไพร | File 22 | (Patients receiving herbal steam / Total patients) × 100 |
| TTM-04 | ร้อยละผู้ป่วยได้รับบริการประคบสมุนไพร | File 22 | (Patients receiving herbal compress / Total patients) × 100 |

### 1.5 43-File Data Format Requirements

**Standard Format Specifications:**
- Encoding: UTF-8 (Thai language support)
- Date Format: Buddhist Era (B.E.) or ISO 8601
- Administrative Codes: Standard MOI codes for amphoe/tambon
- Health Facility Codes: MOH facility codes (e.g., 10601 for รพ.สต.บุ่งหวาย)
- Unique Identifiers: 13-digit Thai National ID (with checksum validation)

**Data Quality Requirements:**
- Completeness: All required fields populated
- Validity: Code values from official dictionaries
- Consistency: Cross-file referential integrity
- Timeliness: Data submitted within reporting periods

### 1.6 Integration Considerations

**For This System:**
- Data extraction from 43-file exports (CSV/XML/JSON)
- Validation against 43-file dictionaries
- Aggregation for KPI calculations
- Export capability in 43-file format for national reporting

**Recommended Approach:**
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  43-File Data   │────▶│  Validation     │────▶│  KPI Engine     │
│  (Source)       │     │  Layer          │     │  (Calculation)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  Dashboard/     │
                        │  Reports        │
                        └─────────────────┘
```

---

## 2. Patient Data Privacy & Compliance

### 2.1 Applicable Regulations

| Regulation | Jurisdiction | Relevance |
|------------|--------------|-----------|
| **PDPA** (Personal Data Protection Act) | Thailand | Primary data protection law |
| **HIPAA** | USA | Reference standard (not legally binding) |
| **National Health Security Office (NHSO)** | Thailand | Health data governance |
| **Ministry of Public Health Regulations** | Thailand | Healthcare-specific requirements |

### 2.2 PDPA Requirements for Health Data

**Health Data Classification:**
- **Personal Data:** Names, ID numbers, contact info, dates of birth
- **Sensitive Personal Data:** Health records, medical history, diagnosis, treatment (requires explicit consent)

**PDPA Core Principles:**
1. **Lawful Basis:** Consent or legitimate interest for health data processing
2. **Purpose Limitation:** Data used only for specified healthcare purposes
3. **Data Minimization:** Collect only necessary data
4. **Accuracy:** Maintain accurate, up-to-date health records
5. **Storage Limitation:** Retain only as long as legally required
6. **Security:** Implement appropriate technical/organizational measures
7. **Accountability:** Demonstrate compliance

### 2.3 Data Sensitivity Levels

| Level | Data Type | Examples | Protection Required |
|-------|-----------|----------|---------------------|
| **Level 4 - Critical** | Sensitive Health Data | Diagnoses, lab results, mental health, HIV status | Encryption at rest + in transit, strict access control, audit logging |
| **Level 3 - High** | Personal Health Data | Medical record numbers, treatment history, prescriptions | Encryption, RBAC, audit logging |
| **Level 2 - Medium** | Demographic Data | Name, DOB, address, phone, national ID | Encryption, access control |
| **Level 1 - Low** | Aggregated/De-identified | KPI statistics, population counts | Basic access control |

### 2.4 Current System Data Classification

**From Legacy Codebase Analysis:**

| Data Entity | Sensitivity Level | Current Protection | Required Protection |
|-------------|-------------------|-------------------|---------------------|
| Health Unit Master | Level 1 (Low) | None (public) | Basic access control |
| KPI Definitions | Level 1 (Low) | None (public) | Basic access control |
| KPI Results (Aggregated) | Level 1-2 (Low-Medium) | None | RBAC, no PHI |
| Finance Records | Level 2 (Medium) | None | RBAC, encryption |
| Patient-Level Data | Level 3-4 (High-Critical) | **NOT PRESENT** | Full encryption, audit, consent |

**Critical Finding:** Current system does not store patient-level data. All data is aggregated at the health unit level. However, future iterations may include patient-level data entry.

### 2.5 Privacy Requirements for This System

#### 2.5.1 Data Collection & Consent

**Requirements:**
- Obtain explicit consent for sensitive health data collection
- Provide clear privacy notices in Thai language
- Allow data subjects to access, correct, delete their data
- Document consent records with timestamps

**Implementation:**
```typescript
// Consent tracking schema
interface ConsentRecord {
  id: string;
  dataSubjectId: string;  // National ID or health ID
  consentType: 'treatment' | 'research' | 'reporting';
  grantedAt: Date;
  grantedBy: string;  // Authorized person
  withdrawnAt?: Date;
  purpose: string;
  dataCategories: string[];
}
```

#### 2.5.2 Data Access Controls

**Role-Based Access Control (RBAC):**

| Role | Data Access Level | Restrictions |
|------|-------------------|--------------|
| **Health Unit Staff** | Own unit's data only | Cannot view other units |
| **District Health Officer** | All units in district | Cannot view other districts |
| **Provincial Health Office** | All units in province | Full provincial access |
| **NHSO Auditor** | Aggregated data only | No patient-level access |
| **System Admin** | System config only | No health data access |
| **Data Analyst** | De-identified datasets | No direct identifiers |

#### 2.5.3 Data Retention

**Thai Health Data Retention Requirements:**
- **Medical Records:** Minimum 10 years from last encounter
- **ANC/Postpartum Records:** Minimum 10 years
- **Immunization Records:** Lifetime (permanent)
- **Chronic Disease Records:** Minimum 10 years
- **Financial Records:** Minimum 7 years (Thai Revenue Code)
- **Audit Logs:** Minimum 3 years

**Implementation:**
```sql
-- Retention policy tracking
CREATE TABLE data_retention_policies (
  id SERIAL PRIMARY KEY,
  data_category VARCHAR(100) NOT NULL,
  retention_years INT NOT NULL,
  legal_basis TEXT,
  disposal_method VARCHAR(50)
);
```

#### 2.5.4 Data Subject Rights (PDPA)

**Rights to Implement:**
1. **Right to Access:** Export personal data in machine-readable format
2. **Right to Rectification:** Correct inaccurate data
3. **Right to Erasure:** Delete data when no longer necessary (with legal exceptions)
4. **Right to Restriction:** Temporarily limit processing
5. **Right to Portability:** Transfer data to another controller
6. **Right to Object:** Object to processing (with public interest exceptions)

**Implementation Requirements:**
- Self-service portal for data access requests
- Automated data export functionality
- Audit trail for all data subject requests
- Response within 30 days (PDPA requirement)

---

## 3. Audit Logging Requirements

### 3.1 Regulatory Requirements

**Audit logging is mandatory for:**
- PDPA compliance (accountability principle)
- Thai Health Facility Accreditation Standards
- NHSO data submission requirements
- Internal fraud/corruption prevention

### 3.2 Audit Log Categories

| Category | Events to Log | Retention |
|----------|---------------|-----------|
| **Authentication** | Login, logout, failed attempts, password changes, MFA events | 3 years |
| **Authorization** | Access granted, access denied, privilege escalation | 3 years |
| **Data Access** | View patient records, view reports, export data | 3 years |
| **Data Modification** | Create, update, delete any health/finance record | 10 years |
| **System Configuration** | User creation, role changes, system settings | 5 years |
| **Data Export** | Report generation, bulk export, API access | 3 years |
| **Security Events** | Suspicious activity, brute force, SQL injection attempts | 5 years |

### 3.3 Audit Log Schema Design

```sql
CREATE TABLE audit_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  event_type ENUM('AUTH', 'ACCESS', 'MODIFY', 'EXPORT', 'CONFIG', 'SECURITY') NOT NULL,
  event_category VARCHAR(50) NOT NULL,
  event_action ENUM('CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 'DENIED') NOT NULL,
  
  -- Actor identification
  user_id MEDIUMINT UNSIGNED,
  user_email VARCHAR(255),
  user_role VARCHAR(50),
  
  -- Resource identification
  table_name VARCHAR(50),
  record_id VARCHAR(50),
  resource_type VARCHAR(100),
  resource_description VARCHAR(255),
  
  -- Change tracking
  old_values JSON,
  new_values JSON,
  changed_fields JSON,
  
  -- Context
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  session_id VARCHAR(100),
  request_id VARCHAR(100),
  
  -- Timestamps
  event_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fiscal_period_id SMALLINT UNSIGNED,
  
  -- Additional metadata
  health_unit_id MEDIUMINT UNSIGNED,
  amphoe_id SMALLINT UNSIGNED,
  notes TEXT,
  
  INDEX idx_audit_event_type (event_type),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_timestamp (event_timestamp),
  INDEX idx_audit_resource (table_name, record_id),
  INDEX idx_audit_unit (health_unit_id)
);
```

### 3.4 Audit Log Implementation Patterns

#### 3.4.1 Application-Level Logging

**For Business Logic Events:**
```typescript
// Example: KPI result modification
async function updateKPIResult(kpiId: string, data: KPIUpdateData, user: User) {
  const oldRecord = await db.kpiResults.findUnique({ where: { id: kpiId } });
  
  const newRecord = await db.kpiResults.update({
    where: { id: kpiId },
    data: { ...data, updatedBy: user.id }
  });
  
  // Create audit log
  await db.auditLogs.create({
    data: {
      eventType: 'MODIFY',
      eventCategory: 'KPI_UPDATE',
      eventAction: 'UPDATE',
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      tableName: 'kpi_results',
      recordId: kpiId,
      resourceType: 'KPI Result',
      resourceDescription: `${oldRecord?.kpiCode} - ${newRecord.unitName}`,
      oldValues: oldRecord,
      newValues: newRecord,
      changedFields: Object.keys(data),
      ipAddress: user.lastIp,
      healthUnitId: newRecord.healthUnitId
    }
  });
  
  return newRecord;
}
```

#### 3.4.2 Database-Level Triggers

**For Comprehensive Data Change Tracking:**
```sql
-- Trigger for kpi_results table
DELIMITER $$
CREATE TRIGGER trg_kpi_results_audit
AFTER UPDATE ON kpi_results
FOR EACH ROW
BEGIN
  INSERT INTO audit_logs (
    event_type, event_category, event_action,
    table_name, record_id, old_values, new_values,
    event_timestamp
  ) VALUES (
    'MODIFY', 'KPI_CHANGE', 'UPDATE',
    'kpi_results', OLD.id,
    JSON_OBJECT('target_value', OLD.target_value, 'actual_value', OLD.actual_value),
    JSON_OBJECT('target_value', NEW.target_value, 'actual_value', NEW.actual_value),
    NOW()
  );
END$$
DELIMITER ;
```

#### 3.4.3 Middleware Logging

**For Request-Level Audit:**
```typescript
// Express/Next.js middleware
export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  
  res.on('finish', async () => {
    const logEntry = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      responseTime: Date.now() - startTime,
      timestamp: new Date()
    };
    
    // Log suspicious patterns
    if (res.statusCode === 403 || res.statusCode === 401) {
      await logSecurityEvent('ACCESS_DENIED', logEntry);
    }
    
    // Log data exports
    if (req.path.includes('/export')) {
      await logExportEvent(logEntry);
    }
  });
  
  next();
}
```

### 3.5 Audit Log Query Patterns

**Common Audit Queries:**

```sql
-- Who accessed this patient record?
SELECT user_email, event_timestamp, action, ip_address
FROM audit_logs
WHERE table_name = 'patient_records' AND record_id = ?
ORDER BY event_timestamp DESC;

-- What changes were made to this KPI?
SELECT event_timestamp, user_email, old_values, new_values
FROM audit_logs
WHERE table_name = 'kpi_results' AND record_id = ?
ORDER BY event_timestamp;

-- Show all exports by this user in last 30 days
SELECT event_timestamp, resource_description, notes
FROM audit_logs
WHERE user_id = ? AND event_action = 'EXPORT'
  AND event_timestamp > NOW() - INTERVAL 30 DAY;

-- Detect suspicious access patterns
SELECT user_id, COUNT(*) as access_count, 
       COUNT(DISTINCT health_unit_id) as units_accessed
FROM audit_logs
WHERE event_action = 'READ'
  AND event_timestamp > NOW() - INTERVAL 1 HOUR
GROUP BY user_id
HAVING access_count > 100 OR units_accessed > 5;
```

### 3.6 Audit Log Security

**Protection Requirements:**
- **Immutability:** Audit logs cannot be modified or deleted
- **Integrity:** Cryptographic hashing or digital signatures
- **Confidentiality:** Restricted access (security officers only)
- **Availability:** Backed up and retained per policy

**Implementation:**
```sql
-- Prevent modification of audit logs
CREATE VIEW audit_logs_readonly AS SELECT * FROM audit_logs;
-- Grant SELECT only on view, no DML on base table

-- Add integrity hash
ALTER TABLE audit_logs ADD COLUMN integrity_hash VARCHAR(64);
-- Calculate hash: SHA2(CONCAT(id, event_type, record_id, timestamp, old_values, new_values))
```

---

## 4. Actor & Workflow Mapping

### 4.1 Actor Identification

Based on the Thai public health system structure and the legacy codebase analysis:

| Actor | Thai Title | Role Description | System Access Level |
|-------|------------|------------------|---------------------|
| **Actor 1** | ผู้อำนวยการ รพ.สต. (Health Unit Director) | Manages single health unit, oversees data entry | View own unit, submit KPI data, view finance |
| **Actor 2** | เจ้าหน้าที่สาธารณสุข (Health Officer) | Frontline staff, data entry operator | Data entry for own unit, view dashboards |
| **Actor 3** | นักวิชาการสาธารณสุข (Public Health Technical Officer) | District-level analyst, data validator | View all units in district, validate KPI data |
| **Actor 4** | สาธารณสุขอำเภอ (District Health Officer) | District health administrator | Approve KPI submissions, view district analytics |
| **Actor 5** | เจ้าหน้าที่ อบจ. (Provincial Admin Officer) | Ubon PAO coordinator, provincial reporting | View all 13 districts, generate provincial reports |
| **Actor 6** | ผู้บริหาร อบจ. (PAO Executive) | Decision-maker, budget allocator | Executive dashboard, comparison views, export |
| **Actor 7** | ผู้ตรวจสอบ (Auditor) | Internal/external auditor, NHSO inspector | Read-only audit logs, compliance reports |
| **Actor 8** | System Administrator | IT support, user management | User CRUD, system config, no health data |

### 4.2 Workflow Mapping

#### 4.2.1 KPI Data Entry Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    KPI Data Entry & Approval Workflow                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Health      │     │  District    │     │  Provincial  │     │  Executive   │
│  Officer     │     │  Validator   │     │  Reviewer    │     │  Viewer      │
│  (Actor 2)   │     │  (Actor 3)   │     │  (Actor 5)   │     │  (Actor 6)   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │                    │
       │ 1. Enter KPI Data  │                    │                    │
       │    (Quarterly)     │                    │                    │
       │───────────────────▶│                    │                    │
       │                    │                    │                    │
       │                    │ 2. Validate Data   │                    │
       │                    │    Check 43-file  │                    │
       │                    │    completeness   │                    │
       │                    │───────────────────▶│                    │
       │                    │                    │                    │
       │                    │                    │ 3. Aggregate       │
       │                    │                    │    Provincial      │
       │                    │                    │    Summary         │
       │                    │                    │───────────────────▶│
       │                    │                    │                    │
       │                    │                    │                    │ 4. View
       │                    │                    │                    │    Dashboard
       │                    │                    │                    │    Make Decisions
       │                    │                    │                    │
       │ 5. Notification    │                    │                    │
       │    if Rejected    │                    │                    │
       │◀───────────────────│                    │                    │
       │                    │                    │                    │
       │ 6. Correct &       │                    │                    │
       │    Resubmit       │                    │                    │
       │───────────────────▶│                    │                    │
       │                    │                    │                    │
```

**Workflow States:**
- `DRAFT` - Data entered but not submitted
- `SUBMITTED` - Sent for district validation
- `VALIDATED` - District officer approved
- `REJECTED` - Returned for correction (with reason)
- `APPROVED` - Final approval, included in reports
- `PUBLISHED` - Visible on executive dashboard

#### 4.2.2 Finance Data Entry Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Finance     │     │  District    │     │  Provincial  │
│  Clerk       │     │  Finance     │     │  Finance     │
│  (Unit)      │     │  Officer     │     │  Coordinator │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │ 1. Monthly Entry   │                    │
       │    (Income/Expense)│                    │
       │───────────────────▶│                    │
       │                    │                    │
       │                    │ 2. Reconciliation  │
       │                    │    Verify totals   │
       │                    │    against bank    │
       │                    │───────────────────▶│
       │                    │                    │
       │                    │                    │ 3. Consolidate
       │                    │                    │    Provincial Fund
       │                    │                    │    Report
       │                    │                    │
       │                    │                    │ 4. Submit to
       │                    │                    │    PAO Finance
       │                    │                    │    Committee
       │                    │                    │───────────────────▶│
       │                    │                    │                    │
```

#### 4.2.3 Data Correction Workflow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Data        │     │  Validator   │     │  System      │
│  Subject     │     │  (District)  │     │  Audit Log   │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │ 1. Identify Error  │                    │
       │    or Inconsistency│                    │
       │───────────────────▶│                    │
       │                    │                    │
       │                    │ 2. Flag Record     │
       │                    │    Set status      │
       │                    │    REQUIRES_FIX    │
       │                    │───────────────────▶│ Log: FLAG_DATA
       │                    │                    │
       │ 3. Notification    │                    │
       │    (Email/Line)    │                    │
       │◀───────────────────│                    │
       │                    │                    │
       │ 4. Submit          │                    │
       │    Correction      │                    │
       │    Request         │                    │
       │───────────────────▶│                    │
       │                    │                    │
       │                    │ 5. Approve         │
       │                    │    Correction      │
       │                    │───────────────────▶│ Log: CORRECTION_APPROVED
       │                    │                    │    old_values
       │                    │                    │    new_values
       │                    │                    │    reason
       │                    │                    │
       │ 6. Data Updated    │                    │
       │◀───────────────────│                    │
       │                    │                    │
```

### 4.3 Permission Matrix

| Feature / Actor | Health Officer | District Validator | Provincial Reviewer | PAO Executive | Auditor | System Admin |
|-----------------|----------------|-------------------|---------------------|---------------|---------|--------------|
| **Dashboard View** | Own unit | All district units | All provinces | All provinces | Read-only | No access |
| **KPI Data Entry** | Create/Edit own | Review/Edit district | Read-only | Read-only | Read-only | No access |
| **KPI Submit** | Yes (own) | Yes (district) | No | No | No | No |
| **KPI Approve** | No | Yes (district) | Yes (provincial) | No | No | No |
| **KPI Reject** | No | Yes (with reason) | Yes (with reason) | No | No | No |
| **Finance Entry** | Own unit | Review district | Read-only | Read-only | Read-only | No access |
| **Finance Export** | Own unit | District | Provincial | All | Yes | No access |
| **Basic Info View** | All | All | All | All | All | All |
| **Comparison View** | All (anonymized) | District | Provincial | All | All | No access |
| **Audit Log Access** | No | No | No | No | Full access | Config only |
| **User Management** | No | No | No | No | No | Full access |
| **System Config** | No | No | No | No | No | Full access |

### 4.4 Data Ownership & Stewardship

| Data Entity | Data Owner | Data Steward | Custodian |
|-------------|------------|--------------|-----------|
| Health Unit Master | Provincial Health Office | District Health Officer | System Admin |
| KPI Definitions | Ministry of Public Health | NHSO | Provincial Health Office |
| KPI Results | Health Unit Director | District Validator | Provincial Reviewer |
| Finance Records | Health Unit Director | District Finance Officer | Provincial Finance |
| User Accounts | System Owner | System Admin | System Admin |
| Audit Logs | Compliance Officer | Auditor | System Admin |

### 4.5 Communication Channels

| Actor | Preferred Channel | Use Case |
|-------|-------------------|----------|
| Health Officer | Line Group, Email | Daily operations, notifications |
| District Validator | Email, Official Memo | Formal validation, rejection notices |
| Provincial Reviewer | Email, Dashboard | Aggregate reports, alerts |
| PAO Executive | Dashboard, Printed Report | Decision-making, budget allocation |
| Auditor | Audit Log Export, Reports | Compliance verification |
| System Admin | Ticket System, Email | Support requests, incidents |

---

## 5. Domain Constraints & Business Rules

### 5.1 Thai Fiscal Year Constraints

**Fiscal Year Structure:**
- **Start:** October 1 (1 ตุลาคม)
- **End:** September 30 (30 กันยายน)
- **Year Number:** Buddhist Era (B.E.) = C.E. + 543
- **Example:** FY 2567 = October 2024 - September 2025

**Implications:**
```typescript
// Quarter mapping
const thaiFiscalQuarters = {
  1: { months: [10, 11, 12], name: 'Q1 (ตุลาคม-ธันวาคม)' },
  2: { months: [1, 2, 3], name: 'Q2 (มกราคม-มีนาคม)' },
  3: { months: [4, 5, 6], name: 'Q3 (เมษายน-มิถุนายน)' },
  4: { months: [7, 8, 9], name: 'Q4 (กรกฎาคม-กันยายน)' }
};

// Year crossover handling
function getFiscalYear(date: Date): number {
  const month = date.getMonth() + 1;
  const year = date.getFullYear() + 543;  // Convert to B.E.
  return month >= 10 ? year : year - 1;
}
```

### 5.2 Administrative Hierarchy Constraints

**Thailand Administrative Structure:**
```
ประเทศ (Country)
  └── จังหวัด (Province: อุบลราชธานี)
        └── อำเภอ (District: 13 อำเภอ)
              └── ตำบล (Subdistrict)
                    └── หมู่บ้าน (Village)
                          └── ครัวเรือน (Household)
                                └── บุคคล (Person)
```

**System Constraints:**
- Health units belong to exactly one tambon
- Tambons belong to exactly one amphoe
- Amphoes belong to exactly one province (Ubon Ratchathani)
- Cannot move health units between districts without historical tracking

### 5.3 KPI Calculation Rules

**Status Thresholds (From Legacy Code):**
| Percentage Range | Status | Thai Label | Color | Emoji |
|------------------|--------|------------|-------|-------|
| 0-20% | Critical | วิกฤต | Red (#ef4444) | 🔴 |
| 21-40% | Low | ต่ำกว่าเกณฑ์ | Orange (#f97316) | 🟠 |
| 41-60% | Medium | ปานกลาง | Yellow (#eab308) | 🟡 |
| 61-80% | Good | ดี | Green (#22c55e) | 🟢 |
| 81-100% | Excellent | ดีมาก | Blue (#3b82f6) | 🔵 |

**Calculation Formula:**
```typescript
function calculateKPIPercentage(actual: number, target: number, targetType: 'min' | 'max' | 'exact'): number {
  switch (targetType) {
    case 'min':  // Higher is better (e.g., ANC coverage)
      return Math.min((actual / target) * 100, 100);
    case 'max':  // Lower is better (e.g., low birth weight %)
      return Math.max((1 - (actual / target)) * 100, 0);
    case 'exact':  // Target is exact value
      return Math.max((1 - Math.abs(actual - target) / target) * 100, 0);
  }
}
```

### 5.4 Data Validation Rules

**Health Unit Code Validation:**
- Format: 5 digits (e.g., 10601)
- First 2 digits: Province code (10 = Ubon Ratchathani)
- Last 3 digits: Sequential unit number
- Must exist in MOH facility registry

**Thai National ID Validation:**
- Format: 13 digits
- Checksum algorithm required
- Pattern: N-NNNN-NNNNN-NN-N (display format)

**KPI Code Validation:**
- Format: `{CATEGORY}-{NUMBER}` (e.g., PPFS-01, TTM-01)
- Category must exist in kpi_categories table
- Number must be 2 digits (01-99)

### 5.5 Reporting Period Constraints

**KPI Reporting:**
- Frequency: Quarterly (every 3 months)
- Submission deadline: 15th day of month following quarter end
- Example: Q1 (Oct-Dec) → Due January 15

**Finance Reporting:**
- Frequency: Monthly
- Submission deadline: 7th day of following month
- Example: October → Due November 7

**Fiscal Period Lock:**
- After submission deadline, period is locked (is_closed = true)
- Corrections require supervisor approval and audit trail
- Closed periods cannot be modified without audit log entry

---

## 6. Compliance Risk Assessment

### 6.1 Identified Compliance Risks

| Risk ID | Risk Description | Severity | Likelihood | Mitigation Priority |
|---------|------------------|----------|------------|---------------------|
| **CR-01** | No patient consent tracking for sensitive health data | Critical | High | P0 |
| **CR-02** | Audit logging not implemented (PDPA violation) | Critical | Certain | P0 |
| **CR-03** | Data retention policy undefined | High | Probable | P1 |
| **CR-04** | No data subject rights implementation (access/delete) | High | Probable | P1 |
| **CR-05** | 43-file format not validated on import | Medium | Possible | P2 |
| **CR-06** | Cross-border data transfer not addressed | Low | Unlikely | P3 |

### 6.2 Mitigation Roadmap

**Phase 1 (P0 - Before MVP):**
- Implement audit logging for all data modifications
- Deploy RBAC with least-privilege access
- Encrypt sensitive data at rest (AES-256)
- Implement secure authentication (MFA for clinical staff)

**Phase 2 (P1 - Post-MVP):**
- Build consent management module
- Implement data subject rights portal
- Define and document retention policies
- Create data processing agreements

**Phase 3 (P2 - Future):**
- 43-file validation engine
- Automated compliance reporting
- Integration with national health data exchange
- Regular third-party security audits

---

## 7. Recommendations

### 7.1 Immediate Actions

1. **Do NOT store patient-level data** until privacy controls are implemented
2. **Implement audit logging** before any data entry functionality
3. **Deploy RBAC** before opening system to multiple users
4. **Encrypt database** connections and sensitive fields
5. **Document data flows** for PDPA compliance assessment

### 7.2 Architecture Recommendations

1. **Database-first design:** Schema must support audit, consent, retention
2. **Server-side validation:** Never trust client-side checks for health data
3. **Immutable audit logs:** Use append-only tables or blockchain-style hashing
4. **Field-level encryption:** For national IDs, phone numbers, medical record numbers
5. **De-identification for analytics:** Separate analytics DB with hashed identifiers

### 7.3 Process Recommendations

1. **Stakeholder interviews:** Confirm actor roles with actual health facility staff
2. **Legal review:** Engage Thai healthcare law expert for PDPA compliance
3. **43-file expert consultation:** Ensure correct mapping to national standards
4. **Penetration testing:** Before go-live, test for OWASP Top 10 vulnerabilities
5. **Accessibility audit:** WCAG 2.1 AA compliance for public sector requirement

---

## 8. Glossary

| Term | Definition |
|------|------------|
| **43 Files (43 แฟ้ม)** | Thailand's National Health Data Standard (43 data files) |
| **ANC** | Antenatal Care - prenatal health services for pregnant women |
| **PPFS** | Pregnancy, Post-partum, Family Planning & Screening |
| **TTM** | Traditional Thai Medicine (แพทย์แผนไทย) |
| **รพ.สต.** | โรงพยาบาลส่งเสริมสุขภาพตำบล (Sub-district Health Promoting Hospital) |
| **อบจ.** | องค์การบริหารส่วนจังหวัด (Provincial Administrative Organization) |
| **อสม.** | อาสาสมัครสาธารณสุข (Community Health Volunteer) |
| **NHSO** | National Health Security Office (สำนักงานหลักประกันสุขภาพแห่งชาติ) |
| **PDPA** | Personal Data Protection Act B.E. 2562 (Thailand's data protection law) |
| **B.E.** | Buddhist Era (Thai calendar year = C.E. + 543) |
| **Amphoe** | อำเภอ (District) |
| **Tambon** | ตำบล (Subdistrict) |
| **Moo** | หมู่ (Village number) |
| **KPI** | Key Performance Indicator (ตัวชี้วัด) |

---

## 9. References

1. Ministry of Public Health Thailand. "43-File National Health Data Standard."
2. Personal Data Protection Committee (PDPC). "PDPA Guidelines for Healthcare."
3. National Health Security Office (NHSO). "KPI Calculation Guidelines."
4. Ubon Ratchathani Provincial Health Office. "Health Unit Performance Reporting Manual."
5. HIPAA Security Rule (Reference Standard).
6. OWASP Top 10 for Healthcare Applications.

---

**Document Status:** Complete  
**Next Review:** After stakeholder interviews and legal consultation  
**Owner:** Healthcare Analyst Agent  
**Distribution:** Development Team, Product Owner, Compliance Officer
