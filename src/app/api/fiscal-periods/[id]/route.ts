import { NextRequest, NextResponse } from 'next/server'
import { updateFiscalPeriodAdmin } from '@/actions/settings-admin'

type RouteParams = { params: Promise<{ id: string }> }

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const periodId = parseInt(id)

  if (Number.isNaN(periodId)) {
    return NextResponse.json({ error: 'Invalid fiscal period ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const result = await updateFiscalPeriodAdmin(periodId, body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in PUT /api/fiscal-periods/[id]:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
