'use server'

/**
 * Finance Server Actions
 * 
 * Server actions for financial data operations including:
 * - Fetching finance records
 * - Creating and updating finance records
 * - Aggregating financial data for reports
 */

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { syncFinanceAccountsFromBreakdown } from '@/actions/finance-accounts'
import type { 
  FinanceRecordWithRelations,
  ApiResponse,
  FinanceRecordFilters,
  PaginationParams,
  CreateFinanceRecordInput,
  UpdateFinanceRecordInput
} from '@/types'
import { Prisma } from '@prisma/client'

// ============================================================
// Validation Schemas
// ============================================================

const createFinanceRecordSchema = z.object({
  healthUnitId: z.number().int().positive(),
  fiscalPeriodId: z.number().int().positive(),
  income: z.number().min(0),
  expense: z.number().min(0),
  incomeBreakdown: z.record(z.string(), z.number()).optional(),
  expenseBreakdown: z.record(z.string(), z.number()).optional(),
  notes: z.string().optional(),
  recorder: z.string().optional(),
})

const updateFinanceRecordSchema = z.object({
  income: z.number().min(0).optional(),
  expense: z.number().min(0).optional(),
  incomeBreakdown: z.record(z.string(), z.number()).optional(),
  expenseBreakdown: z.record(z.string(), z.number()).optional(),
  notes: z.string().optional(),
  recorder: z.string().optional(),
})

// ============================================================
// Finance Records Actions
// ============================================================

/**
 * Get finance records with filtering and pagination
 */
