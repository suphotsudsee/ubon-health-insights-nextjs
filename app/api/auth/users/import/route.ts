import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

type CsvRow = {
  "ชื่อ-สกุล": string;
  "E-mail": string;
  "รหัส รพ.สต.": string;
  "ชื่อ รพ.สต.": string;
};

const DEFAULT_PASSWORD = "12345678!";
const SALT_ROUNDS = 12;

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

  const headers = parseCsvLine(lines[0]).map((header) => header.replace(/^\uFEFF/, "").trim());

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCsvLine(line);
      const row = {} as Record<string, string>;
      headers.forEach((header, index) => {
        row[header] = (values[index] ?? "").trim();
      });
      return row as CsvRow;
    })
    .filter((row) => row["ชื่อ-สกุล"] || row["E-mail"] || row["รหัส รพ.สต."] || row["ชื่อ รพ.สต."]);
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
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

  const csvPath = path.join(process.cwd(), "data", "user-state-phoubon.csv");
  if (!fs.existsSync(csvPath)) {
    return NextResponse.json({ error: "Import CSV file not found" }, { status: 404 });
  }

  try {
    const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    const units = await prisma.healthUnit.findMany({
      select: { id: true, code: true },
    });
    const unitByCode = new Map(units.map((unit) => [unit.code, unit]));

    let createdUsers = 0;
    let updatedUsers = 0;
    const skippedRows: Array<{ row: number; reason: string; email?: string; healthUnitCode?: string }> = [];
    const seenEmails = new Set<string>();

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const name = row["ชื่อ-สกุล"]?.trim();
      const email = normalizeEmail(row["E-mail"] || "");
      const healthUnitCode = row["รหัส รพ.สต."]?.trim();

      if (!name || !email || !healthUnitCode) {
        skippedRows.push({ row: rowNumber, reason: "missing required field", email, healthUnitCode });
        continue;
      }

      if (seenEmails.has(email)) {
        skippedRows.push({ row: rowNumber, reason: "duplicate email in CSV", email, healthUnitCode });
        continue;
      }
      seenEmails.add(email);

      const healthUnit = unitByCode.get(healthUnitCode);
      if (!healthUnit) {
        skippedRows.push({ row: rowNumber, reason: "health unit code not found", email, healthUnitCode });
        continue;
      }

      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            name,
            passwordHash,
            role: "staff",
            healthUnitId: healthUnit.id,
            isActive: true,
            loginAttempts: 0,
            lockedUntil: null,
          },
        });
        updatedUsers += 1;
      } else {
        await prisma.user.create({
          data: {
            email,
            passwordHash,
            name,
            role: "staff",
            healthUnitId: healthUnit.id,
            isActive: true,
          },
        });
        createdUsers += 1;
      }
    }

    return NextResponse.json({
      csvRows: rows.length,
      createdUsers,
      updatedUsers,
      skippedRowsCount: skippedRows.length,
      skippedRows: skippedRows.slice(0, 50),
      password: DEFAULT_PASSWORD,
      role: "staff",
    });
  } catch (error) {
    console.error("Error importing users:", error);
    return NextResponse.json({ error: "Failed to import users" }, { status: 500 });
  }
}
