"use client";

import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterBarProps {
  fiscalYear: string;
  setFiscalYear: (value: string) => void;
  amphoe: string;
  setAmphoe: (value: string) => void;
  quarter?: string;
  setQuarter?: (value: string) => void;
  showQuarter?: boolean;
}

export function FilterBar({
  fiscalYear,
  setFiscalYear,
  amphoe,
  setAmphoe,
  quarter,
  setQuarter,
  showQuarter = false,
}: FilterBarProps) {
  const [amphoeOptions, setAmphoeOptions] = useState<string[]>([]);
  const [yearOptions, setYearOptions] = useState<string[]>(["2567", "2566", "2565"]);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [districtsResponse, yearsResponse] = await Promise.all([
          fetch("/api/health-units?districts=true", { cache: "no-store" }),
          fetch("/api/fiscal-periods?years=true", { cache: "no-store" }),
        ]);

        const districtsBody = await districtsResponse.json();
        const yearsBody = await yearsResponse.json();

        if (districtsResponse.ok) {
          setAmphoeOptions(districtsBody.map((item: { nameTh: string }) => item.nameTh));
        }

        if (yearsResponse.ok) {
          const years = yearsBody.map((item: number) => String(item));
          if (years.length > 0) {
            setYearOptions(years);
          }
        }
      } catch {
        setAmphoeOptions([]);
      }
    }

    void loadOptions();
  }, []);

  return (
    <div className="flex flex-wrap gap-4 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">ปีงบประมาณ</label>
        <Select value={fiscalYear} onValueChange={setFiscalYear}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="เลือกปี" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">อำเภอ</label>
        <Select value={amphoe} onValueChange={setAmphoe}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="เลือกอำเภอ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกอำเภอ</SelectItem>
            {amphoeOptions.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showQuarter && setQuarter ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">ไตรมาส</label>
          <Select value={quarter} onValueChange={setQuarter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="เลือกไตรมาส" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทุกไตรมาส</SelectItem>
              <SelectItem value="1">ไตรมาส 1</SelectItem>
              <SelectItem value="2">ไตรมาส 2</SelectItem>
              <SelectItem value="3">ไตรมาส 3</SelectItem>
              <SelectItem value="4">ไตรมาส 4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}
