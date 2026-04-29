import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type CsvRow = {
  "ที่อยู่อีเมล": string;
  "รหัสหน่วยบริการ และ ชื่อ รพ.สต.": string;
  "หมู่ที่": string;
  "ตำบล": string;
  "อำเภอ": string;
  "ประชากรทั้งหมด (คน)": string;
  "ประชากร ชาย (คน)": string;
  "ประชากร หญิง (คน)": string;
  "อสม. (คน)": string;
  "จำนวนหมู่บ้าน": string;
  "จำนวนหลังคาเรือน": string;
  "จำนวนผู้สูงอายุ (คน)": string;
  "จำนวนวัด/สำนักสงฆ์": string;
  "จำนวนโรงเรียนประถม": string;
  "จำนวนโรงเรียนขยายโอกาส": string;
  "จำนวนโรงเรียนมัธยม": string;
  "ศพค. / สถานีสุขภาพ": string;
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
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map((header) => normalizeText(header.replace(/^\uFEFF/, "")));

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCsvLine(line);
      const row = {} as Record<string, string>;
      headers.forEach((header, index) => {
        row[header] = normalizeText(values[index] ?? "");
      });
      return row as CsvRow;
    })
    .filter((row) => row["รหัสหน่วยบริการ และ ชื่อ รพ.สต."]);
}

function normalizeText(value: string) {
  return value.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
}

