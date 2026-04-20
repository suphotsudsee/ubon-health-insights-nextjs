import { NextRequest, NextResponse } from 'next/server'
import { getFinanceRecord, updateFinanceRecord, deleteFinanceRecord } from '@/actions/finance'

type RouteParams = { params: Promise<{ id: string }> }

/**
 * GET /api/finance/records/[id]
 * Get a single finance record
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const recordId = parseInt(id)

  if (isNaN(recordId)) {
    return NextResponse.json(
      { error: 'Invalid finance record ID' },
      { status: 400 }
    )
  }

  const result = await getFinanceRecord(recordId)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 404 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * PUT /api/finance/records/[id]
 * Update a finance record
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const recordId = parseInt(id)

  if (isNaN(recordId)) {
    return NextResponse.json(
      { error: 'Invalid finance record ID' },
      { status: 400 }
    )
  }

  try {
    const body = await request.json()

    const result = await updateFinanceRecord(recordId, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.data },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in PUT /api/finance/records/[id]:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/finance/records/[id]
 * Delete a finance record
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const recordId = parseInt(id)

  if (isNaN(recordId)) {
    return NextResponse.json(
      { error: 'Invalid finance record ID' },
      { status: 400 }
    )
  }

  const result = await deleteFinanceRecord(recordId)

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json(result)
}