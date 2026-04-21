"use client";

import { useMemo, useState } from "react";
import { BarChart3, Building, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ComparisonPage() {
  const { data, loading } = useDashboardData();
  const [fiscalYear, setFiscalYear] = useState("2567");
  const [amphoe, setAmphoe] = useState("all");
  const kpiResults = data?.kpiResults || [];
  const amphoeList = data?.amphoeList || [];
  const healthUnits = data?.healthUnits || [];
  const financeData = data?.financeData || [];

  const amphoePerformance = useMemo(() => {
    return amphoeList
      .map((name) => {
        const results = kpiResults.filter((item) => item.amphoe === name);
        const ppfsResults = results.filter((item) => item.category === "PPFS");
        const thaiMedicineResults = results.filter((item) => item.category === "แพทย์แผนไทย");

        const avgPPFS =
          ppfsResults.length > 0 ? ppfsResults.reduce((sum, item) => sum + item.percentage, 0) / ppfsResults.length : 0;
        const avgThaiMedicine =
          thaiMedicineResults.length > 0
            ? thaiMedicineResults.reduce((sum, item) => sum + item.percentage, 0) / thaiMedicineResults.length
            : 0;
        const avgTotal =
          results.length > 0 ? results.reduce((sum, item) => sum + item.percentage, 0) / results.length : 0;

        return {
          name,
          ppfs: Math.round(avgPPFS),
          thaiMedicine: Math.round(avgThaiMedicine),
          total: Math.round(avgTotal),
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [amphoeList, kpiResults]);

  const selectedUnits =
    amphoe === "all" ? healthUnits : healthUnits.filter((unit) => unit.amphoe === amphoe);

  const unitPerformance = useMemo(() => {
    return selectedUnits
      .map((unit) => {
        const results = kpiResults.filter((item) => item.unitCode === unit.code);
        const avgPerformance =
          results.length > 0 ? results.reduce((sum, item) => sum + item.percentage, 0) / results.length : 0;

        return {
          name: unit.name.replace("รพ.สต.", ""),
          fullName: unit.name,
          value: Math.round(avgPerformance),
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [kpiResults, selectedUnits]);

  const financeByUnit = useMemo(() => {
    return selectedUnits
      .map((unit) => {
        const records = financeData.filter(
          (item) => item.unitCode === unit.code && String(item.fiscalYear) === fiscalYear
        );
        const movementCredit = records.reduce((sum, item) => sum + Number(item.movementCredit || 0), 0);
        const movementDebit = records.reduce((sum, item) => sum + Number(item.movementDebit || 0), 0);
        const closingNet = records.reduce(
          (sum, item) => sum + (Number(item.closingDebit || 0) - Number(item.closingCredit || 0)),
          0
        );

        return {
          name: unit.name.replace("รพ.สต.", ""),
          fullName: unit.name,
          movementCredit,
          movementDebit,
          closingNet,
        };
      })
      .sort((a, b) => b.closingNet - a.closingNet);
  }, [financeData, fiscalYear, selectedUnits]);

  function getBarColor(value: number) {
    if (value <= 20) return "hsl(0, 72%, 51%)";
    if (value <= 40) return "hsl(25, 95%, 53%)";
    if (value <= 60) return "hsl(45, 93%, 47%)";
    if (value <= 80) return "hsl(142, 71%, 45%)";
    return "hsl(200, 80%, 50%)";
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("th-TH", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  }

  if (loading) {
    return <div className="py-10 text-sm text-muted-foreground">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">เปรียบเทียบผลงาน</h1>
            <p className="text-muted-foreground">Benchmarking รายอำเภอ รายหน่วยบริการ และข้อมูลงบทดลอง</p>
          </div>
        </div>
      </div>

      <FilterBar fiscalYear={fiscalYear} setFiscalYear={setFiscalYear} amphoe={amphoe} setAmphoe={setAmphoe} />

      <Tabs defaultValue="amphoe" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[420px]">
          <TabsTrigger value="amphoe">รายอำเภอ</TabsTrigger>
          <TabsTrigger value="unit">รายหน่วยบริการ</TabsTrigger>
          <TabsTrigger value="finance">งบทดลอง</TabsTrigger>
        </TabsList>

        <TabsContent value="amphoe" className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                เปรียบเทียบผลงานภาพรวมรายอำเภอ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={amphoePerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, ""]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="ppfs" name="PPFS" fill="hsl(213, 50%, 20%)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="thaiMedicine" name="แพทย์แผนไทย" fill="hsl(168, 70%, 38%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>ตารางจัดอันดับอำเภอ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="w-16 px-4 py-3 text-center font-medium">อันดับ</th>
                      <th className="px-4 py-3 text-left font-medium">อำเภอ</th>
                      <th className="px-4 py-3 text-center font-medium">PPFS</th>
                      <th className="px-4 py-3 text-center font-medium">แพทย์แผนไทย</th>
                      <th className="px-4 py-3 text-center font-medium">ภาพรวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amphoePerformance.map((row, index) => (
                      <tr key={row.name} className="border-b transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                              index === 0
                                ? "bg-status-excellent text-white"
                                : index === 1
                                  ? "bg-status-good text-white"
                                  : index === 2
                                    ? "bg-status-medium text-foreground"
                                    : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{row.name}</td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge percentage={row.ppfs} showLabel={false} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge percentage={row.thaiMedicine} showLabel={false} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge percentage={row.total} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unit" className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                เปรียบเทียบผลงานรายหน่วยบริการ {amphoe !== "all" ? `(${amphoe})` : "(ทุกอำเภอ)"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={unitPerformance.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, "ผลงานเฉลี่ย"]}
                      labelFormatter={(label) => unitPerformance.find((item) => item.name === label)?.fullName || label}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {unitPerformance.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>เปรียบเทียบงบทดลองรายหน่วยบริการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financeByUnit}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
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
                    <Bar dataKey="movementCredit" name="เครดิตระหว่างเดือน" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="movementDebit" name="เดบิตระหว่างเดือน" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle>สรุปสถานะงบทดลองรายหน่วยบริการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium">หน่วยบริการ</th>
                      <th className="px-4 py-3 text-right font-medium">เครดิตระหว่างเดือน</th>
                      <th className="px-4 py-3 text-right font-medium">เดบิตระหว่างเดือน</th>
                      <th className="px-4 py-3 text-right font-medium">ยกยอดไปสุทธิ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeByUnit.map((row) => (
                      <tr key={row.fullName} className="border-b transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">{row.fullName}</td>
                        <td className="px-4 py-3 text-right text-status-good">{formatCurrency(row.movementCredit)}</td>
                        <td className="px-4 py-3 text-right text-status-critical">{formatCurrency(row.movementDebit)}</td>
                        <td className={`px-4 py-3 text-right font-bold ${row.closingNet >= 0 ? "text-status-good" : "text-status-critical"}`}>
                          {formatCurrency(row.closingNet)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
