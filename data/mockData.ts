// ข้อมูลพื้นฐาน 13 อำเภอ
export interface HealthUnit {
  id: string;
  code: string;
  name: string;
  moo: string;
  tambon: string;
  amphoe: string;
  affiliation: string;
  male: number;
  female: number;
  totalPopulation: number;
  villages: number;
  households: number;
  healthVolunteers: number;
  email: string;
}

export interface KPIMaster {
  id: string;
  code: string;
  name: string;
  category: string;
  targetPercent: number;
  reportLink?: string;
}

export interface FinanceData {
  id: string;
  fiscalYear: number;
  month: string;
  unitCode: string;
  unitName: string;
  income: number;
  expense: number;
  balance: number;
  recorder: string;
}

export interface KPIResult {
  id: string;
  fiscalYear: number;
  quarter: number;
  unitCode: string;
  unitName: string;
  amphoe: string;
  kpiCode: string;
  kpiName: string;
  category: string;
  target: number;
  actual: number;
  percentage: number;
}

export const amphoeList = [
  "ม่วงสามสิบ",
  "นาจะหลวย",
  "วารินชำราบ",
  "เดชอุดม",
  "ตระการพืชผล",
  "เขื่องใน",
  "พิบูลมังสาหาร",
  "สำโรง",
  "น้ำยืน",
  "บุณฑริก",
  "โขงเจียม",
  "ศรีเมืองใหม่",
  "สว่างวีระวงศ์"
];

export const monthList = [
  "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  "มกราคม", "กุมภาพันธ์", "มีนาคม",
  "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน"
];

