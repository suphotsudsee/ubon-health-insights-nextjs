import { prisma } from "@/lib/db";
import { monthList } from "@/lib/dashboard-utils";

export async function getDashboardDataset() {
  const currentPeriod =
    (await prisma.fiscalPeriod.findFirst({
      orderBy: [{ fiscalYear: "desc" }, { month: "desc" }],
    })) ?? null;

  const [districts, healthUnits, demographics, kpiDefinitions, kpiResults, financeRecords] = await Promise.all([
    prisma.dimAmphoe.findMany({ orderBy: { nameTh: "asc" } }),
    prisma.healthUnit.findMany({
      where: { isDeleted: false },
      include: { amphoe: true, tambon: true },
      orderBy: [{ amphoe: { nameTh: "asc" } }, { name: "asc" }],
    }),
    prisma.healthUnitDemographic.findMany({
      where: currentPeriod ? { fiscalPeriodId: currentPeriod.id } : undefined,
      orderBy: { fiscalPeriodId: "desc" },
    }),
    prisma.kpiDefinition.findMany({
      where: { isDeleted: false, isActive: true },
      include: { category: true },
      orderBy: [{ category: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    }),
    prisma.kpiResult.findMany({
      include: {
        kpi: { include: { category: true } },
        healthUnit: { include: { amphoe: true } },
        fiscalPeriod: true,
      },
      orderBy: [{ fiscalPeriod: { fiscalYear: "desc" } }, { fiscalPeriod: { quarter: "desc" } }],
    }),
    prisma.financeRecord.findMany({
      include: {
        healthUnit: true,
        fiscalPeriod: true,
      },
      orderBy: [{ fiscalPeriod: { fiscalYear: "desc" } }, { fiscalPeriod: { month: "asc" } }],
    }),
  ]);

  const demographicsByUnit = new Map(demographics.map((item) => [item.healthUnitId, item]));

  return {
    amphoeList: districts.map((district) => district.nameTh),
    monthList,
    healthUnits: healthUnits.map((unit) => {
      const demo = demographicsByUnit.get(unit.id);
      return {
        id: String(unit.id),
        code: unit.code,
        name: unit.name,
        moo: unit.moo || "-",
        tambon: unit.tambon?.nameTh || "-",
        amphoe: unit.amphoe.nameTh,
        affiliation: unit.affiliation || "",
        transferYear: unit.transferYear || null,
        unitSize: unit.unitSize || "",
        cupCode: unit.cupCode || "",
        cupName: unit.cupName || "",
        localAuthority: unit.localAuthority || "",
        province: unit.province || "",
        ucPopulation66: unit.ucPopulation66 || 0,
        ucPopulation67: unit.ucPopulation67 || 0,
        ucPopulation68: unit.ucPopulation68 || 0,
        male: demo?.male || 0,
        female: demo?.female || 0,
        totalPopulation: demo?.totalPopulation || 0,
        elderlyPopulation: demo?.elderlyPopulation || 0,
        villages: demo?.villages || 0,
        households: demo?.households || 0,
        healthVolunteers: demo?.healthVolunteers || 0,
        templeCount: unit.templeCount,
        primarySchoolCount: unit.primarySchoolCount,
        opportunitySchoolCount: unit.opportunitySchoolCount,
        secondarySchoolCount: unit.secondarySchoolCount,
        childDevelopmentCenterCount: unit.childDevelopmentCenterCount,
        healthStationCount: unit.healthStationCount,
        email: unit.email || "",
      };
    }),
    kpiMaster: kpiDefinitions.map((item) => ({
      id: String(item.id),
      code: item.code,
      name: item.nameTh,
      category: item.category.code === "TTM" ? "แพทย์แผนไทย" : item.category.code,
      targetPercent: Number(item.targetValue || 0),
      reportLink: item.reportLink || undefined,
    })),
    kpiResults: kpiResults.map((item) => ({
      id: String(item.id),
      fiscalYear: item.fiscalPeriod.fiscalYear,
      quarter: item.fiscalPeriod.quarter,
      unitCode: item.healthUnit.code,
      unitName: item.healthUnit.name,
      amphoe: item.healthUnit.amphoe.nameTh,
      kpiCode: item.kpi.code,
      kpiName: item.kpi.nameTh,
      category: item.kpi.category.code === "TTM" ? "แพทย์แผนไทย" : item.kpi.category.code,
      target: Number(item.targetValue),
      actual: Number(item.actualValue),
      percentage: Number(item.percentage),
    })),
    financeData: financeRecords.map((item) => ({
      id: String(item.id),
      fiscalYear: item.fiscalPeriod.fiscalYear,
      month: item.fiscalPeriod.monthNameTh,
      unitCode: item.healthUnit.code,
      unitName: item.healthUnit.name,
      income: Number(item.income),
      expense: Number(item.expense),
      balance: Number(item.balance),
      incomeBreakdown: item.incomeBreakdown,
      expenseBreakdown: item.expenseBreakdown,
      recorder: item.recorder || "",
    })),
  };
}
