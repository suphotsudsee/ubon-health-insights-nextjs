# MVP vs Full Scope - ระบบติดตามตัวชี้วัด รพ.สต.

## ภาพรวม

เอกสารนี้จำแนกฟีเจอร์ออกเป็น 2 เวอร์ชัน:
- **MVP (Minimum Viable Product)** - ฟีเจอร์ขั้นต่ำที่จำเป็นต้องมีเพื่อให้ระบบใช้งานได้
- **Full Scope** - ฟีเจอร์ครบถ้วนตามที่วางแผนไว้

---

## MoSCoW Prioritization Summary

### 📌 Must Have (ต้องมี)
ฟีเจอร์ที่จำเป็นอย่างยิ่ง หากขาดจะทำให้ระบบใช้งานไม่ได้

### 📌 Should Have (ควรมี)
ฟีเจอร์ที่สำคัญแต่ไม่วิกฤต ควรมีใน MVP ถ้าเป็นไปได้

### 📌 Could Have (น่าจะมี)
ฟีเจอร์ที่ดีมี แต่สามารถเลื่อนไปทำในเวอร์ชันถัดไปได้

### 📌 Won't Do Now (จะไม่ทำในตอนนี้)
ฟีเจอร์ที่ตัดสินใจไม่ทำในรอบพัฒนาปัจจุบัน

---

## MVP Scope (Phase 1)

### เป้าหมาย MVP
- ระบบแสดงผลตัวชี้วัดที่ใช้งานได้จริง
- ข้อมูลอ่านได้จากฐานข้อมูลจริง
- สามารถกรองข้อมูลตามปี/อำเภอ/ไตรมาส
- Dashboard สำหรับผู้บริหารดูภาพรวมได้

### ฟีเจอร์ MVP

#### ✅ Must Have - ใส่ใน MVP

| # | ฟีเจอร์ | หมวดหมู่ | คำอธิบาย | ความซับซ้อน |
|---|---------|----------|----------|-------------|
| 1 | Dashboard ภาพรวม | Dashboard | หน้าแรกแสดงสถิติรวมและกราฟ | ปานกลาง |
| 2 | สถิติรวม (Cards) | Dashboard | ประชากร, อสม., หลังคาเรือน, หมู่บ้าน | ต่ำ |
| 3 | Gauge Chart | Dashboard | วงกลมแสดงผลงานเปอร์เซ็นต์ | ปานกลาง |
| 4 | Bar Chart เปรียบเทียบอำเภอ | Dashboard | กราฟแท่งเรียงลำดับผลงาน | ปานกลาง |
| 5 | ตารางผลงานล่าสุด | Dashboard | แสดง KPI results ล่าสุด | ต่ำ |
| 6 | Filter ปีงบประมาณ | Core | Dropdown เลือกปีงบประมาณ | ต่ำ |
| 7 | Filter อำเภอ | Core | Dropdown เลือกอำเภอ | ต่ำ |
| 8 | หน้า Basic Info | Basic Info | รายการหน่วยบริการทั้งหมด | ต่ำ |
| 9 | Card ข้อมูลหน่วยบริการ | Basic Info | แสดงรายละเอียดแต่ละหน่วย | ต่ำ |
| 10 | หน้า Finance | Finance | สถานะเงินบำรุง | ปานกลาง |
| 11 | Card สรุปการเงิน | Finance | รายรับ, รายจ่าย, คงเหลือ | ต่ำ |
| 12 | Line Chart แนวโน้ม | Finance | กราฟเส้นรายรับ-รายจ่าย | ปานกลาง |
| 13 | ตารางเงินบำรุงรายเดือน | Finance | รายละเอียดการเงิน | ต่ำ |
| 14 | หน้า PPFS | PPFS | ตัวชี้วัดครอบคลุม | ปานกลาง |
| 15 | รายการ KPI PPFS | PPFS | แสดงตัวชี้วัดทั้งหมด | ต่ำ |
| 16 | ตารางผลงาน PPFS | PPFS | รายละเอียดผลงานไตรมาส | ต่ำ |
| 17 | หน้า TTM | TTM | ตัวชี้วัดแพทย์แผนไทย | ปานกลาง |
| 18 | รายการ KPI TTM | TTM | แสดงตัวชี้วัดทั้งหมด | ต่ำ |
| 19 | ตารางผลงาน TTM | TTM | รายละเอียดผลงานไตรมาส | ต่ำ |
| 20 | หน้า Comparison | Comparison | เปรียบเทียบผลงาน | ปานกลาง |
| 21 | ตารางจัดอันดับอำเภอ | Comparison | เรียงลำดับจากผลงาน | ต่ำ |
| 22 | Bar Chart เปรียบเทียบ | Comparison | กราฟ PPFS vs TTM | ปานกลาง |
| 23 | Tab รายหน่วยบริการ | Comparison | เปรียบเทียบรายหน่วย | ต่ำ |
| 24 | Tab การเงิน | Comparison | เปรียบเทียบการเงิน | ต่ำ |
| 25 | Status Badge | Core | แสดงสถานะด้วยสี | ต่ำ |
| 26 | Header/Navigation | Core | เมนูนำทางหน้า | ต่ำ |
| 27 | Footer | Core | ข้อมูลลิขสิทธิ์ | ต่ำ |
| 28 | Responsive Design | Core | รองรับมือถือ | ต่ำ |
| 29 | Database Schema | Backend | ออกแบบตาราง MariaDB | สูง |
| 30 | API Routes | Backend | สร้าง API endpoints | สูง |
| 31 | Seed Data | Backend | ข้อมูลเริ่มต้นจาก mockData | ปานกลาง |

