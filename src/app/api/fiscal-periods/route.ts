import { NextRequest, NextResponse } from 'next/server'
import { 
  getFiscalPeriods, 
  getFiscalPeriodsByYear, 
  getFiscalPeriodsByQuarter,
  getCurrentFiscalPeriod,
  getAvailableFiscalYears
} from '@/actions/fiscal-periods'
import { createFiscalYear, getFiscalYearsWithUsage, deleteFiscalYear } from '@/actions/settings-admin'

/**
 * GET /api/fiscal-periods
 * Get fiscal periods
 * 
 * Query parameters:
 * - year: Filter by fiscal year
 * - quarter: Filter by quarter (requires year)
 * - current: Get current fiscal period
 * - years: Get list of available fiscal years
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Check for current period request
  if (searchParams.get('current') === 'true') {
    const result = await getCurrentFiscalPeriod()
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result.data)
  }

  // Check for available years request
  if (searchParams.get('years') === 'true') {
    const result = await getAvailableFiscalYears()
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result.data)
  }

  if (searchParams.get('summary') === 'true') {
    const result = await getFiscalYearsWithUsage()

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  }

  // Parse filters
  const year = searchParams.get('year') 
    ? parseInt(searchParams.get('year')!) 
    : undefined
  const quarter = searchParams.get('quarter') 
    ? parseInt(searchParams.get('quarter')!) 
    : undefined

  // Get periods by year and quarter
  if (year && quarter) {
    const result = await getFiscalPeriodsByQuarter(year, quarter)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result.data)
  }

  // Get periods by year
  if (year) {
    const result = await getFiscalPeriodsByYear(year)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result.data)
  }

  // Get all periods
  const result = await getFiscalPeriods()

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json(result.data)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await createFiscalYear(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/fiscal-periods:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const fiscalYear = request.nextUrl.searchParams.get('fiscalYear')

  if (!fiscalYear || Number.isNaN(Number(fiscalYear))) {
    return NextResponse.json({ error: 'Invalid fiscal year' }, { status: 400 })
  }

  const result = await deleteFiscalYear(Number(fiscalYear))

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(result)
}
