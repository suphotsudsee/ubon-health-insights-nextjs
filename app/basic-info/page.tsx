"use client";

import { useState } from "react";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { useDashboardData } from "@/components/dashboard/useDashboardData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, Heart, Home, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function BasicInfoPage() {
  const { data, loading } = useDashboardData();
  const [fiscalYear, setFiscalYear] = useState("2567");
  const [amphoe, setAmphoe] = useState("all");
  const [search, setSearch] = useState("");
  const healthUnits = data?.healthUnits || [];

  const filteredUnits = healthUnits.filter(unit => {
    const matchesAmphoe = amphoe === "all" || unit.amphoe === amphoe;
    const matchesSearch = search === "" || 
      unit.name.toLowerCase().includes(search.toLowerCase()) ||
      unit.code.includes(search);
    return matchesAmphoe && matchesSearch;
  });

  if (loading) {
    return <div className="py-10 text-sm text-muted-foreground">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">
          ข้อมูลพื้นฐานหน่วยบริการ
        </h1>
        <p className="text-muted-foreground">
          รพ.สต. สังกัด อบจ.อุบลราชธานี ทั้ง 13 อำเภอ
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <FilterBar
          fiscalYear={fiscalYear}
          setFiscalYear={setFiscalYear}
          amphoe={amphoe}
          setAmphoe={setAmphoe}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">ค้นหา</label>
          <Input
            placeholder="ชื่อหน่วยบริการ หรือ รหัส..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[240px]"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="flex items-center gap-4 p-4">
            <Building className="h-8 w-8 opacity-80" />
            <div>
              <p className="text-2xl font-bold">{filteredUnits.length}</p>
              <p className="text-sm opacity-80">หน่วยบริการ</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">
                {filteredUnits.reduce((sum, u) => sum + u.totalPopulation, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">ประชากรรวม</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Heart className="h-8 w-8 text-accent" />
            <div>
              <p className="text-2xl font-bold">
                {filteredUnits.reduce((sum, u) => sum + u.healthVolunteers, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">อสม.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <Home className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">
                {filteredUnits.reduce((sum, u) => sum + u.households, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">หลังคาเรือน</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Units Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUnits.map((unit) => (
          <Card key={unit.id} className="card-hover overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">รหัส: {unit.code}</p>
                  <CardTitle className="text-lg">{unit.name}</CardTitle>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Building className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>หมู่ {unit.moo} ต.{unit.tambon} อ.{unit.amphoe}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground text-xs">ประชากร</p>
                  <p className="font-semibold">{unit.totalPopulation.toLocaleString()} คน</p>
                  <p className="text-xs text-muted-foreground">
                    ชาย {unit.male.toLocaleString()} / หญิง {unit.female.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground text-xs">อสม.</p>
                  <p className="font-semibold">{unit.healthVolunteers} คน</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground text-xs">หมู่บ้าน</p>
                  <p className="font-semibold">{unit.villages} หมู่บ้าน</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-muted-foreground text-xs">หลังคาเรือน</p>
                  <p className="font-semibold">{unit.households.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
