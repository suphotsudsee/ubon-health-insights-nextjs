import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type CsvRow = {
  "ปีโอน": string;
  "ชื่อหน่วยบริการ": string;
  Size: string;
  "แม่ข่าย(CUP)": string;
  "สังกัด อปท.": string;
  "จังหวัด": string;
  "ปชก.UC66": string;
  "ปชก.UC67": string;
  "ปชก.UC68": string;
};

function parseCsvLine(line: string) {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headers = parseCsvLine(lines[0]).map((header) => header.replace(/^\uFEFF/, "").trim());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {} as Record<string, string>;
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row as CsvRow;
  });
}

function toNullableInt(value?: string) {
  const trimmed = (value || "").trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function splitCodeAndName(value: string) {
  const match = value.trim().match(/^(\d+)\s*-\s*(.+)$/);
  if (match) {
    return { code: match[1], name: match[2].trim() };
  }
  return { code: value.trim(), name: value.trim() };
}

function deriveDistrictName(cupName: string) {
  return cupName.replace(/^รพ\./, "").trim();
}

async function resolveDistrictId(cupCode: string | null, cupName: string) {
  const districtName = deriveDistrictName(cupName);
  const existing = await prisma.dimAmphoe.findFirst({
    where: {
      OR: [{ nameTh: districtName }, { code: cupCode || undefined }],
    },
  });

  if (existing) {
    return existing.id;
  }

  const safeCode = (cupCode || `IMP${districtName}`).replace(/\s+/g, "").slice(0, 10);
  const created = await prisma.dimAmphoe.create({
    data: {
      code: safeCode,
      nameTh: districtName,
      nameEn: null,
      region: null,
    },
  });

  return created.id;
}

async function main() {
  const csvPath =
    process.argv[2] ||
    path.join(
      "C:",
      "Users",
      "DELL",
      "Downloads",
      "ข้อมูลถ่ายโอนภารกิจ สอน._รพ.สต.ไปสู่ อปท._ตรวจสอบรพ.สต.ถ่ายโอน_Table.csv",
    );

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const text = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(text);
  const currentPeriod = await prisma.fiscalPeriod.findFirst({
    orderBy: [{ fiscalYear: "desc" }, { month: "desc" }],
  });

  if (!currentPeriod) {
    throw new Error("No fiscal period found");
  }

  let createdUnits = 0;
  let updatedUnits = 0;
  let demographicsUpserts = 0;

  for (const row of rows) {
    const unit = splitCodeAndName(row["ชื่อหน่วยบริการ"]);
    const cup = splitCodeAndName(row["แม่ข่าย(CUP)"]);
    const amphoeId = await resolveDistrictId(cup.code || null, cup.name);

    const existing = await prisma.healthUnit.findUnique({
      where: { code: unit.code },
    });

    const payload = {
      name: unit.name,
      shortName: unit.name,
      amphoeId,
      affiliation: row["สังกัด อปท."].trim() || null,
      transferYear: toNullableInt(row["ปีโอน"]),
      unitSize: row.Size.trim() || null,
      cupCode: cup.code || null,
      cupName: cup.name || null,
      localAuthority: row["สังกัด อปท."].trim() || null,
      province: row["จังหวัด"].trim() || null,
      ucPopulation66: toNullableInt(row["ปชก.UC66"]),
      ucPopulation67: toNullableInt(row["ปชก.UC67"]),
      ucPopulation68: toNullableInt(row["ปชก.UC68"]),
      status: "active" as const,
      isDeleted: false,
    };

    let healthUnitId: number;

    if (existing) {
      const updated = await prisma.healthUnit.update({
        where: { id: existing.id },
        data: payload,
      });
      healthUnitId = updated.id;
      updatedUnits += 1;
    } else {
      const created = await prisma.healthUnit.create({
        data: {
          code: unit.code,
          ...payload,
        },
      });
      healthUnitId = created.id;
      createdUnits += 1;
    }

    await prisma.healthUnitDemographic.upsert({
      where: {
        healthUnitId_fiscalPeriodId: {
          healthUnitId,
          fiscalPeriodId: currentPeriod.id,
        },
      },
      create: {
        healthUnitId,
        fiscalPeriodId: currentPeriod.id,
        totalPopulation: toNullableInt(row["ปชก.UC68"]),
      },
      update: {
        totalPopulation: toNullableInt(row["ปชก.UC68"]),
      },
    });
    demographicsUpserts += 1;
  }

  console.log(
    JSON.stringify(
      {
        csvPath,
        rows: rows.length,
        createdUnits,
        updatedUnits,
        demographicsUpserts,
        fiscalPeriodId: currentPeriod.id,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
