import * as XLSX from "xlsx";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { syncFinanceAccountsFromBreakdown } from "@/actions/finance-accounts";

function toInputJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  return value as Prisma.InputJsonValue;
}

type FinanceSheetKind = "income" | "expense";
type WorkbookKind = "summary" | "expense-document" | "trial-balance" | "unknown";

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
  openingDebit: number;
  openingCredit: number;
  movementDebit: number;
  movementCredit: number;
  closingDebit: number;
  closingCredit: number;
  trialBalanceRows?: Array<Record<string, unknown>>;
  fileNames: string[];
};

export type FinanceImportFile = {
  name: string;
  buffer: Buffer;
};

export type FinanceImportPreviewItem = {
  sourceCode: string;
  unitCode: string;
  unitName: string;
  month: number;
  fiscalYear: number;
  income: number;
  expense: number;
  status: "ready" | "unknown-unit" | "ambiguous-unit" | "unknown-period";
  reason?: string;
  files?: string[];
  willUpdate: boolean;
};

export type FinanceImportIssue = {
  sourceCode: string;
  unitCode: string;
  month: number | null;
  reason: string;
};

export type FinanceImportDebugItem = {
  sourceCode: string;
  unitCode: string;
  unitName: string;
  month: number | null;
  fiscalYear: number;
  files: string[];
  status: "imported" | "updated" | "skipped";
  reason?: string;
};

export type FinanceImportResult = {
  processedFiles: number;
  imported: number;
  updated: number;
  skipped: number;
  detectedUnits: string[];
  issues: FinanceImportIssue[];
  debugItems: FinanceImportDebugItem[];
};

export type FinanceImportPreview = {
  processedFiles: number;
  readyCount: number;
  issueCount: number;
  detectedUnits: string[];
  items: FinanceImportPreviewItem[];
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

function normalizeAccountCode(value: string) {
  return value.replace(/[^\d.]/g, "").trim();
}

function classifyVoucherEntry(
  accountCode: string,
  side: "debit" | "credit"
): { kind: "income" | "expense" | null; multiplier: number } {
  const normalized = normalizeAccountCode(accountCode);
  const accountClass = normalized[0];

  if (accountClass === "4") {
    return { kind: "income", multiplier: side === "credit" ? 1 : -1 };
  }

  if (accountClass === "5") {
    return { kind: "expense", multiplier: side === "debit" ? 1 : -1 };
  }

  return { kind: null, multiplier: 0 };
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
  if (!value) {
    return null;
  }

  if (value.includes("วันที่พิมพ์")) {
    return null;
  }

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
      const value = trimCell(cell);
      if (!value.includes("ณ วันที่")) {
        continue;
      }

      const month = parseMonthFromText(value);
      if (month) {
        return month;
      }
    }
  }

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

async function cleanupMisfiledNamedImports(params: {
  healthUnitId: number;
  fiscalYear: number;
  month: number;
  fileNames: string[];
}) {
  const normalizedFileNames = [...new Set(params.fileNames.map((fileName) => fileName.trim()).filter(Boolean))];
  if (normalizedFileNames.length === 0) {
    return [];
  }

  const candidates = await prisma.financeRecord.findMany({
    where: {
      healthUnitId: params.healthUnitId,
      fiscalPeriod: {
        fiscalYear: params.fiscalYear,
        month: { not: params.month },
      },
    },
    select: {
      id: true,
      notes: true,
      fiscalPeriod: {
        select: {
          month: true,
          monthNameTh: true,
        },
      },
    },
  });

  const wrongMonthRecords = candidates.filter((record) =>
    normalizedFileNames.some((fileName) => (record.notes || "").includes(fileName))
  );

  if (wrongMonthRecords.length === 0) {
    return [];
  }

  await prisma.financeRecord.deleteMany({
    where: {
      id: { in: wrongMonthRecords.map((record) => record.id) },
    },
  });

  return wrongMonthRecords.map((record) => ({
    id: record.id,
    month: record.fiscalPeriod.month,
    monthNameTh: record.fiscalPeriod.monthNameTh,
  }));
}

