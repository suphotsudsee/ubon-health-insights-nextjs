# ระบบติดตามตัวชี้วัด - รพ.สต. อบจ.อุบลราชธานี

ระบบติดตามตัวชี้วัดสำหรับรพ.สต. สังกัด อบจ.อุบลราชธานี ทั้ง 13 อำเภอ

## เทคโนโลยีที่ใช้

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** - UI Components
- **Recharts** - กราฟและแผนภูมิ
- **Lucide React** - Icons

## การติดตั้ง

```bash
npm install
```

## การรันโหมดพัฒนา

```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ http://localhost:3000

## โครงสร้างโปรเจค

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx             # Dashboard (หน้าหลัก)
│   ├── loading.tsx          # Loading state
│   ├── error.tsx            # Error boundary
│   ├── not-found.tsx        # 404 page
│   ├── globals.css           # Global styles
│   ├── basic-info/page.tsx  # ข้อมูลพื้นฐาน
│   ├── finance/page.tsx      # สถานะเงินบำรุง
│   ├── ppfs/page.tsx         # ตัวชี้วัด PPFS
│   ├── ttm/page.tsx          # ตัวชี้วัดแพทย์แผนไทย
│   └── comparison/page.tsx  # เปรียบเทียบผลงาน
├── components/
│   ├── layout/              # Header component
│   ├── dashboard/           # StatCard, GaugeChart, FilterBar, StatusBadge
│   └── ui/                  # shadcn/ui components
├── data/
│   └── mockData.ts          # ข้อมูลจำลอง
├── lib/
│   └── utils.ts             # Utility functions
└── docs/
    └── ui-route-map.md      # เอกสารโครงสร้าง UI
```

## หน้าหลัก

| เส้นทาง | หน้า | คำอธิบาย |
|---------|------|----------|
| `/` | Dashboard | ภาพรวมระบบติดตามตัวชี้วัด |
| `/basic-info` | Basic Info | ข้อมูลพื้นฐานหน่วยบริการ |
| `/finance` | Finance | สถานะเงินบำรุง |
| `/ppfs` | PPFS | ตัวชี้วัด Pregnancy, Post-partum, Family Planning & Screening |
| `/ttm` | TTM | ตัวชี้วัดแพทย์แผนไทย |
| `/comparison` | Comparison | เปรียบเทียบผลงาน |

## การ Build

```bash
npm run build
```

## การ Deploy

```bash
npm run build
npm start
```

## License

© 2569 องค์การบริหารส่วนจังหวัดอุบลราชธานี
