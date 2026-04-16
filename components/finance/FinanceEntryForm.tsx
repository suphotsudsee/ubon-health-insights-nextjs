"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type FinanceEntryType = "income" | "expense";

type HealthUnitOption = {
  id: number;
  code: string;
  name: string;
  amphoeId: number;
  amphoeName: string;
  status: "active" | "inactive";
};

type DistrictOption = {
  id: number;
  nameTh: string;
};

type FiscalPeriodOption = {
  id: number;
  fiscalYear: number;
  month: number;
  monthNameTh: string;
  quarter: number;
};

type FinanceAccountOption = {
  id: number;
  type: "income" | "expense";
  nameTh: string;
  isActive: boolean;
};

type FinanceRecordResponse = {
  id: number;
  income: number;
  expense: number;
  incomeBreakdown: Record<string, number> | null;
  expenseBreakdown: Record<string, number> | null;
  notes: string | null;
  recorder: string | null;
};

type FormState = {
  transactionDate: string;
  fiscalYear: string;
  districtId: string;
  healthUnitId: string;
  documentNo: string;
  referenceNo: string;
  categoryName: string;
  title: string;
  payeeName: string;
  amountInput: string;
  description: string;
  recorder: string;
};

const today = new Date().toISOString().slice(0, 10);

function formatAmountInput(value: string) {
  const sanitized = value.replace(/[^\d.]/g, "");
  const [intPart, decimalPart] = sanitized.split(".");
  const normalizedInt = intPart ? Number(intPart).toLocaleString("en-US") : "";
  return decimalPart !== undefined ? `${normalizedInt}.${decimalPart.slice(0, 2)}` : normalizedInt;
}

