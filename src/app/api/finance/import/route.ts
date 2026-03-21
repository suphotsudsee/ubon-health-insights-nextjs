import { NextRequest, NextResponse } from "next/server";
import { importFinanceWorkbook } from "@/lib/finance-import";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  const fiscalYearValue = formData.get("fiscalYear");
  const recorder = String(formData.get("recorder") ?? "").trim() || undefined;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const fiscalYear = Number(fiscalYearValue);
  if (!Number.isInteger(fiscalYear) || fiscalYear <= 0) {
    return NextResponse.json({ error: "Fiscal year is required" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importFinanceWorkbook(buffer, {
      fiscalYear,
      recorder,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error importing finance workbook:", error);
    return NextResponse.json({ error: "Failed to import finance workbook" }, { status: 500 });
  }
}
