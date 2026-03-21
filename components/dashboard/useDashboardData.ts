"use client";

import { useEffect, useState } from "react";

type DashboardData = {
  amphoeList: string[];
  monthList: string[];
  healthUnits: any[];
  kpiMaster: any[];
  kpiResults: any[];
  financeData: any[];
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.error || "Failed to fetch dashboard data");
        }
        setData(body);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  return { data, loading, error };
}
