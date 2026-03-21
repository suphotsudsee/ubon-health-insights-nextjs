import { NextRequest, NextResponse } from 'next/server'
import { createFinanceAccountAdmin, getFinanceAccountsAdmin } from '@/actions/finance-accounts'

export async function GET() {
  const result = await getFinanceAccountsAdmin()

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(result.data)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await createFinanceAccountAdmin(body)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/finance-accounts:', error)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
