import { NextRequest, NextResponse } from 'next/server'
import { deleteKpiDefinitionAdmin, updateKpiDefinitionAdmin } from '@/actions/settings-admin'

type RouteParams = { params: Promise<{ id: string }> }

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const definitionId = parseInt(id)

  if (Number.isNaN(definitionId)) {
    return NextResponse.json({ error: 'Invalid KPI definition ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const result = await updateKpiDefinitionAdmin(definitionId, body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in PUT /api/kpi/definitions/[id]:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
) {
  const { id } = await params
  const definitionId = parseInt(id)

  if (Number.isNaN(definitionId)) {
    return NextResponse.json({ error: 'Invalid KPI definition ID' }, { status: 400 })
  }

  const result = await deleteKpiDefinitionAdmin(definitionId)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(result)
}
