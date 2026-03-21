import { NextRequest, NextResponse } from 'next/server'
import { getFinanceRecords, createFinanceRecord, getFinanceSummary, getFinanceTrends, getFinanceByUnit } from '@/actions/finance'
import type { FinanceRecordFilters, PaginationParams } from '@/types'

/**
 * GET /api/finance/records
 * Fetch finance records with filtering and pagination
 * 
 * Query parameters:
 * - fiscalYear: Filter by fiscal year
 * - month: Filter by month (1-12)
 * - amphoeId: Filter by district
 * - healthUnitId: Filter by health unit
 * - summary: If true, return summary instead of records
 * - trends: If true, return monthly trends
 * - byUnit: If true, return grouped by health unit
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  // Check for summary request
  if (searchParams.get('summary') === 'true') {
    const fiscalYear = searchParams.get('fiscalYear') 
      ? parseInt(searchParams.get('fiscalYear')!) 
      : undefined
    const amphoeId = searchParams.get('amphoeId') 
      ? parseInt(searchParams.get('amphoeId')!) 
      : undefined

    const result = await getFinanceSummary(fiscalYear, amphoeId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result.data)
  }

  // Check for trends request
  if (searchParams.get('trends') === 'true') {
    const fiscalYear = parseInt(searchParams.get('fiscalYear') || '2567')
    const amphoeId = searchParams.get('amphoeId') 
      ? parseInt(searchParams.get('amphoeId')!) 
      : undefined

    const result = await getFinanceTrends(fiscalYear, amphoeId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result.data)
  }

  // Check for by-unit request
  if (searchParams.get('byUnit') === 'true') {
    const fiscalYear = parseInt(searchParams.get('fiscalYear') || '2567')
    const amphoeId = searchParams.get('amphoeId') 
      ? parseInt(searchParams.get('amphoeId')!) 
      : undefined

    const result = await getFinanceByUnit(fiscalYear, amphoeId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result.data)
  }

  // Parse filters for regular records request
  const filters: FinanceRecordFilters = {
    fiscalYear: searchParams.get('fiscalYear') 
      ? parseInt(searchParams.get('fiscalYear')!) 
      : undefined,
    month: searchParams.get('month') 
      ? parseInt(searchParams.get('month')!) 
      : undefined,
    amphoeId: searchParams.get('amphoeId') 
      ? parseInt(searchParams.get('amphoeId')!) 
      : undefined,
    healthUnitId: searchParams.get('healthUnitId') 
      ? parseInt(searchParams.get('healthUnitId')!) 
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

  const result = await getFinanceRecords(filters, pagination)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * POST /api/finance/records
 * Create a new finance record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await createFinanceRecord(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.data },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/finance/records:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}