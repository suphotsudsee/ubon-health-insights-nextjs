import { NextRequest, NextResponse } from 'next/server'
import { deleteFinanceAccountAdmin, updateFinanceAccountAdmin } from '@/actions/finance-accounts'

type RouteParams = { params: Promise<{ id: string }> }

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const accountId = parseInt(id)

  if (isNaN(accountId)) {
    return NextResponse.json({ error: 'Invalid finance account ID' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const result = await updateFinanceAccountAdmin(accountId, body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in PUT /api/finance-accounts/[id]:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const accountId = parseInt(id)

  if (isNaN(accountId)) {
    return NextResponse.json({ error: 'Invalid finance account ID' }, { status: 400 })
  }

  const result = await deleteFinanceAccountAdmin(accountId)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(result)
}
