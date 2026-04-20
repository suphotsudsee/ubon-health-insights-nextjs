import { NextRequest, NextResponse } from 'next/server'
import { createKpiCategoryAdmin, getKpiCategoriesAdmin } from '@/actions/settings-admin'

export async function GET() {
  const result = await getKpiCategoriesAdmin()

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(result.data)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await createKpiCategoryAdmin(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/kpi/categories:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