#### ✅ Should Have - พิจารณาใส่ MVP

| # | ฟีเจอร์ | หมวดหมู่ | คำอธิบาย | ความซับซ้อน |
|---|---------|----------|----------|-------------|
| 32 | ค้นหาหน่วยบริการ | Basic Info | Search ชื่อหรือรหัส | ต่ำ |
| 33 | Export Excel | Finance | ส่งออกรายงานเงินบำรุง | ปานกลาง |
| 34 | Export PDF | Comparison | ส่งออกรายงานเปรียบเทียบ | ปานกลาง |
| 35 | ระบบล็อกอิน | Auth | Authentication ผู้ใช้ | สูง |
| 36 | สิทธิ์การเข้าถึง | Auth | จำกัดตามบทบาท | สูง |

---

## Full Scope (Phase 2+)

### เป้าหมาย Full Scope
- ระบบครบถ้วนสมบูรณ์
- รองรับการทำงานของเจ้าหน้าที่
- รองรับการรายงานและวิเคราะห์ขั้นสูง
- ความปลอดภัยและ audit trail

### ฟีเจอร์ Phase 2

#### 📌 Could Have - เฟสถัดไป

| # | ฟีเจอร์ | หมวดหมู่ | คำอธิบาย | Phase |
|---|---------|----------|----------|-------|
| 37 | ป้อนข้อมูล KPI | Data Entry | Form สำหรับเจ้าหน้าที่ | Phase 2 |
| 38 | ป้อนข้อมูลเงินบำรุง | Data Entry | Form บันทึกรายรับ-รายจ่าย | Phase 2 |
| 39 | แจ้งเตือนผลงานต่ำ | Notification | Alert เมื่อต่ำกว่าเกณฑ์ | Phase 2 |
| 40 | ประวัติการแก้ไข | Audit | Audit log การเปลี่ยนแปลง | Phase 2 |
| 41 | กราฟแนวโน้มรายปี | Dashboard | Line chart ย้อนหลัง | Phase 2 |
| 42 | Dashboard ผู้บริหาร | Dashboard | หน้าสรุปเฉพาะผู้บริหาร | Phase 2 |
| 43 | พิมพ์รายงาน | Report | Print-friendly view | Phase 2 |
| 44 | แชร์ลิงก์ | Sharing | URL พร้อม filter | Phase 2 |
| 45 | ตั้งค่าเป้าหมาย | Admin | Admin กำหนดเป้าเอง | Phase 2 |
| 46 | API สำหรับระบบอื่น | Integration | REST API | Phase 2 |
| 47 | Import ข้อมูล | Data Entry | Import CSV/Excel | Phase 2 |

#### ❌ Won't Do Now - ไม่ทำในปัจจุบัน

| # | ฟีเจอร์ | เหตุผล | พิจารณาใหม่เมื่อ |
|---|---------|--------|------------------|
| 48 | แอปพลิเคชันมือถือ (Native App) | เว็บ responsive เพียงพอ, ไม่มีงบ | มีงบประมาณพิเศษ |
| 49 | AI Prediction | ข้อมูลยังไม่เพียงพอ | มีข้อมูล 2+ ปี |
| 50 | Real-time Dashboard | ข้อมูลอัพเดทรายไตรมาส | ต้องการ real-time |
| 51 | ระบบ Notification (Email/Line) | ต้องการ infrastructure | มีงบประมาณ |
| 52 | Multi-language | ผู้ใช้หลักเป็นไทย | มีความต้องการ |
| 53 | Offline Mode | ข้อมูลต้องการ real-time | มีความต้องการพิเศษ |

---

## เปรียบเทียบ MVP vs Full Scope