function detectWorkbookKind(buffer: Buffer): WorkbookKind {
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

  if (hasVoucherShape) {
    return "expense-document";
  }

  const hasTrialBalanceShape =
    flattened.some((cell) => cell.includes("งบทดลอง")) &&
    flattened.some((cell) => cell === "ชื่อบัญชี") &&
    flattened.some((cell) => cell === "รหัสบัญชี") &&
    flattened.some((cell) => cell === "รายการระหว่างเดือน");

  return hasTrialBalanceShape ? "trial-balance" : "unknown";
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
  const incomeBreakdown: Record<string, number> = {};
  const expenseBreakdown: Record<string, number> = {};
  let income = 0;
  let expense = 0;

  for (const row of rows) {
    const cells = row
      .map((cell, index) => ({ index, value: trimCell(cell) }))
      .filter((cell) => cell.value);

    const sideLabel = cells[0]?.value;
    const side = sideLabel === "เดบิต" ? "debit" : sideLabel === "เครดิต" ? "credit" : null;

    if (!side) {
      continue;
    }

    const accountName = cells[1]?.value || "Unknown account";
    const accountCode = cells.find((cell) => /^\d[\d.]+$/.test(cell.value))?.value || "";
    const amount = toNumber(cells[cells.length - 1]?.value);

    if (amount <= 0) {
      continue;
    }

    const classification = classifyVoucherEntry(accountCode, side);
    if (!classification.kind) {
      continue;
    }

    const breakdownKey = accountCode ? `${accountCode} ${accountName}` : accountName;
    const signedAmount = amount * classification.multiplier;

    if (classification.kind === "income") {
      income += signedAmount;
      incomeBreakdown[breakdownKey] = (incomeBreakdown[breakdownKey] ?? 0) + signedAmount;
    } else {
      expense += signedAmount;
      expenseBreakdown[breakdownKey] = (expenseBreakdown[breakdownKey] ?? 0) + signedAmount;
    }
  }

  return {
    record:
      unitName && normalizedUnitName && month && (income !== 0 || expense !== 0)
        ? {
            sourceCode,
            unitName,
            normalizedUnitName,
            month,
            income,
            expense,
            incomeBreakdown,
            expenseBreakdown,
            openingDebit: 0,
            openingCredit: 0,
            movementDebit: expense,
            movementCredit: income,
            closingDebit: 0,
            closingCredit: 0,
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
      ...((income === 0 && expense === 0)
        ? [{ sourceCode, unitCode: "", month: month ?? null, reason: `Cannot detect income or expense amount in file ${fileName}` }]
        : []),
    ] satisfies FinanceImportIssue[],
  };
}

