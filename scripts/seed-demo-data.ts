import { PrismaClient } from "@prisma/client";
import { financeData, healthUnits, kpiResults } from "../data/mockData";

const prisma = new PrismaClient();

async function main() {
  const amphoeMap = new Map(
    (await prisma.dimAmphoe.findMany()).map((item) => [item.nameTh, item])
  );
  const tambonMap = new Map<string, number>();

  for (const unit of healthUnits) {
    const amphoe = amphoeMap.get(unit.amphoe);
    if (!amphoe) continue;

    const tambonKey = `${amphoe.id}:${unit.tambon}`;
    let tambonId = tambonMap.get(tambonKey);

    if (!tambonId) {
      const tambon = await prisma.dimTambon.upsert({
        where: { code: `${amphoe.code}${unit.code}`.slice(0, 10) },
        update: { amphoeId: amphoe.id, nameTh: unit.tambon },
        create: {
          amphoeId: amphoe.id,
          code: `${amphoe.code}${unit.code}`.slice(0, 10),
          nameTh: unit.tambon,
        },
      });
      tambonId = tambon.id;
      tambonMap.set(tambonKey, tambon.id);
    }

    await prisma.healthUnit.upsert({
      where: { code: unit.code },
      update: {
        name: unit.name,
        moo: unit.moo,
        tambonId,
        amphoeId: amphoe.id,
        affiliation: unit.affiliation,
        email: unit.email,
        status: "active",
      },
      create: {
        code: unit.code,
        name: unit.name,
        moo: unit.moo,
        tambonId,
        amphoeId: amphoe.id,
        affiliation: unit.affiliation,
        email: unit.email,
        status: "active",
      },
    });
  }

  const periods = await prisma.fiscalPeriod.findMany({ where: { fiscalYear: 2567 } });
  const october = periods.find((item) => item.month === 10);

  if (october) {
    for (const unit of healthUnits) {
      const dbUnit = await prisma.healthUnit.findUnique({ where: { code: unit.code } });
      if (!dbUnit) continue;

      await prisma.healthUnitDemographic.upsert({
        where: {
          healthUnitId_fiscalPeriodId: {
            healthUnitId: dbUnit.id,
            fiscalPeriodId: october.id,
          },
        },
        update: {
          male: unit.male,
          female: unit.female,
          totalPopulation: unit.totalPopulation,
          villages: unit.villages,
          households: unit.households,
          healthVolunteers: unit.healthVolunteers,
        },
        create: {
          healthUnitId: dbUnit.id,
          fiscalPeriodId: october.id,
          male: unit.male,
          female: unit.female,
          totalPopulation: unit.totalPopulation,
          villages: unit.villages,
          households: unit.households,
          healthVolunteers: unit.healthVolunteers,
        },
      });
    }
  }

  const periodByMonth = new Map(periods.map((item) => [`${item.fiscalYear}-${item.monthNameTh}`, item]));

  for (const record of financeData) {
    const dbUnit = await prisma.healthUnit.findUnique({ where: { code: record.unitCode } });
    const period = periodByMonth.get(`${record.fiscalYear}-${record.month}`);
    if (!dbUnit || !period) continue;

    await prisma.financeRecord.upsert({
      where: {
        healthUnitId_fiscalPeriodId: {
          healthUnitId: dbUnit.id,
          fiscalPeriodId: period.id,
        },
      },
      update: {
        income: record.income,
        expense: record.expense,
        balance: record.balance,
        recorder: record.recorder,
      },
      create: {
        healthUnitId: dbUnit.id,
        fiscalPeriodId: period.id,
        income: record.income,
        expense: record.expense,
        balance: record.balance,
        recorder: record.recorder,
      },
    });
  }

  const periodByQuarter = new Map(periods.map((item) => [`${item.fiscalYear}-${item.quarter}`, item]));
  const kpiByCode = new Map((await prisma.kpiDefinition.findMany()).map((item) => [item.code, item]));

  for (const result of kpiResults) {
    const dbUnit = await prisma.healthUnit.findUnique({ where: { code: result.unitCode } });
    const kpi = kpiByCode.get(result.kpiCode);
    const period = periodByQuarter.get(`${result.fiscalYear}-${result.quarter}`);
    if (!dbUnit || !kpi || !period) continue;

    await prisma.kpiResult.upsert({
      where: {
        kpiId_healthUnitId_fiscalPeriodId: {
          kpiId: kpi.id,
          healthUnitId: dbUnit.id,
          fiscalPeriodId: period.id,
        },
      },
      update: {
        targetValue: result.target,
        actualValue: result.actual,
        percentage: result.percentage,
      },
      create: {
        kpiId: kpi.id,
        healthUnitId: dbUnit.id,
        fiscalPeriodId: period.id,
        targetValue: result.target,
        actualValue: result.actual,
        percentage: result.percentage,
      },
    });
  }

  console.log(`Seeded demo data for ${healthUnits.length} health units`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
