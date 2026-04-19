import * as XLSX from "xlsx";
import { prisma } from "@/lib/db";
import { syncFinanceAccountsFromBreakdown } from "@/actions/finance-accounts";

type FinanceSheetKind = "income" | "expense";

type ParsedFinanceGroup = {
  sourceCode: string;
  unitCode: string;
  month: number;
  income: number;
  expense: number;
  incomeBreakdown: Record<string, number>;
  expenseBreakdown: Record<string, number>;
};

type ParsedFinanceDocumentGroup = {
  sourceCode: string;
  unitName: string;
  normalizedUnitName: string;
  month: number;
  income: number;
  expense: number;
  incomeBreakdown: Record<string, number>;
  expenseBreakdown: Record<string, number>;
  fileNames: string[];
};

export type FinanceImportFile = {
  name: string;
  buffer: Buffer;
};

export type FinanceImportIssue = {
  sourceCode: string;
  unitCode: string;
  month: number | null;
  reason: string;
};

export type FinanceImportResult = {
  processedFiles: number;
  imported: number;
  updated: number;
  skipped: number;
  detectedUnits: string[];
  issues: FinanceImportIssue[];
};

const THAI_MONTHS = new Map<string, number>([
  ["มกราคม", 1],
  ["กุมภาพันธ์", 2],
  ["มีนาคม", 3],
  ["เมษายน", 4],
  ["พฤษภาคม", 5],
  ["มิถุนายน", 6],
  ["กรกฎาคม", 7],
  ["สิงหาคม", 8],
  ["กันยายน", 9],
  ["ตุลาคม", 10],
  ["พฤศจิกายน", 11],
  ["ธันวาคม", 12],
]);

function detectSheetKind(name: string): FinanceSheetKind | null {
  if (name.includes("รับ")) {
    return "income";
  }
  if (name.includes("จ่าย")) {
    return "expense";
  }
  return null;
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function trimCell(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeUnitName(value: string) {
  return value
    .replace(/โรงพยาบาลส่งเสริมสุขภาพตำบล/g, "")
    .replace(/รพ\.?\s*สต\.?/g, "")
    .replace(/\s+/g, "")
    .replace(/[().-]/g, "")
    .trim()
    .toLowerCase();
}

function parseMonthFromText(value: string) {
  const slashMatch = value.match(/(\d{1,2})\/(\d{1,2})\/(25\d{2}|20\d{2})/);
  if (slashMatch) {
    return Number(slashMatch[2]);
  }

  const thaiMatch = value.match(/(\d{1,2})\s+([ก-๙]+)\s+(25\d{2}|20\d{2})/u);
  if (thaiMatch) {
    return THAI_MONTHS.get(thaiMatch[2]) ?? null;
  }

  return null;
}

function findDocumentUnitName(rows: unknown[][]) {
  for (const row of rows) {
    for (const cell of row) {
      const value = trimCell(cell);
      if (value.includes("โรงพยาบาลส่งเสริมสุขภาพตำบล") || value.includes("รพ.สต.")) {
        return value;
      }
    }
  }
  return "";
}

function findDocumentSourceCode(rows: unknown[][], fallback: string) {
  for (const row of rows) {
    const cells = row.map((cell) => trimCell(cell)).filter(Boolean);
    const labelIndex = cells.findIndex((cell) => cell === "เลขที่");
    if (labelIndex >= 0 && cells[labelIndex + 1]) {
      return cells[labelIndex + 1];
    }
  }
  return fallback;
}

function findDocumentMonth(rows: unknown[][]) {
  for (const row of rows) {
    for (const cell of row) {
      const month = parseMonthFromText(trimCell(cell));
      if (month) {
        return month;
      }
    }
  }
  return null;
}

function detectWorkbookKind(buffer: Buffer): "summary" | "expense-document" | "unknown" {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  if (workbook.SheetNames.some((name) => detectSheetKind(name))) {
    return "summary";
  }

  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) {
    return "unknown";
  }

  const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });

  const flattened = rows.flat().map((cell) => trimCell(cell)).filter(Boolean);
  const hasVoucherShape =
    flattened.some((cell) => cell.includes("ใบผ่านรายการ")) &&
    flattened.some((cell) => cell === "เดบิต") &&
    flattened.some((cell) => cell.includes("โรงพยาบาลส่งเสริมสุขภาพตำบล") || cell.includes("รพ.สต."));

  return hasVoucherShape ? "expense-document" : "unknown";
}

