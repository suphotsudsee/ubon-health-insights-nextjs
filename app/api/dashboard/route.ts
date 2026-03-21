import { NextResponse } from "next/server";
import { getDashboardDataset } from "@/src/lib/dashboard-data";

export async function GET() {
  try {
    const data = await getDashboardDataset();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in GET /api/dashboard:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
