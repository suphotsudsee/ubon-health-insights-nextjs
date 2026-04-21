import { NextRequest, NextResponse } from "next/server";
import {
  importFinanceFiles,
  importFinanceWorkbook,
  previewFinanceFiles,
  type FinanceImportFile,
} from "@/lib/finance-import";

function normalizeFiles(formData: FormData) {
  const multiFiles = formData
    .getAll("files")
    .filter((value): value is File => value instanceof File && value.size > 0);

  if (multiFiles.length > 0) {
    return multiFiles;
  }

  const singleFile = formData.get("file");
  if (singleFile instanceof File && singleFile.size > 0) {
    return [singleFile];
  }

  return [];
}

async function toImportFiles(files: File[]): Promise<FinanceImportFile[]> {
  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      buffer: Buffer.from(await file.arrayBuffer()),
    })),
  );
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const files = normalizeFiles(formData);
  const fiscalYearValue = formData.get("fiscalYear");
  const recorder = String(formData.get("recorder") ?? "").trim() || undefined;
  const mode = String(formData.get("mode") ?? "import").trim().toLowerCase();

  if (files.length === 0) {
    return NextResponse.json({ error: "At least one Excel file is required" }, { status: 400 });
  }

  const fiscalYear = Number(fiscalYearValue);
  if (!Number.isInteger(fiscalYear) || fiscalYear <= 0) {
    return NextResponse.json({ error: "Fiscal year is required" }, { status: 400 });
  }

  try {
    const importFiles = await toImportFiles(files);

    if (mode === "preview") {
      const result = await previewFinanceFiles(importFiles, { fiscalYear });
      return NextResponse.json(result);
    }

    const result =
      importFiles.length === 1
        ? await importFinanceWorkbook(importFiles[0].buffer, { fiscalYear, recorder })
        : await importFinanceFiles(importFiles, { fiscalYear, recorder });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error importing finance workbook:", error);
    return NextResponse.json({ error: "Failed to import finance workbook" }, { status: 500 });
  }
}
