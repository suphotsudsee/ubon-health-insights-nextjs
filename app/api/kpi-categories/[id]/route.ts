import { NextRequest, NextResponse } from 'next/server'
import { deleteKpiCategoryAdmin, updateKpiCategoryAdmin } from '@/actions/settings-admin'

type RouteParams = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const categoryId = parseInt(id)

  if (isNaN(categoryId)) {
    return NextResponse.json({ error: 'Invalid KPI category ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const result = await updateKpiCategoryAdmin(categoryId, body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in PUT /api/kpi/categories/[id]:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const categoryId = parseInt(id)

  if (isNaN(categoryId)) {
    return NextResponse.json({ error: 'Invalid KPI category ID' }, { status: 400 })
  }

  const result = await deleteKpiCategoryAdmin(categoryId)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(result)
}
