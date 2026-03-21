import { NextRequest, NextResponse } from 'next/server'
import { 
  getHealthUnits, 
  getHealthUnit, 
  createHealthUnit, 
  updateHealthUnit, 
  deleteHealthUnit,
  getDashboardStats,
  getDistricts,
  getSubdistricts
} from '@/actions/health-units'

/**
 * GET /api/health-units
 * Get health units with optional filtering
 * 
 * Query parameters:
 * - amphoeId: Filter by district
 * - status: Filter by status (active/inactive)
 * - search: Search by name or code
 * - demographics: Include demographics data
 * - stats: Return dashboard stats instead
 * - districts: Return districts list instead
 * - subdistricts: Return subdistricts (requires amphoeId)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // Check for stats request
  if (searchParams.get('stats') === 'true') {
    const fiscalPeriodId = searchParams.get('fiscalPeriodId') 
      ? parseInt(searchParams.get('fiscalPeriodId')!) 
      : undefined

    const result = await getDashboardStats(fiscalPeriodId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result.data)
  }

  // Check for districts request
  if (searchParams.get('districts') === 'true') {
    const result = await getDistricts()
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result.data)
  }

  // Check for subdistricts request
  if (searchParams.get('subdistricts') === 'true') {
    const amphoeId = searchParams.get('amphoeId') 
      ? parseInt(searchParams.get('amphoeId')!) 
      : undefined

    const result = await getSubdistricts(amphoeId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json(result.data)
  }

  // Parse filters for regular health units request
  const filters = {
    amphoeId: searchParams.get('amphoeId') 
      ? parseInt(searchParams.get('amphoeId')!) 
      : undefined,
    status: searchParams.get('status') as 'active' | 'inactive' | undefined,
    search: searchParams.get('search') || undefined,
  }

  const result = await getHealthUnits(filters)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * POST /api/health-units
 * Create a new health unit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const result = await createHealthUnit(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.data },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/health-units:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}