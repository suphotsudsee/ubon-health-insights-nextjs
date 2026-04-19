"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Pencil, Plus, RefreshCcw, Trash2, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  income: number;
  expense: number;
  balance: number;
  incomeBreakdown: Record<string, number> | null;
  expenseBreakdown: Record<string, number> | null;
  notes: string | null;
  recorder: string | null;
};

type BreakdownLine = {
  id: string;
  name: string;
  amount: string;
};

type FinanceRecordFormState = {
  healthUnitId: string;
  fiscalPeriodId: string;
  notes: string;
  recorder: string;
  incomeLines: BreakdownLine[];
  expenseLines: BreakdownLine[];
};

type ImportResponse = {
  processedFiles: number;
  imported: number;
  updated: number;
  skipped: number;
  detectedUnits: string[];
  issues: Array<{
    sourceCode: string;
    unitCode: string;
    month: number | null;
    reason: string;
  }>;
};

type FinanceAccountItem = {
  id: number;
  type: "income" | "expense";
  nameTh: string;
  displayOrder: number;
  isActive: boolean;
};

type FinanceAccountFormState = {
  type: "income" | "expense";
  nameTh: string;
  displayOrder: string;
  isActive: boolean;
};

function createLine(name = "", amount = ""): BreakdownLine {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    amount,
  };
}

