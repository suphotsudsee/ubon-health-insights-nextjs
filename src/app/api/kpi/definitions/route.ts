import { NextRequest, NextResponse } from 'next/server'
import { getKpiDefinitions, getKpiDefinitionsByCategory } from '@/actions/kpi'
import { createKpiDefinitionAdmin, getKpiDefinitionsAdmin } from '@/actions/settings-admin'

/**
 * GET /api/kpi/definitions
 * Get all KPI definitions (optionally filtered by category)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const categoryCode = searchParams.get('category')
  const includeInactive = searchParams.get('admin') === 'true'

  if (includeInactive) {
    const result = await getKpiDefinitionsAdmin()
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    return NextResponse.json(result.data)
  }

  if (categoryCode) {
    const result = await getKpiDefinitionsByCategory(categoryCode)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    return NextResponse.json(result.data)
  }

  const result = await getKpiDefinitions()

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
    const result = await createKpiDefinitionAdmin(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/kpi/definitions:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