export function parseTrialBalanceWorkbook(buffer: Buffer, fileName: string) {
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
  const sourceCode = fileName;
  const incomeBreakdown: Record<string, number> = {};
  const expenseBreakdown: Record<string, number> = {};
  const trialBalanceRows: Array<Record<string, unknown>> = [];
  let income = 0;
  let expense = 0;
  let openingDebit = 0;
  let openingCredit = 0;
  let movementDebit = 0;
  let movementCredit = 0;
  let closingDebit = 0;
  let closingCredit = 0;

  for (const row of rows) {
    const accountName = trimCell(row[1]);
    const accountCode = trimCell(row[3]);
    const openingDebitValue = toNumber(row[4]);
    const openingCreditValue = toNumber(row[5]);
    const debit = toNumber(row[6]);
    const credit = toNumber(row[7]);
    const closingDebitValue = toNumber(row[8]);
    const closingCreditValue = toNumber(row[10]);

    if (!accountName || !accountCode || accountName.startsWith("รวม")) {
      continue;
    }

    if (
      openingDebitValue <= 0 &&
      openingCreditValue <= 0 &&
      debit <= 0 &&
      credit <= 0 &&
      closingDebitValue <= 0 &&
      closingCreditValue <= 0
    ) {
      continue;
    }

    openingDebit += openingDebitValue;
    openingCredit += openingCreditValue;
    movementDebit += debit;
    movementCredit += credit;
    closingDebit += closingDebitValue;
    closingCredit += closingCreditValue;

    trialBalanceRows.push({
      accountName,
      accountCode,
      openingDebit: openingDebitValue,
      openingCredit: openingCreditValue,
      movementDebit: debit,
      movementCredit: credit,
      closingDebit: closingDebitValue,
      closingCredit: closingCreditValue,
    });

    const debitClass = classifyVoucherEntry(accountCode, "debit");
    const creditClass = classifyVoucherEntry(accountCode, "credit");
    const breakdownKey = accountCode ? `${accountCode} ${accountName}` : accountName;

    if (debit > 0 && debitClass.kind === "income") {
      const signedAmount = debit * debitClass.multiplier;
      income += signedAmount;
      incomeBreakdown[breakdownKey] = (incomeBreakdown[breakdownKey] ?? 0) + signedAmount;
    } else if (debit > 0 && debitClass.kind === "expense") {
      const signedAmount = debit * debitClass.multiplier;
      expense += signedAmount;
      expenseBreakdown[breakdownKey] = (expenseBreakdown[breakdownKey] ?? 0) + signedAmount;
    }

    if (credit > 0 && creditClass.kind === "income") {
      const signedAmount = credit * creditClass.multiplier;
      income += signedAmount;
      incomeBreakdown[breakdownKey] = (incomeBreakdown[breakdownKey] ?? 0) + signedAmount;
    } else if (credit > 0 && creditClass.kind === "expense") {
      const signedAmount = credit * creditClass.multiplier;
      expense += signedAmount;
      expenseBreakdown[breakdownKey] = (expenseBreakdown[breakdownKey] ?? 0) + signedAmount;
    }
  }

  const hasTrialBalanceTotals =
    openingDebit > 0 ||
    openingCredit > 0 ||
    movementDebit > 0 ||
    movementCredit > 0 ||
    closingDebit > 0 ||
    closingCredit > 0 ||
    trialBalanceRows.length > 0;

  return {
    record:
      unitName && normalizedUnitName && month && hasTrialBalanceTotals
        ? {
            sourceCode,
            unitName,
            normalizedUnitName,
            month,
            income,
            expense,
            incomeBreakdown,
            expenseBreakdown,
            openingDebit,
            openingCredit,
            movementDebit,
            movementCredit,
            closingDebit,
            closingCredit,
            trialBalanceRows,
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
      ...(!hasTrialBalanceTotals
        ? [{ sourceCode, unitCode: "", month: month ?? null, reason: `Cannot detect trial balance totals in file ${fileName}` }]
        : []),
    ] satisfies FinanceImportIssue[],
  };
}

