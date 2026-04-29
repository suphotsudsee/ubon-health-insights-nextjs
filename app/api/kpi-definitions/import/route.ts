import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { TargetType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

type CsvRow = {
  nameTh: string;
  categoryCode: string;
  targetValue: number | null;
  resultsCount: number | null;
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

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, "").replace(/\s+/g, "").trim().toLowerCase();
}

function parseNumber(value: string | undefined) {
  const normalized = (value ?? "").replace(/,/g, "").trim();
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferTargetType(nameTh: string): TargetType {
  return /น้ำหนักน้อยกว่า|น้อยกว่า\s*2,?500|ต่ำกว่า\s*2,?500|ไม่เกิน/.test(nameTh)
    ? TargetType.max
    : TargetType.min;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const nameIndex = headers.findIndex((header) => header === "ชื่อkpi" || header === "kpiname");
  const categoryIndex = headers.findIndex((header) => header === "หมวด" || header === "category");
  const targetIndex = headers.findIndex((header) => header === "เป้าหมาย" || header === "target");
  const resultsIndex = headers.findIndex((header) => header === "ผลลัพธ์ที่ผูก" || header === "results");

  if (nameIndex === -1 || categoryIndex === -1) {
    throw new Error("CSV ต้องมีคอลัมน์ ชื่อ KPI และ หมวด");
  }

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCsvLine(line);
      return {
        nameTh: (values[nameIndex] ?? "").trim(),
        categoryCode: (values[categoryIndex] ?? "").trim().toUpperCase(),
        targetValue: parseNumber(values[targetIndex]),
        resultsCount: parseNumber(values[resultsIndex]),
      };
    })
    .filter((row) => row.nameTh || row.categoryCode);
}

async function ensureCategory(categoryCode: string) {
  const existing = await prisma.kpiCategory.findUnique({
    where: { code: categoryCode },
  });

  if (existing) return existing;

  return prisma.kpiCategory.create({
    data: {
      code: categoryCode,
      nameTh: categoryCode,
      nameEn: null,
      description: null,
      displayOrder: 99,
      colorCode: null,
      isActive: true,
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "กรุณาเลือกไฟล์ CSV" }, { status: 400 });
    }

    const rows = parseCsv(await file.text());
    if (rows.length === 0) {
      return NextResponse.json({ error: "ไม่พบรายการ KPI ในไฟล์ CSV" }, { status: 400 });
    }

    const categoryCounters = new Map<string, number>();
    let created = 0;
    let updated = 0;
    const skippedRows: Array<{ row: number; reason: string; nameTh?: string; categoryCode?: string }> = [];

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const nameTh = row.nameTh.trim();
      const categoryCode = row.categoryCode.trim().toUpperCase();

      if (!nameTh || !categoryCode) {
        skippedRows.push({ row: rowNumber, reason: "missing required field", nameTh, categoryCode });
        continue;
      }

      const category = await ensureCategory(categoryCode);
      const nextOrder = (categoryCounters.get(categoryCode) ?? 0) + 1;
      categoryCounters.set(categoryCode, nextOrder);

      const code = `${categoryCode}-${String(nextOrder).padStart(2, "0")}`.slice(0, 20);
      const existingByCode = await prisma.kpiDefinition.findUnique({
        where: { code },
        select: { id: true },
      });
      const existingByName = existingByCode
        ? null
        : await prisma.kpiDefinition.findFirst({
            where: { categoryId: category.id, nameTh },
            select: { id: true },
          });

      const data = {
        categoryId: category.id,
        code,
        nameTh,
        nameEn: null,
        description: null,
        unit: "%",
        targetValue: row.targetValue,
        targetType: inferTargetType(nameTh),
        calculationFormula: null,
        dataSource: "CSV",
        reportLink: null,
        displayOrder: nextOrder,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
      };

      if (existingByCode || existingByName) {
        await prisma.kpiDefinition.update({
          where: { id: existingByCode?.id ?? existingByName!.id },
          data,
        });
        updated += 1;
      } else {
        await prisma.kpiDefinition.create({ data });
        created += 1;
      }
    }

    revalidatePath("/settings");
    revalidateTag("kpi-definitions", "max");

    return NextResponse.json({
      csvRows: rows.length,
      created,
      updated,
      skippedRowsCount: skippedRows.length,
      skippedRows: skippedRows.slice(0, 50),
      message: `นำเข้า KPI สำเร็จ: เพิ่ม ${created} รายการ, อัปเดต ${updated} รายการ`,
    });
  } catch (error) {
    console.error("Error importing KPI definitions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ไม่สามารถนำเข้า KPI ได้" },
      { status: 500 },
    );
  }
}