| หมวดหมู่ | MVP | Full Scope |
|----------|-----|------------|
| **Dashboard** | แสดงผลข้อมูล, Filter ปี/อำเภอ, กราฟพื้นฐาน | + แนวโน้มรายปี, Dashboard ผู้บริหาร |
| **Basic Info** | รายการหน่วยบริการ, Card ข้อมูล | + ค้นหา, Filter ขั้นสูง |
| **Finance** | สรุปการเงิน, กราฟเส้น, ตาราง | + Export, Import ข้อมูล |
| **PPFS** | แสดง KPI, ตารางผลงาน, Filter | + รายละเอียดเพิ่ม, Export |
| **TTM** | แสดง KPI, ตารางผลงาน, Filter | + รายละเอียดเพิ่ม, Export |
| **Comparison** | จัดอันดับ, กราฟเปรียบเทียบ, Tab | + Export, แชร์ลิงก์ |
| **Auth** | ไม่มี (อ่านอย่างเดียว) | ล็อกอิน, สิทธิ์, Audit |
| **Data Entry** | ไม่มี (ข้อมูลจาก DB) | Form ป้อนข้อมูล, Import |
| **Reports** | แสดงบนหน้าจอ | + Export PDF/Excel, Print |
| **Notifications** | ไม่มี | แจ้งเตือนผลงานต่ำ |

---

## แผนการพัฒนา (Development Roadmap)

### Phase 1: MVP (เวลาประมาณ 4-6 สัปดาห์)

#### สัปดาห์ที่ 1-2: Foundation
- [x] ออกแบบ Database Schema
- [x] สร้างโครงสร้างโปรเจ็กต์ Next.js
- [x] สร้างหน้า Layout, Header, Footer
- [x] สร้าง Component พื้นฐาน (Card, Badge, Filter)

#### สัปดาห์ที่ 3-4: Core Pages
- [x] Dashboard หน้าแรก
- [x] Basic Info (หน่วยบริการ)
- [x] Finance (เงินบำรุง)
- [x] PPFS (ตัวชี้วัด)

#### สัปดาห์ที่ 5-6: Completion
- [x] TTM (แพทย์แผนไทย)
- [x] Comparison (เปรียบเทียบ)
- [x] Testing & Bug fixes
- [x] Deployment

### Phase 2: Enhancement (เวลาประมาณ 4-8 สัปดาห์)

- [ ] Authentication & Authorization
- [ ] Data Entry Forms
- [ ] Export Reports
- [ ] Notifications
- [ ] Audit Logging

### Phase 3: Advanced (เวลาประมาณ 4-8 สัปดาห์)

- [ ] Dashboard ผู้บริหาร
- [ ] กราฟแนวโน้มรายปี
- [ ] API สำหรับระบบอื่น
- [ ] Admin Settings

---

## เทคโนโลยีที่ใช้

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Charts:** Recharts

### Backend
- **Database:** MariaDB
- **API:** Next.js Route Handlers & Server Actions
- **ORM:** (เลือกระหว่าง Prisma / Drizzle)

### Infrastructure
- **Container:** Docker
- **Web Server:** Nginx (reverse proxy)
- **Environment Variables:** .env

---

## ความเสี่ยงและการจัดการ

| ความเสี่ยง | โอกาสเกิด | ผลกระทบ | แนวทางจัดการ |
|-----------|-----------|---------|--------------|
| ข้อมูลจริงไม่ตรงกับ mock data | ปานกลาง | สูง | ต้อง verify schema กับทีมงานก่อนพัฒนา |
| ผู้ใช้ไม่คุ้นเคยระบบใหม่ | ปานกลาง | ปานกลาง | จัดอบรม, คู่มือผู้ใช้ |
| Performance ช้าเมื่อข้อมูลมาก | ต่ำ | ปานกลาง | Pagination, Indexing, Query optimization |
| ขาดทรัพยากรพัฒนา | ต่ำ | สูง | กำหนด scope ชัดเจน, MVP ก่อน |

---

## สรุป

### MVP Priority Focus
1. **Dashboard** - หน้าแรกที่ผู้บริหารดูภาพรวมได้ทันที
2. **Data Display** - แสดงข้อมูลทุกหน้าอย่างถูกต้อง
3. **Filtering** - กรองข้อมูลตามปี/อำเภอ/ไตรมาส
4. **Responsive** - ใช้งานได้บนมือถือ

### Phase 2+ Focus
1. **Authentication** - ความปลอดภัย
2. **Data Entry** - ให้เจ้าหน้าที่ป้อนข้อมูลได้
3. **Export/Reports** - รายงานสำหรับผู้บริหาร
4. **Notifications** - แจ้งเตือนผลงานต่ำ

### Won't Do Now Rationale
- **Native App** - เว็บ responsive เพียงพอสำหรับผู้ใช้หลัก
- **AI/Automation** - ต้องการข้อมูลและ expertise เพิ่มเติม
- **Real-time** - ข้อมูลอัพเดทรายไตรมาส ไม่จำเป็นต้อง real-time