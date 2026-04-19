import { NextRequest, NextResponse } from "next/server";
import { importFinanceFiles } from "@/lib/finance-import";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const fileEntries = formData.getAll("files");
  const singleFile = formData.get("file");
  const fiscalYearValue = formData.get("fiscalYear");
  const recorder = String(formData.get("recorder") ?? "").trim() || undefined;

  const files = [...fileEntries, singleFile].filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "At least one file is required" }, { status: 400 });
  }

  const fiscalYear = Number(fiscalYearValue);
  if (!Number.isInteger(fiscalYear) || fiscalYear <= 0) {
    return NextResponse.json({ error: "Fiscal year is required" }, { status: 400 });
  }

  try {
    const payload = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        buffer: Buffer.from(await file.arrayBuffer()),
      }))
    );

    const result = await importFinanceFiles(payload, {
      fiscalYear,
      recorder,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error importing finance workbook:", error);
    return NextResponse.json({ error: "Failed to import finance workbook" }, { status: 500 });
  }
}
