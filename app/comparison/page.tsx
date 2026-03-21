"use client";

import { useState } from "react";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Building } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts";

export default function ComparisonPage() {
  const { data, loading } = useDashboardData();
  const [fiscalYear, setFiscalYear] = useState("2567");
  const [amphoe, setAmphoe] = useState("all");
  const kpiResults = data?.kpiResults || [];
  const amphoeList = data?.amphoeList || [];
  const healthUnits = data?.healthUnits || [];
  const financeData = data?.financeData || [];

  // Calculate amphoe performance
  const amphoePerformance = amphoeList.map(a => {
    const results = kpiResults.filter(r => r.amphoe === a);
    const ppfsResults = results.filter(r => r.category === "PPFS");
    const ttmResults = results.filter(r => r.category === "แพทย์แผนไทย");
    
    const avgPPFS = ppfsResults.length > 0
      ? ppfsResults.reduce((sum, r) => sum + r.percentage, 0) / ppfsResults.length
      : 0;
    const avgTTM = ttmResults.length > 0
      ? ttmResults.reduce((sum, r) => sum + r.percentage, 0) / ttmResults.length
      : 0;
    const avgTotal = results.length > 0
      ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
      : 0;
    
    return {
      name: a,
      ppfs: Math.round(avgPPFS),
      ttm: Math.round(avgTTM),
      total: Math.round(avgTotal)
    };
  }).sort((a, b) => b.total - a.total);

  // Get units for selected amphoe
  const selectedUnits = amphoe === "all"
    ? healthUnits
    : healthUnits.filter(u => u.amphoe === amphoe);

  // Unit performance within amphoe
  const unitPerformance = selectedUnits.map(unit => {
    const results = kpiResults.filter(r => r.unitCode === unit.code);
    const avgPerformance = results.length > 0
      ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
      : 0;
    return {
      name: unit.name.replace("รพ.สต.", ""),
      fullName: unit.name,
      value: Math.round(avgPerformance)
    };
  }).sort((a, b) => b.value - a.value);

  // Financial comparison
  const financeByUnit = selectedUnits.map(unit => {
    const records = financeData.filter(f => f.unitCode === unit.code);
    const totalIncome = records.reduce((sum, r) => sum + r.income, 0);
    const totalExpense = records.reduce((sum, r) => sum + r.expense, 0);
    return {
      name: unit.name.replace("รพ.สต.", ""),
      fullName: unit.name,
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense
    };
  }).sort((a, b) => b.balance - a.balance);

  const getBarColor = (value: number) => {
    if (value <= 20) return "hsl(0, 72%, 51%)";
    if (value <= 40) return "hsl(25, 95%, 53%)";
    if (value <= 60) return "hsl(45, 93%, 47%)";
    if (value <= 80) return "hsl(142, 71%, 45%)";
    return "hsl(200, 80%, 50%)";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return <div className="py-10 text-sm text-muted-foreground">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              เปรียบเทียบผลงาน
            </h1>
            <p className="text-muted-foreground">
              Benchmarking รายอำเภอและรายหน่วยบริการ
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        fiscalYear={fiscalYear}
        setFiscalYear={setFiscalYear}
        amphoe={amphoe}
        setAmphoe={setAmphoe}
      />

      <Tabs defaultValue="amphoe" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="amphoe">รายอำเภอ</TabsTrigger>
          <TabsTrigger value="unit">รายหน่วยบริการ</TabsTrigger>
          <TabsTrigger value="finance">การเงิน</TabsTrigger>
        </TabsList>

        {/* Amphoe Comparison */}
        <TabsContent value="amphoe" className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                เปรียบเทียบผลงานภาพรวม 13 อำเภอ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={amphoePerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={120}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, ""]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Bar dataKey="ppfs" name="PPFS" fill="hsl(213, 50%, 20%)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="ttm" name="แพทย์แผนไทย" fill="hsl(168, 70%, 38%)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Ranking Table */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>ตารางจัดอันดับอำเภอ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-center py-3 px-4 font-medium w-16">อันดับ</th>
                      <th className="text-left py-3 px-4 font-medium">อำเภอ</th>
                      <th className="text-center py-3 px-4 font-medium">PPFS</th>
                      <th className="text-center py-3 px-4 font-medium">แพทย์แผนไทย</th>
                      <th className="text-center py-3 px-4 font-medium">ภาพรวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amphoePerformance.map((row, index) => (
                      <tr key={row.name} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                            index === 0 ? 'bg-status-excellent text-white' :
                            index === 1 ? 'bg-status-good text-white' :
                            index === 2 ? 'bg-status-medium text-foreground' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{row.name}</td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge percentage={row.ppfs} showLabel={false} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge percentage={row.ttm} showLabel={false} size="sm" />
                        </td>
                        <td className="py-3 px-4 text-center">
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

        {/* Unit Comparison */}
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
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, "ผลงานเฉลี่ย"]}
                      labelFormatter={(label) => unitPerformance.find(u => u.name === label)?.fullName || label}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
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

        {/* Finance Comparison */}
        <TabsContent value="finance" className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>เปรียบเทียบรายรับ-รายจ่ายรายหน่วยบริการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financeByUnit}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Bar dataKey="income" name="รายรับ" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="รายจ่าย" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Finance Table */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>สรุปสถานะการเงินรายหน่วยบริการ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">หน่วยบริการ</th>
                      <th className="text-right py-3 px-4 font-medium">รายรับรวม</th>
                      <th className="text-right py-3 px-4 font-medium">รายจ่ายรวม</th>
                      <th className="text-right py-3 px-4 font-medium">คงเหลือ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {financeByUnit.map((row) => (
                      <tr key={row.name} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-medium">{row.fullName}</td>
                        <td className="py-3 px-4 text-right text-status-good">
                          ฿{formatCurrency(row.income)}
                        </td>
                        <td className="py-3 px-4 text-right text-status-critical">
                          ฿{formatCurrency(row.expense)}
                        </td>
                        <td className={`py-3 px-4 text-right font-bold ${row.balance >= 0 ? 'text-status-good' : 'text-status-critical'}`}>
                          ฿{formatCurrency(row.balance)}
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
