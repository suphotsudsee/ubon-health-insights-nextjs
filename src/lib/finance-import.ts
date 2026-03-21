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

export type FinanceImportIssue = {
  sourceCode: string;
  unitCode: string;
  month: number | null;
  reason: string;
};

export type FinanceImportResult = {
  imported: number;
  updated: number;
  skipped: number;
  issues: FinanceImportIssue[];
};

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
    imported,
    updated,
    skipped: issues.length,
    issues,
  };
}
