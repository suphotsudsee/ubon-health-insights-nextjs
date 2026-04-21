"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Download, Eye, LayoutDashboard, RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type TrialBalanceRow = {
  accountCode?: string;
  accountName?: string;
  openingDebit?: number;
  openingCredit?: number;
  movementDebit?: number;
  movementCredit?: number;
  closingDebit?: number;
  closingCredit?: number;
};

type RecordItem = {
  id: number;
  healthUnitId: number;
  unitCode: string;
  unitName: string;
  amphoeName: string;
  fiscalPeriodId: number;
  fiscalYear: number;
  month: number;
  monthNameTh: string;
  income: number;
  expense: number;
  balance: number;
  incomeBreakdown: Record<string, number> | null;
  expenseBreakdown: Record<string, number> | null;
  openingDebit: number;
  openingCredit: number;
  movementDebit: number;
  movementCredit: number;
  closingDebit: number;
  closingCredit: number;
  trialBalanceRows: TrialBalanceRow[] | null;
  notes: string | null;
  recorder: string | null;
  createdAt: string;
  updatedAt: string;
};

type DistrictOption = {
  id: number;
  nameTh: string;
};

type HealthUnitOption = {
  id: number;
  code: string;
  name: string;
  amphoeId: number;
  status: "active" | "inactive";
};

