'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { FinanceAccountType } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import type { ApiResponse } from '@/types'

const createFinanceAccountSchema = z.object({
  type: z.nativeEnum(FinanceAccountType),
  nameTh: z.string().min(1).max(255),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

const updateFinanceAccountSchema = createFinanceAccountSchema.partial()

export async function syncFinanceAccountsFromBreakdown(
  type: FinanceAccountType,
  names: string[]
) {
  const uniqueNames = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)))
  if (uniqueNames.length === 0) {
    return
  }

  for (const nameTh of uniqueNames) {
    await prisma.financeAccount.upsert({
      where: {
        type_nameTh: {
          type,
          nameTh,
        },
      },
      update: {},
      create: {
        type,
        nameTh,
      },
    })
  }
}

export async function getFinanceAccountsAdmin(): Promise<ApiResponse> {
  try {
    const accounts = await prisma.financeAccount.findMany({
      orderBy: [{ type: 'asc' }, { displayOrder: 'asc' }, { nameTh: 'asc' }],
    })

    return { success: true, data: accounts }
  } catch (error) {
    console.error('Error fetching finance accounts:', error)
    return { success: false, error: 'Failed to fetch finance accounts' }
  }
}

export async function createFinanceAccountAdmin(data: unknown): Promise<ApiResponse> {
  try {
    const validated = createFinanceAccountSchema.parse(data)

    const existing = await prisma.financeAccount.findUnique({
      where: {
        type_nameTh: {
          type: validated.type,
          nameTh: validated.nameTh.trim(),
        },
      },
    })

    if (existing) {
      return { success: false, error: 'Finance account already exists' }
    }

    await prisma.financeAccount.create({
      data: {
        type: validated.type,
        nameTh: validated.nameTh.trim(),
        displayOrder: validated.displayOrder ?? 0,
        isActive: validated.isActive ?? true,
      },
    })

    revalidatePath('/settings')
    revalidateTag('finance-accounts', 'max')

    return { success: true, message: 'Finance account created successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error creating finance account:', error)
    return { success: false, error: 'Failed to create finance account' }
  }
}

export async function updateFinanceAccountAdmin(id: number, data: unknown): Promise<ApiResponse> {
  try {
    const validated = updateFinanceAccountSchema.parse(data)
    const existing = await prisma.financeAccount.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'Finance account not found' }
    }

    const nextType = validated.type ?? existing.type
    const nextName = validated.nameTh?.trim() ?? existing.nameTh

    const duplicate = await prisma.financeAccount.findFirst({
      where: {
        id: { not: id },
        type: nextType,
        nameTh: nextName,
      },
    })

    if (duplicate) {
      return { success: false, error: 'Finance account already exists' }
    }

    await prisma.financeAccount.update({
      where: { id },
      data: {
        type: validated.type,
        nameTh: validated.nameTh?.trim(),
        displayOrder: validated.displayOrder,
        isActive: validated.isActive,
      },
    })

    revalidatePath('/settings')
    revalidateTag('finance-accounts', 'max')

    return { success: true, message: 'Finance account updated successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error updating finance account:', error)
    return { success: false, error: 'Failed to update finance account' }
  }
}

export async function deleteFinanceAccountAdmin(id: number): Promise<ApiResponse> {
  try {
    const existing = await prisma.financeAccount.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'Finance account not found' }
    }

    await prisma.financeAccount.delete({ where: { id } })

    revalidatePath('/settings')
    revalidateTag('finance-accounts', 'max')

    return { success: true, message: 'Finance account deleted successfully' }
  } catch (error) {
    console.error('Error deleting finance account:', error)
    return { success: false, error: 'Failed to delete finance account' }
  }
}