export const healthUnits: HealthUnit[] = [
  {
    id: "1",
    code: "10601",
    name: "รพ.สต.บุ่งหวาย",
    moo: "1",
    tambon: "บุ่งหวาย",
    amphoe: "ม่วงสามสิบ",
    affiliation: "อบจ.อุบลราชธานี",
    male: 1250,
    female: 1320,
    totalPopulation: 2570,
    villages: 8,
    households: 650,
    healthVolunteers: 45,
    email: "bungwai@example.com"
  },
  {
    id: "2",
    code: "10602",
    name: "รพ.สต.หนองช้างใหญ่",
    moo: "3",
    tambon: "หนองช้างใหญ่",
    amphoe: "ม่วงสามสิบ",
    affiliation: "อบจ.อุบลราชธานี",
    male: 980,
    female: 1050,
    totalPopulation: 2030,
    villages: 6,
    households: 480,
    healthVolunteers: 35,
    email: "nongchangyai@example.com"
  },
  {
    id: "3",
    code: "10701",
    name: "รพ.สต.นาจะหลวย",
    moo: "5",
    tambon: "นาจะหลวย",
    amphoe: "นาจะหลวย",
    affiliation: "อบจ.อุบลราชธานี",
    male: 1500,
    female: 1580,
    totalPopulation: 3080,
    villages: 10,
    households: 780,
    healthVolunteers: 55,
    email: "najaluang@example.com"
  },
  {
    id: "4",
    code: "10801",
    name: "รพ.สต.บุ่งไหม",
    moo: "2",
    tambon: "บุ่งไหม",
    amphoe: "วารินชำราบ",
    affiliation: "อบจ.อุบลราชธานี",
    male: 1100,
    female: 1180,
    totalPopulation: 2280,
    villages: 7,
    households: 560,
    healthVolunteers: 40,
    email: "bungmai@example.com"
  },
  {
    id: "5",
    code: "10901",
    name: "รพ.สต.เมืองเดช",
    moo: "1",
    tambon: "เมืองเดช",
    amphoe: "เดชอุดม",
    affiliation: "อบจ.อุบลราชธานี",
    male: 1800,
    female: 1920,
    totalPopulation: 3720,
    villages: 12,
    households: 920,
    healthVolunteers: 65,
    email: "muangdet@example.com"
  },
  {
    id: "6",
    code: "11001",
    name: "รพ.สต.ขุหลุ",
    moo: "4",
    tambon: "ขุหลุ",
    amphoe: "ตระการพืชผล",
    affiliation: "อบจ.อุบลราชธานี",
    male: 890,
    female: 950,
    totalPopulation: 1840,
    villages: 5,
    households: 420,
    healthVolunteers: 28,
    email: "khulu@example.com"
  },
  {
    id: "7",
    code: "11101",
    name: "รพ.สต.เขื่องใน",
    moo: "1",
    tambon: "เขื่องใน",
    amphoe: "เขื่องใน",
    affiliation: "อบจ.อุบลราชธานี",
    male: 1350,
    female: 1420,
    totalPopulation: 2770,
    villages: 9,
    households: 680,
    healthVolunteers: 48,
    email: "khuangnai@example.com"
  },
  {
    id: "8",
    code: "11201",
    name: "รพ.สต.พิบูลมังสาหาร",
    moo: "2",
    tambon: "พิบูล",
    amphoe: "พิบูลมังสาหาร",
    affiliation: "อบจ.อุบลราชธานี",
    male: 1650,
    female: 1750,
    totalPopulation: 3400,
    villages: 11,
    households: 850,
    healthVolunteers: 58,
    email: "phibun@example.com"
  },
  {
    id: "9",
    code: "11301",
    name: "รพ.สต.สำโรง",
    moo: "3",
    tambon: "สำโรง",
    amphoe: "สำโรง",
    affiliation: "อบจ.อุบลราชธานี",
    male: 780,
    female: 850,
    totalPopulation: 1630,
    villages: 5,
    households: 380,
    healthVolunteers: 25,
    email: "samrong@example.com"
  },
  {
    id: "10",
    code: "11401",
    name: "รพ.สต.น้ำยืน",
    moo: "1",
    tambon: "น้ำยืน",
    amphoe: "น้ำยืน",
    affiliation: "อบจ.อุบลราชธานี",
    male: 920,
    female: 980,
    totalPopulation: 1900,
    villages: 6,
    households: 450,
    healthVolunteers: 32,
    email: "namyuen@example.com"
  },
  {
    id: "11",
    code: "11501",
    name: "รพ.สต.บุณฑริก",
    moo: "2",
    tambon: "บุณฑริก",
    amphoe: "บุณฑริก",
    affiliation: "อบจ.อุบลราชธานี",
    male: 1050,
    female: 1120,
    totalPopulation: 2170,
    villages: 7,
    households: 520,
    healthVolunteers: 38,
    email: "buntharik@example.com"
  },
  {
    id: "12",
    code: "11601",
    name: "รพ.สต.โขงเจียม",
    moo: "1",
    tambon: "โขงเจียม",
    amphoe: "โขงเจียม",
    affiliation: "อบจ.อุบลราชธานี",
    male: 680,
    female: 720,
    totalPopulation: 1400,
    villages: 4,
    households: 320,
    healthVolunteers: 22,
    email: "khongjiam@example.com"
  },
  {
    id: "13",
    code: "11701",
    name: "รพ.สต.ศรีเมืองใหม่",
    moo: "4",
    tambon: "ศรีเมืองใหม่",
    amphoe: "ศรีเมืองใหม่",
    affiliation: "อบจ.อุบลราชธานี",
    male: 1150,
    female: 1220,
    totalPopulation: 2370,
    villages: 8,
    households: 580,
    healthVolunteers: 42,
    email: "srimuangmai@example.com"
  },
  {
    id: "14",
    code: "11801",
    name: "รพ.สต.สว่างวีระวงศ์",
    moo: "1",
    tambon: "สว่าง",
    amphoe: "สว่างวีระวงศ์",
    affiliation: "อบจ.อุบลราชธานี",
    male: 850,
    female: 920,
    totalPopulation: 1770,
    villages: 6,
    households: 420,
    healthVolunteers: 30,
    email: "sawang@example.com"
  }
];

