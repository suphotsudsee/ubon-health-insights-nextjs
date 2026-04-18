import { NextRequest, NextResponse } from 'next/server'
import { 
  getHealthUnit, 
  getHealthUnitWithDemographics, 
  updateHealthUnit, 
  deleteHealthUnit,
  upsertDemographics,
  getDemographics,
  deleteDemographicRecord
} from '@/actions/health-units'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/health-units/[id]
 * Get a single health unit
 * 
 * Query parameters:
 * - demographics: Include latest demographics data
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const unitId = parseInt(id)
  const searchParams = request.nextUrl.searchParams

  if (isNaN(unitId)) {
    return NextResponse.json(
      { error: 'Invalid health unit ID' },
      { status: 400 }
    )
  }

  // Check if demographics are requested
  if (searchParams.get('demographics') === 'true') {
    const fiscalPeriodId = searchParams.get('fiscalPeriodId') 
      ? parseInt(searchParams.get('fiscalPeriodId')!) 
      : undefined

    const result = await getHealthUnitWithDemographics(unitId, fiscalPeriodId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      )
    }

    return NextResponse.json(result.data)
  }

  // Check for demographics history
  if (searchParams.get('demographicsHistory') === 'true') {
    const fiscalPeriodId = searchParams.get('fiscalPeriodId') 
      ? parseInt(searchParams.get('fiscalPeriodId')!) 
      : undefined

    const result = await getDemographics(unitId, fiscalPeriodId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result.data)
  }

  const result = await getHealthUnit(unitId)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 404 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * PUT /api/health-units/[id]
 * Update a health unit
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const unitId = parseInt(id)

  if (isNaN(unitId)) {
    return NextResponse.json(
      { error: 'Invalid health unit ID' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()

    // Check if this is a demographics update
    if (
      body.fiscalPeriodId !== undefined &&
      (
        body.totalPopulation !== undefined ||
        body.male !== undefined ||
        body.female !== undefined ||
        body.elderlyPopulation !== undefined ||
        body.villages !== undefined ||
        body.households !== undefined ||
        body.healthVolunteers !== undefined
      )
    ) {
      const result = await upsertDemographics({
        healthUnitId: unitId,
        fiscalPeriodId: body.fiscalPeriodId,
        male: body.male,
        female: body.female,
        totalPopulation: body.totalPopulation,
        elderlyPopulation: body.elderlyPopulation,
        villages: body.villages,
        households: body.households,
        healthVolunteers: body.healthVolunteers,
      })

      if (!result.success) {
        return NextResponse.json(
          { error: result.error, details: result.data },
          { status: 400 }
        )
      }

      return NextResponse.json(result)
    }

    // Regular health unit update
    const result = await updateHealthUnit(unitId, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.data },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in PUT /api/health-units/[id]:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/health-units/[id]
 * Delete a health unit (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const unitId = parseInt(id)
  const searchParams = request.nextUrl.searchParams

  if (isNaN(unitId)) {
    return NextResponse.json(
      { error: 'Invalid health unit ID' },
      { status: 400 }
    )
  }

  const demographicsId = searchParams.get('demographicsId')
  if (demographicsId) {
    const demographicId = parseInt(demographicsId)
    if (isNaN(demographicId)) {
      return NextResponse.json(
        { error: 'Invalid demographic record ID' },
        { status: 400 }
      )
    }

    const result = await deleteDemographicRecord(unitId, demographicId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  }

  const result = await deleteHealthUnit(unitId)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json(result)
}