function parsePcuCode(rawValue: unknown) {
  const raw = String(rawValue ?? "").trim();
  const digits = raw.replace(/\D/g, "");

  if (digits.length < 3) {
    return null;
  }

  const month = Number(digits.slice(-2));
  const unitCode = digits.slice(0, -2);

  if (!unitCode || month < 1 || month > 12) {
    return null;
  }

  return {
    sourceCode: digits,
    unitCode,
    month,
  };
}

export function parseFinanceWorkbook(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const grouped = new Map<string, ParsedFinanceGroup>();
  const issues: FinanceImportIssue[] = [];

  for (const sheetName of workbook.SheetNames) {
    const kind = detectSheetKind(sheetName);
    if (!kind) {
      continue;
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: null,
      raw: true,
    });

    for (const row of rows) {
      const parsedCode = parsePcuCode(row.pcucode ?? row.PcodeM ?? row.pcode ?? row.pcuCode);
      if (!parsedCode) {
        issues.push({
          sourceCode: String(row.pcucode ?? row.PcodeM ?? ""),
          unitCode: "",
          month: null,
          reason: `Invalid pcucode in sheet ${sheetName}`,
        });
        continue;
      }

      const ledger = toNumber(row.Ledger ?? row.ledger);
      const accountName = String(row.Accountname ?? row.accountname ?? "Unknown account").trim();
      const accountCode = String(row.Accountcode ?? row.accountcode ?? "").trim();
      const breakdownKey = accountCode ? `${accountCode} ${accountName}` : accountName;
      const groupKey = `${parsedCode.unitCode}:${parsedCode.month}`;

      const current =
        grouped.get(groupKey) ??
        {
          ...parsedCode,
          income: 0,
          expense: 0,
          incomeBreakdown: {},
          expenseBreakdown: {},
        };

      if (kind === "income") {
        current.income += ledger;
        current.incomeBreakdown[breakdownKey] = (current.incomeBreakdown[breakdownKey] ?? 0) + ledger;
      } else {
        current.expense += ledger;
        current.expenseBreakdown[breakdownKey] = (current.expenseBreakdown[breakdownKey] ?? 0) + ledger;
      }

      grouped.set(groupKey, current);
    }
  }

  return {
    records: Array.from(grouped.values()).sort((a, b) => {
      if (a.unitCode === b.unitCode) {
        return a.month - b.month;
      }
      return a.unitCode.localeCompare(b.unitCode);
    }),
    issues,
  };
}

export function parseExpenseDocumentWorkbook(buffer: Buffer, fileName: string) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });

  const unitName = findDocumentUnitName(rows);
  const normalizedUnitName = normalizeUnitName(unitName);
  const month = findDocumentMonth(rows);
  const sourceCode = findDocumentSourceCode(rows, fileName);
  const expenseBreakdown: Record<string, number> = {};
  let expense = 0;

  for (const row of rows) {
    const cells = row
      .map((cell, index) => ({ index, value: trimCell(cell) }))
      .filter((cell) => cell.value);

    if (cells[0]?.value !== "เดบิต") {
      continue;
    }

    const accountName = cells[1]?.value || "Unknown expense";
    const accountCode = cells.find((cell) => /^\d[\d.]+$/.test(cell.value))?.value || "";
    const amount = toNumber(cells[cells.length - 1]?.value);

    if (amount <= 0) {
      continue;
    }

    const breakdownKey = accountCode ? `${accountCode} ${accountName}` : accountName;
    expense += amount;
    expenseBreakdown[breakdownKey] = (expenseBreakdown[breakdownKey] ?? 0) + amount;
  }

  return {
    record:
      unitName && normalizedUnitName && month && expense > 0
        ? {
            sourceCode,
            unitName,
            normalizedUnitName,
            month,
            income: 0,
            expense,
            incomeBreakdown: {},
            expenseBreakdown,
            fileNames: [fileName],
          }
        : null,
    issues: [
      ...(!unitName
        ? [{ sourceCode, unitCode: "", month: month ?? null, reason: `Cannot detect unit name in file ${fileName}` }]
        : []),
      ...(!month
        ? [{ sourceCode, unitCode: "", month: null, reason: `Cannot detect month in file ${fileName}` }]
        : []),
      ...(expense <= 0
        ? [{ sourceCode, unitCode: "", month: month ?? null, reason: `Cannot detect debit amount in file ${fileName}` }]
        : []),
    ] satisfies FinanceImportIssue[],
  };
}