type FiscalPeriodOption = {
  id: number;
  fiscalYear: number;
  month: number;
  monthNameTh: string;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getNetOpening(record: RecordItem) {
  return (record.openingDebit || 0) - (record.openingCredit || 0);
}

function getNetClosing(record: RecordItem) {
  return (record.closingDebit || 0) - (record.closingCredit || 0);
}

export default function FinanceListPage() {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [units, setUnits] = useState<HealthUnitOption[]>([]);
  const [periods, setPeriods] = useState<FiscalPeriodOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(null);
  const [filters, setFilters] = useState({
    fiscalYear: "",
    districtId: "",
    healthUnitId: "",
    month: "",
    keyword: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadPageData() {
      setLoading(true);
      setError(null);

      try {
        const [recordRes, districtRes, unitRes, periodRes] = await Promise.all([
          fetch("/api/finance/records?pageSize=500", { cache: "no-store" }),
          fetch("/api/health-units?districts=true", { cache: "no-store" }),
          fetch("/api/health-units", { cache: "no-store" }),
          fetch("/api/fiscal-periods", { cache: "no-store" }),
        ]);

        const [recordBody, districtBody, unitBody, periodBody] = await Promise.all([
          recordRes.json(),
          districtRes.json(),
          unitRes.json(),
          periodRes.json(),
        ]);

        if (!recordRes.ok) throw new Error(recordBody.error || "โหลดรายการงบทดลองไม่สำเร็จ");
        if (!districtRes.ok) throw new Error(districtBody.error || "โหลดอำเภอไม่สำเร็จ");
        if (!unitRes.ok) throw new Error(unitBody.error || "โหลดหน่วยบริการไม่สำเร็จ");
        if (!periodRes.ok) throw new Error(periodBody.error || "โหลดงวดข้อมูลไม่สำเร็จ");

        if (!mounted) return;

        const nextPeriods = (periodBody as FiscalPeriodOption[]).sort((a, b) => {
          if (a.fiscalYear !== b.fiscalYear) return b.fiscalYear - a.fiscalYear;
          return a.month - b.month;
        });

        setRecords((recordBody.records || []) as RecordItem[]);
        setDistricts(districtBody as DistrictOption[]);
        setUnits((unitBody as HealthUnitOption[]).filter((item) => item.status === "active"));
        setPeriods(nextPeriods);
        setFilters((current) => ({
          ...current,
          fiscalYear: current.fiscalYear || String(nextPeriods[0]?.fiscalYear || ""),
        }));
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "โหลดข้อมูลงบทดลองไม่สำเร็จ");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadPageData();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => !filters.districtId || String(unit.amphoeId) === filters.districtId);
  }, [filters.districtId, units]);

  const monthOptions = useMemo(() => {
    return periods.filter((period) => !filters.fiscalYear || String(period.fiscalYear) === filters.fiscalYear);
  }, [filters.fiscalYear, periods]);

  const filteredRecords = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();

    return records.filter((record) => {
      const matchesYear = !filters.fiscalYear || String(record.fiscalYear) === filters.fiscalYear;
      const matchesDistrict = !filters.districtId || filteredUnits.some((unit) => unit.id === record.healthUnitId);
      const matchesUnit = !filters.healthUnitId || String(record.healthUnitId) === filters.healthUnitId;
      const matchesMonth = !filters.month || String(record.month) === filters.month;
      const matchesKeyword =
        !keyword ||
        record.unitCode.toLowerCase().includes(keyword) ||
        record.unitName.toLowerCase().includes(keyword) ||
        record.amphoeName.toLowerCase().includes(keyword) ||
        (record.recorder || "").toLowerCase().includes(keyword) ||
        (record.notes || "").toLowerCase().includes(keyword);

      return matchesYear && matchesDistrict && matchesUnit && matchesMonth && matchesKeyword;
    });
  }, [filteredUnits, filters, records]);

  async function reloadRecords() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/finance/records?pageSize=500", { cache: "no-store" });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "โหลดรายการงบทดลองไม่สำเร็จ");
      }

      setRecords((body.records || []) as RecordItem[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "โหลดรายการงบทดลองไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(record: RecordItem) {
    if (!window.confirm(`ยืนยันการลบงบทดลองของ ${record.unitName} เดือน ${record.monthNameTh} ${record.fiscalYear} ?`)) {
      return;
    }

    setDeletingId(record.id);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/finance/records/${record.id}`, { method: "DELETE" });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "ลบข้อมูลงบทดลองไม่สำเร็จ");
      }

      setRecords((current) => current.filter((item) => item.id !== record.id));
      setSelectedRecord((current) => (current?.id === record.id ? null : current));
      setMessage("ลบข้อมูลงบทดลองเรียบร้อยแล้ว");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ลบข้อมูลงบทดลองไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-primary">รายการงบทดลอง</h1>
          <p className="text-muted-foreground">
            แสดงข้อมูลตั้งต้นจากไฟล์งบทดลองรายเดือน โดยยึดยอดยกมา รายการระหว่างเดือน และยอดยกไปเป็นแกนหลักของงานการเงิน
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled>
            <Download className="mr-2 h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ตัวกรองข้อมูล</CardTitle>
          <CardDescription>กรองตามปีงบประมาณ อำเภอ หน่วยบริการ เดือน และคำค้นหา</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">ปีงบประมาณ</label>
              <select
                value={filters.fiscalYear}
                onChange={(event) => setFilters((current) => ({ ...current, fiscalYear: event.target.value, month: "" }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">ทั้งหมด</option>
                {Array.from(new Set(periods.map((item) => item.fiscalYear))).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">อำเภอ</label>
              <select
                value={filters.districtId}
                onChange={(event) => setFilters((current) => ({ ...current, districtId: event.target.value, healthUnitId: "" }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">ทั้งหมด</option>
                {districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.nameTh}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">หน่วยบริการ</label>
              <select
                value={filters.healthUnitId}
                onChange={(event) => setFilters((current) => ({ ...current, healthUnitId: event.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">ทั้งหมด</option>
                {filteredUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.code} - {unit.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">เดือน</label>
              <select
                value={filters.month}
                onChange={(event) => setFilters((current) => ({ ...current, month: event.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">ทั้งหมด</option>
                {monthOptions.map((period) => (
                  <option key={period.id} value={period.month}>
                    {period.monthNameTh}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 xl:col-span-2">
              <label className="text-sm font-medium">คำค้นหา</label>
              <Input
                value={filters.keyword}
                onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))}
                placeholder="ค้นหาหน่วยบริการ อำเภอ ผู้บันทึก หรือหมายเหตุ"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void reloadRecords()} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              รีเฟรชข้อมูล
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFilters({
                  fiscalYear: filters.fiscalYear,
                  districtId: "",
                  healthUnitId: "",
                  month: "",
                  keyword: "",
                })
              }
            >
              ล้างตัวกรอง
            </Button>
            <Button asChild variant="outline">
              <Link href="/finance/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                ไป Dashboard
              </Link>
            </Button>
          </div>

          {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
          {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลงบทดลอง</CardTitle>
          <CardDescription>
            {loading ? "กำลังโหลดข้อมูล..." : `พบ ${filteredRecords.length} รายการ`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium">วันที่บันทึก</th>
                  <th className="px-4 py-3 font-medium">งวดข้อมูล</th>
                  <th className="px-4 py-3 font-medium">หน่วยบริการ</th>
                  <th className="px-4 py-3 font-medium">อำเภอ</th>
                  <th className="px-4 py-3 text-right font-medium">ยกยอดมา</th>
                  <th className="px-4 py-3 text-right font-medium">เดบิตระหว่างเดือน</th>
                  <th className="px-4 py-3 text-right font-medium">เครดิตระหว่างเดือน</th>
                  <th className="px-4 py-3 text-right font-medium">ยกยอดไปสุทธิ</th>
                  <th className="px-4 py-3 font-medium">ผู้บันทึก</th>
                  <th className="px-4 py-3 text-right font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b last:border-b-0 hover:bg-muted/20">
                    <td className="px-4 py-3">{formatDateTime(record.createdAt)}</td>
                    <td className="px-4 py-3">
                      {record.monthNameTh} {record.fiscalYear}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{record.unitCode}</div>
                      <div className="text-muted-foreground">{record.unitName}</div>
                    </td>
                    <td className="px-4 py-3">{record.amphoeName}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(getNetOpening(record))}</td>
                    <td className="px-4 py-3 text-right text-rose-700">{formatCurrency(record.movementDebit)}</td>
                    <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(record.movementCredit)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(getNetClosing(record))}</td>
                    <td className="px-4 py-3">{record.recorder || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setSelectedRecord(record)}>
                          <Eye className="mr-2 h-4 w-4" />
                          ดู
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => void handleDelete(record)} disabled={deletingId === record.id}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === record.id ? "กำลังลบ..." : "ลบ"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && filteredRecords.length === 0 ? (
            <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              ไม่พบข้อมูลงบทดลองตามเงื่อนไขที่เลือก
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedRecord)} onOpenChange={(open) => (!open ? setSelectedRecord(null) : null)}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายละเอียดงบทดลอง</DialogTitle>
            <DialogDescription>
              {selectedRecord ? `${selectedRecord.unitName} เดือน ${selectedRecord.monthNameTh} ปี ${selectedRecord.fiscalYear}` : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedRecord ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">ยกยอดมา</p>
                  <p className="mt-1 text-xl font-semibold">{formatCurrency(getNetOpening(selectedRecord))}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">เดบิตระหว่างเดือน</p>
                  <p className="mt-1 text-xl font-semibold text-rose-700">{formatCurrency(selectedRecord.movementDebit)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">เครดิตระหว่างเดือน</p>
                  <p className="mt-1 text-xl font-semibold text-emerald-700">{formatCurrency(selectedRecord.movementCredit)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">ยกยอดไปสุทธิ</p>
                  <p className="mt-1 text-xl font-semibold">{formatCurrency(getNetClosing(selectedRecord))}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">เดบิตยกมา</p>
                  <p className="mt-1 font-medium">{formatCurrency(selectedRecord.openingDebit)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">เครดิตยกมา</p>
                  <p className="mt-1 font-medium">{formatCurrency(selectedRecord.openingCredit)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">เดบิตยกไป</p>
                  <p className="mt-1 font-medium">{formatCurrency(selectedRecord.closingDebit)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">เครดิตยกไป</p>
                  <p className="mt-1 font-medium">{formatCurrency(selectedRecord.closingCredit)}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">ผู้บันทึก</p>
                  <p className="mt-1 font-medium">{selectedRecord.recorder || "-"}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">ปรับปรุงล่าสุด</p>
                  <p className="mt-1 font-medium">{formatDateTime(selectedRecord.updatedAt)}</p>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="mb-2 text-sm font-medium">หมายเหตุ</p>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground">{selectedRecord.notes || "-"}</pre>
              </div>

              <div className="rounded-lg border">
                <div className="border-b px-4 py-3">
                  <p className="font-medium">รายละเอียดบัญชีจากงบทดลอง</p>
                  <p className="text-sm text-muted-foreground">
                    แสดงยอดยกมา รายการระหว่างเดือน และยอดยกไปในระดับบัญชี
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px] text-sm">
                    <thead>
                      <tr className="border-b bg-muted/40 text-left">
                        <th className="px-4 py-3 font-medium">รหัสบัญชี</th>
                        <th className="px-4 py-3 font-medium">ชื่อบัญชี</th>
                        <th className="px-4 py-3 text-right font-medium">เดบิตยกมา</th>
                        <th className="px-4 py-3 text-right font-medium">เครดิตยกมา</th>
                        <th className="px-4 py-3 text-right font-medium">เดบิตระหว่างเดือน</th>
                        <th className="px-4 py-3 text-right font-medium">เครดิตระหว่างเดือน</th>
                        <th className="px-4 py-3 text-right font-medium">เดบิตยกไป</th>
                        <th className="px-4 py-3 text-right font-medium">เครดิตยกไป</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedRecord.trialBalanceRows || []).map((row, index) => (
                        <tr key={`${row.accountCode || "row"}-${index}`} className="border-b last:border-b-0">
                          <td className="px-4 py-3">{row.accountCode || "-"}</td>
                          <td className="px-4 py-3">{row.accountName || "-"}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(Number(row.openingDebit || 0))}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(Number(row.openingCredit || 0))}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(Number(row.movementDebit || 0))}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(Number(row.movementCredit || 0))}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(Number(row.closingDebit || 0))}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(Number(row.closingCredit || 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(selectedRecord.trialBalanceRows || []).length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">ไม่มีรายละเอียดบัญชีในรายการนี้</div>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