export const kpiMaster: KPIMaster[] = [
  {
    id: "1",
    code: "PPFS-01",
    name: "ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์",
    category: "PPFS",
    targetPercent: 80
  },
  {
    id: "2",
    code: "PPFS-02",
    name: "ร้อยละหญิงฝากครรภ์ครบ 5 ครั้งตามเกณฑ์",
    category: "PPFS",
    targetPercent: 75
  },
  {
    id: "3",
    code: "PPFS-03",
    name: "ร้อยละเด็กแรกเกิดน้ำหนักต่ำกว่า 2,500 กรัม",
    category: "PPFS",
    targetPercent: 7
  },
  {
    id: "4",
    code: "PPFS-04",
    name: "ร้อยละเด็กได้รับนมแม่อย่างน้อย 6 เดือน",
    category: "PPFS",
    targetPercent: 50
  },
  {
    id: "5",
    code: "TTM-01",
    name: "อัตราการใช้ยาสมุนไพร",
    category: "แพทย์แผนไทย",
    targetPercent: 25
  },
  {
    id: "6",
    code: "TTM-02",
    name: "ร้อยละผู้ป่วยได้รับบริการนวดไทย",
    category: "แพทย์แผนไทย",
    targetPercent: 20
  },
  {
    id: "7",
    code: "TTM-03",
    name: "ร้อยละผู้ป่วยได้รับบริการอบสมุนไพร",
    category: "แพทย์แผนไทย",
    targetPercent: 15
  },
  {
    id: "8",
    code: "TTM-04",
    name: "ร้อยละผู้ป่วยได้รับบริการประคบสมุนไพร",
    category: "แพทย์แผนไทย",
    targetPercent: 18
  }
];

export const financeData: FinanceData[] = [
  { id: "1", fiscalYear: 2567, month: "ตุลาคม", unitCode: "10601", unitName: "รพ.สต.บุ่งหวาย", income: 150000, expense: 120000, balance: 30000, recorder: "bungwai@example.com" },
  { id: "2", fiscalYear: 2567, month: "พฤศจิกายน", unitCode: "10601", unitName: "รพ.สต.บุ่งหวาย", income: 145000, expense: 115000, balance: 60000, recorder: "bungwai@example.com" },
  { id: "3", fiscalYear: 2567, month: "ธันวาคม", unitCode: "10601", unitName: "รพ.สต.บุ่งหวาย", income: 160000, expense: 140000, balance: 80000, recorder: "bungwai@example.com" },
  { id: "4", fiscalYear: 2567, month: "ตุลาคม", unitCode: "10701", unitName: "รพ.สต.นาจะหลวย", income: 180000, expense: 150000, balance: 30000, recorder: "najaluang@example.com" },
  { id: "5", fiscalYear: 2567, month: "พฤศจิกายน", unitCode: "10701", unitName: "รพ.สต.นาจะหลวย", income: 175000, expense: 160000, balance: 45000, recorder: "najaluang@example.com" },
  { id: "6", fiscalYear: 2567, month: "ธันวาคม", unitCode: "10701", unitName: "รพ.สต.นาจะหลวย", income: 190000, expense: 170000, balance: 65000, recorder: "najaluang@example.com" },
  { id: "7", fiscalYear: 2567, month: "ตุลาคม", unitCode: "10801", unitName: "รพ.สต.บุ่งไหม", income: 120000, expense: 110000, balance: 10000, recorder: "bungmai@example.com" },
  { id: "8", fiscalYear: 2567, month: "พฤศจิกายน", unitCode: "10801", unitName: "รพ.สต.บุ่งไหม", income: 125000, expense: 120000, balance: 15000, recorder: "bungmai@example.com" },
  { id: "9", fiscalYear: 2567, month: "ธันวาคม", unitCode: "10801", unitName: "รพ.สต.บุ่งไหม", income: 130000, expense: 125000, balance: 20000, recorder: "bungmai@example.com" },
  { id: "10", fiscalYear: 2567, month: "ตุลาคม", unitCode: "10901", unitName: "รพ.สต.เมืองเดช", income: 220000, expense: 180000, balance: 40000, recorder: "muangdet@example.com" },
  { id: "11", fiscalYear: 2567, month: "พฤศจิกายน", unitCode: "10901", unitName: "รพ.สต.เมืองเดช", income: 230000, expense: 190000, balance: 80000, recorder: "muangdet@example.com" },
  { id: "12", fiscalYear: 2567, month: "ธันวาคม", unitCode: "10901", unitName: "รพ.สต.เมืองเดช", income: 240000, expense: 200000, balance: 120000, recorder: "muangdet@example.com" },
];