export async function getFinanceRecords(
  filters: FinanceRecordFilters = {},
  pagination: PaginationParams = {}
): Promise<ApiResponse<{ records: FinanceRecordWithRelations[]; total: number }>> {
  try {
    const { fiscalYear, month, amphoeId, healthUnitId } = filters
    const { page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination

    // Build where clause
    const where: Prisma.FinanceRecordWhereInput = {}

    if (fiscalYear || month) {
      where.fiscalPeriod = {}
      if (fiscalYear) where.fiscalPeriod.fiscalYear = fiscalYear
      if (month) where.fiscalPeriod.month = month
    }

    if (healthUnitId) {
      where.healthUnitId = healthUnitId
    } else if (amphoeId) {
      where.healthUnit = { amphoeId }
    }

    // Get total count
    const total = await prisma.financeRecord.count({ where })

    // Get records with relations
    const records = await prisma.financeRecord.findMany({
      where,
      include: {
        healthUnit: { include: { amphoe: true } },
        fiscalPeriod: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    // Transform to FinanceRecordWithRelations
    const transformedRecords: FinanceRecordWithRelations[] = records.map((r) => ({
      id: r.id,
      healthUnitId: r.healthUnitId,
      unitCode: r.healthUnit.code,
      unitName: r.healthUnit.name,
      amphoeName: r.healthUnit.amphoe.nameTh,
      fiscalPeriodId: r.fiscalPeriodId,
      fiscalYear: r.fiscalPeriod.fiscalYear,
      month: r.fiscalPeriod.month,
      monthNameTh: r.fiscalPeriod.monthNameTh,
      income: Number(r.income),
      expense: Number(r.expense),
      balance: Number(r.balance),
      incomeBreakdown: r.incomeBreakdown as Record<string, number> | null,
      expenseBreakdown: r.expenseBreakdown as Record<string, number> | null,
      notes: r.notes,
      recorder: r.recorder,
      submittedAt: r.submittedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))

    return { success: true, data: { records: transformedRecords, total } }
  } catch (error) {
    console.error('Error fetching finance records:', error)
    return { success: false, error: 'Failed to fetch finance records' }
  }
}

/**
 * Get a single finance record by ID
 */
export async function getFinanceRecord(id: number): Promise<ApiResponse<FinanceRecordWithRelations>> {
  try {
    const record = await prisma.financeRecord.findUnique({
      where: { id },
      include: {
        healthUnit: { include: { amphoe: true, tambon: true } },
        fiscalPeriod: true,
      },
    })

    if (!record) {
      return { success: false, error: 'Finance record not found' }
    }

    const transformed: FinanceRecordWithRelations = {
      id: record.id,
      healthUnitId: record.healthUnitId,
      unitCode: record.healthUnit.code,
      unitName: record.healthUnit.name,
      amphoeName: record.healthUnit.amphoe.nameTh,
      fiscalPeriodId: record.fiscalPeriodId,
      fiscalYear: record.fiscalPeriod.fiscalYear,
      month: record.fiscalPeriod.month,
      monthNameTh: record.fiscalPeriod.monthNameTh,
      income: Number(record.income),
      expense: Number(record.expense),
      balance: Number(record.balance),
      incomeBreakdown: record.incomeBreakdown as Record<string, number> | null,
      expenseBreakdown: record.expenseBreakdown as Record<string, number> | null,
      notes: record.notes,
      recorder: record.recorder,
      submittedAt: record.submittedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    }

    return { success: true, data: transformed }
  } catch (error) {
    console.error('Error fetching finance record:', error)
    return { success: false, error: 'Failed to fetch finance record' }
  }
}

/**
 * Create a new finance record
 */
export async function createFinanceRecord(
  data: CreateFinanceRecordInput
): Promise<ApiResponse<{ id: number }>> {
  try {
    const validated = createFinanceRecordSchema.parse(data)

    // Check for duplicate
    const existing = await prisma.financeRecord.findUnique({
      where: {
        healthUnitId_fiscalPeriodId: {
          healthUnitId: validated.healthUnitId,
          fiscalPeriodId: validated.fiscalPeriodId,
        },
      },
    })

    if (existing) {
      return { success: false, error: 'Finance record already exists for this unit and period' }
    }

    // Calculate balance
    const balance = validated.income - validated.expense

    await syncFinanceAccountsFromBreakdown('income', Object.keys(validated.incomeBreakdown || {}))
    await syncFinanceAccountsFromBreakdown('expense', Object.keys(validated.expenseBreakdown || {}))

    // Create record
    const record = await prisma.financeRecord.create({
      data: {
        healthUnitId: validated.healthUnitId,
        fiscalPeriodId: validated.fiscalPeriodId,
        income: validated.income,
        expense: validated.expense,
        balance,
        incomeBreakdown: validated.incomeBreakdown || undefined,
        expenseBreakdown: validated.expenseBreakdown || undefined,
        notes: validated.notes,
        recorder: validated.recorder,
      },
    })

    revalidatePath('/finance')
    revalidateTag('finance-records', 'max')

    return { success: true, data: { id: record.id }, message: 'Finance record created successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error creating finance record:', error)
    return { success: false, error: 'Failed to create finance record' }
  }
}

/**
 * Update an existing finance record
 */
export async function updateFinanceRecord(
  id: number,
  data: UpdateFinanceRecordInput
): Promise<ApiResponse> {
  try {
    const validated = updateFinanceRecordSchema.parse(data)

    // Get existing record
    const existing = await prisma.financeRecord.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'Finance record not found' }
    }

    // Calculate new balance
    const income = data.income ?? Number(existing.income)
    const expense = data.expense ?? Number(existing.expense)
    const balance = income - expense

    await syncFinanceAccountsFromBreakdown('income', Object.keys(validated.incomeBreakdown || {}))
    await syncFinanceAccountsFromBreakdown('expense', Object.keys(validated.expenseBreakdown || {}))

    // Update record
    await prisma.financeRecord.update({
      where: { id },
      data: {
        ...validated,
        balance,
      },
    })

    revalidatePath('/finance')
    revalidateTag('finance-records', 'max')

    return { success: true, message: 'Finance record updated successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error updating finance record:', error)
    return { success: false, error: 'Failed to update finance record' }
  }
}

/**
 * Delete a finance record
 */
export async function deleteFinanceRecord(id: number): Promise<ApiResponse> {
  try {
    const existing = await prisma.financeRecord.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'Finance record not found' }
    }

    await prisma.financeRecord.delete({ where: { id } })

    revalidatePath('/finance')
    revalidateTag('finance-records', 'max')

    return { success: true, message: 'Finance record deleted successfully' }
  } catch (error) {
    console.error('Error deleting finance record:', error)
    return { success: false, error: 'Failed to delete finance record' }
  }
}

// ============================================================
// Aggregation Actions
// ============================================================

/**
 * Get finance summary by fiscal year
 */
export async function getFinanceSummary(
  fiscalYear?: number,
  amphoeId?: number
): Promise<ApiResponse<{
  totalIncome: number
  totalExpense: number
  totalBalance: number
  unitCount: number
}>> {
  try {
    const where: Prisma.FinanceRecordWhereInput = {}

    if (fiscalYear) {
      where.fiscalPeriod = { fiscalYear }
    }

    if (amphoeId) {
      where.healthUnit = { amphoeId }
    }

    const records = await prisma.financeRecord.findMany({
      where,
      select: {
        income: true,
        expense: true,
        balance: true,
        healthUnitId: true,
      },
    })

    const summary = {
      totalIncome: records.reduce((sum, r) => sum + Number(r.income), 0),
      totalExpense: records.reduce((sum, r) => sum + Number(r.expense), 0),
      totalBalance: records.reduce((sum, r) => sum + Number(r.balance), 0),
      unitCount: new Set(records.map((r) => r.healthUnitId)).size,
    }

    return { success: true, data: summary }
  } catch (error) {
    console.error('Error fetching finance summary:', error)
    return { success: false, error: 'Failed to fetch finance summary' }
  }
}

/**
 * Get monthly finance trends
 */
export async function getFinanceTrends(
  fiscalYear: number,
  amphoeId?: number
): Promise<ApiResponse<{
  month: number
  monthName: string
  income: number
  expense: number
  balance: number
}[]>> {
  try {
    const where: Prisma.FinanceRecordWhereInput = {
      fiscalPeriod: { fiscalYear },
    }

    if (amphoeId) {
      where.healthUnit = { amphoeId }
    }

    const records = await prisma.financeRecord.findMany({
      where,
      include: { fiscalPeriod: true },
    })

    // Group by month
    const monthMap = new Map<number, { income: number; expense: number; balance: number; name: string }>()

    for (const record of records) {
      const month = record.fiscalPeriod.month
      if (!monthMap.has(month)) {
        monthMap.set(month, { income: 0, expense: 0, balance: 0, name: record.fiscalPeriod.monthNameTh })
      }
      const data = monthMap.get(month)!
      data.income += Number(record.income)
      data.expense += Number(record.expense)
      data.balance += Number(record.balance)
    }

    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ]

    // Build sorted array (Thai fiscal year starts October)
    const fiscalOrder = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const trends = fiscalOrder.map((month) => {
      const data = monthMap.get(month)
      return {
        month,
        monthName: data?.name || thaiMonths[month - 1],
        income: data?.income || 0,
        expense: data?.expense || 0,
        balance: data?.balance || 0,
      }
    })

    return { success: true, data: trends }
  } catch (error) {
    console.error('Error fetching finance trends:', error)
    return { success: false, error: 'Failed to fetch finance trends' }
  }
}

