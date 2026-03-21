'use server'

/**
 * Authentication Server Actions
 * 
 * Server actions for user authentication including:
 * - User registration
 * - Password management
 * - Session management
 * - Role-based access control
 */

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import type { ApiResponse, AuthUser, CreateUserInput, UpdateUserInput } from '@/types'
import { Prisma } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

// ============================================================
// Validation Schemas
// ============================================================

const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']).optional(),
  healthUnitId: z.number().int().positive().optional(),
})

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']).optional(),
  healthUnitId: z.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

// ============================================================
// Password Utilities
// ============================================================

const SALT_ROUNDS = 12

/**
 * Hash a password
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// ============================================================
// User Management Actions
// ============================================================

/**
 * Get all users (admin only)
 */
export async function getUsers(): Promise<ApiResponse> {
  try {
    const users = await prisma.user.findMany({
      include: {
        healthUnit: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Remove password hashes from response
    const sanitizedUsers = users.map((user) => ({
      ...user,
      passwordHash: undefined,
    }))

    return { success: true, data: sanitizedUsers }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
}

/**
 * Get a user by ID
 */
export async function getUser(id: number): Promise<ApiResponse<AuthUser>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        healthUnit: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      healthUnitId: user.healthUnitId,
      healthUnitName: user.healthUnit?.name || null,
    }

    return { success: true, data: authUser }
  } catch (error) {
    console.error('Error fetching user:', error)
    return { success: false, error: 'Failed to fetch user' }
  }
}

/**
 * Create a new user (admin only)
 */
export async function createUser(data: CreateUserInput): Promise<ApiResponse<{ id: number }>> {
  try {
    const validated = createUserSchema.parse(data)

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existing) {
      return { success: false, error: 'Email already registered' }
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        passwordHash,
        name: validated.name,
        role: validated.role || 'viewer',
        healthUnitId: validated.healthUnitId || null,
      },
    })

    return { 
      success: true, 
      data: { id: user.id }, 
      message: 'User created successfully' 
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error creating user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

/**
 * Update a user (admin only)
 */
export async function updateUser(
  id: number, 
  data: UpdateUserInput
): Promise<ApiResponse> {
  try {
    const validated = updateUserSchema.parse(data)

    // Check user exists
    const existing = await prisma.user.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'User not found' }
    }

    // Update user
    await prisma.user.update({
      where: { id },
      data: validated,
    })

    revalidatePath('/admin/users')

    return { success: true, message: 'User updated successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error updating user:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

/**
 * Delete a user (admin only)
 */
export async function deleteUser(id: number): Promise<ApiResponse> {
  try {
    const existing = await prisma.user.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'User not found' }
    }

    // Prevent deletion of last admin
    if (existing.role === 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } })
      if (adminCount <= 1) {
        return { success: false, error: 'Cannot delete the last admin user' }
      }
    }

    await prisma.user.delete({ where: { id } })

    revalidatePath('/admin/users')

    return { success: true, message: 'User deleted successfully' }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

// ============================================================
// Authentication Actions
// ============================================================

/**
 * Verify user credentials for login
 */
export async function verifyCredentials(
  email: string, 
  password: string
): Promise<ApiResponse<AuthUser>> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        healthUnit: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Check if account is active
    if (!user.isActive) {
      return { success: false, error: 'Account is disabled. Contact administrator.' }
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000
      )
      return { 
        success: false, 
        error: `Account is locked. Try again in ${remainingMinutes} minutes.` 
      }
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash)

    if (!isValid) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1
      
      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: newAttempts,
            lockedUntil: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
          },
        })
        return { success: false, error: 'Account locked due to too many failed attempts. Try again in 30 minutes.' }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: newAttempts },
      })

      return { success: false, error: 'Invalid email or password' }
    }

    // Reset login attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    })

    // Return user without password hash
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      healthUnitId: user.healthUnitId,
      healthUnitName: user.healthUnit?.name || null,
    }

    return { success: true, data: authUser }
  } catch (error) {
    console.error('Error verifying credentials:', error)
    return { success: false, error: 'Authentication failed' }
  }
}

