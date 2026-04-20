import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUsers, createUser, updateUser, deleteUser, getUser } from '@/actions/auth'

async function requireAdmin() {
  const session = await auth()
  const role = (session?.user as { role?: string } | undefined)?.role

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  if (role !== 'admin') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }

  return null
}

/**
 * GET /api/auth/users
 * Get all users (admin only)
 */
export async function GET(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('id')

  // Get single user
  if (userId) {
    const result = await getUser(parseInt(userId))
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      )
    }
    
    return NextResponse.json(result.data)
  }

  // Get all users
  const result = await getUsers()

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json(result.data)
}

/**
 * POST /api/auth/users
 * Create a new user (admin only)
 */
export async function POST(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const body = await request.json()

    const result = await createUser(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.data },
        { status: 400 }
      )
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/auth/users:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

/**
 * PUT /api/auth/users
 * Update a user (admin only)
 */
export async function PUT(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const result = await updateUser(parseInt(id), updateData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.data },
        { status: 400 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in PUT /api/auth/users:', error)
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}

/**
 * DELETE /api/auth/users
 * Delete a user (admin only)
 */
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const searchParams = request.nextUrl.searchParams
  const userId = searchParams.get('id')

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  const result = await deleteUser(parseInt(userId))

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    )
  }

  return NextResponse.json(result)
}