/**
 * Get finance comparison by health unit
 */
export async function getFinanceByUnit(
  fiscalYear: number,
  amphoeId?: number
): Promise<ApiResponse<{
  healthUnitId: number
  unitCode: string
  unitName: string
  amphoeName: string
  totalIncome: number
  totalExpense: number
  totalBalance: number
}[]>> {
  try {
    const where: Prisma.FinanceRecordWhereInput = {
      fiscalPeriod: { fiscalYear },
    }

    if (amphoeId) {
      where.healthUnit = { amphoeId }
    }

    const records = await prisma.financeRecord.findMany({
      where,
      include: {
        healthUnit: { include: { amphoe: true } },
      },
    })

    // Group by health unit
    const unitMap = new Map<number, {
      unitCode: string
      unitName: string
      amphoeName: string
      income: number
      expense: number
      balance: number
    }>()

    for (const record of records) {
      const unitId = record.healthUnitId
      if (!unitMap.has(unitId)) {
        unitMap.set(unitId, {
          unitCode: record.healthUnit.code,
          unitName: record.healthUnit.name,
          amphoeName: record.healthUnit.amphoe.nameTh,
          income: 0,
          expense: 0,
          balance: 0,
        })
      }
      const data = unitMap.get(unitId)!
      data.income += Number(record.income)
      data.expense += Number(record.expense)
      data.balance += Number(record.balance)
    }

    const result = Array.from(unitMap.entries()).map(([id, data]) => ({
      healthUnitId: id,
      unitCode: data.unitCode,
      unitName: data.unitName,
      amphoeName: data.amphoeName,
      totalIncome: data.income,
      totalExpense: data.expense,
      totalBalance: data.balance,
    }))

    return { success: true, data: result }
  } catch (error) {
    console.error('Error fetching finance by unit:', error)
    return { success: false, error: 'Failed to fetch finance by unit' }
  }
}