function toNullableInt(value?: string) {
  const trimmed = normalizeText(value || "");
  if (!trimmed) return null;
  const parsed = Number(trimmed.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function toCount(value?: string) {
  const parsed = toNullableInt(value);
  if (parsed !== null) return parsed;
  return normalizeText(value || "") ? 1 : 0;
}

function stableCode(prefix: string, value: string) {
  return `${prefix}${crypto.createHash("sha1").update(value).digest("hex").slice(0, 9)}`.slice(0, 10);
}

function splitCodeAndName(value: string) {
  const match = normalizeText(value).match(/^(\d+)\s*-\s*(.+)$/);
  if (!match) {
    return { code: normalizeText(value), name: normalizeText(value) };
  }
  return { code: match[1], name: normalizeText(match[2]) };
}

async function resolveAmphoe(nameTh: string) {
  const existing = await prisma.dimAmphoe.findFirst({
    where: { nameTh },
    select: { id: true, code: true },
  });

  if (existing) return existing;

  return prisma.dimAmphoe.create({
    data: {
      code: stableCode("A", nameTh),
      nameTh,
    },
    select: { id: true, code: true },
  });
}

async function resolveTambon(amphoeId: number, nameTh: string) {
  if (!nameTh) return null;

  const existing = await prisma.dimTambon.findFirst({
    where: { amphoeId, nameTh },
    select: { id: true },
  });

  if (existing) return existing.id;

  const created = await prisma.dimTambon.create({
    data: {
      amphoeId,
      code: stableCode("T", `${amphoeId}:${nameTh}`),
      nameTh,
    },
    select: { id: true },
  });

  return created.id;
}

export async function POST() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const csvPath = path.join(process.cwd(), "data", "health-units-basic.csv");
  if (!fs.existsSync(csvPath)) {
    return NextResponse.json({ error: "Import CSV file not found" }, { status: 404 });
  }

  try {
    const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
    const currentPeriod = await prisma.fiscalPeriod.findFirst({
      orderBy: [{ fiscalYear: "desc" }, { month: "desc" }],
      select: { id: true },
    });

    if (!currentPeriod) {
      return NextResponse.json({ error: "No fiscal period found" }, { status: 400 });
    }

    let createdUnits = 0;
    let updatedUnits = 0;
    let demographicsUpserts = 0;
    const skippedRows: Array<{ row: number; reason: string; unit?: string }> = [];

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const unit = splitCodeAndName(row["รหัสหน่วยบริการ และ ชื่อ รพ.สต."] || "");
      const amphoeName = normalizeText(row["อำเภอ"] || "");
      const tambonName = normalizeText(row["ตำบล"] || "");

      if (!unit.code || !unit.name || !amphoeName) {
        skippedRows.push({ row: rowNumber, reason: "missing unit code/name or district", unit: row["รหัสหน่วยบริการ และ ชื่อ รพ.สต."] });
        continue;
      }

      const amphoe = await resolveAmphoe(amphoeName);
      const tambonId = await resolveTambon(amphoe.id, tambonName);
      const existing = await prisma.healthUnit.findUnique({
        where: { code: unit.code },
        select: { id: true },
      });

      const totalPopulation = toNullableInt(row["ประชากรทั้งหมด (คน)"]);
      const payload = {
        name: unit.name,
        shortName: unit.name,
        amphoeId: amphoe.id,
        tambonId,
        moo: normalizeText(row["หมู่ที่"] || "") || null,
        email: normalizeText(row["ที่อยู่อีเมล"] || "") || null,
        affiliation: "อบจ.อุบลราชธานี",
        province: "อุบลราชธานี",
        ucPopulation68: totalPopulation,
        templeCount: toCount(row["จำนวนวัด/สำนักสงฆ์"]),
        primarySchoolCount: toCount(row["จำนวนโรงเรียนประถม"]),
        opportunitySchoolCount: toCount(row["จำนวนโรงเรียนขยายโอกาส"]),
        secondarySchoolCount: toCount(row["จำนวนโรงเรียนมัธยม"]),
        healthStationCount: toCount(row["ศพค. / สถานีสุขภาพ"]),
        status: "active" as const,
        isDeleted: false,
      };

      const healthUnit = existing
        ? await prisma.healthUnit.update({
            where: { id: existing.id },
            data: payload,
            select: { id: true },
          })
        : await prisma.healthUnit.create({
            data: {
              code: unit.code,
              ...payload,
            },
            select: { id: true },
          });

      if (existing) {
        updatedUnits += 1;
      } else {
        createdUnits += 1;
      }

      await prisma.healthUnitDemographic.upsert({
        where: {
          healthUnitId_fiscalPeriodId: {
            healthUnitId: healthUnit.id,
            fiscalPeriodId: currentPeriod.id,
          },
        },
        create: {
          healthUnitId: healthUnit.id,
          fiscalPeriodId: currentPeriod.id,
          male: toNullableInt(row["ประชากร ชาย (คน)"]),
          female: toNullableInt(row["ประชากร หญิง (คน)"]),
          totalPopulation,
          elderlyPopulation: toNullableInt(row["จำนวนผู้สูงอายุ (คน)"]),
          villages: toNullableInt(row["จำนวนหมู่บ้าน"]),
          households: toNullableInt(row["จำนวนหลังคาเรือน"]),
          healthVolunteers: toNullableInt(row["อสม. (คน)"]),
        },
        update: {
          male: toNullableInt(row["ประชากร ชาย (คน)"]),
          female: toNullableInt(row["ประชากร หญิง (คน)"]),
          totalPopulation,
          elderlyPopulation: toNullableInt(row["จำนวนผู้สูงอายุ (คน)"]),
          villages: toNullableInt(row["จำนวนหมู่บ้าน"]),
          households: toNullableInt(row["จำนวนหลังคาเรือน"]),
          healthVolunteers: toNullableInt(row["อสม. (คน)"]),
        },
      });
      demographicsUpserts += 1;
    }

    revalidatePath("/settings");
    revalidatePath("/basic-info");
    revalidateTag("health-units", "max");
    revalidateTag("demographics", "max");

    return NextResponse.json({
      csvRows: rows.length,
      createdUnits,
      updatedUnits,
      demographicsUpserts,
      skippedRowsCount: skippedRows.length,
      skippedRows: skippedRows.slice(0, 50),
      fiscalPeriodId: currentPeriod.id,
    });
  } catch (error) {
    console.error("Error importing basic health unit data:", error);
    return NextResponse.json({ error: "Failed to import health unit data" }, { status: 500 });
  }
}
