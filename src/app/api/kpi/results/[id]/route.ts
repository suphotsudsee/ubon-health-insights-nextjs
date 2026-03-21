import { NextRequest, NextResponse } from 'next/server'
import { getKpiDefinition, updateKpiResult, deleteKpiResult, submitKpiResult, reviewKpiResult, getKpiResult } from '@/actions/kpi'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/kpi/results/[id]
 * Get a single KPI result
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const resultId = parseInt(id)

  if (isNaN(resultId)) {
    return NextResponse.json(
      { error: 'Invalid KPI result ID' },
      { status: 400 }
    )
  }

  const result = await getKpiResult(resultId)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 404 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * PUT /api/kpi/results/[id]
 * Update a KPI result
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const resultId = parseInt(id)

  if (isNaN(resultId)) {
    return NextResponse.json(
      { error: 'Invalid KPI result ID' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()

    const result = await updateKpiResult(resultId, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.data },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in PUT /api/kpi/results/[id]:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/kpi/results/[id]
 * Delete a KPI result
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const resultId = parseInt(id)

  if (isNaN(resultId)) {
    return NextResponse.json(
      { error: 'Invalid KPI result ID' },
      { status: 400 }
    )
  }

  const result = await deleteKpiResult(resultId)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json(result)
}

/**
 * PATCH /api/kpi/results/[id]
 * Submit or review a KPI result
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const resultId = parseInt(id)

  if (isNaN(resultId)) {
    return NextResponse.json(
      { error: 'Invalid KPI result ID' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()
    const action = body.action

    let result

    switch (action) {
      case 'submit':
        result = await submitKpiResult(resultId)
        break
      case 'approve':
        result = await reviewKpiResult(resultId, 'approved')
        break
      case 'reject':
        result = await reviewKpiResult(resultId, 'rejected')
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: submit, approve, or reject' },
          { status: 400 }
        )
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in PATCH /api/kpi/results/[id]:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}