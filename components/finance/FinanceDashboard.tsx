"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrialBalanceRow = {
  accountName?: string;
  name?: string;
  movementDebit?: number;
  movementCredit?: number;
};

type FinanceBreakdownRecord = {
  id: string;
  unitName: string;
  unitCode: string;
  month: string;
  fiscalYear: number;
  openingDebit: number;
  openingCredit: number;
  movementDebit: number;
  movementCredit: number;
  closingDebit: number;
  closingCredit: number;
  trialBalanceRows?: TrialBalanceRow[] | null;
};

type BreakdownModalState =
  | { open: false }
  | { open: true; type: "movementDebit" | "movementCredit"; record: FinanceBreakdownRecord };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function getTrialBalanceEntries(record: FinanceBreakdownRecord, type: "movementDebit" | "movementCredit") {
  const rows = (record.trialBalanceRows || []) as TrialBalanceRow[];
  return rows
    .map((row) => ({
      name: String(row.accountName || row.name || "-"),
      amount: Number(type === "movementDebit" ? row.movementDebit || 0 : row.movementCredit || 0),
    }))
    .filter((row) => row.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

function formatCategoryLabel(name: string, limit = 32) {
  const withoutCode = name.replace(/^\d+(?:\.\d+)*\s*/u, "").replace(/\s+/gu, " ").trim();
  const readable = withoutCode || name.trim();
  return readable.length > limit ? `${readable.slice(0, limit)}...` : readable;
}

function aggregateBreakdownByTypeWithLimit(
  records: FinanceBreakdownRecord[],
  type: "movementDebit" | "movementCredit",
  limit: number
) {
  const totals = new Map<string, number>();

  for (const record of records) {
    const rows = (record.trialBalanceRows || []) as TrialBalanceRow[];
    for (const row of rows) {
      const name = String(row.accountName || row.name || "").trim();
      const amount = Number(type === "movementDebit" ? row.movementDebit || 0 : row.movementCredit || 0);
      if (!name || amount <= 0) continue;
      totals.set(name, (totals.get(name) || 0) + amount);
    }
  }

  return Array.from(totals.entries())
    .map(([name, amount]) => ({
      name,
      displayName: formatCategoryLabel(name, 80),
      shortName: formatCategoryLabel(name, 32),
      amount,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

function buildMonthlyStackedData(
  records: FinanceBreakdownRecord[],
  months: string[],
  type: "movementDebit" | "movementCredit",
  categoryNames: Array<{ key: string; label: string }>
) {
  return months.map((month) => {
    const row: Record<string, string | number> = { month };
    const monthRecords = records.filter((record) => record.month === month);

    for (const { key } of categoryNames) {
      row[key] = monthRecords.reduce((sum, record) => {
        const rows = (record.trialBalanceRows || []) as TrialBalanceRow[];
        return (
          sum +
          rows.reduce((innerSum, item) => {
            const name = String(item.accountName || item.name || "").trim();
            if (name !== key) return innerSum;
            return innerSum + Number(type === "movementDebit" ? item.movementDebit || 0 : item.movementCredit || 0);
          }, 0)
        );
      }, 0);
    }

    return row;
  });
}

function colorForIndex(index: number, palette: string[]) {
  return palette[index % palette.length];
}

function SummaryMetric({
  label,
  value,
  icon,
  cardClassName,
  iconClassName,
  valueClassName,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  cardClassName: string;
  iconClassName: string;
  valueClassName: string;
}) {
  return (
    <Card className={cardClassName}>
      <CardContent className="flex items-center gap-4 p-6">
        <div className={iconClassName}>{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={valueClassName}>{formatCurrency(value)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinanceDashboard() {
  const { data, loading } = useDashboardData();
  const [fiscalYear, setFiscalYear] = useState("2567");
  const [amphoe, setAmphoe] = useState("all");
  const [topLimit, setTopLimit] = useState<8 | 15>(8);
  const [modal, setModal] = useState<BreakdownModalState>({ open: false });
  const financeData = (data?.financeData || []) as FinanceBreakdownRecord[];
  const monthList = data?.monthList || [];
  const healthUnits = data?.healthUnits || [];
  const fiscalMonthList = monthList.length === 12 ? [...monthList.slice(9), ...monthList.slice(0, 9)] : monthList;

  const unitCodes =
    amphoe === "all"
      ? healthUnits.map((unit) => unit.code)
      : healthUnits.filter((unit) => unit.amphoe === amphoe).map((unit) => unit.code);

  const filteredFinance = financeData.filter(
    (item) => item.fiscalYear.toString() === fiscalYear && unitCodes.includes(item.unitCode)
  );

  const totals = useMemo(
    () =>
      filteredFinance.reduce(
        (sum, item) => ({
          openingDebit: sum.openingDebit + (item.openingDebit || 0),
          openingCredit: sum.openingCredit + (item.openingCredit || 0),
          movementDebit: sum.movementDebit + (item.movementDebit || 0),
          movementCredit: sum.movementCredit + (item.movementCredit || 0),
          closingDebit: sum.closingDebit + (item.closingDebit || 0),
          closingCredit: sum.closingCredit + (item.closingCredit || 0),
        }),
        {
          openingDebit: 0,
          openingCredit: 0,
          movementDebit: 0,
          movementCredit: 0,
          closingDebit: 0,
          closingCredit: 0,
        }
      ),
    [filteredFinance]
  );

  const chartData = fiscalMonthList.map((month) => {
    const monthData = filteredFinance.filter((item) => item.month === month);
    return {
      month,
      openingDebit: monthData.reduce((sum, item) => sum + (item.openingDebit || 0), 0),
      openingCredit: monthData.reduce((sum, item) => sum + (item.openingCredit || 0), 0),
      movementDebit: monthData.reduce((sum, item) => sum + (item.movementDebit || 0), 0),
      movementCredit: monthData.reduce((sum, item) => sum + (item.movementCredit || 0), 0),
      closingDebit: monthData.reduce((sum, item) => sum + (item.closingDebit || 0), 0),
      closingCredit: monthData.reduce((sum, item) => sum + (item.closingCredit || 0), 0),
    };
  });

  const movementCreditCategoryData = aggregateBreakdownByTypeWithLimit(filteredFinance, "movementCredit", topLimit);
  const movementDebitCategoryData = aggregateBreakdownByTypeWithLimit(filteredFinance, "movementDebit", topLimit);
  const movementCreditStackedCategories = movementCreditCategoryData
    .slice(0, 4)
    .map((item) => ({ key: item.name, label: item.shortName }));
  const movementDebitStackedCategories = movementDebitCategoryData
    .slice(0, 4)
    .map((item) => ({ key: item.name, label: item.shortName }));
  const movementCreditStackedData = buildMonthlyStackedData(
    filteredFinance,
    fiscalMonthList,
    "movementCredit",
    movementCreditStackedCategories
  );
  const movementDebitStackedData = buildMonthlyStackedData(
    filteredFinance,
    fiscalMonthList,
    "movementDebit",
    movementDebitStackedCategories
  );
  const movementCreditPalette = ["#16a34a", "#22c55e", "#4ade80", "#86efac"];
  const movementDebitPalette = ["#dc2626", "#ef4444", "#f87171", "#fca5a5"];

  const monthlyRows = useMemo(() => {
    return [...filteredFinance].sort((a, b) => {
      if (a.month === b.month) {
        return a.unitName.localeCompare(b.unitName, "th");
      }
      return fiscalMonthList.indexOf(a.month) - fiscalMonthList.indexOf(b.month);
    });
  }, [filteredFinance, fiscalMonthList]);

  if (loading) {
    return <div className="py-10 text-sm text-muted-foreground">กำลังโหลดข้อมูลงบทดลอง...</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">Dashboard งบทดลอง</h1>
        <p className="text-muted-foreground">
          สรุปยกยอดมา เดบิตระหว่างเดือน เครดิตระหว่างเดือน และยอดยกไปจากไฟล์งบทดลองที่นำเข้าในระบบ
          โดยแสดงแยกเดบิตและเครดิตตรงตามต้นฉบับ
        </p>
      </div>

      <FilterBar fiscalYear={fiscalYear} setFiscalYear={setFiscalYear} amphoe={amphoe} setAmphoe={setAmphoe} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryMetric
          label="ยกยอดมาเดบิต"
          value={totals.openingDebit}
          icon={<TrendingUp className="h-6 w-6 text-status-good" />}
          iconClassName="flex h-12 w-12 items-center justify-center rounded-full bg-status-good/20"
          valueClassName="text-2xl font-bold text-status-good"
          cardClassName="card-hover border-l-4 border-l-status-good"
        />
        <SummaryMetric
          label="ยกยอดมาเครดิต"
          value={totals.openingCredit}
          icon={<TrendingUp className="h-6 w-6 text-sky-700" />}
          iconClassName="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100"
          valueClassName="text-2xl font-bold text-sky-700"
          cardClassName="card-hover border-l-4 border-l-sky-600"
        />
        <SummaryMetric
          label="เดบิตระหว่างเดือน"
          value={totals.movementDebit}
          icon={<TrendingDown className="h-6 w-6 text-status-critical" />}
          iconClassName="flex h-12 w-12 items-center justify-center rounded-full bg-status-critical/20"
          valueClassName="text-2xl font-bold text-status-critical"
          cardClassName="card-hover border-l-4 border-l-status-critical"
        />
        <SummaryMetric
          label="เครดิตระหว่างเดือน"
          value={totals.movementCredit}
          icon={<Wallet className="h-6 w-6 text-primary" />}
          iconClassName="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20"
          valueClassName="text-2xl font-bold text-primary"
          cardClassName="card-hover border-l-4 border-l-primary"
        />
        <SummaryMetric
          label="ยกยอดไปเดบิต"
          value={totals.closingDebit}
          icon={<DollarSign className="h-6 w-6 text-violet-700" />}
          iconClassName="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100"
          valueClassName="text-2xl font-bold text-violet-700"
          cardClassName="card-hover border-l-4 border-l-violet-600"
        />
        <SummaryMetric
          label="ยกยอดไปเครดิต"
          value={totals.closingCredit}
          icon={<DollarSign className="h-6 w-6 text-amber-700" />}
          iconClassName="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100"
          valueClassName="text-2xl font-bold text-amber-700"
          cardClassName="card-hover border-l-4 border-l-amber-600"
        />
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            แนวโน้มงบทดลองรายเดือน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="openingDebit" name="ยกยอดมาเดบิต" stroke="#1e3a5f" strokeWidth={2} dot={{ fill: "#1e3a5f" }} />
                <Line type="monotone" dataKey="openingCredit" name="ยกยอดมาเครดิต" stroke="#0284c7" strokeWidth={2} dot={{ fill: "#0284c7" }} />
                <Line type="monotone" dataKey="movementDebit" name="เดบิตระหว่างเดือน" stroke="#dc2626" strokeWidth={2} dot={{ fill: "#dc2626" }} />
                <Line type="monotone" dataKey="movementCredit" name="เครดิตระหว่างเดือน" stroke="#16a34a" strokeWidth={2} dot={{ fill: "#16a34a" }} />
                <Line type="monotone" dataKey="closingDebit" name="ยกยอดไปเดบิต" stroke="#7c3aed" strokeWidth={2} dot={{ fill: "#7c3aed" }} />
                <Line type="monotone" dataKey="closingCredit" name="ยกยอดไปเครดิต" stroke="#d97706" strokeWidth={2} dot={{ fill: "#d97706" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="card-hover border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-background to-background">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg text-emerald-700">บัญชีเครดิตระหว่างเดือนสูงสุด</CardTitle>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant={topLimit === 8 ? "default" : "outline"} onClick={() => setTopLimit(8)}>
                Top 8
              </Button>
              <Button type="button" size="sm" variant={topLimit === 15 ? "default" : "outline"} onClick={() => setTopLimit(15)}>
                Top 15
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movementCreditCategoryData} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="shortName" width={170} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(_, payload) => String(payload?.[0]?.payload?.displayName || payload?.[0]?.payload?.name || "")}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="amount" radius={[0, 10, 10, 0]} fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {movementCreditCategoryData.length === 0 ? <p className="pt-2 text-sm text-muted-foreground">ไม่มีข้อมูลเครดิตระหว่างเดือนตามตัวกรองปัจจุบัน</p> : null}
          </CardContent>
        </Card>

        <Card className="card-hover border border-rose-100 bg-gradient-to-br from-rose-50/70 via-background to-background">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg text-rose-700">บัญชีเดบิตระหว่างเดือนสูงสุด</CardTitle>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant={topLimit === 8 ? "default" : "outline"} onClick={() => setTopLimit(8)}>
                Top 8
              </Button>
              <Button type="button" size="sm" variant={topLimit === 15 ? "default" : "outline"} onClick={() => setTopLimit(15)}>
                Top 15
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movementDebitCategoryData} layout="vertical" margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="shortName" width={170} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(_, payload) => String(payload?.[0]?.payload?.displayName || payload?.[0]?.payload?.name || "")}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="amount" radius={[0, 10, 10, 0]} fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {movementDebitCategoryData.length === 0 ? <p className="pt-2 text-sm text-muted-foreground">ไม่มีข้อมูลเดบิตระหว่างเดือนตามตัวกรองปัจจุบัน</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="card-hover border border-emerald-100">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-700">กราฟแท่งซ้อนรายเดือน: เครดิตระหว่างเดือน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movementCreditStackedData} margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  {movementCreditStackedCategories.map((item, index) => (
                    <Bar
                      key={item.key}
                      dataKey={item.key}
                      name={item.label}
                      stackId="movementCredit"
                      fill={colorForIndex(index, movementCreditPalette)}
                      radius={index === movementCreditStackedCategories.length - 1 ? [6, 6, 0, 0] : 0}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            {movementCreditStackedCategories.length === 0 ? <p className="pt-2 text-sm text-muted-foreground">ไม่มีข้อมูลเพียงพอสำหรับกราฟเครดิตระหว่างเดือน</p> : null}
          </CardContent>
        </Card>

        <Card className="card-hover border border-rose-100">
          <CardHeader>
            <CardTitle className="text-lg text-rose-700">กราฟแท่งซ้อนรายเดือน: เดบิตระหว่างเดือน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={movementDebitStackedData} margin={{ top: 8, right: 20, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  {movementDebitStackedCategories.map((item, index) => (
                    <Bar
                      key={item.key}
                      dataKey={item.key}
                      name={item.label}
                      stackId="movementDebit"
                      fill={colorForIndex(index, movementDebitPalette)}
                      radius={index === movementDebitStackedCategories.length - 1 ? [6, 6, 0, 0] : 0}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            {movementDebitStackedCategories.length === 0 ? <p className="pt-2 text-sm text-muted-foreground">ไม่มีข้อมูลเพียงพอสำหรับกราฟเดบิตระหว่างเดือน</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle>รายการงบทดลองรายเดือน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">เดือน</th>
                  <th className="px-4 py-3 text-left font-medium">หน่วยบริการ</th>
                  <th className="px-4 py-3 text-right font-medium">ยกยอดมาเดบิต</th>
                  <th className="px-4 py-3 text-right font-medium">ยกยอดมาเครดิต</th>
                  <th className="px-4 py-3 text-right font-medium">เดบิตระหว่างเดือน</th>
                  <th className="px-4 py-3 text-right font-medium">เครดิตระหว่างเดือน</th>
                  <th className="px-4 py-3 text-right font-medium">ยกยอดไปเดบิต</th>
                  <th className="px-4 py-3 text-right font-medium">ยกยอดไปเครดิต</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRows.map((record) => (
                  <tr key={record.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">{record.month}</td>
                    <td className="px-4 py-3 font-medium">{record.unitName}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(record.openingDebit || 0)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(record.openingCredit || 0)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="font-medium text-status-critical underline-offset-2 hover:underline"
                        onClick={() => setModal({ open: true, type: "movementDebit", record })}
                      >
                        {formatCurrency(record.movementDebit || 0)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="font-medium text-status-good underline-offset-2 hover:underline"
                        onClick={() => setModal({ open: true, type: "movementCredit", record })}
                      >
                        {formatCurrency(record.movementCredit || 0)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(record.closingDebit || 0)}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(record.closingCredit || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modal.open} onOpenChange={(open) => (!open ? setModal({ open: false }) : null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{modal.open ? (modal.type === "movementCredit" ? "รายละเอียดเครดิตระหว่างเดือน" : "รายละเอียดเดบิตระหว่างเดือน") : ""}</DialogTitle>
            <DialogDescription>
              {modal.open ? `${modal.record.unitName} เดือน ${modal.record.month} ปีงบประมาณ ${modal.record.fiscalYear}` : ""}
            </DialogDescription>
          </DialogHeader>

          {modal.open ? (
            <div className="max-h-[60vh] overflow-y-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">รายการ</th>
                    <th className="px-4 py-3 text-right font-medium">ยอด</th>
                  </tr>
                </thead>
                <tbody>
                  {getTrialBalanceEntries(modal.record, modal.type).map((item) => (
                    <tr key={item.name} className="border-b last:border-b-0">
                      <td className="px-4 py-3">{item.name}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(Number(item.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getTrialBalanceEntries(modal.record, modal.type).length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">ไม่มีรายการย่อยสำหรับข้อมูลนี้</div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
