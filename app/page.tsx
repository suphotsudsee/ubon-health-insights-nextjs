"use client";

import { useState } from "react";
import { StatCard } from "@/components/dashboard/StatCard";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { 
  Users, 
  Heart, 
  Home, 
  Building,
  Activity,
  Leaf
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function DashboardPage() {
  const { data, loading } = useDashboardData();
  const [fiscalYear, setFiscalYear] = useState("2567");
  const [amphoe, setAmphoe] = useState("all");
  const healthUnits = data?.healthUnits || [];
  const kpiResults = data?.kpiResults || [];
  const amphoeList = data?.amphoeList || [];
  
  const stats = {
    totalPopulation: healthUnits.reduce((sum, unit) => sum + unit.totalPopulation, 0),
    totalHealthVolunteers: healthUnits.reduce((sum, unit) => sum + unit.healthVolunteers, 0),
    totalHouseholds: healthUnits.reduce((sum, unit) => sum + unit.households, 0),
    totalVillages: healthUnits.reduce((sum, unit) => sum + unit.villages, 0),
    totalUnits: healthUnits.length,
  };

  // Calculate performance by amphoe
  const amphoePerformance = amphoeList.map(a => {
    const results = kpiResults.filter(r => r.amphoe === a);
    const avgPerformance = results.length > 0
      ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
      : 0;
    return {
      name: a,
      value: Math.round(avgPerformance),
      shortName: a.length > 8 ? a.substring(0, 6) + "..." : a
    };
  }).sort((a, b) => b.value - a.value);

  // Get color based on value
  const getBarColor = (value: number) => {
    if (value <= 20) return "hsl(0, 72%, 51%)";
    if (value <= 40) return "hsl(25, 95%, 53%)";
    if (value <= 60) return "hsl(45, 93%, 47%)";
    if (value <= 80) return "hsl(142, 71%, 45%)";
    return "hsl(200, 80%, 50%)";
  };

  // Filter units by amphoe
  const filteredUnits = amphoe === "all" 
    ? healthUnits 
    : healthUnits.filter(u => u.amphoe === amphoe);

  // Filter KPI results
  const filteredKPIs = amphoe === "all"
    ? kpiResults
    : kpiResults.filter(r => r.amphoe === amphoe);

  const ppfsResults = filteredKPIs.filter(r => r.category === "PPFS");
  const ttmResults = filteredKPIs.filter(r => r.category === "แพทย์แผนไทย");
  
  const avgPPFS = ppfsResults.length > 0 
    ? ppfsResults.reduce((sum, r) => sum + r.percentage, 0) / ppfsResults.length 
    : 0;
  const avgTTM = ttmResults.length > 0 
    ? ttmResults.reduce((sum, r) => sum + r.percentage, 0) / ttmResults.length 
    : 0;

  if (loading) {
    return <div className="py-10 text-sm text-muted-foreground">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">
          ภาพรวมระบบติดตามตัวชี้วัด
        </h1>
        <p className="text-muted-foreground">
          รพ.สต. สังกัด อบจ.อุบลราชธานี ทั้ง 13 อำเภอ • ปีงบประมาณ {fiscalYear}
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        fiscalYear={fiscalYear}
        setFiscalYear={setFiscalYear}
        amphoe={amphoe}
        setAmphoe={setAmphoe}
      />

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="ประชากรรวม"
          value={filteredUnits.reduce((sum, u) => sum + u.totalPopulation, 0)}
          subtitle={`${filteredUnits.length} หน่วยบริการ`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="อาสาสมัครสาธารณสุข (อสม.)"
          value={filteredUnits.reduce((sum, u) => sum + u.healthVolunteers, 0)}
          subtitle="คน"
          icon={Heart}
          variant="accent"
        />
        <StatCard
          title="หลังคาเรือน"
          value={filteredUnits.reduce((sum, u) => sum + u.households, 0)}
          subtitle="หลังคาเรือน"
          icon={Home}
        />
        <StatCard
          title="หมู่บ้าน"
          value={filteredUnits.reduce((sum, u) => sum + u.villages, 0)}
          subtitle="หมู่บ้าน"
          icon={Building}
        />
      </div>

      {/* Gauge Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">ผลงาน PPFS</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <GaugeChart 
              value={Math.round(avgPPFS)} 
              label="ภาพรวมตัวชี้วัด PPFS"
            />
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Leaf className="h-5 w-5 text-accent" />
            <CardTitle className="text-lg">ผลงานแพทย์แผนไทย</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <GaugeChart 
              value={Math.round(avgTTM)} 
              label="ภาพรวมตัวชี้วัดแพทย์แผนไทย"
            />
          </CardContent>
        </Card>
      </div>

      {/* Amphoe Performance Chart */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-lg">เปรียบเทียบผลงานรายอำเภอ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={amphoePerformance}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, "ผลงานเฉลี่ย"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {amphoePerformance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent KPI Results Table */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-lg">ผลงานตัวชี้วัดล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">หน่วยบริการ</th>
                  <th className="text-left py-3 px-4 font-medium">อำเภอ</th>
                  <th className="text-left py-3 px-4 font-medium">ตัวชี้วัด</th>
                  <th className="text-center py-3 px-4 font-medium">เป้าหมาย</th>
                  <th className="text-center py-3 px-4 font-medium">ผลงาน</th>
                  <th className="text-center py-3 px-4 font-medium">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {filteredKPIs.slice(0, 8).map((result) => (
                  <tr key={result.id} className="border-b hover:bg-muted/30 transition-colors">
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
