const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_PASSWORD = "12345678!";
const DEFAULT_PASSWORD_HASH = "$2a$12$lJNvdmuznRxQoljlo7SfTuol.b0HSGZsN8bel2SXpS9ICO7IM.dCS";

function parseCsvLine(line) {
  const result = [];
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

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]).map((header) => header.replace(/^\uFEFF/, "").trim());

  return lines
    .slice(1)
    .map((line) => {
      const values = parseCsvLine(line);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = (values[index] || "").trim();
      });
      return row;
    })
    .filter((row) => row["ชื่อ-สกุล"] || row["E-mail"] || row["รหัส รพ.สต."] || row["ชื่อ รพ.สต."]);
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

async function main() {
  const csvPath =
    process.argv[2] ||
    path.join("C:", "Users", "DELL", "Downloads", "รายชื่อuser_state_phoubon.csv");

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const text = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(text);
  const passwordHash = process.env.IMPORT_USERS_PASSWORD_HASH || DEFAULT_PASSWORD_HASH;

  const units = await prisma.healthUnit.findMany({
    select: {
      id: true,
      code: true,
      name: true,
    },
  });
  const unitByCode = new Map(units.map((unit) => [unit.code, unit]));

  let createdUsers = 0;
  let updatedUsers = 0;
  const skippedRows = [];
  const seenEmails = new Set();

  for (const [index, row] of rows.entries()) {
    const rowNumber = index + 2;
    const name = (row["ชื่อ-สกุล"] || "").trim();
    const email = normalizeEmail(row["E-mail"] || "");
    const healthUnitCode = (row["รหัส รพ.สต."] || "").trim();

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

  console.log(
    JSON.stringify(
      {
        csvPath,
        csvRows: rows.length,
        createdUsers,
        updatedUsers,
        skippedRowsCount: skippedRows.length,
        skippedRows: skippedRows.slice(0, 50),
        password: DEFAULT_PASSWORD,
        role: "staff",
      },
      null,
      2,
    ),
  );

  if (skippedRows.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