async function importNamedUnitFiles(
  collected: {
    records: ParsedFinanceDocumentGroup[];
    issues: FinanceImportIssue[];
  },
  files: FinanceImportFile[],
  options: {
    fiscalYear: number;
    recorder?: string;
  },
  sourceLabel: string
): Promise<FinanceImportResult> {
  const records = collected.records;
  const issues: FinanceImportIssue[] = [...collected.issues];
  const debugItems: FinanceImportDebugItem[] = collected.issues.map((issue) => ({
    sourceCode: issue.sourceCode,
    unitCode: issue.unitCode,
    unitName: "",
    month: issue.month,
    fiscalYear: options.fiscalYear,
    files: issue.sourceCode ? [issue.sourceCode] : [],
    status: "skipped",
    reason: issue.reason,
  }));
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
    await syncFinanceAccountsFromBreakdown("income", Object.keys(record.incomeBreakdown || {}));
    await syncFinanceAccountsFromBreakdown("expense", Object.keys(record.expenseBreakdown || {}));

    const matchedUnits = unitsByNormalizedName.get(record.normalizedUnitName) ?? [];
    if (matchedUnits.length !== 1) {
      const issue = {
        sourceCode: record.sourceCode,
        unitCode: "",
        month: record.month,
        reason:
          matchedUnits.length === 0
            ? `Health unit ${record.unitName} not found`
            : `Health unit ${record.unitName} is ambiguous`,
      };
      issues.push(issue);
      debugItems.push({
        sourceCode: record.sourceCode,
        unitCode: "",
        unitName: record.unitName,
        month: record.month,
        fiscalYear: options.fiscalYear,
        files: record.fileNames,
        status: "skipped",
        reason: issue.reason,
      });
      continue;
    }

    const unit = matchedUnits[0];
    const period = periodMap.get(record.month);
    if (!period) {
      const issue = {
        sourceCode: record.sourceCode,
        unitCode: unit.code,
        month: record.month,
        reason: `Fiscal period for year ${options.fiscalYear} month ${record.month} not found`,
      };
      issues.push(issue);
      debugItems.push({
        sourceCode: record.sourceCode,
        unitCode: unit.code,
        unitName: unit.name,
        month: record.month,
        fiscalYear: options.fiscalYear,
        files: record.fileNames,
        status: "skipped",
        reason: issue.reason,
      });
      continue;
    }

    const cleanedWrongMonthRecords = await cleanupMisfiledNamedImports({
      healthUnitId: unit.id,
      fiscalYear: options.fiscalYear,
      month: record.month,
      fileNames: record.fileNames,
    });

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
        expense: true,
        incomeBreakdown: true,
        expenseBreakdown: true,
      },
    });

    const preservedIncome = Number(existing?.income ?? 0);
    const preservedExpense = Number(existing?.expense ?? 0);
    const nextIncome = Object.keys(record.incomeBreakdown).length > 0 ? record.income : preservedIncome;
    const nextExpense = Object.keys(record.expenseBreakdown).length > 0 ? record.expense : preservedExpense;
    const nextIncomeBreakdown =
      Object.keys(record.incomeBreakdown).length > 0
        ? record.incomeBreakdown
        : ((existing?.incomeBreakdown as Record<string, number> | null) ?? {});
    const nextExpenseBreakdown =
      Object.keys(record.expenseBreakdown).length > 0
        ? record.expenseBreakdown
        : ((existing?.expenseBreakdown as Record<string, number> | null) ?? {});
    const noteSuffix = `Imported ${sourceLabel} (${record.fileNames.length} files): ${record.fileNames.join(", ")}`;

    await prisma.financeRecord.upsert({
      where: {
        healthUnitId_fiscalPeriodId: {
          healthUnitId: unit.id,
          fiscalPeriodId: period.id,
        },
      },
      update: {
        income: nextIncome,
        expense: nextExpense,
        incomeBreakdown: nextIncomeBreakdown,
        expenseBreakdown: nextExpenseBreakdown,
        balance: nextIncome - nextExpense,
        openingDebit: record.openingDebit,
        openingCredit: record.openingCredit,
        movementDebit: record.movementDebit,
        movementCredit: record.movementCredit,
        closingDebit: record.closingDebit,
        closingCredit: record.closingCredit,
        trialBalanceRows: toInputJsonValue(record.trialBalanceRows),
        recorder: options.recorder,
        notes: noteSuffix,
      },
      create: {
        healthUnitId: unit.id,
        fiscalPeriodId: period.id,
        income: record.income,
        expense: record.expense,
        balance: record.income - record.expense,
        incomeBreakdown: record.incomeBreakdown,
        expenseBreakdown: record.expenseBreakdown,
        openingDebit: record.openingDebit,
        openingCredit: record.openingCredit,
        movementDebit: record.movementDebit,
        movementCredit: record.movementCredit,
        closingDebit: record.closingDebit,
        closingCredit: record.closingCredit,
        trialBalanceRows: toInputJsonValue(record.trialBalanceRows),
        recorder: options.recorder,
        notes: noteSuffix,
      },
    });

    if (existing) {
      updated += 1;
      debugItems.push({
        sourceCode: record.sourceCode,
        unitCode: unit.code,
        unitName: unit.name,
        month: record.month,
        fiscalYear: options.fiscalYear,
        files: record.fileNames,
        status: "updated",
        reason:
          cleanedWrongMonthRecords.length > 0
            ? `Removed wrong-month imports from ${cleanedWrongMonthRecords
                .map((item) => item.monthNameTh || `month ${item.month}`)
                .join(", ")} before updating`
            : undefined,
      });
    } else {
      imported += 1;
      debugItems.push({
        sourceCode: record.sourceCode,
        unitCode: unit.code,
        unitName: unit.name,
        month: record.month,
        fiscalYear: options.fiscalYear,
        files: record.fileNames,
        status: "imported",
        reason:
          cleanedWrongMonthRecords.length > 0
            ? `Removed wrong-month imports from ${cleanedWrongMonthRecords
                .map((item) => item.monthNameTh || `month ${item.month}`)
                .join(", ")} before importing`
            : undefined,
      });
    }
  }

  return {
    processedFiles: files.length,
    imported,
    updated,
    skipped: issues.length,
    detectedUnits: [...new Set(records.map((record) => record.unitName))],
    issues,
    debugItems,
  };
}

async function importExpenseDocumentFiles(
  files: FinanceImportFile[],
  options: {
    fiscalYear: number;
    recorder?: string;
  }
): Promise<FinanceImportResult> {
  return importNamedUnitFiles(
    collectExpenseDocumentRecords(files),
    files,
    options,
    "accounting documents",
  );
}

