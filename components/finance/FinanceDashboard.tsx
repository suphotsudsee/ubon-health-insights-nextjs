"use client";

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
    minimumFractionDigits: 0,
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
      ? healthUnits.map((u) => u.code)
      : healthUnits.filter((u) => u.amphoe === amphoe).map((u) => u.code);

  const filteredFinance = financeData.filter(
    (item) => item.fiscalYear.toString() === fiscalYear && unitCodes.includes(item.unitCode)
  );

  const totalOpening = filteredFinance.reduce((sum, item) => sum + ((item.openingDebit || 0) - (item.openingCredit || 0)), 0);
  const totalMovementDebit = filteredFinance.reduce((sum, item) => sum + (item.movementDebit || 0), 0);
  const totalMovementCredit = filteredFinance.reduce((sum, item) => sum + (item.movementCredit || 0), 0);
  const totalClosing = filteredFinance.reduce((sum, item) => sum + ((item.closingDebit || 0) - (item.closingCredit || 0)), 0);

  const chartData = fiscalMonthList.map((month) => {
    const monthData = filteredFinance.filter((item) => item.month === month);
    return {
      month,
      opening: monthData.reduce((sum, item) => sum + ((item.openingDebit || 0) - (item.openingCredit || 0)), 0),
      movementDebit: monthData.reduce((sum, item) => sum + (item.movementDebit || 0), 0),
      movementCredit: monthData.reduce((sum, item) => sum + (item.movementCredit || 0), 0),
      closing: monthData.reduce((sum, item) => sum + ((item.closingDebit || 0) - (item.closingCredit || 0)), 0),
    };
  });

  const movementCreditCategoryData = aggregateBreakdownByTypeWithLimit(filteredFinance, "movementCredit", topLimit);
  const movementDebitCategoryData = aggregateBreakdownByTypeWithLimit(filteredFinance, "movementDebit", topLimit);
  const movementCreditStackedCategories = movementCreditCategoryData.slice(0, 4).map((item) => ({ key: item.name, label: item.shortName }));
  const movementDebitStackedCategories = movementDebitCategoryData.slice(0, 4).map((item) => ({ key: item.name, label: item.shortName }));
  const movementCreditStackedData = buildMonthlyStackedData(filteredFinance, fiscalMonthList, "movementCredit", movementCreditStackedCategories);
  const movementDebitStackedData = buildMonthlyStackedData(filteredFinance, fiscalMonthList, "movementDebit", movementDebitStackedCategories);
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
          สรุปยกยอดมา เดบิตระหว่างเดือน เครดิตระหว่างเดือน และยอดยกไปสุทธิจากไฟล์งบทดลองที่นำเข้าในระบบ
        </p>
      </div>

      <FilterBar fiscalYear={fiscalYear} setFiscalYear={setFiscalYear} amphoe={amphoe} setAmphoe={setAmphoe} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="card-hover border-l-4 border-l-status-good">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-good/20">
              <TrendingUp className="h-6 w-6 text-status-good" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ยกยอดมาสุทธิ</p>
              <p className="text-2xl font-bold text-status-good">{formatCurrency(totalOpening)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-status-critical">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-critical/20">
              <TrendingDown className="h-6 w-6 text-status-critical" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">เดบิตระหว่างเดือน</p>
              <p className="text-2xl font-bold text-status-critical">{formatCurrency(totalMovementDebit)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-primary">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">เครดิตระหว่างเดือน</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalMovementCredit)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-violet-600">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-100">
              <DollarSign className="h-6 w-6 text-violet-700" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ยกยอดไปสุทธิ</p>
              <p className="text-2xl font-bold text-violet-700">{formatCurrency(totalClosing)}</p>
            </div>
          </CardContent>
        </Card>
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
                <Line type="monotone" dataKey="opening" name="ยกยอดมาสุทธิ" stroke="hsl(213, 50%, 20%)" strokeWidth={2} dot={{ fill: "hsl(213, 50%, 20%)" }} />
                <Line type="monotone" dataKey="movementDebit" name="เดบิตระหว่างเดือน" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ fill: "hsl(0, 72%, 51%)" }} />
                <Line type="monotone" dataKey="movementCredit" name="เครดิตระหว่างเดือน" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: "hsl(142, 71%, 45%)" }} />
                <Line type="monotone" dataKey="closing" name="ยกยอดไปสุทธิ" stroke="hsl(262, 60%, 45%)" strokeWidth={2} dot={{ fill: "hsl(262, 60%, 45%)" }} />
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
                  <Bar dataKey="amount" radius={[0, 10, 10, 0]} fill="hsl(142, 71%, 45%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {movementCreditCategoryData.length === 0 ? (
              <p className="pt-2 text-sm text-muted-foreground">ไม่มีข้อมูลเครดิตระหว่างเดือนตามตัวกรองปัจจุบัน</p>
            ) : null}
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
                  <Bar dataKey="amount" radius={[0, 10, 10, 0]} fill="hsl(0, 72%, 51%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {movementDebitCategoryData.length === 0 ? (
              <p className="pt-2 text-sm text-muted-foreground">ไม่มีข้อมูลเดบิตระหว่างเดือนตามตัวกรองปัจจุบัน</p>
            ) : null}
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
            {movementCreditStackedCategories.length === 0 ? (
              <p className="pt-2 text-sm text-muted-foreground">ไม่มีข้อมูลเพียงพอสำหรับกราฟเครดิตระหว่างเดือน</p>
            ) : null}
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
            {movementDebitStackedCategories.length === 0 ? (
              <p className="pt-2 text-sm text-muted-foreground">ไม่มีข้อมูลเพียงพอสำหรับกราฟเดบิตระหว่างเดือน</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle>รายการงบทดลองรายเดือน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">เดือน</th>
                  <th className="px-4 py-3 text-left font-medium">หน่วยบริการ</th>
                  <th className="px-4 py-3 text-right font-medium">ยกยอดมา</th>
                  <th className="px-4 py-3 text-right font-medium">เดบิตระหว่างเดือน</th>
                  <th className="px-4 py-3 text-right font-medium">เครดิตระหว่างเดือน</th>
                  <th className="px-4 py-3 text-right font-medium">ยกยอดไป</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRows.map((record) => (
                  <tr key={record.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">{record.month}</td>
                    <td className="px-4 py-3 font-medium">{record.unitName}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency((record.openingDebit || 0) - (record.openingCredit || 0))}</td>
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
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency((record.closingDebit || 0) - (record.closingCredit || 0))}</td>
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