export const kpiResults: KPIResult[] = [
  // ม่วงสามสิบ
  { id: "1", fiscalYear: 2567, quarter: 1, unitCode: "10601", unitName: "รพ.สต.บุ่งหวาย", amphoe: "ม่วงสามสิบ", kpiCode: "PPFS-01", kpiName: "ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์", category: "PPFS", target: 20, actual: 18, percentage: 90 },
  { id: "2", fiscalYear: 2567, quarter: 1, unitCode: "10601", unitName: "รพ.สต.บุ่งหวาย", amphoe: "ม่วงสามสิบ", kpiCode: "TTM-01", kpiName: "อัตราการใช้ยาสมุนไพร", category: "แพทย์แผนไทย", target: 100, actual: 35, percentage: 35 },
  { id: "3", fiscalYear: 2567, quarter: 1, unitCode: "10602", unitName: "รพ.สต.หนองช้างใหญ่", amphoe: "ม่วงสามสิบ", kpiCode: "PPFS-01", kpiName: "ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์", category: "PPFS", target: 15, actual: 12, percentage: 80 },
  { id: "4", fiscalYear: 2567, quarter: 1, unitCode: "10602", unitName: "รพ.สต.หนองช้างใหญ่", amphoe: "ม่วงสามสิบ", kpiCode: "TTM-01", kpiName: "อัตราการใช้ยาสมุนไพร", category: "แพทย์แผนไทย", target: 80, actual: 20, percentage: 25 },
  
  // นาจะหลวย
  { id: "5", fiscalYear: 2567, quarter: 1, unitCode: "10701", unitName: "รพ.สต.นาจะหลวย", amphoe: "นาจะหลวย", kpiCode: "PPFS-01", kpiName: "ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์", category: "PPFS", target: 25, actual: 15, percentage: 60 },
  { id: "6", fiscalYear: 2567, quarter: 1, unitCode: "10701", unitName: "รพ.สต.นาจะหลวย", amphoe: "นาจะหลวย", kpiCode: "TTM-01", kpiName: "อัตราการใช้ยาสมุนไพร", category: "แพทย์แผนไทย", target: 120, actual: 18, percentage: 15 },
  
  // วารินชำราบ
  { id: "7", fiscalYear: 2567, quarter: 1, unitCode: "10801", unitName: "รพ.สต.บุ่งไหม", amphoe: "วารินชำราบ", kpiCode: "PPFS-01", kpiName: "ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์", category: "PPFS", target: 18, actual: 16, percentage: 89 },
  { id: "8", fiscalYear: 2567, quarter: 1, unitCode: "10801", unitName: "รพ.สต.บุ่งไหม", amphoe: "วารินชำราบ", kpiCode: "TTM-01", kpiName: "อัตราการใช้ยาสมุนไพร", category: "แพทย์แผนไทย", target: 90, actual: 14, percentage: 15 },
  
  // เดชอุดม
  { id: "9", fiscalYear: 2567, quarter: 1, unitCode: "10901", unitName: "รพ.สต.เมืองเดช", amphoe: "เดชอุดม", kpiCode: "PPFS-01", kpiName: "ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์", category: "PPFS", target: 30, actual: 28, percentage: 93 },
  { id: "10", fiscalYear: 2567, quarter: 1, unitCode: "10901", unitName: "รพ.สต.เมืองเดช", amphoe: "เดชอุดม", kpiCode: "TTM-01", kpiName: "อัตราการใช้ยาสมุนไพร", category: "แพทย์แผนไทย", target: 150, actual: 60, percentage: 40 },
  
  // ตระการพืชผล
  { id: "11", fiscalYear: 2567, quarter: 1, unitCode: "11001", unitName: "รพ.สต.ขุหลุ", amphoe: "ตระการพืชผล", kpiCode: "PPFS-01", kpiName: "ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์", category: "PPFS", target: 12, actual: 10, percentage: 83 },
  { id: "12", fiscalYear: 2567, quarter: 1, unitCode: "11001", unitName: "รพ.สต.ขุหลุ", amphoe: "ตระการพืชผล", kpiCode: "TTM-01", kpiName: "อัตราการใช้ยาสมุนไพร", category: "แพทย์แผนไทย", target: 70, actual: 45, percentage: 64 },
  
  // เขื่องใน
  { id: "13", fiscalYear: 2567, quarter: 1, unitCode: "11101", unitName: "รพ.สต.เขื่องใน", amphoe: "เขื่องใน", kpiCode: "PPFS-01", kpiName: "ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์", category: "PPFS", target: 22, actual: 11, percentage: 50 },
  { id: "14", fiscalYear: 2567, quarter: 1, unitCode: "11101", unitName: "รพ.สต.เขื่องใน", amphoe: "เขื่องใน", kpiCode: "TTM-01", kpiName: "อัตราการใช้ยาสมุนไพร", category: "แพทย์แผนไทย", target: 100, actual: 30, percentage: 30 },
  
  // พิบูลมังสาหาร
  { id: "15", fiscalYear: 2567, quarter: 1, unitCode: "11201", unitName: "รพ.สต.พิบูลมังสาหาร", amphoe: "พิบูลมังสาหาร", kpiCode: "PPFS-01", kpiName: "ร้อยละหญิงฝากครรภ์ก่อน 12 สัปดาห์", category: "PPFS", target: 28, actual: 24, percentage: 86 },
  { id: "16", fiscalYear: 2567, quarter: 1, unitCode: "11201", unitName: "รพ.สต.พิบูลมังสาหาร", amphoe: "พิบูลมังสาหาร", kpiCode: "TTM-01", kpiName: "อัตราการใช้ยาสมุนไพร", category: "แพทย์แผนไทย", target: 130, actual: 78, percentage: 60 },
];