async function importTrialBalanceFiles(
  files: FinanceImportFile[],
  options: {
    fiscalYear: number;
    recorder?: string;
  }
): Promise<FinanceImportResult> {
  return importNamedUnitFiles(
    await collectTrialBalanceRecords(files),
    files,
    options,
    "trial balance files",
  );
}

function collectExpenseDocumentRecords(files: FinanceImportFile[]) {
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
        income: 0,
        expense: 0,
        incomeBreakdown: {} as Record<string, number>,
        expenseBreakdown: {} as Record<string, number>,
        openingDebit: 0,
        openingCredit: 0,
        movementDebit: 0,
        movementCredit: 0,
        closingDebit: 0,
        closingCredit: 0,
        trialBalanceRows: [],
        fileNames: [],
      };

    current.income += parsed.record.income;
    current.expense += parsed.record.expense;
    current.openingDebit += parsed.record.openingDebit;
    current.openingCredit += parsed.record.openingCredit;
    current.movementDebit += parsed.record.movementDebit;
    current.movementCredit += parsed.record.movementCredit;
    current.closingDebit += parsed.record.closingDebit;
    current.closingCredit += parsed.record.closingCredit;
    current.fileNames.push(file.name);

    for (const [account, amount] of Object.entries(parsed.record.incomeBreakdown)) {
      current.incomeBreakdown[account] = (current.incomeBreakdown[account] ?? 0) + amount;
    }

    for (const [account, amount] of Object.entries(parsed.record.expenseBreakdown)) {
      current.expenseBreakdown[account] = (current.expenseBreakdown[account] ?? 0) + amount;
    }

    grouped.set(key, current);
  }

  return {
    records: Array.from(grouped.values()),
    issues,
  };
}

async function collectTrialBalanceRecords(files: FinanceImportFile[]) {
  const grouped = new Map<string, ParsedFinanceDocumentGroup>();
  const issues: FinanceImportIssue[] = [];

  for (const file of files) {
    const parsed = parseTrialBalanceWorkbook(file.buffer, file.name);
    issues.push(...parsed.issues);

    if (!parsed.record) {
      continue;
    }

    const key = `${parsed.record.normalizedUnitName}:${parsed.record.month}`;
    const current: ParsedFinanceDocumentGroup =
      grouped.get(key) ??
      {
        ...parsed.record,
        income: 0,
        expense: 0,
        incomeBreakdown: {} as Record<string, number>,
        expenseBreakdown: {} as Record<string, number>,
        openingDebit: 0,
        openingCredit: 0,
        movementDebit: 0,
        movementCredit: 0,
        closingDebit: 0,
        closingCredit: 0,
        trialBalanceRows: [],
        fileNames: [],
      };

    current.income += parsed.record.income;
    current.expense += parsed.record.expense;
    current.openingDebit += parsed.record.openingDebit;
    current.openingCredit += parsed.record.openingCredit;
    current.movementDebit += parsed.record.movementDebit;
    current.movementCredit += parsed.record.movementCredit;
    current.closingDebit += parsed.record.closingDebit;
    current.closingCredit += parsed.record.closingCredit;
    current.trialBalanceRows = [
      ...((current.trialBalanceRows as Array<Record<string, unknown>> | undefined) ?? []),
      ...((parsed.record.trialBalanceRows as Array<Record<string, unknown>> | undefined) ?? []),
    ];
    current.fileNames.push(file.name);

    for (const [account, amount] of Object.entries(parsed.record.incomeBreakdown)) {
      current.incomeBreakdown[account] = (current.incomeBreakdown[account] ?? 0) + amount;
    }

    for (const [account, amount] of Object.entries(parsed.record.expenseBreakdown)) {
      current.expenseBreakdown[account] = (current.expenseBreakdown[account] ?? 0) + amount;
    }

    grouped.set(key, current);
  }

  return {
    records: Array.from(grouped.values()),
    issues,
  };
}