/**
 * Change user password
 */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse> {
  try {
    const validated = changePasswordSchema.parse({
      currentPassword,
      newPassword,
    })

    // Get user
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Verify current password
    const isValid = await verifyPassword(validated.currentPassword, user.passwordHash)

    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' }
    }

    // Hash new password
    const newPasswordHash = await hashPassword(validated.newPassword)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    })

    return { success: true, message: 'Password changed successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error changing password:', error)
    return { success: false, error: 'Failed to change password' }
  }
}

/**
 * Reset user password (admin only)
 */
export async function resetUserPassword(
  userId: number,
  newPassword: string
): Promise<ApiResponse> {
  try {
    // Verify target user exists
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update password and unlock account
    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        loginAttempts: 0,
        lockedUntil: null,
      },
    })

    return { success: true, message: 'Password reset successfully' }
  } catch (error) {
    console.error('Error resetting password:', error)
    return { success: false, error: 'Failed to reset password' }
  }
}

// ============================================================
// Role-Based Access Control
// ============================================================

/**
 * Check if user has required role
 */
export async function hasRole(userRole: string, requiredRoles: string[]): Promise<boolean> {
  const roleHierarchy = {
    admin: 4,
    manager: 3,
    staff: 2,
    viewer: 1,
  }

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
  const requiredLevel = Math.min(
    ...requiredRoles.map(
      (role) => roleHierarchy[role as keyof typeof roleHierarchy] || 0
    )
  )

  return userLevel >= requiredLevel
}

/**
 * Check if user can access health unit data
 */
export async function canAccessHealthUnit(
  userId: number,
  healthUnitId: number
): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, healthUnitId: true },
    })

    if (!user) return false

    // Admins can access all units
    if (user.role === 'admin') return true

    // Managers can access all units in their district
    if (user.role === 'manager' && user.healthUnitId) {
      // Get amphoe of user's unit
      const userUnit = await prisma.healthUnit.findUnique({
        where: { id: user.healthUnitId },
        select: { amphoeId: true },
      })

      // Get amphoe of target unit
      const targetUnit = await prisma.healthUnit.findUnique({
        where: { id: healthUnitId },
        select: { amphoeId: true },
      })

      return userUnit?.amphoeId === targetUnit?.amphoeId
    }

    // Staff and viewers can only access their own unit
    return user.healthUnitId === healthUnitId
  } catch (error) {
    console.error('Error checking health unit access:', error)
    return false
  }
}

/**
 * Get health units accessible to user
 */
export async function getAccessibleHealthUnits(userId: number): Promise<ApiResponse> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        healthUnit: {
          include: { amphoe: true },
        },
      },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Admins can access all units
    if (user.role === 'admin') {
      const units = await prisma.healthUnit.findMany({
        where: { isDeleted: false, status: 'active' },
        include: { amphoe: true },
        orderBy: [{ amphoe: { nameTh: 'asc' } }, { name: 'asc' }],
      })
      return { success: true, data: units }
    }

    // Managers can access units in their amphoe
    if (user.role === 'manager' && user.healthUnit) {
      const units = await prisma.healthUnit.findMany({
        where: { 
          amphoeId: user.healthUnit.amphoeId,
          isDeleted: false,
          status: 'active',
        },
        include: { amphoe: true },
        orderBy: { name: 'asc' },
      })
      return { success: true, data: units }
    }

    // Staff and viewers can only access their own unit
    if (user.healthUnit) {
      return { success: true, data: [user.healthUnit] }
    }

    return { success: true, data: [] }
  } catch (error) {
    console.error('Error getting accessible health units:', error)
    return { success: false, error: 'Failed to get accessible health units' }
  }
}
