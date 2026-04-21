"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, RefreshCcw, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type HealthUnitOption = {
  id: number;
  code: string;
  name: string;
};

type FiscalPeriodOption = {
  id?: number;
  fiscalYear: number;
  quarter: number;
  month: number;
  monthNameTh?: string;
};

type FinanceRecordItem = {
  id: number;
  healthUnitId: number;
  unitCode: string;
  unitName: string;
  amphoeName: string;
  fiscalPeriodId: number;
  fiscalYear: number;
  month: number;
  monthNameTh: string;
  openingDebit: number;
  openingCredit: number;
  movementDebit: number;
  movementCredit: number;
  closingDebit: number;
  closingCredit: number;
  recorder: string | null;
  createdAt?: string;
};

type ImportResponse = {
  processedFiles: number;
  imported: number;
  updated: number;
  skipped: number;
  detectedUnits: string[];
  debugItems: Array<{
    sourceCode: string;
    unitCode: string;
    unitName: string;
    month: number | null;
    fiscalYear: number;
    files: string[];
    status: "imported" | "updated" | "skipped";
    reason?: string;
  }>;
  issues: Array<{
    sourceCode: string;
    unitCode: string;
    month: number | null;
    reason: string;
  }>;
};

type ImportPreviewItem = {
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

type ImportPreviewResponse = {
  processedFiles: number;
  readyCount: number;
  issueCount: number;
  detectedUnits: string[];
  items: ImportPreviewItem[];
  issues: Array<{
    sourceCode: string;
    unitCode: string;
    month: number | null;
    reason: string;
  }>;
};

type Props = {
  units: HealthUnitOption[];
  fiscalPeriods: FiscalPeriodOption[];
  years: number[];
  currentPeriod: FiscalPeriodOption | null;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatMonthLabel(period: FiscalPeriodOption | null) {
  if (!period) return "-";
  return period.monthNameTh ? `${period.monthNameTh} ${period.fiscalYear}` : `เดือน ${period.month} / ${period.fiscalYear}`;
}

function previewStatusLabel(status: ImportPreviewItem["status"]) {
  switch (status) {
    case "ready":
      return "พร้อมนำเข้า";
    case "unknown-unit":
      return "ไม่พบหน่วยบริการ";
    case "ambiguous-unit":
      return "พบหน่วยบริการซ้ำ";
    case "unknown-period":
      return "ไม่พบงวดข้อมูล";
    default:
      return status;
  }
}

function debugStatusLabel(status: "imported" | "updated" | "skipped") {
  switch (status) {
    case "imported":
      return "Imported";
    case "updated":
      return "Updated";
    case "skipped":
      return "Skipped";
    default:
      return status;
  }
}

function debugStatusClassName(status: "imported" | "updated" | "skipped") {
  switch (status) {
    case "imported":
      return "bg-emerald-100 text-emerald-700";
    case "updated":
      return "bg-sky-100 text-sky-700";
    case "skipped":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-muted text-muted-foreground";
  }
}

async function readResponseBody<T>(response: Response): Promise<(T & { error?: string }) | { error?: string }> {
  const raw = await response.text();

  if (!raw.trim()) {
    return {};
  }

  try {
    return JSON.parse(raw) as T & { error?: string };
  } catch {
    return { error: raw };
  }
}

export function FinanceSettingsSection({ units, fiscalPeriods, years, currentPeriod }: Props) {
  const statusPageSize = 10;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [records, setRecords] = useState<FinanceRecordItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState(String(currentPeriod?.fiscalYear ?? years[0] ?? ""));
  const [selectedMonth, setSelectedMonth] = useState(String(currentPeriod?.month ?? ""));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [lastImport, setLastImport] = useState<ImportResponse | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreviewResponse | null>(null);
  const [statusPage, setStatusPage] = useState(1);

  const periodsForSelectedYear = useMemo(() => {
    const year = Number(selectedYear);
    return fiscalPeriods.filter((period) => period.fiscalYear === year && period.id);
  }, [fiscalPeriods, selectedYear]);

  const selectedMonthPeriod = useMemo(() => {
    const month = Number(selectedMonth);
    return periodsForSelectedYear.find((period) => period.month === month) ?? null;
  }, [periodsForSelectedYear, selectedMonth]);

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return records.filter((record) => {
      if (selectedMonth && String(record.month) !== selectedMonth) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        record.unitCode.toLowerCase().includes(keyword) ||
        record.unitName.toLowerCase().includes(keyword) ||
        record.amphoeName.toLowerCase().includes(keyword) ||
        (record.recorder || "").toLowerCase().includes(keyword)
      );
    });
  }, [records, search, selectedMonth]);

  const monthlyImportRows = useMemo(() => {
    return units
      .map((unit) => {
        const record = records.find((item) => item.healthUnitId === unit.id && String(item.month) === selectedMonth);
        return {
          ...unit,
          record,
          status: record ? "imported" : "missing",
        };
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [records, selectedMonth, units]);

  const importedUnitCount = useMemo(
    () => monthlyImportRows.filter((row) => row.status === "imported").length,
    [monthlyImportRows]
  );

  const missingUnitCount = useMemo(
    () => monthlyImportRows.filter((row) => row.status === "missing").length,
    [monthlyImportRows]
  );

  const statusTotalPages = useMemo(() => Math.max(1, Math.ceil(monthlyImportRows.length / statusPageSize)), [monthlyImportRows.length]);

  const paginatedMonthlyImportRows = useMemo(() => {
    const startIndex = (statusPage - 1) * statusPageSize;
    return monthlyImportRows.slice(startIndex, startIndex + statusPageSize);
  }, [monthlyImportRows, statusPage]);

  const statusPageRange = useMemo(() => {
    if (monthlyImportRows.length === 0) {
      return { start: 0, end: 0 };
    }

    const start = (statusPage - 1) * statusPageSize + 1;
    const end = Math.min(statusPage * statusPageSize, monthlyImportRows.length);
    return { start, end };
  }, [monthlyImportRows.length, statusPage]);

  const totals = useMemo(() => {
    return filteredRecords.reduce(
      (sum, record) => ({
        openingDebit: sum.openingDebit + (record.openingDebit || 0),
        openingCredit: sum.openingCredit + (record.openingCredit || 0),
        movementDebit: sum.movementDebit + (record.movementDebit || 0),
        movementCredit: sum.movementCredit + (record.movementCredit || 0),
        closingDebit: sum.closingDebit + (record.closingDebit || 0),
        closingCredit: sum.closingCredit + (record.closingCredit || 0),
      }),
      {
        openingDebit: 0,
        openingCredit: 0,
        movementDebit: 0,
        movementCredit: 0,
        closingDebit: 0,
        closingCredit: 0,
      }
    );
  }, [filteredRecords]);

  useEffect(() => {
    if (!selectedYear && (currentPeriod?.fiscalYear || years[0])) {
      setSelectedYear(String(currentPeriod?.fiscalYear ?? years[0]));
    }
  }, [currentPeriod?.fiscalYear, selectedYear, years]);

  useEffect(() => {
    if (periodsForSelectedYear.length === 0) {
      setSelectedMonth("");
      return;
    }

    const stillSelected = periodsForSelectedYear.some((period) => String(period.month) === selectedMonth);
    if (stillSelected) return;

    const fallbackMonth =
      currentPeriod?.fiscalYear === Number(selectedYear) ? currentPeriod?.month : periodsForSelectedYear[0]?.month;
    setSelectedMonth(fallbackMonth ? String(fallbackMonth) : "");
  }, [currentPeriod?.fiscalYear, currentPeriod?.month, periodsForSelectedYear, selectedMonth, selectedYear]);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "");
      folderInputRef.current.setAttribute("directory", "");
      folderInputRef.current.setAttribute("multiple", "");
    }
  }, []);

  useEffect(() => {
    setImportPreview(null);
  }, [selectedFiles, selectedYear]);

  useEffect(() => {
    setStatusPage(1);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (statusPage > statusTotalPages) {
      setStatusPage(statusTotalPages);
    }
  }, [statusPage, statusTotalPages]);

  useEffect(() => {
    void loadRecords();
  }, [selectedYear]);

  async function loadRecords() {
    try {
      setIsLoading(true);
      setError("");
      const year = selectedYear ? `&fiscalYear=${selectedYear}` : "";
      const response = await fetch(`/api/finance/records?pageSize=500${year}`, { cache: "no-store" });
      const body = (await readResponseBody<{ records?: FinanceRecordItem[] }>(response)) as {
        records?: FinanceRecordItem[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(body.error || "โหลดข้อมูลงบทดลองไม่สำเร็จ");
      }
      setRecords(body.records || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "โหลดข้อมูลงบทดลองไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }

  function handleFileSelection(files: FileList | null) {
    if (!files) return;
    setSelectedFiles(Array.from(files).filter((file) => file.size > 0 && /\.pdf$/i.test(file.name)));
    setMessage("");
    setError("");
  }

  async function handlePreviewImport() {
    if (selectedFiles.length === 0) {
      setError("กรุณาเลือกไฟล์งบทดลองก่อน");
      return;
    }

    setPreviewing(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("mode", "preview");
      formData.append("fiscalYear", selectedYear);
      for (const file of selectedFiles) {
        formData.append("files", file);
      }

      const response = await fetch("/api/finance/import", {
        method: "POST",
        body: formData,
      });

      const body = (await readResponseBody<ImportPreviewResponse>(response)) as ImportPreviewResponse & { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "ตรวจสอบไฟล์งบทดลองไม่สำเร็จ");
      }

      setImportPreview(body);
      setMessage(`ตรวจสอบไฟล์ ${body.processedFiles} ไฟล์แล้ว พร้อมนำเข้า ${body.readyCount} รายการ`);
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : "ตรวจสอบไฟล์งบทดลองไม่สำเร็จ");
    } finally {
      setPreviewing(false);
    }
  }

  async function handleImport() {
    if (selectedFiles.length === 0) {
      setError("กรุณาเลือกไฟล์งบทดลองก่อน");
      return;
    }

    setImporting(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("fiscalYear", selectedYear);
      formData.append("recorder", "trial-balance-import");
      for (const file of selectedFiles) {
        formData.append("files", file);
      }

      const response = await fetch("/api/finance/import", {
        method: "POST",
        body: formData,
      });

      const body = (await readResponseBody<ImportResponse>(response)) as ImportResponse & { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "นำเข้างบทดลองไม่สำเร็จ");
      }

      setLastImport(body);
      setMessage(`นำเข้าเสร็จแล้ว: เพิ่มใหม่ ${body.imported} รายการ, อัปเดต ${body.updated} รายการ, ข้าม ${body.skipped} รายการ`);
      setSelectedFiles([]);
      setImportPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (folderInputRef.current) folderInputRef.current.value = "";
      await loadRecords();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "นำเข้างบทดลองไม่สำเร็จ");
    } finally {
      setImporting(false);
    }
  }

  async function handleDelete(record: FinanceRecordItem) {
    if (!window.confirm(`ยืนยันการลบงบทดลองของ ${record.unitName} เดือน ${record.monthNameTh} ${record.fiscalYear} ?`)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/finance/records/${record.id}`, { method: "DELETE" });
      const body = await readResponseBody(response);
      if (!response.ok) {
        throw new Error(body.error || "ลบข้อมูลงบทดลองไม่สำเร็จ");
      }

      setRecords((current) => current.filter((item) => item.id !== record.id));
      setMessage("ลบข้อมูลงบทดลองเรียบร้อยแล้ว");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ลบข้อมูลงบทดลองไม่สำเร็จ");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">จัดการข้อมูลงบทดลอง</h2>
        <p className="text-sm text-muted-foreground">
          หน้านี้ใช้สำหรับนำเข้า ตรวจสอบความครบถ้วน และติดตามสถานะงบทดลองรายเดือนของทุกหน่วยบริการ โดยยึดโครงสร้างเดบิตและเครดิตจากงบทดลองโดยตรง
        </p>
      </div>

      {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="หน่วยบริการทั้งหมด" value={`${units.length} แห่ง`} />
        <SummaryCard label={`นำเข้าแล้ว (${formatMonthLabel(selectedMonthPeriod)})`} value={`${importedUnitCount} แห่ง`} />
        <SummaryCard label={`ยังไม่ส่ง (${formatMonthLabel(selectedMonthPeriod)})`} value={`${missingUnitCount} แห่ง`} />
        <SummaryCard label="ไฟล์ที่เลือก" value={`${selectedFiles.length} ไฟล์`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>นำเข้างบทดลองรายเดือน</CardTitle>
          <CardDescription>
            ใช้ไฟล์งบทดลองเป็นข้อมูลตั้งต้นของรายงานทั้งหมด เช่น ยกยอดมา เดบิตระหว่างเดือน เครดิตระหว่างเดือน และยอดยกไป
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Field label="ปีงบประมาณ">
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="เดือนเป้าหมาย">
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {periodsForSelectedYear.map((period) => (
                  <option key={period.id} value={period.month}>
                    {period.monthNameTh || `เดือน ${period.month}`}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="เลือกไฟล์ PDF งบทดลอง">
              <Input ref={fileInputRef} type="file" accept=".pdf,application/pdf" multiple onChange={(event) => handleFileSelection(event.target.files)} />
            </Field>

            <Field label="หรือเลือกทั้งโฟลเดอร์">
              <Input ref={folderInputRef} type="file" onChange={(event) => handleFileSelection(event.target.files)} />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={handlePreviewImport} disabled={previewing || selectedFiles.length === 0}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {previewing ? "กำลังตรวจสอบ..." : "Preview ก่อนนำเข้า"}
            </Button>
            <Button type="button" onClick={handleImport} disabled={importing || selectedFiles.length === 0}>
              <Upload className="mr-2 h-4 w-4" />
              {importing ? "กำลังนำเข้า..." : "นำเข้างบทดลอง"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedFiles([]);
                setImportPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                if (folderInputRef.current) folderInputRef.current.value = "";
              }}
            >
              ล้างรายการไฟล์
            </Button>
            <Button asChild variant="outline">
              <Link href="/finance/list">
                <ExternalLink className="mr-2 h-4 w-4" />
                เปิดหน้ารายการงบทดลอง
              </Link>
            </Button>
          </div>

          {selectedFiles.length > 0 ? (
            <div className="rounded-xl border bg-muted/20 p-4">
              <p className="mb-2 text-sm font-medium">ไฟล์ที่เลือก</p>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {selectedFiles.map((file) => (
                  <div key={`${file.name}-${file.size}`} className="rounded-md border bg-background px-3 py-2 text-sm">
                    {file.name}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {importPreview ? (
        <Card>
          <CardHeader>
            <CardTitle>ผลตรวจสอบก่อนนำเข้า</CardTitle>
            <CardDescription>
              ตรวจสอบแล้ว {importPreview.processedFiles} ไฟล์ พร้อมนำเข้า {importPreview.readyCount} รายการ พบปัญหา {importPreview.issueCount} รายการ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/50 text-left">
                    <th className="px-4 py-3 font-medium">รหัสอ้างอิง</th>
                    <th className="px-4 py-3 font-medium">หน่วยบริการ</th>
                    <th className="px-4 py-3 font-medium">งวด</th>
                    <th className="px-4 py-3 text-right font-medium">เครดิตระหว่างเดือน</th>
                    <th className="px-4 py-3 text-right font-medium">เดบิตระหว่างเดือน</th>
                    <th className="px-4 py-3 font-medium">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.items.map((item) => (
                    <tr key={`${item.sourceCode}-${item.unitCode}-${item.month}`} className="border-b last:border-b-0">
                      <td className="px-4 py-3">{item.sourceCode}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{item.unitCode}</div>
                        <div className="text-muted-foreground">{item.unitName}</div>
                      </td>
                      <td className="px-4 py-3">
                        เดือน {item.month} / {item.fiscalYear}
                      </td>
                      <td className="px-4 py-3 text-right">{formatAmount(item.income)}</td>
                      <td className="px-4 py-3 text-right">{formatAmount(item.expense)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${item.status === "ready" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {previewStatusLabel(item.status)}
                        </span>
                        {item.reason ? <p className="mt-1 text-xs text-muted-foreground">{item.reason}</p> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard label="ยกยอดมาเดบิต" value={formatAmount(totals.openingDebit)} />
        <SummaryCard label="ยกยอดมาเครดิต" value={formatAmount(totals.openingCredit)} />
        <SummaryCard label="เดบิตระหว่างเดือน" value={formatAmount(totals.movementDebit)} />
        <SummaryCard label="เครดิตระหว่างเดือน" value={formatAmount(totals.movementCredit)} />
        <SummaryCard label="ยกยอดไปเดบิต" value={formatAmount(totals.closingDebit)} />
        <SummaryCard label="ยกยอดไปเครดิต" value={formatAmount(totals.closingCredit)} />
      </div>

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>สถานะการส่งงบทดลองรายเดือน</CardTitle>
            <CardDescription>
              ติดตามว่าทั้ง {units.length} แห่งส่งงบทดลองเข้ามาครบหรือยังสำหรับงวด {formatMonthLabel(selectedMonthPeriod)}
            </CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={() => void loadRecords()} disabled={isLoading}>
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">หน่วยบริการ</th>
                  <th className="pb-3 font-medium">สถานะ</th>
                  <th className="pb-3 text-right font-medium">ยกยอดมาเดบิต</th>
                  <th className="pb-3 text-right font-medium">ยกยอดมาเครดิต</th>
                  <th className="pb-3 text-right font-medium">เดบิตระหว่างเดือน</th>
                  <th className="pb-3 text-right font-medium">เครดิตระหว่างเดือน</th>
                  <th className="pb-3 text-right font-medium">ยกยอดไปเดบิต</th>
                  <th className="pb-3 text-right font-medium">ยกยอดไปเครดิต</th>
                </tr>
              </thead>
              <tbody>
                {paginatedMonthlyImportRows.map((row) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    <td className="py-4">
                      <div className="font-medium">{row.code}</div>
                      <div className="text-muted-foreground">{row.name}</div>
                    </td>
                    <td className="py-4">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${row.status === "imported" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {row.status === "imported" ? "นำเข้าแล้ว" : "รอส่ง"}
                      </span>
                    </td>
                    <td className="py-4 text-right">{row.record ? formatAmount(row.record.openingDebit) : "-"}</td>
                    <td className="py-4 text-right">{row.record ? formatAmount(row.record.openingCredit) : "-"}</td>
                    <td className="py-4 text-right">{row.record ? formatAmount(row.record.movementDebit) : "-"}</td>
                    <td className="py-4 text-right">{row.record ? formatAmount(row.record.movementCredit) : "-"}</td>
                    <td className="py-4 text-right">{row.record ? formatAmount(row.record.closingDebit) : "-"}</td>
                    <td className="py-4 text-right">{row.record ? formatAmount(row.record.closingCredit) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col gap-3 border-t pt-4 text-sm md:flex-row md:items-center md:justify-between">
            <p className="text-muted-foreground">
              แสดง {statusPageRange.start}-{statusPageRange.end} จาก {monthlyImportRows.length} แห่ง
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusPage((current) => Math.max(1, current - 1))}
                disabled={statusPage === 1}
              >
                ก่อนหน้า
              </Button>
              <span className="min-w-[96px] text-center text-muted-foreground">
                หน้า {statusPage} / {statusTotalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusPage((current) => Math.min(statusTotalPages, current + 1))}
                disabled={statusPage === statusTotalPages}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>ข้อมูลงบทดลองที่นำเข้าแล้ว</CardTitle>
            <CardDescription>ค้นหา ตรวจสอบ และลบรายการนำเข้าที่ไม่ถูกต้องได้จากตารางนี้</CardDescription>
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหารหัสหน่วยบริการ ชื่อหน่วยบริการ อำเภอ หรือผู้บันทึก"
            className="w-full md:w-80"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-3 font-medium">หน่วยบริการ</th>
                  <th className="pb-3 font-medium">งวด</th>
                  <th className="pb-3 text-right font-medium">ยกยอดมาเดบิต</th>
                  <th className="pb-3 text-right font-medium">ยกยอดมาเครดิต</th>
                  <th className="pb-3 text-right font-medium">เดบิตระหว่างเดือน</th>
                  <th className="pb-3 text-right font-medium">เครดิตระหว่างเดือน</th>
                  <th className="pb-3 text-right font-medium">ยกยอดไปเดบิต</th>
                  <th className="pb-3 text-right font-medium">ยกยอดไปเครดิต</th>
                  <th className="pb-3 font-medium">ผู้บันทึก</th>
                  <th className="pb-3 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b last:border-b-0">
                    <td className="py-4">
                      <div className="font-medium">{record.unitCode}</div>
                      <div className="text-muted-foreground">{record.unitName}</div>
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {record.monthNameTh} {record.fiscalYear}
                    </td>
                    <td className="py-4 text-right">{formatAmount(record.openingDebit)}</td>
                    <td className="py-4 text-right">{formatAmount(record.openingCredit)}</td>
                    <td className="py-4 text-right">{formatAmount(record.movementDebit)}</td>
                    <td className="py-4 text-right">{formatAmount(record.movementCredit)}</td>
                    <td className="py-4 text-right">{formatAmount(record.closingDebit)}</td>
                    <td className="py-4 text-right">{formatAmount(record.closingCredit)}</td>
                    <td className="py-4 text-muted-foreground">{record.recorder || "-"}</td>
                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href="/finance/list">เปิดรายการ</Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => void handleDelete(record)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          ลบ
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isLoading && filteredRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              ไม่พบข้อมูลงบทดลองตามเงื่อนไขที่ค้นหา
            </div>
          ) : null}
        </CardContent>
      </Card>

      {lastImport ? (
        <Card>
          <CardHeader>
            <CardTitle>ผลการนำเข้าล่าสุด</CardTitle>
            <CardDescription>
              ประมวลผล {lastImport.processedFiles} ไฟล์ เพิ่มใหม่ {lastImport.imported} รายการ อัปเดต {lastImport.updated} รายการ และข้าม {lastImport.skipped} รายการ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {lastImport.debugItems.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-medium">Debug import result</p>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[1100px] text-sm">
                    <thead className="bg-muted/50">
                      <tr className="border-b text-left">
                        <th className="px-4 py-3 font-medium">สถานะ</th>
                        <th className="px-4 py-3 font-medium">ไฟล์</th>
                        <th className="px-4 py-3 font-medium">หน่วยบริการ</th>
                        <th className="px-4 py-3 font-medium">งวด</th>
                        <th className="px-4 py-3 font-medium">เหตุผล</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastImport.debugItems.map((item, index) => (
                        <tr key={`${item.sourceCode}-${item.unitCode}-${item.month}-${index}`} className="border-b last:border-b-0">
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${debugStatusClassName(item.status)}`}>
                              {debugStatusLabel(item.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              {(item.files.length > 0 ? item.files : [item.sourceCode]).map((file) => (
                                <div key={file} className="text-xs text-muted-foreground">
                                  {file}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{item.unitCode || "-"}</div>
                            <div className="text-muted-foreground">{item.unitName || "-"}</div>
                          </td>
                          <td className="px-4 py-3">
                            {item.month ? `เดือน ${item.month} / ${item.fiscalYear}` : `- / ${item.fiscalYear}`}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{item.reason || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {lastImport.detectedUnits.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-medium">หน่วยบริการที่ตรวจพบ</p>
                <div className="flex flex-wrap gap-2">
                  {lastImport.detectedUnits.map((item) => (
                    <span key={item} className="rounded-full border px-3 py-1 text-xs">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {lastImport.issues.length > 0 ? (
              <div>
                <p className="mb-2 text-sm font-medium">รายการที่มีปัญหา</p>
                <div className="space-y-2">
                  {lastImport.issues.map((issue, index) => (
                    <div key={`${issue.sourceCode}-${index}`} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      {issue.sourceCode} / {issue.unitCode || "-"} / เดือน {issue.month ?? "-"} : {issue.reason}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
