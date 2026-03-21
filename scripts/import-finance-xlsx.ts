import { readFile } from "node:fs/promises";
import { prisma } from "@/lib/db";
import { importFinanceWorkbook } from "@/lib/finance-import";

async function main() {
  const filePath = process.argv[2];
  const fiscalYearArg = process.argv[3];
  const recorder = process.argv[4] ?? "system-import";

  if (!filePath) {
    throw new Error("Usage: tsx scripts/import-finance-xlsx.ts <file-path> [fiscal-year] [recorder]");
  }

  const currentPeriod = await prisma.fiscalPeriod.findFirst({
    orderBy: [{ fiscalYear: "desc" }, { month: "desc" }],
    select: { fiscalYear: true },
  });

  const fiscalYear = fiscalYearArg ? Number(fiscalYearArg) : currentPeriod?.fiscalYear;
  if (!fiscalYear) {
    throw new Error("Cannot determine fiscal year");
  }

  const buffer = await readFile(filePath);
  const result = await importFinanceWorkbook(buffer, { fiscalYear, recorder });

  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