function parseAmount(value: string) {
  const parsed = Number(value.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildStoredNotes(type: FinanceEntryType, form: FormState) {
  const lines = [
    `[${type.toUpperCase()} ENTRY]`,
    `วันที่รายการ: ${form.transactionDate}`,
    `เลขที่เอกสาร: ${form.documentNo}`,
    `เลขที่อ้างอิง: ${form.referenceNo || "-"}`,
    `หมวด: ${form.categoryName}`,
    `รายการ: ${form.title}`,
  ];

  if (type === "expense") {
    lines.push(`ผู้รับเงิน/เจ้าหนี้: ${form.payeeName || "-"}`);
  }

  lines.push(`รายละเอียด: ${form.description || "-"}`);
  return lines.join("\n");
}

function mergeNotes(existingNotes: string | null, nextNote: string) {
  if (!existingNotes?.trim()) {
    return nextNote;
  }
  return `${existingNotes}\n\n${nextNote}`;
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function FinanceEntryForm({ type }: { type: FinanceEntryType }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [units, setUnits] = useState<HealthUnitOption[]>([]);
  const [periods, setPeriods] = useState<FiscalPeriodOption[]>([]);
  const [accounts, setAccounts] = useState<FinanceAccountOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>({
    transactionDate: today,
    fiscalYear: "",
    districtId: "",
    healthUnitId: "",
    documentNo: "",
    referenceNo: "",
    categoryName: "",
    title: "",
    payeeName: "",
    amountInput: "",
    description: "",
    recorder: "",
  });

  useEffect(() => {
    let mounted = true;

    async function loadOptions() {
      setLoading(true);
      setError(null);

      try {
        const [districtRes, unitRes, periodRes, accountRes] = await Promise.all([
          fetch("/api/health-units?districts=true", { cache: "no-store" }),
          fetch("/api/health-units", { cache: "no-store" }),
          fetch("/api/fiscal-periods", { cache: "no-store" }),
          fetch("/api/finance-accounts", { cache: "no-store" }),
        ]);

        const [districtBody, unitBody, periodBody, accountBody] = await Promise.all([
          districtRes.json(),
          unitRes.json(),
          periodRes.json(),
          accountRes.json(),
        ]);

        if (!districtRes.ok) throw new Error(districtBody.error || "โหลดอำเภอไม่สำเร็จ");
        if (!unitRes.ok) throw new Error(unitBody.error || "โหลดหน่วยบริการไม่สำเร็จ");
        if (!periodRes.ok) throw new Error(periodBody.error || "โหลดงวดปีไม่สำเร็จ");
        if (!accountRes.ok) throw new Error(accountBody.error || "โหลดหมวดการเงินไม่สำเร็จ");

        if (!mounted) return;

        const nextPeriods = (periodBody as FiscalPeriodOption[]).sort((a, b) => {
          if (a.fiscalYear !== b.fiscalYear) return b.fiscalYear - a.fiscalYear;
          return a.month - b.month;
        });

        setDistricts(districtBody as DistrictOption[]);
        setUnits((unitBody as HealthUnitOption[]).filter((item) => item.status === "active"));
        setPeriods(nextPeriods);
        setAccounts((accountBody as FinanceAccountOption[]).filter((item) => item.isActive));

        const defaultYear = nextPeriods[0]?.fiscalYear ? String(nextPeriods[0].fiscalYear) : "";
        setForm((current) => ({ ...current, fiscalYear: current.fiscalYear || defaultYear }));
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError instanceof Error ? loadError.message : "โหลดข้อมูลฟอร์มไม่สำเร็จ");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadOptions();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredUnits = units.filter((unit) => !form.districtId || String(unit.amphoeId) === form.districtId);
  const categoryOptions = accounts.filter((account) => account.type === type);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    setMessage(null);
    setError(null);
  }

  function resetForm() {
    setForm((current) => ({
      ...current,
      transactionDate: today,
      districtId: "",
      healthUnitId: "",
      documentNo: "",
      referenceNo: "",
      categoryName: "",
      title: "",
      payeeName: "",
      amountInput: "",
      description: "",
      recorder: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setErrors({});
    setMessage(null);
    setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    const nextErrors: Record<string, string> = {};
    const amount = parseAmount(form.amountInput);
    const month = Number(form.transactionDate.slice(5, 7));
    const selectedPeriod = periods.find((item) => String(item.fiscalYear) === form.fiscalYear && item.month === month);

    if (!form.transactionDate) nextErrors.transactionDate = "กรุณาเลือกวันที่รายการ";
    if (!form.fiscalYear) nextErrors.fiscalYear = "กรุณาเลือกปีงบประมาณ";
    if (!form.districtId) nextErrors.districtId = "กรุณาเลือกอำเภอ";
    if (!form.healthUnitId) nextErrors.healthUnitId = "กรุณาเลือกหน่วยบริการ";
    if (!form.documentNo.trim()) nextErrors.documentNo = "กรุณากรอกเลขที่เอกสาร";
    if (!form.categoryName.trim()) nextErrors.categoryName = `กรุณาเลือกหมวด${type === "income" ? "รายรับ" : "รายจ่าย"}`;
    if (!form.title.trim()) nextErrors.title = `กรุณากรอก${type === "income" ? "รายการ" : "ชื่อรายการ"}`;
    if (amount <= 0) nextErrors.amountInput = "จำนวนเงินต้องมากกว่า 0";
    if (!selectedPeriod) nextErrors.transactionDate = "ไม่พบงวดข้อมูลของเดือนที่เลือกในปีงบประมาณนี้";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !selectedPeriod) {
      return;
    }

    setSaving(true);

    try {
      const recordQuery = new URLSearchParams({
        fiscalYear: form.fiscalYear,
        month: String(month),
        healthUnitId: form.healthUnitId,
        pageSize: "1",
      });

      const existingRes = await fetch(`/api/finance/records?${recordQuery.toString()}`, { cache: "no-store" });
      const existingBody = await existingRes.json();

      if (!existingRes.ok) {
        throw new Error(existingBody.error || "ตรวจสอบข้อมูลเดิมไม่สำเร็จ");
      }

      const existingRecord = ((existingBody.records || []) as FinanceRecordResponse[])[0];
      const nextIncomeBreakdown = { ...(existingRecord?.incomeBreakdown || {}) };
      const nextExpenseBreakdown = { ...(existingRecord?.expenseBreakdown || {}) };

      if (type === "income") {
        nextIncomeBreakdown[form.categoryName] = Number(nextIncomeBreakdown[form.categoryName] || 0) + amount;
      } else {
        nextExpenseBreakdown[form.categoryName] = Number(nextExpenseBreakdown[form.categoryName] || 0) + amount;
      }

      const nextNote = buildStoredNotes(type, form);

      if (existingRecord) {
        const updateRes = await fetch(`/api/finance/records/${existingRecord.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            income: type === "income" ? Number(existingRecord.income || 0) + amount : Number(existingRecord.income || 0),
            expense: type === "expense" ? Number(existingRecord.expense || 0) + amount : Number(existingRecord.expense || 0),
            incomeBreakdown: nextIncomeBreakdown,
            expenseBreakdown: nextExpenseBreakdown,
            notes: mergeNotes(existingRecord.notes, nextNote),
            recorder: form.recorder.trim() || existingRecord.recorder || undefined,
          }),
        });

        const updateBody = await updateRes.json();
        if (!updateRes.ok) {
          throw new Error(updateBody.error || "บันทึกรายการไม่สำเร็จ");
        }
      } else {
        const createRes = await fetch("/api/finance/records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            healthUnitId: Number(form.healthUnitId),
            fiscalPeriodId: selectedPeriod.id,
            income: type === "income" ? amount : 0,
            expense: type === "expense" ? amount : 0,
            incomeBreakdown: type === "income" ? nextIncomeBreakdown : undefined,
            expenseBreakdown: type === "expense" ? nextExpenseBreakdown : undefined,
            notes: nextNote,
            recorder: form.recorder.trim() || undefined,
          }),
        });

        const createBody = await createRes.json();
        if (!createRes.ok) {
          throw new Error(createBody.error || "บันทึกรายการไม่สำเร็จ");
        }
      }

      setMessage(`${type === "income" ? "บันทึกรายรับ" : "บันทึกรายจ่าย"}สำเร็จ`);
      router.push("/finance/list");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "บันทึกรายการไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-primary">{type === "income" ? "บันทึกรายรับ" : "บันทึกรายจ่าย"}</h1>
          <p className="text-muted-foreground">
            {type === "income" ? "กรอกข้อมูลรายรับเพื่อบันทึกเข้าระบบการเงิน" : "กรอกข้อมูลรายจ่ายเพื่อบันทึกเข้าระบบการเงิน"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={resetForm}>
            <RotateCcw className="mr-2 h-4 w-4" />
            ล้างข้อมูล
          </Button>
          <Button asChild variant="outline">
            <Link href="/finance/list">
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับหน้ารายการ
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{type === "income" ? "ฟอร์มบันทึกรายรับ" : "ฟอร์มบันทึกรายจ่าย"}</CardTitle>
          <CardDescription>
            บันทึกข้อมูลตาม PRD ใหม่ โดยผูกเข้าระบบการเงินเดิมของงวดรายเดือนในปัจจุบัน
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <div className="py-6 text-sm text-muted-foreground">กำลังโหลดข้อมูลฟอร์ม...</div> : null}
          {!loading ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Field label="วันที่รายการ" required error={errors.transactionDate}>
                  <Input type="date" value={form.transactionDate} onChange={(event) => updateField("transactionDate", event.target.value)} />
                </Field>
                <Field label="ปีงบประมาณ" required error={errors.fiscalYear}>
                  <select
                    value={form.fiscalYear}
                    onChange={(event) => updateField("fiscalYear", event.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">เลือกปีงบประมาณ</option>
                    {Array.from(new Set(periods.map((item) => item.fiscalYear))).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="อำเภอ" required error={errors.districtId}>
                  <select
                    value={form.districtId}
                    onChange={(event) => {
                      updateField("districtId", event.target.value);
                      updateField("healthUnitId", "");
                    }}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">เลือกอำเภอ</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.nameTh}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="หน่วยบริการ" required error={errors.healthUnitId}>
                  <select
                    value={form.healthUnitId}
                    onChange={(event) => updateField("healthUnitId", event.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">เลือกหน่วยบริการ</option>
                    {filteredUnits.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.code} - {unit.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="เลขที่เอกสาร" required error={errors.documentNo}>
                  <Input value={form.documentNo} onChange={(event) => updateField("documentNo", event.target.value)} />
                </Field>
                <Field label="เลขที่อ้างอิง">
                  <Input value={form.referenceNo} onChange={(event) => updateField("referenceNo", event.target.value)} />
                </Field>
                <Field label={type === "income" ? "หมวดรายรับ" : "หมวดรายจ่าย"} required error={errors.categoryName}>
                  <select
                    value={form.categoryName}
                    onChange={(event) => updateField("categoryName", event.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">{type === "income" ? "เลือกหมวดรายรับ" : "เลือกหมวดรายจ่าย"}</option>
                    {categoryOptions.map((account) => (
                      <option key={account.id} value={account.nameTh}>
                        {account.nameTh}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={type === "income" ? "รายการ" : "ชื่อรายการ"} required error={errors.title}>
                  <Input value={form.title} onChange={(event) => updateField("title", event.target.value)} />
                </Field>
                {type === "expense" ? (
                  <Field label="ผู้รับเงิน/เจ้าหนี้">
                    <Input value={form.payeeName} onChange={(event) => updateField("payeeName", event.target.value)} />
                  </Field>
                ) : null}
                <Field label="จำนวนเงิน" required error={errors.amountInput}>
                  <Input
                    inputMode="decimal"
                    placeholder="0.00"
                    value={form.amountInput}
                    onChange={(event) => updateField("amountInput", formatAmountInput(event.target.value))}
                  />
                </Field>
                <Field label="ผู้บันทึก">
                  <Input value={form.recorder} onChange={(event) => updateField("recorder", event.target.value)} />
                </Field>
                <Field label="ไฟล์แนบ">
                  <Input ref={fileInputRef} type="file" />
                </Field>
              </div>

              <Field label="รายละเอียด">
                <textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) => updateField("description", event.target.value)}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </Field>

              <div className="rounded-xl border bg-muted/20 p-4 text-sm text-muted-foreground">
                ระบบเวอร์ชันปัจจุบันจะบันทึกรายการนี้รวมเข้า record การเงินของ `หน่วยบริการ + เดือน + ปีงบประมาณ` เดิมอัตโนมัติ
              </div>

              {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
              {error ? <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                  ล้างข้อมูล
                </Button>
                <Button asChild type="button" variant="outline">
                  <Link href="/finance/list">กลับหน้ารายการ</Link>
                </Button>
              </div>
            </form>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