// Helper function to get status info
export function getStatusInfo(percentage: number): { label: string; color: string; emoji: string; bgClass: string } {
  if (percentage <= 20) {
    return { label: "วิกฤต", color: "status-critical", emoji: "🔴", bgClass: "bg-status-critical" };
  } else if (percentage <= 40) {
    return { label: "ต่ำกว่าเกณฑ์", color: "status-low", emoji: "🟠", bgClass: "bg-status-low" };
  } else if (percentage <= 60) {
    return { label: "ปานกลาง", color: "status-medium", emoji: "🟡", bgClass: "bg-status-medium" };
  } else if (percentage <= 80) {
    return { label: "ดี", color: "status-good", emoji: "🟢", bgClass: "bg-status-good" };
  } else {
    return { label: "ดีมาก", color: "status-excellent", emoji: "🔵", bgClass: "bg-status-excellent" };
  }
}

// Calculate summary statistics
export function calculateSummaryStats() {
  const totalPopulation = healthUnits.reduce((sum, unit) => sum + unit.totalPopulation, 0);
  const totalHealthVolunteers = healthUnits.reduce((sum, unit) => sum + unit.healthVolunteers, 0);
  const totalHouseholds = healthUnits.reduce((sum, unit) => sum + unit.households, 0);
  const totalVillages = healthUnits.reduce((sum, unit) => sum + unit.villages, 0);
  
  const ppfsResults = kpiResults.filter(r => r.category === "PPFS");
  const ttmResults = kpiResults.filter(r => r.category === "แพทย์แผนไทย");
  
  const avgPPFS = ppfsResults.length > 0 
    ? ppfsResults.reduce((sum, r) => sum + r.percentage, 0) / ppfsResults.length 
    : 0;
  const avgTTM = ttmResults.length > 0 
    ? ttmResults.reduce((sum, r) => sum + r.percentage, 0) / ttmResults.length 
    : 0;

  return {
    totalPopulation,
    totalHealthVolunteers,
    totalHouseholds,
    totalVillages,
    totalUnits: healthUnits.length,
    avgPPFS: Math.round(avgPPFS),
    avgTTM: Math.round(avgTTM)
  };
}