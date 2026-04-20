import { NextRequest, NextResponse } from 'next/server'
import { getKpiResults, createKpiResult, getKpiDefinitions } from '@/actions/kpi'
import type { KpiResultFilters, PaginationParams } from '@/types'

/**
 * GET /api/kpi/results
 * Fetch KPI results with filtering and pagination
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  // Parse filters
  const filters: KpiResultFilters = {
    fiscalYear: searchParams.get('fiscalYear') 
      ? parseInt(searchParams.get('fiscalYear')!) 
      : undefined,
    quarter: searchParams.get('quarter') 
      ? parseInt(searchParams.get('quarter')!) 
      : undefined,
    amphoeId: searchParams.get('amphoeId') 
      ? parseInt(searchParams.get('amphoeId')!) 
      : undefined,
    healthUnitId: searchParams.get('healthUnitId') 
      ? parseInt(searchParams.get('healthUnitId')!) 
      : undefined,
    kpiId: searchParams.get('kpiId') 
      ? parseInt(searchParams.get('kpiId')!) 
      : undefined,
    categoryId: searchParams.get('categoryId') 
      ? parseInt(searchParams.get('categoryId')!) 
      : undefined,
    reviewStatus: searchParams.get('reviewStatus') as KpiResultFilters['reviewStatus'],
    minPercentage: searchParams.get('minPercentage') 
      ? parseFloat(searchParams.get('minPercentage')!) 
      : undefined,
    maxPercentage: searchParams.get('maxPercentage') 
      ? parseFloat(searchParams.get('maxPercentage')!) 
      : undefined,
  }

  // Parse pagination
  const pagination: PaginationParams = {
    page: searchParams.get('page') 
      ? parseInt(searchParams.get('page')!) 
      : 1,
    pageSize: searchParams.get('pageSize') 
      ? parseInt(searchParams.get('pageSize')!) 
      : 20,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  }

  const result = await getKpiResults(filters, pagination)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * POST /api/kpi/results
 * Create a new KPI result
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await createKpiResult(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.data },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/kpi/results:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}