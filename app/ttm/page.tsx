"use client";

import { useState } from "react";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, Target, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function TTMPage() {
  const { data, loading } = useDashboardData();
  const [fiscalYear, setFiscalYear] = useState("2567");
  const [amphoe, setAmphoe] = useState("all");
  const [quarter, setQuarter] = useState("all");
  const kpiResults = data?.kpiResults || [];
  const kpiMaster = data?.kpiMaster || [];

  // Get TTM KPIs
  const ttmKPIs = kpiMaster.filter(k => k.category === "แพทย์แผนไทย");

  // Filter results
  const filteredResults = kpiResults.filter(r => {
    const matchesCategory = r.category === "แพทย์แผนไทย";
    const matchesFiscalYear = r.fiscalYear.toString() === fiscalYear;
    const matchesAmphoe = amphoe === "all" || r.amphoe === amphoe;
    const matchesQuarter = quarter === "all" || r.quarter.toString() === quarter;
    return matchesCategory && matchesFiscalYear && matchesAmphoe && matchesQuarter;
  });

  // Calculate average
  const avgPercentage = filteredResults.length > 0
    ? filteredResults.reduce((sum, r) => sum + r.percentage, 0) / filteredResults.length
    : 0;

  // Get color based on value
  const getBarColor = (value: number) => {
    if (value <= 20) return "hsl(0, 72%, 51%)";
    if (value <= 40) return "hsl(25, 95%, 53%)";
    if (value <= 60) return "hsl(45, 93%, 47%)";
    if (value <= 80) return "hsl(142, 71%, 45%)";
    return "hsl(200, 80%, 50%)";
  };

  // Performance by unit
  const unitPerformance = filteredResults.map(r => ({
    name: r.unitName.replace("รพ.สต.", ""),
    value: r.percentage,
    fullName: r.unitName
  })).sort((a, b) => b.value - a.value);

  if (loading) {
    return <div className="py-10 text-sm text-muted-foreground">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
            <Leaf className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              ตัวชี้วัดแพทย์แผนไทย
            </h1>
            <p className="text-muted-foreground">
              Traditional Thai Medicine (TTM)
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
        quarter={quarter}
        setQuarter={setQuarter}
        showQuarter
      />

      {/* Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="card-hover md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              ภาพรวมผลงาน
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <GaugeChart 
              value={Math.round(avgPercentage)} 
              label={`จาก ${filteredResults.length} รายการ`}
            />
          </CardContent>
        </Card>

        <Card className="card-hover md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">รายการตัวชี้วัดแพทย์แผนไทย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {ttmKPIs.map((kpi) => (
                <div 
                  key={kpi.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
                      {kpi.code.split("-")[1]}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{kpi.name}</p>
                      <p className="text-xs text-muted-foreground">รหัส: {kpi.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">เป้าหมาย</p>
                    <p className="text-lg font-bold text-accent">{kpi.targetPercent}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      {unitPerformance.length > 0 && (
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              เปรียบเทียบผลงานรายหน่วยบริการ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={100}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, "ผลงาน"]}
                    labelFormatter={(label) => unitPerformance.find(u => u.name === label)?.fullName || label}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {unitPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>รายละเอียดผลงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">ไตรมาส</th>
                  <th className="text-left py-3 px-4 font-medium">หน่วยบริการ</th>
                  <th className="text-left py-3 px-4 font-medium">อำเภอ</th>
                  <th className="text-left py-3 px-4 font-medium">ตัวชี้วัด</th>
                  <th className="text-center py-3 px-4 font-medium">เป้าหมาย</th>
                  <th className="text-center py-3 px-4 font-medium">ผลงาน</th>
                  <th className="text-center py-3 px-4 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => (
                  <tr key={result.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">Q{result.quarter}</td>
                    <td className="py-3 px-4 font-medium">{result.unitName}</td>
                    <td className="py-3 px-4 text-muted-foreground">{result.amphoe}</td>
                    <td className="py-3 px-4">{result.kpiName}</td>
                    <td className="py-3 px-4 text-center">{result.target}</td>
                    <td className="py-3 px-4 text-center">{result.actual}</td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge percentage={result.percentage} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
