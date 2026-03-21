# UI Route Map - ระบบติดตามตัวชี้วัด

เอกสารนี้แสดงโครงสร้างหน้าและเส้นทางการนำทางของระบบ

## โครงสร้างโฟลเดอร์ App Router

```
app/
├── layout.tsx          # Root layout (Header + Footer)
├── page.tsx             # Dashboard (หน้าหลัก - ภาพรวมระบบ)
├── loading.tsx          # Loading state component
├── error.tsx            # Error boundary component
├── not-found.tsx        # 404 Not Found page
├── globals.css          # Global styles & CSS variables
│
├── basic-info/
│   └── page.tsx          # ข้อมูลพื้นฐานหน่วยบริการ
│
├── finance/
│   └── page.tsx          # สถานะเงินบำรุง
│
├── ppfs/
│   └── page.tsx          # ตัวชี้วัด PPFS
│
├── ttm/
│   └── page.tsx          # ตัวชี้วัดแพทย์แผนไทย
│
└── comparison/
    └── page.tsx          # เปรียบเทียบผลงาน
```

## เส้นทางการนำทาง (Routes)

| เส้นทาง | หน้า | คำอธิบาย |
|---------|------|----------|
| `/` | Dashboard | หน้าหลัก - ภาพรวมระบบติดตามตัวชี้วัด |
| `/basic-info` | Basic Info | ข้อมูลพื้นฐานหน่วยบริการ (รพ.สต.) |
| `/finance` | Finance | สถานะเงินบำรุง - รายรับ/รายจ่าย |
| `/ppfs` | PPFS | ตัวชี้วัด Pregnancy, Post-partum, Family Planning & Screening |
| `/ttm` | TTM | ตัวชี้วัดแพทย์แผนไทย (Traditional Thai Medicine) |
| `/comparison` | Comparison | เปรียบเทียบผลงานรายอำเภอ/หน่วยบริการ |

## คอมโพเนนต์ที่ใช้ซ้ำ (Shared Components)

### Layout Components
- `Header.tsx` - ส่วนหัวของเว็บไซต์พร้อมเมนูนำทาง

### Dashboard Components
- `StatCard.tsx` - การ์ดแสดงสถิติ
- `GaugeChart.tsx` - กราฟวงกลมแสดงเปอร์เซ็นต์
- `FilterBar.tsx` - แถบกรองข้อมูล (ปีงบประมาณ, อำเภอ, ไตรมาส)
- `StatusBadge.tsx` - ป้ายแสดงสถานะผลงาน

### UI Components (shadcn/ui)
- `button.tsx` - ปุ่มกด
- `card.tsx` - การ์ด
- `select.tsx` - ช่องเลือก
- `input.tsx` - ช่องกรอกข้อมูล
- `tabs.tsx` - แท็บสลับหน้า
- `sheet.tsx` - แผงด้านข้าง (มือถือ)
- `dialog.tsx` - กล่องโต้ตอบ

## ข้อมูลที่ใช้ (Data Layer)

### `/data/mockData.ts`
ไฟล์ข้อมูลจำลองประกอบด้วย:

1. **Health Units** - ข้อมูล 14 หน่วยบริการ รพ.สต. จาก 13 อำเภอ
2. **KPI Master** - รายการตัวชี้วัด 8 รายการ (PPFS 4 รายการ, TTM 4 รายการ)
3. **KPI Results** - ผลงานตัวชี้วัดตามหน่วยบริการ
4. **Finance Data** - ข้อมูลการเงินรายเดือน
5. **Amphoe List** - รายชื่อ 13 อำเภอใน จ.อุบลราชธานี
6. **Helper Functions** - ฟังก์ชันช่วยในการคำนวณและแสดงสถานะ

## ธีมและการออกแบบ

### สีหลัก (Color Palette)
- **Primary**: Navy Blue (#1a3a5c) - ความน่าเชื่อถือของหน่วยราชการ
- **Accent**: Teal (#1a9f7a) - สีเขียวทะเลหมอกสำหรับด้านสุขภาพ
- **Status Colors**:
  - Critical (แดง): 0-20%
  - Low (ส้ม): 21-40%
  - Medium (เหลือง): 41-60%
  - Good (เขียว): 61-80%
  - Excellent (น้ำเงิน): 81-100%

### ฟอนต์
- **Sarabun** - ฟอนต์หลักสำหรับภาษาไทย

## การโยงข้อมูลจากระบบเดิม

| หน้าใน Vite/React Router | หน้าใน Next.js App Router |
|---------------------------|----------------------------|
| `/` (Dashboard) | `app/page.tsx` |
| `/basic-info` | `app/basic-info/page.tsx` |
| `/finance` | `app/finance/page.tsx` |
| `/ppfs` | `app/ppfs/page.tsx` |
| `/ttm` | `app/ttm/page.tsx` |
| `/comparison` | `app/comparison/page.tsx` |
| `*` (NotFound) | `app/not-found.tsx` |

## การติดตั้งและใช้งาน

### ความต้องการระบบ
- Node.js 18+
- npm หรือ yarn หรือ pnpm

### การติดตั้ง
```bash
cd ubon-health-insights-nextjs
npm install
```

### การรันโหมดพัฒนา
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ http://localhost:3000

### การ Build สำหรับ Production
```bash
npm run build
npm start
```

## โครงสร้างไฟล์สำคัญ

### Configuration Files
- `package.json` - รายการ dependencies
- `tailwind.config.ts` - การตั้งค่า Tailwind CSS
- `tsconfig.json` - การตั้งค่า TypeScript
- `next.config.js` - การตั้งค่า Next.js
- `components.json` - การตั้งค่า shadcn/ui

### Styling
- `app/globals.css` - CSS variables และ custom styles
- `lib/utils.ts` - Utility functions (cn function)

## การแสดงผลตามขนาดหน้าจอ

### Desktop (≥768px)
- เมนูนำทางแสดงเป็นแถบแนวนอนด้านบน
- การ์ดแสดง 4 คอลัมน์
- ตารางแสดงข้อมูลเต็มความกว้าง

### Mobile (<768px)
- เมนูนำทางซ่อนอยู่ใน Sheet (แผงด้านขวา)
- การ์ดแสดง 1 คอลัมน์
- ตารางเลื่อนซ้าย-ขวาได้ (horizontal scroll)

## หมายเหตุ

- ระบบใช้ **Client Components** (`"use client"`) สำหรับทุกหน้าเนื่องจากมีการใช้ state และ interactive components
- ข้อมูลปัจจุบันเป็น mock data สามารถเปลี่ยนเป็น API fetch ได้ในอนาคต
- รองรับภาษาไทยเป็นหลัก แต่มีคำอธิบายภาษาอังกฤษสำหรับคำศัพท์เทคนิค