function createEmptyForm(currentPeriodId?: number | string): FinanceRecordFormState {
  return {
    healthUnitId: "",
    fiscalPeriodId: currentPeriodId ? String(currentPeriodId) : "",
    notes: "",
    recorder: "",
    incomeLines: [createLine()],
    expenseLines: [createLine()],
  };
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function toNumber(value: string) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildBreakdown(lines: BreakdownLine[]) {
  return lines.reduce((acc, line) => {
    const name = line.name.trim();
    if (!name) {
      return acc;
    }
    const amount = toNumber(line.amount);
    acc[name] = (acc[name] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);
}

function sumLines(lines: BreakdownLine[]) {
  return lines.reduce((sum, line) => sum + toNumber(line.amount), 0);
}

function breakdownToLines(breakdown: Record<string, number> | null) {
  const entries = Object.entries(breakdown || {}).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return [createLine()];
  }
  return entries.map(([name, amount]) => createLine(name, String(amount)));
}

function breakdownEntries(breakdown: Record<string, number> | null) {
  return Object.entries(breakdown || {}).sort((a, b) => b[1] - a[1]);
}

type Props = {
  units: HealthUnitOption[];
  fiscalPeriods: FiscalPeriodOption[];
  years: number[];
  currentPeriod: FiscalPeriodOption | null;
};

export function FinanceSettingsSection({ units, fiscalPeriods, years, currentPeriod }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [records, setRecords] = useState<FinanceRecordItem[]>([]);
  const [accounts, setAccounts] = useState<FinanceAccountItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState(String(currentPeriod?.fiscalYear ?? years[0] ?? ""));
  const [form, setForm] = useState<FinanceRecordFormState>(createEmptyForm(currentPeriod?.id));
  const [editingRecord, setEditingRecord] = useState<FinanceRecordItem | null>(null);
  const [editForm, setEditForm] = useState<FinanceRecordFormState>(createEmptyForm());
  const [accountForm, setAccountForm] = useState<FinanceAccountFormState>({
    type: "income",
    nameTh: "",
    displayOrder: "0",
    isActive: true,
  });
  const [editingAccount, setEditingAccount] = useState<FinanceAccountItem | null>(null);
  const [editAccountForm, setEditAccountForm] = useState<FinanceAccountFormState>({
    type: "income",
    nameTh: "",
    displayOrder: "0",
    isActive: true,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);
  const [lastImport, setLastImport] = useState<ImportResponse | null>(null);

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) {
      return records;
    }

    return records.filter((record) => {
      return (
        record.unitCode.toLowerCase().includes(keyword) ||
        record.unitName.toLowerCase().includes(keyword) ||
        record.monthNameTh.toLowerCase().includes(keyword) ||
        (record.recorder || "").toLowerCase().includes(keyword)
      );
    });
  }, [records, search]);

  const unitsWithFinanceRecords = useMemo(() => {
    return new Set(records.map((record) => record.healthUnitId)).size;
  }, [records]);

  const periodsForSelectedYear = useMemo(() => {
    const year = Number(selectedYear);
    return fiscalPeriods.filter((period) => period.fiscalYear === year && period.id);
  }, [fiscalPeriods, selectedYear]);

  useEffect(() => {
    if (!selectedYear && (currentPeriod?.fiscalYear || years[0])) {
      setSelectedYear(String(currentPeriod?.fiscalYear ?? years[0]));
    }
  }, [currentPeriod?.fiscalYear, selectedYear, years]);

  useEffect(() => {
    if (periodsForSelectedYear.length === 0) {
      setForm((current) => ({ ...current, fiscalPeriodId: "" }));
      return;
    }

    setForm((current) => {
      const stillSelected = periodsForSelectedYear.some((period) => String(period.id) === current.fiscalPeriodId);
      if (stillSelected) {
        return current;
      }

      const defaultPeriod =
        periodsForSelectedYear.find((period) => period.id === currentPeriod?.id) ?? periodsForSelectedYear[0];

      return {
        ...current,
        fiscalPeriodId: defaultPeriod?.id ? String(defaultPeriod.id) : "",
      };
    });
  }, [currentPeriod?.id, periodsForSelectedYear]);

  const incomeOptions = useMemo(() => {
    return Array.from(
      new Set(
        accounts
          .filter((account) => account.type === "income" && account.isActive)
          .map((account) => account.nameTh)
      )
    ).sort((a, b) => a.localeCompare(b, "th"));
  }, [accounts]);

  const expenseOptions = useMemo(() => {
    return Array.from(
      new Set(
        accounts
          .filter((account) => account.type === "expense" && account.isActive)
          .map((account) => account.nameTh)
      )
    ).sort((a, b) => a.localeCompare(b, "th"));
  }, [accounts]);

  const createIncomeTotal = useMemo(() => sumLines(form.incomeLines), [form.incomeLines]);
  const createExpenseTotal = useMemo(() => sumLines(form.expenseLines), [form.expenseLines]);
  const editIncomeTotal = useMemo(() => sumLines(editForm.incomeLines), [editForm.incomeLines]);
  const editExpenseTotal = useMemo(() => sumLines(editForm.expenseLines), [editForm.expenseLines]);

  function resetFeedback() {
    setMessage("");
    setError("");
  }

  async function loadRecords() {
    try {
      setIsLoading(true);
      setError("");
      const year = selectedYear ? `&fiscalYear=${selectedYear}` : "";
      const response = await fetch(`/api/finance/records?pageSize=500${year}`, { cache: "no-store" });
      const body = (await response.json()) as { records?: FinanceRecordItem[]; error?: string };
      if (!response.ok) {
        throw new Error(body.error || "โหลดข้อมูลการเงินไม่สำเร็จ");
      }
      setRecords(body.records || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "โหลดข้อมูลการเงินไม่สำเร็จ");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAccounts() {
    try {
      const response = await fetch("/api/finance-accounts", { cache: "no-store" });
      const body = (await response.json()) as FinanceAccountItem[] | { error?: string };
      if (!response.ok) {
        throw new Error((body as { error?: string }).error || "โหลดรายการรายได้และรายจ่ายไม่สำเร็จ");
      }
      setAccounts(body as FinanceAccountItem[]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "โหลดรายการรายได้และรายจ่ายไม่สำเร็จ");
    }
  }

  useEffect(() => {
    void loadRecords();
  }, [selectedYear]);

  useEffect(() => {
    void loadAccounts();
  }, []);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "");
      folderInputRef.current.setAttribute("directory", "");
      folderInputRef.current.setAttribute("multiple", "");
    }
  }, []);

  function updateLines(
    target: "incomeLines" | "expenseLines",
    updater: (lines: BreakdownLine[]) => BreakdownLine[]
  ) {
    setForm((current) => ({ ...current, [target]: updater(current[target]) }));
  }

  function updateEditLines(
    target: "incomeLines" | "expenseLines",
    updater: (lines: BreakdownLine[]) => BreakdownLine[]
  ) {
    setEditForm((current) => ({ ...current, [target]: updater(current[target]) }));
  }

  function setLineValue(
    target: "incomeLines" | "expenseLines",
    id: string,
    field: "name" | "amount",
    value: string
  ) {
    updateLines(target, (lines) => lines.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
  }

  function setEditLineValue(
    target: "incomeLines" | "expenseLines",
    id: string,
    field: "name" | "amount",
    value: string
  ) {
    updateEditLines(target, (lines) => lines.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
  }

  function addLine(target: "incomeLines" | "expenseLines") {
    updateLines(target, (lines) => [...lines, createLine()]);
  }

  function addEditLine(target: "incomeLines" | "expenseLines") {
    updateEditLines(target, (lines) => [...lines, createLine()]);
  }

  function removeLine(target: "incomeLines" | "expenseLines", id: string) {
    updateLines(target, (lines) => (lines.length > 1 ? lines.filter((line) => line.id !== id) : [createLine()]));
  }

  function removeEditLine(target: "incomeLines" | "expenseLines", id: string) {
    updateEditLines(target, (lines) => (lines.length > 1 ? lines.filter((line) => line.id !== id) : [createLine()]));
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    setIsSaving(true);

    try {
      const incomeBreakdown = buildBreakdown(form.incomeLines);
      const expenseBreakdown = buildBreakdown(form.expenseLines);
      const response = await fetch("/api/finance/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          healthUnitId: Number(form.healthUnitId),
          fiscalPeriodId: Number(form.fiscalPeriodId),
          income: createIncomeTotal,
          expense: createExpenseTotal,
          incomeBreakdown,
          expenseBreakdown,
          notes: form.notes || undefined,
          recorder: form.recorder || undefined,
        }),
      });

      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "เพิ่มข้อมูลการเงินไม่สำเร็จ");
      }

      setMessage(body.message || "เพิ่มข้อมูลการเงินเรียบร้อยแล้ว");
      setForm(createEmptyForm(currentPeriod?.id));
      await loadRecords();
      await loadAccounts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "เพิ่มข้อมูลการเงินไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  }

  function openEditDialog(record: FinanceRecordItem) {
    resetFeedback();
    setEditingRecord(record);
    setEditForm({
      healthUnitId: String(record.healthUnitId),
      fiscalPeriodId: String(record.fiscalPeriodId),
      notes: record.notes || "",
      recorder: record.recorder || "",
      incomeLines: breakdownToLines(record.incomeBreakdown),
      expenseLines: breakdownToLines(record.expenseBreakdown),
    });
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingRecord) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const incomeBreakdown = buildBreakdown(editForm.incomeLines);
      const expenseBreakdown = buildBreakdown(editForm.expenseLines);
      const response = await fetch(`/api/finance/records/${editingRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          income: editIncomeTotal,
          expense: editExpenseTotal,
          incomeBreakdown,
          expenseBreakdown,
          notes: editForm.notes || undefined,
          recorder: editForm.recorder || undefined,
        }),
      });

      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "แก้ไขข้อมูลการเงินไม่สำเร็จ");
      }

      setMessage(body.message || "แก้ไขข้อมูลการเงินเรียบร้อยแล้ว");
      setEditingRecord(null);
      await loadRecords();
      await loadAccounts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "แก้ไขข้อมูลการเงินไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(record: FinanceRecordItem) {
    if (!window.confirm(`ยืนยันการลบข้อมูลการเงิน ${record.unitCode} ${record.monthNameTh} ${record.fiscalYear} ?`)) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/finance/records/${record.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ลบข้อมูลการเงินไม่สำเร็จ");
      }

      setMessage(body.message || "ลบข้อมูลการเงินเรียบร้อยแล้ว");
      await loadRecords();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ลบข้อมูลการเงินไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleImport() {
    if (selectedFiles.length === 0) {
      setError("กรุณาเลือกไฟล์ Excel");
      return;
    }

    resetFeedback();
    setImporting(true);
    setLastImport(null);

    try {
      const payload = new FormData();
      selectedFiles.forEach((file) => payload.append("files", file));
      payload.set("fiscalYear", selectedYear);
      payload.set("recorder", form.recorder || "settings-import");

      const response = await fetch("/api/finance/import", {
        method: "POST",
        body: payload,
      });
      const body = (await response.json()) as ImportResponse & { error?: string };

      if (!response.ok) {
        throw new Error(body.error || "นำเข้าข้อมูลการเงินไม่สำเร็จ");
      }

      setLastImport(body);
      setMessage(`นำเข้าสำเร็จ เพิ่มใหม่ ${body.imported} ปรับปรุง ${body.updated} ข้าม ${body.skipped}`);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
      await loadRecords();
      await loadAccounts();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "นำเข้าข้อมูลการเงินไม่สำเร็จ");
    } finally {
      setImporting(false);
    }
  }

  async function handleCreateAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch("/api/finance-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: accountForm.type,
          nameTh: accountForm.nameTh,
          displayOrder: Number(accountForm.displayOrder || 0),
          isActive: accountForm.isActive,
        }),
      });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "เพิ่ม master รายการการเงินไม่สำเร็จ");
      }

      setMessage(body.message || "เพิ่ม master รายการการเงินเรียบร้อยแล้ว");
      setAccountForm({
        type: "income",
        nameTh: "",
        displayOrder: "0",
        isActive: true,
      });
      await loadAccounts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "เพิ่ม master รายการการเงินไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  }

  function openEditAccountDialog(account: FinanceAccountItem) {
    resetFeedback();
    setEditingAccount(account);
    setEditAccountForm({
      type: account.type,
      nameTh: account.nameTh,
      displayOrder: String(account.displayOrder),
      isActive: account.isActive,
    });
  }

  async function handleUpdateAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingAccount) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/finance-accounts/${editingAccount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: editAccountForm.type,
          nameTh: editAccountForm.nameTh,
          displayOrder: Number(editAccountForm.displayOrder || 0),
          isActive: editAccountForm.isActive,
        }),
      });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "แก้ไข master รายการการเงินไม่สำเร็จ");
      }

      setMessage(body.message || "แก้ไข master รายการการเงินเรียบร้อยแล้ว");
      setEditingAccount(null);
      await loadAccounts();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "แก้ไข master รายการการเงินไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount(account: FinanceAccountItem) {
    if (!window.confirm(`ยืนยันการลบรายการ ${account.nameTh} ?`)) {
      return;
    }

    resetFeedback();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/finance-accounts/${account.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(body.error || "ลบ master รายการการเงินไม่สำเร็จ");
      }

      setMessage(body.message || "ลบ master รายการการเงินเรียบร้อยแล้ว");
      await loadAccounts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "ลบ master รายการการเงินไม่สำเร็จ");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {message ? <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div> : null}
      {error ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

      <datalist id="income-account-options">
        {incomeOptions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      <datalist id="expense-account-options">
        {expenseOptions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">เมนูการเงิน</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/finance/income/create">
              <ExternalLink className="mr-2 h-4 w-4" />
              บันทึกรายรับ
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/finance/expense/create">
              <ExternalLink className="mr-2 h-4 w-4" />
              บันทึกรายจ่าย
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/finance/list">
              <ExternalLink className="mr-2 h-4 w-4" />
              รายการข้อมูล
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="บันทึกการเงินที่แสดง" value={String(records.length)} />
        <SummaryCard label="หน่วยบริการที่มีข้อมูล" value={String(unitsWithFinanceRecords)} />
        <SummaryCard label="รายรับรวม" value={formatAmount(records.reduce((sum, record) => sum + record.income, 0))} />
        <SummaryCard label="รายจ่ายรวม" value={formatAmount(records.reduce((sum, record) => sum + record.expense, 0))} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[460px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">จัดการรายการรายได้และรายจ่าย</CardTitle>
              <CardDescription>สร้าง แก้ไข และลบ master ของชื่อรายการที่ใช้ในฟอร์มการเงิน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form className="space-y-4" onSubmit={handleCreateAccount}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="ประเภท">
                    <select
                      value={accountForm.type}
                      onChange={(event) => setAccountForm((current) => ({ ...current, type: event.target.value as "income" | "expense" }))}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      <option value="income">รายได้</option>
                      <option value="expense">รายจ่าย</option>
                    </select>
                  </Field>
                  <Field label="ลำดับ">
                    <Input value={accountForm.displayOrder} onChange={(event) => setAccountForm((current) => ({ ...current, displayOrder: event.target.value }))} />
                  </Field>
                </div>
                <Field label="ชื่อรายการ">
                  <Input value={accountForm.nameTh} onChange={(event) => setAccountForm((current) => ({ ...current, nameTh: event.target.value }))} />
                </Field>
                <Field label="สถานะ">
                  <select
                    value={accountForm.isActive ? "active" : "inactive"}
                    onChange={(event) => setAccountForm((current) => ({ ...current, isActive: event.target.value === "active" }))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">ใช้งาน</option>
                    <option value="inactive">ปิดใช้งาน</option>
                  </select>
                </Field>
                <Button type="submit" className="w-full" disabled={isSaving || !accountForm.nameTh.trim()}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isSaving ? "กำลังบันทึก..." : "เพิ่มรายการ master"}
                </Button>
              </form>

              <div className="rounded-xl border">
                <div className="border-b px-4 py-3 text-sm font-medium">รายการที่มีอยู่</div>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="px-4 py-2 font-medium">ประเภท</th>
                        <th className="px-4 py-2 font-medium">ชื่อรายการ</th>
                        <th className="px-4 py-2 font-medium">สถานะ</th>
                        <th className="px-4 py-2 text-right font-medium">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((account) => (
                        <tr key={account.id} className="border-b last:border-b-0">
                          <td className="px-4 py-3">{account.type === "income" ? "รายได้" : "รายจ่าย"}</td>
                          <td className="px-4 py-3">{account.nameTh}</td>
                          <td className="px-4 py-3">{account.isActive ? "ใช้งาน" : "ปิดใช้งาน"}</td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" size="sm" onClick={() => openEditAccountDialog(account)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                แก้ไข
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={() => void handleDeleteAccount(account)}>
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
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">นำเข้าข้อมูลการเงิน</CardTitle>
              <CardDescription>อ่านรหัส `pcucode` โดย 5 หลักแรกเป็นหน่วยบริการ และ 2 หลักท้ายเป็นเดือน</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Field label="ผู้บันทึก">
                <Input value={form.recorder} onChange={(event) => setForm((current) => ({ ...current, recorder: event.target.value }))} placeholder="settings-import" />
              </Field>
              <Field label="ไฟล์ Excel">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".xlsx,.xls"
                  className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
                  onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
                />
              </Field>
              <Field label="โฟลเดอร์เอกสารรายเดือน">
                <input
                  ref={folderInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="block w-full rounded-md border bg-background px-3 py-2 text-sm"
                  onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
                />
              </Field>
              {selectedFiles.length > 0 ? (
                <div className="rounded-xl border bg-muted/20 p-4 text-sm">
                  <p>เลือกแล้ว {selectedFiles.length} ไฟล์</p>
                  <p className="text-muted-foreground">ตัวอย่าง: {selectedFiles.slice(0, 3).map((file) => file.name).join(", ")}</p>
                </div>
              ) : null}
              <Button type="button" className="w-full" onClick={() => void handleImport()} disabled={importing || !selectedYear}>
                <Upload className="mr-2 h-4 w-4" />
                {importing ? "กำลังนำเข้า..." : "นำเข้าข้อมูล"}
              </Button>
              {lastImport ? (
                <div className="rounded-xl border bg-muted/20 p-4 text-sm">
                  <p>ประมวลผล {lastImport.processedFiles} ไฟล์</p>
                  <p>เพิ่มใหม่ {lastImport.imported} รายการ</p>
                  <p>ปรับปรุง {lastImport.updated} รายการ</p>
                  <p>ข้าม {lastImport.skipped} รายการ</p>
                  {lastImport.detectedUnits.length > 0 ? (
                    <p className="text-muted-foreground">หน่วยบริการที่ตรวจพบ: {lastImport.detectedUnits.join(", ")}</p>
                  ) : null}
                  {lastImport.issues.length > 0 ? (
                    <div className="mt-3 space-y-2">
                      {lastImport.issues.slice(0, 5).map((issue, index) => (
                        <div key={`${issue.sourceCode}-${index}`} className="rounded-md bg-background px-3 py-2 text-xs text-muted-foreground">
                          {issue.sourceCode || "-"}: {issue.reason}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">เพิ่มบันทึกการเงินรายหน่วยบริการ</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreate}>
                <Field label="ปีงบประมาณ">
                  <select
                    value={selectedYear}
                    onChange={(event) => setSelectedYear(event.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">เลือกปีงบประมาณ</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="หน่วยบริการ">
                  <select
                    value={form.healthUnitId}
                    onChange={(event) => setForm((current) => ({ ...current, healthUnitId: event.target.value }))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">เลือกหน่วยบริการ</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.code} - {unit.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="งวดเดือน">
                  <select
                    value={form.fiscalPeriodId}
                    onChange={(event) => setForm((current) => ({ ...current, fiscalPeriodId: event.target.value }))}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">เลือกงวดเดือน</option>
                    {periodsForSelectedYear.map((period) => (
                      <option key={period.id} value={period.id}>
                        {period.monthNameTh} / ไตรมาส {period.quarter} / {period.fiscalYear}
                      </option>
                    ))}
                  </select>
                  {!periodsForSelectedYear.length ? (
                    <p className="text-xs text-muted-foreground">ยังไม่มีงวดเดือนในปีงบประมาณที่เลือก</p>
                  ) : null}
                </Field>

                <BreakdownEditor
                  title="รายการรายได้"
                  description="เลือกชื่อรายได้จากรายการที่มีอยู่ หรือพิมพ์ชื่อใหม่ได้"
                  lines={form.incomeLines}
                  options={incomeOptions}
                  total={createIncomeTotal}
                  listId="income-account-options"
                  onAdd={() => addLine("incomeLines")}
                  onChange={(id, field, value) => setLineValue("incomeLines", id, field, value)}
                  onRemove={(id) => removeLine("incomeLines", id)}
                />

                <BreakdownEditor
                  title="รายการรายจ่าย"
                  description="เลือกชื่อรายจ่ายจากรายการที่มีอยู่ หรือพิมพ์ชื่อใหม่ได้"
                  lines={form.expenseLines}
                  options={expenseOptions}
                  total={createExpenseTotal}
                  listId="expense-account-options"
                  onAdd={() => addLine("expenseLines")}
                  onChange={(id, field, value) => setLineValue("expenseLines", id, field, value)}
                  onRemove={(id) => removeLine("expenseLines", id)}
                />

                <Field label="ผู้บันทึก">
                  <Input value={form.recorder} onChange={(event) => setForm((current) => ({ ...current, recorder: event.target.value }))} />
                </Field>
                <Field label="หมายเหตุ">
                  <textarea
                    value={form.notes}
                    onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                    rows={3}
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  />
                </Field>
                <Button type="submit" className="w-full" disabled={isSaving || !form.healthUnitId || !form.fiscalPeriodId}>
                  <Plus className="mr-2 h-4 w-4" />
                  {isSaving ? "กำลังบันทึก..." : "บันทึกการเงินรายหน่วยบริการ"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">จัดการการเงินรายหน่วยบริการ</CardTitle>
              <CardDescription>ค้นหา แก้ไข และลบบันทึกรายรับรายจ่ายของแต่ละหน่วยบริการ</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหารหัส ชื่อหน่วยบริการ หรือเดือน" className="w-full md:w-72" />
              <Button variant="outline" size="icon" onClick={() => void loadRecords()} disabled={isLoading}>
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">หน่วยบริการ</th>
                    <th className="pb-3 font-medium">งวด</th>
                    <th className="pb-3 font-medium text-right">รายรับ</th>
                    <th className="pb-3 font-medium text-right">รายจ่าย</th>
                    <th className="pb-3 font-medium text-right">คงเหลือ</th>
                    <th className="pb-3 font-medium">ผู้บันทึก</th>
                    <th className="pb-3 font-medium text-right">จัดการ</th>
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
                      <td className="py-4 text-right">{formatAmount(record.income)}</td>
                      <td className="py-4 text-right">{formatAmount(record.expense)}</td>
                      <td className="py-4 text-right">{formatAmount(record.balance)}</td>
                      <td className="py-4 text-muted-foreground">{record.recorder || "-"}</td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditDialog(record)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            แก้ไข
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
              <div className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">ไม่พบข้อมูลการเงินตามเงื่อนไขที่ค้นหา</div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(editingRecord)} onOpenChange={(open) => (!open ? setEditingRecord(null) : null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>แก้ไขข้อมูลการเงิน</DialogTitle>
            <DialogDescription>ปรับรายการรายได้ รายจ่าย ผู้บันทึก และหมายเหตุของรายการที่มีอยู่</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdate}>
            <Field label="หน่วยบริการ">
              <Input value={editingRecord ? `${editingRecord.unitCode} - ${editingRecord.unitName}` : ""} disabled />
            </Field>
            <Field label="งวดเดือน">
              <Input value={editingRecord ? `${editingRecord.monthNameTh} ${editingRecord.fiscalYear}` : ""} disabled />
            </Field>

            <BreakdownEditor
              title="รายการรายได้"
              description="แก้ไขรายการรายได้ของงวดนี้"
              lines={editForm.incomeLines}
              options={incomeOptions}
              total={editIncomeTotal}
              listId="income-account-options"
              onAdd={() => addEditLine("incomeLines")}
              onChange={(id, field, value) => setEditLineValue("incomeLines", id, field, value)}
              onRemove={(id) => removeEditLine("incomeLines", id)}
            />

            <BreakdownEditor
              title="รายการรายจ่าย"
              description="แก้ไขรายการรายจ่ายของงวดนี้"
              lines={editForm.expenseLines}
              options={expenseOptions}
              total={editExpenseTotal}
              listId="expense-account-options"
              onAdd={() => addEditLine("expenseLines")}
              onChange={(id, field, value) => setEditLineValue("expenseLines", id, field, value)}
              onRemove={(id) => removeEditLine("expenseLines", id)}
            />

            <Field label="ผู้บันทึก">
              <Input value={editForm.recorder} onChange={(event) => setEditForm((current) => ({ ...current, recorder: event.target.value }))} />
            </Field>
            <Field label="หมายเหตุ">
              <textarea
                value={editForm.notes}
                onChange={(event) => setEditForm((current) => ({ ...current, notes: event.target.value }))}
                rows={3}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </Field>

            {editingRecord ? (
              <div className="rounded-xl border bg-muted/20 p-4">
                <p className="mb-3 text-sm font-medium">รายชื่อรายได้เดิมที่มีอยู่ในรายการนี้</p>
                <div className="max-h-56 overflow-y-auto rounded-lg border bg-background">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Accountname</th>
                        <th className="px-3 py-2 text-right font-medium">ยอด</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breakdownEntries(editingRecord.incomeBreakdown).map(([name, amount]) => (
                        <tr key={name} className="border-b last:border-b-0">
                          <td className="px-3 py-2">{name}</td>
                          <td className="px-3 py-2 text-right">{formatAmount(amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingRecord(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editingAccount)} onOpenChange={(open) => (!open ? setEditingAccount(null) : null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไข master รายการการเงิน</DialogTitle>
            <DialogDescription>ปรับประเภท ชื่อรายการ ลำดับ และสถานะการใช้งาน</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateAccount}>
            <Field label="ประเภท">
              <select
                value={editAccountForm.type}
                onChange={(event) => setEditAccountForm((current) => ({ ...current, type: event.target.value as "income" | "expense" }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="income">รายได้</option>
                <option value="expense">รายจ่าย</option>
              </select>
            </Field>
            <Field label="ชื่อรายการ">
              <Input value={editAccountForm.nameTh} onChange={(event) => setEditAccountForm((current) => ({ ...current, nameTh: event.target.value }))} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="ลำดับ">
                <Input value={editAccountForm.displayOrder} onChange={(event) => setEditAccountForm((current) => ({ ...current, displayOrder: event.target.value }))} />
              </Field>
              <Field label="สถานะ">
                <select
                  value={editAccountForm.isActive ? "active" : "inactive"}
                  onChange={(event) => setEditAccountForm((current) => ({ ...current, isActive: event.target.value === "active" }))}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ปิดใช้งาน</option>
                </select>
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingAccount(null)}>
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BreakdownEditor({
  title,
  description,
  lines,
  options,
  total,
  listId,
  onAdd,
  onChange,
  onRemove,
}: {
  title: string;
  description: string;
  lines: BreakdownLine[];
  options: string[];
  total: number;
  listId: string;
  onAdd: () => void;
  onChange: (id: string, field: "name" | "amount", value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">ยอดรวม</p>
          <p className="text-sm font-semibold">{formatAmount(total)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {lines.map((line) => (
          <div key={line.id} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_140px_92px]">
            <div>
              <Input
                list={listId}
                value={line.name}
                onChange={(event) => onChange(line.id, "name", event.target.value)}
                placeholder={options.length > 0 ? options[0] : "ชื่อรายการ"}
              />
            </div>
            <div>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={line.amount}
                onChange={(event) => onChange(line.id, "amount", event.target.value)}
                placeholder="0.00"
              />
            </div>
            <Button type="button" variant="outline" onClick={() => onRemove(line.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              ลบ
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" className="mt-3 w-full" onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        เพิ่มรายการ
      </Button>
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