async function importExpenseDocumentFiles(
  files: FinanceImportFile[],
  options: {
    fiscalYear: number;
    recorder?: string;
  }
): Promise<FinanceImportResult> {
  const grouped = new Map<string, ParsedFinanceDocumentGroup>();
  const issues: FinanceImportIssue[] = [];

  for (const file of files) {
    const parsed = parseExpenseDocumentWorkbook(file.buffer, file.name);
    issues.push(...parsed.issues);

    if (!parsed.record) {
      continue;
    }

    const key = `${parsed.record.normalizedUnitName}:${parsed.record.month}`;
    const current: ParsedFinanceDocumentGroup =
      grouped.get(key) ?? {
        ...parsed.record,
        expense: 0,
        expenseBreakdown: {} as Record<string, number>,
        fileNames: [],
      };

    current.expense += parsed.record.expense;
    current.fileNames.push(file.name);

    for (const [account, amount] of Object.entries(parsed.record.expenseBreakdown)) {
      current.expenseBreakdown[account] = (current.expenseBreakdown[account] ?? 0) + amount;
    }

    grouped.set(key, current);
  }

  const records = Array.from(grouped.values());
  const months = [...new Set(records.map((record) => record.month))];
  const units = await prisma.healthUnit.findMany({
    select: { id: true, code: true, name: true },
  });
  const periods = await prisma.fiscalPeriod.findMany({
    where: {
      fiscalYear: options.fiscalYear,
      month: { in: months },
    },
    select: { id: true, month: true },
  });

  const unitsByNormalizedName = new Map<string, Array<{ id: number; code: string; name: string }>>();
  for (const unit of units) {
    const key = normalizeUnitName(unit.name);
    unitsByNormalizedName.set(key, [...(unitsByNormalizedName.get(key) ?? []), unit]);
  }

  const periodMap = new Map(periods.map((period) => [period.month, period]));
  let imported = 0;
  let updated = 0;

  for (const record of records) {
    await syncFinanceAccountsFromBreakdown("expense", Object.keys(record.expenseBreakdown || {}));

    const matchedUnits = unitsByNormalizedName.get(record.normalizedUnitName) ?? [];
    if (matchedUnits.length !== 1) {
      issues.push({
        sourceCode: record.sourceCode,
        unitCode: "",
        month: record.month,
        reason:
          matchedUnits.length === 0
            ? `Health unit ${record.unitName} not found`
            : `Health unit ${record.unitName} is ambiguous`,
      });
      continue;
    }

    const unit = matchedUnits[0];
    const period = periodMap.get(record.month);
    if (!period) {
      issues.push({
        sourceCode: record.sourceCode,
        unitCode: unit.code,
        month: record.month,
        reason: `Fiscal period for year ${options.fiscalYear} month ${record.month} not found`,
      });
      continue;
    }

    const existing = await prisma.financeRecord.findUnique({
      where: {
        healthUnitId_fiscalPeriodId: {
          healthUnitId: unit.id,
          fiscalPeriodId: period.id,
        },
      },
      select: {
        id: true,
        income: true,
      },
    });

    const preservedIncome = Number(existing?.income ?? 0);
    const noteSuffix = `Imported expense documents (${record.fileNames.length} files): ${record.fileNames.join(", ")}`;

    await prisma.financeRecord.upsert({
      where: {
        healthUnitId_fiscalPeriodId: {
          healthUnitId: unit.id,
          fiscalPeriodId: period.id,
        },
      },
      update: {
        expense: record.expense,
        expenseBreakdown: record.expenseBreakdown,
        balance: preservedIncome - record.expense,
        recorder: options.recorder,
        notes: noteSuffix,
      },
      create: {
        healthUnitId: unit.id,
        fiscalPeriodId: period.id,
        income: 0,
        expense: record.expense,
        balance: -record.expense,
        incomeBreakdown: {},
        expenseBreakdown: record.expenseBreakdown,
        recorder: options.recorder,
        notes: noteSuffix,
      },
    });

    if (existing) {
      updated += 1;
    } else {
      imported += 1;
    }
  }

  return {
    processedFiles: files.length,
    imported,
    updated,
    skipped: issues.length,
    detectedUnits: [...new Set(records.map((record) => record.unitName))],
    issues,
  };
}

