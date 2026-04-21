import { NextRequest, NextResponse } from "next/server";
import type { FinanceImportFile } from "@/lib/finance-import";

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
  try {
    const formData = await request.formData();
    const files = normalizeFiles(formData);
    const fiscalYearValue = formData.get("fiscalYear");
    const recorder = String(formData.get("recorder") ?? "").trim() || undefined;
    const mode = String(formData.get("mode") ?? "import").trim().toLowerCase();

    if (files.length === 0) {
      return NextResponse.json({ error: "At least one finance file is required" }, { status: 400 });
    }

    const fiscalYear = Number(fiscalYearValue);
    if (!Number.isInteger(fiscalYear) || fiscalYear <= 0) {
      return NextResponse.json({ error: "Fiscal year is required" }, { status: 400 });
    }

    const { importFinanceFiles, previewFinanceFiles } = await import("@/lib/finance-import");
    const importFiles = await toImportFiles(files);

    if (mode === "preview") {
      const result = await previewFinanceFiles(importFiles, { fiscalYear });
      return NextResponse.json(result);
    }

    const result = await importFinanceFiles(importFiles, { fiscalYear, recorder });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to import finance files";
    console.error("Error importing finance files:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
