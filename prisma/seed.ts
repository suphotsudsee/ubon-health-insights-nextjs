/**
 * Prisma Database Seed Script
 * 
 * This script populates the database with initial reference data:
 * - Districts (amphoe)
 * - Subdistricts (tambon)
 * - KPI Categories
 * - KPI Definitions
 * - Fiscal Periods
 * 
 * Run with: npx prisma db seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // ============================================================
  // Seed Districts (Amphoe)
  // ============================================================
  console.log('📍 Seeding districts...')
  
  const districts = [
    { code: '1001', nameTh: 'เมืองอุบลราชธานี', nameEn: 'Mueang Ubon Ratchathani' },
    { code: '1006', nameTh: 'ม่วงสามสิบ', nameEn: 'Muang Sam Sip' },
    { code: '1007', nameTh: 'นาจะหลวย', nameEn: 'Na Chaluai' },
    { code: '1008', nameTh: 'วารินชำราบ', nameEn: 'Warinchamrap' },
    { code: '1009', nameTh: 'เดชอุดม', nameEn: 'Det Udom' },
    { code: '1010', nameTh: 'ตระการพืชผล', nameEn: 'Trakan Phuet Phon' },
    { code: '1011', nameTh: 'เขื่องใน', nameEn: 'Khueang Nai' },
    { code: '1012', nameTh: 'พิบูลมังสาหาร', nameEn: 'Phibun Mangsahan' },
    { code: '1013', nameTh: 'สำโรง', nameEn: 'Samrong' },
    { code: '1014', nameTh: 'น้ำยืน', nameEn: 'Nam Yuen' },
    { code: '1015', nameTh: 'บุณฑริก', nameEn: 'Buntharik' },
    { code: '1016', nameTh: 'โขงเจียม', nameEn: 'Khong Chiam' },
    { code: '1017', nameTh: 'ศรีเมืองใหม่', nameEn: 'Si Mueang Mai' },
    { code: '1018', nameTh: 'สว่างวีระวงศ์', nameEn: 'Sawang Wirawong' },
  ]

  for (const district of districts) {
    await prisma.dimAmphoe.upsert({
      where: { code: district.code },
      update: { nameTh: district.nameTh, nameEn: district.nameEn },
      create: district,
    })
  }
  
  console.log(`   ✅ Created ${districts.length} districts`)

  // ============================================================
  // Seed KPI Categories
  // ============================================================
  console.log('📊 Seeding KPI categories...')
  
  const categories = [
    { 
      code: 'PPFS', 
      nameTh: 'การฝากครรภ์ หลังคลอด วางแผนครอบครัว และคัดกรอง', 
      nameEn: 'Pregnancy, Post-partum, Family Planning & Screening',
      colorCode: '#3B82F6',
      displayOrder: 1 
    },
    { 
      code: 'TTM', 
      nameTh: 'แพทย์แผนไทย', 
      nameEn: 'Traditional Thai Medicine',
      colorCode: '#10B981',
      displayOrder: 2 
    },
  ]

  for (const category of categories) {
    await prisma.kpiCategory.upsert({
      where: { code: category.code },
      update: { nameTh: category.nameTh, nameEn: category.nameEn, colorCode: category.colorCode },
      create: category,
    })
  }
  
  console.log(`   ✅ Created ${categories.length} KPI categories`)

  // ============================================================
  // Seed KPI Definitions
  // ============================================================
  console.log('📈 Seeding KPI definitions...')
  
  // Get category IDs
  const ppfsCategory = await prisma.kpiCategory.findUnique({ where: { code: 'PPFS' } })
  const ttmCategory = await prisma.kpiCategory.findUnique({ where: { code: 'TTM' } })

  if (!ppfsCategory || !ttmCategory) {
    throw new Error('KPI categories not found')
  }

  const kpiDefinitions = [
    // PPFS KPIs
    { 
      categoryId: ppfsCategory.id, 
      code: 'PPFS-01', 
      nameTh: 'ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์', 
      nameEn: 'Percentage of pregnant women registered before 12 weeks',
      targetValue: 80,
      targetType: 'min' as const,
      unit: '%',
      displayOrder: 1 
    },
    { 
      categoryId: ppfsCategory.id, 
      code: 'PPFS-02', 
      nameTh: 'ร้อยละหญิงฝากครรภ์ครบ 5 ครั้งตามเกณฑ์', 
      nameEn: 'Percentage with 5 prenatal visits',
      targetValue: 75,
      targetType: 'min' as const,
      unit: '%',
      displayOrder: 2 
    },
    { 
      categoryId: ppfsCategory.id, 
      code: 'PPFS-03', 
      nameTh: 'ร้อยละเด็กแรกเกิดน้ำหนักต่ำกว่า 2,500 กรัม', 
      nameEn: 'Low birth weight percentage',
      targetValue: 7,
      targetType: 'max' as const,
      unit: '%',
      displayOrder: 3 
    },
    { 
      categoryId: ppfsCategory.id, 
      code: 'PPFS-04', 
      nameTh: 'ร้อยละเด็กได้รับนมแม่อย่างน้อย 6 เดือน', 
      nameEn: 'Exclusive breastfeeding 6 months',
      targetValue: 50,
      targetType: 'min' as const,
      unit: '%',
      displayOrder: 4 
    },
    // TTM KPIs
    { 
      categoryId: ttmCategory.id, 
      code: 'TTM-01', 
      nameTh: 'อัตราการใช้ยาสมุนไพร', 
      nameEn: 'Herbal medicine usage rate',
      targetValue: 25,
      targetType: 'min' as const,
      unit: '%',
      displayOrder: 1 
    },
    { 
      categoryId: ttmCategory.id, 
      code: 'TTM-02', 
      nameTh: 'ร้อยละผู้ป่วยได้รับบริการนวดไทย', 
      nameEn: 'Thai massage service percentage',
      targetValue: 20,
      targetType: 'min' as const,
      unit: '%',
      displayOrder: 2 
    },
    { 
      categoryId: ttmCategory.id, 
      code: 'TTM-03', 
      nameTh: 'ร้อยละผู้ป่วยได้รับบริการอบสมุนไพร', 
      nameEn: 'Herbal steam service percentage',
      targetValue: 15,
      targetType: 'min' as const,
      unit: '%',
      displayOrder: 3 
    },
    { 
      categoryId: ttmCategory.id, 
      code: 'TTM-04', 
      nameTh: 'ร้อยละผู้ป่วยได้รับบริการประคบสมุนไพร', 
      nameEn: 'Herbal compress service percentage',
      targetValue: 18,
      targetType: 'min' as const,
      unit: '%',
      displayOrder: 4 
    },
  ]

  for (const kpi of kpiDefinitions) {
    await prisma.kpiDefinition.upsert({
      where: { code: kpi.code },
      update: { 
        nameTh: kpi.nameTh, 
        nameEn: kpi.nameEn,
        targetValue: kpi.targetValue,
        targetType: kpi.targetType,
        displayOrder: kpi.displayOrder,
      },
      create: kpi,
    })
  }
  
  console.log(`   ✅ Created ${kpiDefinitions.length} KPI definitions`)

  // ============================================================
  // Seed Fiscal Periods (2567 = FY 2024-2025)
  // ============================================================
  console.log('📅 Seeding fiscal periods...')
  
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  // Thai fiscal year 2567 (Oct 2024 - Sep 2025)
  const fiscalYear = 2567
  const fiscalPeriods = [
    // Q1 (Oct-Dec 2024)
    { month: 10, quarter: 1, startDate: new Date('2024-10-01'), endDate: new Date('2024-10-31') },
    { month: 11, quarter: 1, startDate: new Date('2024-11-01'), endDate: new Date('2024-11-30') },
    { month: 12, quarter: 1, startDate: new Date('2024-12-01'), endDate: new Date('2024-12-31') },
    // Q2 (Jan-Mar 2025)
    { month: 1, quarter: 2, startDate: new Date('2025-01-01'), endDate: new Date('2025-01-31') },
    { month: 2, quarter: 2, startDate: new Date('2025-02-01'), endDate: new Date('2025-02-28') },
    { month: 3, quarter: 2, startDate: new Date('2025-03-01'), endDate: new Date('2025-03-31') },
    // Q3 (Apr-Jun 2025)
    { month: 4, quarter: 3, startDate: new Date('2025-04-01'), endDate: new Date('2025-04-30') },
    { month: 5, quarter: 3, startDate: new Date('2025-05-01'), endDate: new Date('2025-05-31') },
    { month: 6, quarter: 3, startDate: new Date('2025-06-01'), endDate: new Date('2025-06-30') },
    // Q4 (Jul-Sep 2025)
    { month: 7, quarter: 4, startDate: new Date('2025-07-01'), endDate: new Date('2025-07-31') },
    { month: 8, quarter: 4, startDate: new Date('2025-08-01'), endDate: new Date('2025-08-31') },
    { month: 9, quarter: 4, startDate: new Date('2025-09-01'), endDate: new Date('2025-09-30') },
  ]

  for (const period of fiscalPeriods) {
    await prisma.fiscalPeriod.upsert({
      where: {
        fiscalYear_quarter_month: {
          fiscalYear,
          quarter: period.quarter,
          month: period.month,
        },
      },
      update: {
        monthNameTh: thaiMonths[period.month - 1],
        startDate: period.startDate,
        endDate: period.endDate,
      },
      create: {
        fiscalYear,
        quarter: period.quarter,
        month: period.month,
        monthNameTh: thaiMonths[period.month - 1],
        startDate: period.startDate,
        endDate: period.endDate,
      },
    })
  }
  
  console.log(`   ✅ Created ${fiscalPeriods.length} fiscal periods`)

  // ============================================================
  // Seed Admin User (optional)
  // ============================================================
  console.log('👤 Seeding admin user...')
  
  // Check if admin exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@ubonhealth.go.th' },
  })

  if (!existingAdmin) {
    // Create default admin user
    // Password: admin123 (bcrypt hash)
    const adminPasswordHash = '$2a$12$Jm5CcH2q.8VG8rWbKxVN.uWGqb2QEEIwJLKzg6ZS/60p/gKBiQoGC'
    
    await prisma.user.create({
      data: {
        email: 'admin@ubonhealth.go.th',
        passwordHash: adminPasswordHash,
        name: 'ผู้ดูแลระบบ',
        role: 'admin',
        isActive: true,
      },
    })
    
    console.log('   ✅ Created admin user (email: admin@ubonhealth.go.th, password: admin123)')
  } else {
    console.log('   ⏭️  Admin user already exists')
  }

  console.log('✅ Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