export async function importFinanceWorkbook(
  buffer: Buffer,
  options: {
    fiscalYear: number;
    recorder?: string;
  }
): Promise<FinanceImportResult> {
  const parsed = parseFinanceWorkbook(buffer);
  const unitCodes = [...new Set(parsed.records.map((record) => record.unitCode))];
  const months = [...new Set(parsed.records.map((record) => record.month))];

  const [units, periods] = await Promise.all([
    prisma.healthUnit.findMany({
      where: { code: { in: unitCodes } },
      select: { id: true, code: true, name: true },
    }),
    prisma.fiscalPeriod.findMany({
      where: {
        fiscalYear: options.fiscalYear,
        month: { in: months },
      },
      select: { id: true, month: true },
    }),
  ]);

  const unitMap = new Map(units.map((unit) => [unit.code, unit]));
  const periodMap = new Map(periods.map((period) => [period.month, period]));

  let imported = 0;
  let updated = 0;
  const issues = [...parsed.issues];

  for (const record of parsed.records) {
    await syncFinanceAccountsFromBreakdown("income", Object.keys(record.incomeBreakdown || {}));
    await syncFinanceAccountsFromBreakdown("expense", Object.keys(record.expenseBreakdown || {}));

    const unit = unitMap.get(record.unitCode);
    if (!unit) {
      issues.push({
        sourceCode: record.sourceCode,
        unitCode: record.unitCode,
        month: record.month,
        reason: `Health unit code ${record.unitCode} not found`,
      });
      continue;
    }

    const period = periodMap.get(record.month);
    if (!period) {
      issues.push({
        sourceCode: record.sourceCode,
        unitCode: record.unitCode,
        month: record.month,
        reason: `Fiscal period for year ${options.fiscalYear} month ${record.month} not found`,
      });
      continue;
    }

    const existing = await prisma.financeRecord.findUnique({
      where: {
        healthUnitId_fiscalPeriodId: {
          healthUnitId: unit.id,
          fiscalPeriodId: period.id,
        },
      },
      select: { id: true },
    });

    await prisma.financeRecord.upsert({
      where: {
        healthUnitId_fiscalPeriodId: {
          healthUnitId: unit.id,
          fiscalPeriodId: period.id,
        },
      },
      update: {
        income: record.income,
        expense: record.expense,
        balance: record.income - record.expense,
        incomeBreakdown: record.incomeBreakdown,
        expenseBreakdown: record.expenseBreakdown,
        recorder: options.recorder,
        notes: `Imported from Excel source code ${record.sourceCode}`,
      },
      create: {
        healthUnitId: unit.id,
        fiscalPeriodId: period.id,
        income: record.income,
        expense: record.expense,
        balance: record.income - record.expense,
        incomeBreakdown: record.incomeBreakdown,
        expenseBreakdown: record.expenseBreakdown,
        recorder: options.recorder,
        notes: `Imported from Excel source code ${record.sourceCode}`,
      },
    });

    if (existing) {
      updated += 1;
    } else {
      imported += 1;
    }
  }

  return {
    processedFiles: 1,
    imported,
    updated,
    skipped: issues.length,
    detectedUnits: units.map((unit) => unit.name),
    issues,
  };
}

export async function importFinanceFiles(
  files: FinanceImportFile[],
  options: {
    fiscalYear: number;
    recorder?: string;
  }
): Promise<FinanceImportResult> {
  if (files.length === 0) {
    return {
      processedFiles: 0,
      imported: 0,
      updated: 0,
      skipped: 1,
      detectedUnits: [],
      issues: [{ sourceCode: "", unitCode: "", month: null, reason: "No Excel files provided" }],
    };
  }

  const summaryFiles: FinanceImportFile[] = [];
  const expenseDocumentFiles: FinanceImportFile[] = [];
  const issues: FinanceImportIssue[] = [];
  let imported = 0;
  let updated = 0;
  const detectedUnits = new Set<string>();

  for (const file of files) {
    const kind = detectWorkbookKind(file.buffer);
    if (kind === "summary") {
      summaryFiles.push(file);
    } else if (kind === "expense-document") {
      expenseDocumentFiles.push(file);
    } else {
      issues.push({
        sourceCode: file.name,
        unitCode: "",
        month: null,
        reason: `Unsupported workbook format in file ${file.name}`,
      });
    }
  }

  for (const file of summaryFiles) {
    const result = await importFinanceWorkbook(file.buffer, options);
    imported += result.imported;
    updated += result.updated;
    result.detectedUnits.forEach((unit) => detectedUnits.add(unit));
    issues.push(...result.issues.map((issue) => ({ ...issue, sourceCode: issue.sourceCode || file.name })));
  }

  if (expenseDocumentFiles.length > 0) {
    const result = await importExpenseDocumentFiles(expenseDocumentFiles, options);
    imported += result.imported;
    updated += result.updated;
    result.detectedUnits.forEach((unit) => detectedUnits.add(unit));
    issues.push(...result.issues);
  }

  return {
    processedFiles: files.length,
    imported,
    updated,
    skipped: issues.length,
    detectedUnits: Array.from(detectedUnits).sort((a, b) => a.localeCompare(b, "th")),
    issues,
  };
}