export async function previewFinanceFiles(
  files: FinanceImportFile[],
  options: {
    fiscalYear: number;
  }
): Promise<FinanceImportPreview> {
  const summaryFiles: FinanceImportFile[] = [];
  const expenseDocumentFiles: FinanceImportFile[] = [];
  const trialBalanceFiles: FinanceImportFile[] = [];
  const issues: FinanceImportIssue[] = [];
  const items: FinanceImportPreviewItem[] = [];
  const detectedUnits = new Set<string>();

  for (const file of files) {
    const kind = detectWorkbookKind(file.buffer);
    if (kind === "summary") {
      summaryFiles.push(file);
    } else if (kind === "expense-document") {
      expenseDocumentFiles.push(file);
    } else if (kind === "trial-balance") {
      trialBalanceFiles.push(file);
    } else {
      issues.push({
        sourceCode: file.name,
        unitCode: "",
        month: null,
        reason: `Unsupported finance workbook format in file ${file.name}`,
      });
    }
  }

  const summaryResults = summaryFiles.map((file) => ({
    file,
    parsed: parseFinanceWorkbook(file.buffer),
  }));
  const expenseCollected = collectExpenseDocumentRecords(expenseDocumentFiles);
  const trialBalanceCollected = await collectTrialBalanceRecords(trialBalanceFiles);
  issues.push(...summaryResults.flatMap((result) => result.parsed.issues));
  issues.push(...expenseCollected.issues);
  issues.push(...trialBalanceCollected.issues);

  const summaryUnitCodes = [
    ...new Set(summaryResults.flatMap((result) => result.parsed.records.map((record) => record.unitCode))),
  ];
  const months = [
    ...new Set([
      ...summaryResults.flatMap((result) => result.parsed.records.map((record) => record.month)),
      ...expenseCollected.records.map((record) => record.month),
      ...trialBalanceCollected.records.map((record) => record.month),
    ]),
  ];

  const namedRecords = [...expenseCollected.records, ...trialBalanceCollected.records];

  const [codedUnits, allUnits, periods] = await Promise.all([
    summaryUnitCodes.length > 0
      ? prisma.healthUnit.findMany({
          where: { code: { in: summaryUnitCodes } },
          select: { id: true, code: true, name: true },
        })
      : Promise.resolve([]),
    namedRecords.length > 0
      ? prisma.healthUnit.findMany({
          select: { id: true, code: true, name: true },
        })
      : Promise.resolve([]),
    months.length > 0
      ? prisma.fiscalPeriod.findMany({
          where: {
            fiscalYear: options.fiscalYear,
            month: { in: months },
          },
          select: { id: true, month: true },
        })
      : Promise.resolve([]),
  ]);

  const periodMap = new Map(periods.map((period) => [period.month, period]));
  const codedUnitMap = new Map(codedUnits.map((unit) => [unit.code, unit]));
  const unitsByNormalizedName = new Map<string, Array<{ id: number; code: string; name: string }>>();
  for (const unit of allUnits) {
    const key = normalizeUnitName(unit.name);
    unitsByNormalizedName.set(key, [...(unitsByNormalizedName.get(key) ?? []), unit]);
  }

  const readyPairs: Array<{ healthUnitId: number; fiscalPeriodId: number }> = [];

  for (const result of summaryResults) {
    for (const record of result.parsed.records) {
      const unit = codedUnitMap.get(record.unitCode);
      const period = periodMap.get(record.month);
      const status = !unit
        ? "unknown-unit"
        : !period
        ? "unknown-period"
        : "ready";
      const reason =
        status === "unknown-unit"
          ? `Health unit code ${record.unitCode} not found`
          : status === "unknown-period"
          ? `Fiscal period for month ${record.month} not found`
          : undefined;

      items.push({
        sourceCode: record.sourceCode || result.file.name,
        unitCode: unit?.code || record.unitCode,
        unitName: unit?.name || record.unitCode,
        month: record.month,
        fiscalYear: options.fiscalYear,
        income: record.income,
        expense: record.expense,
        status,
        reason,
        files: [result.file.name],
        willUpdate: false,
      });

      if (unit?.name) detectedUnits.add(unit.name);
      if (status === "ready") {
        readyPairs.push({ healthUnitId: unit!.id, fiscalPeriodId: period!.id });
      }
    }
  }

  for (const record of namedRecords) {
    const matchedUnits = unitsByNormalizedName.get(record.normalizedUnitName) ?? [];
    const period = periodMap.get(record.month);
    const status =
      matchedUnits.length === 0
        ? "unknown-unit"
        : matchedUnits.length > 1
        ? "ambiguous-unit"
        : !period
        ? "unknown-period"
        : "ready";
    const reason =
      status === "unknown-unit"
        ? `Health unit ${record.unitName} not found`
        : status === "ambiguous-unit"
        ? `Health unit ${record.unitName} is ambiguous`
        : status === "unknown-period"
        ? `Fiscal period for month ${record.month} not found`
        : undefined;

    items.push({
      sourceCode: record.sourceCode,
      unitCode: matchedUnits[0]?.code || "",
      unitName: matchedUnits[0]?.name || record.unitName,
      month: record.month,
      fiscalYear: options.fiscalYear,
      income: record.income,
      expense: record.expense,
      status,
      reason,
      files: record.fileNames,
      willUpdate: false,
    });

    detectedUnits.add(record.unitName);
    if (status === "ready") {
      readyPairs.push({ healthUnitId: matchedUnits[0].id, fiscalPeriodId: period!.id });
    }
  }

  const uniqueReadyPairs = Array.from(
    new Map(readyPairs.map((pair) => [`${pair.healthUnitId}:${pair.fiscalPeriodId}`, pair])).values()
  );

  const existingRecords =
    uniqueReadyPairs.length > 0
      ? await prisma.financeRecord.findMany({
          where: {
            OR: uniqueReadyPairs.map((pair) => ({
              healthUnitId: pair.healthUnitId,
              fiscalPeriodId: pair.fiscalPeriodId,
            })),
          },
          select: {
            id: true,
            healthUnitId: true,
            fiscalPeriodId: true,
          },
        })
      : [];

  const existingMap = new Set(existingRecords.map((record) => `${record.healthUnitId}:${record.fiscalPeriodId}`));
  const periodIdMap = new Map(periods.map((period) => [period.month, period.id]));
  const unitIdByCode = new Map(codedUnits.map((unit) => [unit.code, unit.id]));
  const unitIdByName = new Map(allUnits.map((unit) => [unit.name, unit.id]));

  for (const item of items) {
    if (item.status !== "ready") {
      continue;
    }

    const healthUnitId =
      (item.unitCode ? unitIdByCode.get(item.unitCode) : undefined) ??
      unitIdByName.get(item.unitName);
    const fiscalPeriodId = periodIdMap.get(item.month);

    if (healthUnitId && fiscalPeriodId) {
      item.willUpdate = existingMap.has(`${healthUnitId}:${fiscalPeriodId}`);
    }
  }

  return {
    processedFiles: files.length,
    readyCount: items.filter((item) => item.status === "ready").length,
    issueCount: issues.length + items.filter((item) => item.status !== "ready").length,
    detectedUnits: Array.from(detectedUnits).sort((a, b) => a.localeCompare(b, "th")),
    items: items.sort((a, b) => {
      if (a.unitName === b.unitName) return a.month - b.month;
      return a.unitName.localeCompare(b.unitName, "th");
    }),
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
  const debugItems: FinanceImportDebugItem[] = parsed.issues.map((issue) => ({
    sourceCode: issue.sourceCode,
    unitCode: issue.unitCode,
    unitName: "",
    month: issue.month,
    fiscalYear: options.fiscalYear,
    files: issue.sourceCode ? [issue.sourceCode] : [],
    status: "skipped",
    reason: issue.reason,
  }));

  for (const record of parsed.records) {
    await syncFinanceAccountsFromBreakdown("income", Object.keys(record.incomeBreakdown || {}));
    await syncFinanceAccountsFromBreakdown("expense", Object.keys(record.expenseBreakdown || {}));

    const unit = unitMap.get(record.unitCode);
    if (!unit) {
      const issue = {
        sourceCode: record.sourceCode,
        unitCode: record.unitCode,
        month: record.month,
        reason: `Health unit code ${record.unitCode} not found`,
      };
      issues.push(issue);
      debugItems.push({
        sourceCode: record.sourceCode,
        unitCode: record.unitCode,
        unitName: "",
        month: record.month,
        fiscalYear: options.fiscalYear,
        files: [record.sourceCode],
        status: "skipped",
        reason: issue.reason,
      });
      continue;
    }

    const period = periodMap.get(record.month);
    if (!period) {
      const issue = {
        sourceCode: record.sourceCode,
        unitCode: record.unitCode,
        month: record.month,
        reason: `Fiscal period for year ${options.fiscalYear} month ${record.month} not found`,
      };
      issues.push(issue);
      debugItems.push({
        sourceCode: record.sourceCode,
        unitCode: record.unitCode,
        unitName: unit.name,
        month: record.month,
        fiscalYear: options.fiscalYear,
        files: [record.sourceCode],
        status: "skipped",
        reason: issue.reason,
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
        movementDebit: record.expense,
        movementCredit: record.income,
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
        movementDebit: record.expense,
        movementCredit: record.income,
        recorder: options.recorder,
        notes: `Imported from Excel source code ${record.sourceCode}`,
      },
    });

    if (existing) {
      updated += 1;
      debugItems.push({
        sourceCode: record.sourceCode,
        unitCode: unit.code,
        unitName: unit.name,
        month: record.month,
        fiscalYear: options.fiscalYear,
        files: [record.sourceCode],
        status: "updated",
      });
    } else {
      imported += 1;
      debugItems.push({
        sourceCode: record.sourceCode,
        unitCode: unit.code,
        unitName: unit.name,
        month: record.month,
        fiscalYear: options.fiscalYear,
        files: [record.sourceCode],
        status: "imported",
      });
    }
  }

  return {
    processedFiles: 1,
    imported,
    updated,
    skipped: issues.length,
    detectedUnits: units.map((unit) => unit.name),
    issues,
    debugItems,
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
      issues: [{ sourceCode: "", unitCode: "", month: null, reason: "No workbook files provided" }],
      debugItems: [
        {
          sourceCode: "",
          unitCode: "",
          unitName: "",
          month: null,
          fiscalYear: options.fiscalYear,
          files: [],
          status: "skipped",
          reason: "No workbook files provided",
        },
      ],
    };
  }

  const summaryFiles: FinanceImportFile[] = [];
  const expenseDocumentFiles: FinanceImportFile[] = [];
  const trialBalanceFiles: FinanceImportFile[] = [];
  const issues: FinanceImportIssue[] = [];
  const debugItems: FinanceImportDebugItem[] = [];
  let imported = 0;
  let updated = 0;
  const detectedUnits = new Set<string>();

  for (const file of files) {
    const kind = detectWorkbookKind(file.buffer);
    if (kind === "summary") {
      summaryFiles.push(file);
    } else if (kind === "expense-document") {
      expenseDocumentFiles.push(file);
    } else if (kind === "trial-balance") {
      trialBalanceFiles.push(file);
    } else {
      issues.push({
        sourceCode: file.name,
        unitCode: "",
        month: null,
        reason: `Unsupported finance workbook format in file ${file.name}`,
      });
      debugItems.push({
        sourceCode: file.name,
        unitCode: "",
        unitName: "",
        month: null,
        fiscalYear: options.fiscalYear,
        files: [file.name],
        status: "skipped",
        reason: `Unsupported finance workbook format in file ${file.name}`,
      });
    }
  }

  for (const file of summaryFiles) {
    const result = await importFinanceWorkbook(file.buffer, options);
    imported += result.imported;
    updated += result.updated;
    result.detectedUnits.forEach((unit) => detectedUnits.add(unit));
    issues.push(...result.issues.map((issue) => ({ ...issue, sourceCode: issue.sourceCode || file.name })));
    debugItems.push(...result.debugItems);
  }

  if (expenseDocumentFiles.length > 0) {
    const result = await importExpenseDocumentFiles(expenseDocumentFiles, options);
    imported += result.imported;
    updated += result.updated;
    result.detectedUnits.forEach((unit) => detectedUnits.add(unit));
    issues.push(...result.issues);
    debugItems.push(...result.debugItems);
  }

  if (trialBalanceFiles.length > 0) {
    const result = await importTrialBalanceFiles(trialBalanceFiles, options);
    imported += result.imported;
    updated += result.updated;
    result.detectedUnits.forEach((unit) => detectedUnits.add(unit));
    issues.push(...result.issues);
    debugItems.push(...result.debugItems);
  }

  return {
    processedFiles: files.length,
    imported,
    updated,
    skipped: issues.length,
    detectedUnits: Array.from(detectedUnits).sort((a, b) => a.localeCompare(b, "th")),
    issues,
    debugItems: debugItems.sort((a, b) => {
      const fileCompare = (a.files[0] || a.sourceCode).localeCompare(b.files[0] || b.sourceCode, "th");
      if (fileCompare !== 0) return fileCompare;
      if ((a.month ?? 0) !== (b.month ?? 0)) return (a.month ?? 0) - (b.month ?? 0);
      return a.unitName.localeCompare(b.unitName, "th");
    }),
  };
}
