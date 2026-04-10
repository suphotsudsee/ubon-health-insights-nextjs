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

  const filteredUnits = healthUnits.filter((unit) => {
    const matchesAmphoe = amphoe === "all" || unit.amphoe === amphoe;
    const matchesSearch =
      search === "" ||
      unit.name.toLowerCase().includes(search.toLowerCase()) ||
      unit.code.includes(search);
    return matchesAmphoe && matchesSearch;
  });

  if (loading) {
    return <div className="py-10 text-sm text-muted-foreground">กำลังโหลดข้อมูล...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-primary">ข้อมูลพื้นฐานหน่วยบริการ</h1>
        <p className="text-muted-foreground">รพ.สต. สังกัด อบจ.อุบลราชธานี</p>
      </div>

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredUnits.map((unit) => (
          <Card key={unit.id} className="card-hover overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">รหัส: {unit.code}</p>
                  <CardTitle className="text-lg">{unit.name}</CardTitle>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Building className="h-5 w-5 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  หมู่ {unit.moo} ต.{unit.tambon} อ.{unit.amphoe}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoBox
                  label="ประชากร"
                  value={`${Number(unit.totalPopulation || 0).toLocaleString()} คน`}
                  subValue={`ชาย ${Number(unit.male || 0).toLocaleString()} / หญิง ${Number(unit.female || 0).toLocaleString()}`}
                />
                <InfoBox label="อสม." value={`${Number(unit.healthVolunteers || 0).toLocaleString()} คน`} />
                <InfoBox label="หมู่บ้าน" value={`${Number(unit.villages || 0).toLocaleString()} หมู่บ้าน`} />
                <InfoBox label="หลังคาเรือน" value={Number(unit.households || 0).toLocaleString()} />
                <InfoBox
                  label="ผู้สูงอายุ"
                  value={`${Number(unit.elderlyPopulation || 0).toLocaleString()} คน`}
                  subValue={
                    Number(unit.totalPopulation || 0) > 0
                      ? `${((Number(unit.elderlyPopulation || 0) / Number(unit.totalPopulation || 0)) * 100).toFixed(2)}%`
                      : "0.00%"
                  }
                />
                <InfoBox label="วัด/สำนักสงฆ์" value={`${Number(unit.templeCount || 0).toLocaleString()} แห่ง`} />
                <InfoBox
                  label="โรงเรียน"
                  value={`${(
                    Number(unit.primarySchoolCount || 0) +
                    Number(unit.opportunitySchoolCount || 0) +
                    Number(unit.secondarySchoolCount || 0)
                  ).toLocaleString()} แห่ง`}
                  subValue={`ประถม ${Number(unit.primarySchoolCount || 0)} / ขยายโอกาส ${Number(unit.opportunitySchoolCount || 0)} / มัธยม ${Number(unit.secondarySchoolCount || 0)}`}
                />
                <InfoBox
                  label="ศพด. / สถานีสุขภาพ"
                  value={`${Number(unit.childDevelopmentCenterCount || 0).toLocaleString()} / ${Number(unit.healthStationCount || 0).toLocaleString()}`}
                />
                <InfoBox
                  label="ข้อมูลถ่ายโอน"
                  value={`ปี ${unit.transferYear || "-"} / Size ${unit.unitSize || "-"}`}
                  subValue={unit.cupName || "-"}
                />
                <InfoBox
                  label="ประชากร UC66-68"
                  value={`${Number(unit.ucPopulation68 || 0).toLocaleString()} คน`}
                  subValue={`UC66 ${Number(unit.ucPopulation66 || 0).toLocaleString()} / UC67 ${Number(unit.ucPopulation67 || 0).toLocaleString()}`}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InfoBox({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
      {subValue ? <p className="text-xs text-muted-foreground">{subValue}</p> : null}
    </div>
  );
}
