"use client";

import { useState } from "react";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type FinanceBreakdownRecord = {
  id: string;
  unitName: string;
  unitCode: string;
  month: string;
  fiscalYear: number;
  income: number;
  expense: number;
  balance: number;
  incomeBreakdown?: Record<string, number> | null;
  expenseBreakdown?: Record<string, number> | null;
};

type BreakdownModalState =
  | { open: false }
  | { open: true; type: "income" | "expense"; record: FinanceBreakdownRecord };

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(value);
}

function getBreakdownEntries(record: FinanceBreakdownRecord, type: "income" | "expense") {
  const breakdown = type === "income" ? record.incomeBreakdown : record.expenseBreakdown;
  return Object.entries((breakdown || {}) as Record<string, number>).sort((a, b) => b[1] - a[1]);
}

export function FinanceDashboard() {
  const { data, loading } = useDashboardData();
  const [fiscalYear, setFiscalYear] = useState("2567");
  const [amphoe, setAmphoe] = useState("all");
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
    (f) => f.fiscalYear.toString() === fiscalYear && unitCodes.includes(f.unitCode)
  );

  const totalIncome = filteredFinance.reduce((sum, f) => sum + f.income, 0);
  const totalExpense = filteredFinance.reduce((sum, f) => sum + f.expense, 0);

  const chartData = fiscalMonthList.map((month) => {
    const monthData = filteredFinance.filter((f) => f.month === month);
    return {
      month,
      income: monthData.reduce((sum, f) => sum + f.income, 0),
      expense: monthData.reduce((sum, f) => sum + f.expense, 0),
      balance: monthData.length > 0 ? monthData.reduce((sum, f) => sum + f.balance, 0) / monthData.length : 0,
    };
  });

  if (loading) {
    return <div className="py-10 text-sm text-muted-foreground">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">Dashboard สถานะเงินบำรุง</h1>
        <p className="text-muted-foreground">สรุปรายรับ รายจ่าย และยอดคงเหลือจากข้อมูลการเงินที่บันทึกในระบบ</p>
      </div>

      <FilterBar fiscalYear={fiscalYear} setFiscalYear={setFiscalYear} amphoe={amphoe} setAmphoe={setAmphoe} />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-hover border-l-4 border-l-status-good">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-good/20">
              <TrendingUp className="h-6 w-6 text-status-good" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">รายรับรวม</p>
              <p className="text-2xl font-bold text-status-good">{formatCurrency(totalIncome)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-status-critical">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-status-critical/20">
              <TrendingDown className="h-6 w-6 text-status-critical" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">รายจ่ายรวม</p>
              <p className="text-2xl font-bold text-status-critical">{formatCurrency(totalExpense)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-primary">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ยอดคงเหลือ</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalIncome - totalExpense)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            แนวโน้มรายรับ-รายจ่าย
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="income" name="รายรับ" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: "hsl(142, 71%, 45%)" }} />
                <Line type="monotone" dataKey="expense" name="รายจ่าย" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ fill: "hsl(0, 72%, 51%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle>รายการการเงินรายเดือน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">เดือน</th>
                  <th className="px-4 py-3 text-left font-medium">หน่วยบริการ</th>
                  <th className="px-4 py-3 text-right font-medium">รายรับ</th>
                  <th className="px-4 py-3 text-right font-medium">รายจ่าย</th>
                  <th className="px-4 py-3 text-right font-medium">คงเหลือ</th>
                </tr>
              </thead>
              <tbody>
                {filteredFinance.map((record) => (
                  <tr key={record.id} className="border-b transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3">{record.month}</td>
                    <td className="px-4 py-3 font-medium">{record.unitName}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="font-medium text-status-good underline-offset-2 hover:underline"
                        onClick={() => setModal({ open: true, type: "income", record })}
                      >
                        {formatCurrency(record.income)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="font-medium text-status-critical underline-offset-2 hover:underline"
                        onClick={() => setModal({ open: true, type: "expense", record })}
                      >
                        {formatCurrency(record.expense)}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(record.balance)}</td>
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
            <DialogTitle>{modal.open ? (modal.type === "income" ? "รายการรายรับ" : "รายการรายจ่าย") : ""}</DialogTitle>
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
                  {getBreakdownEntries(modal.record, modal.type).map(([name, amount]) => (
                    <tr key={name} className="border-b last:border-b-0">
                      <td className="px-4 py-3">{name}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(Number(amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getBreakdownEntries(modal.record, modal.type).length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">ไม่มีรายการย่อยสำหรับข้อมูลนี้</div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
