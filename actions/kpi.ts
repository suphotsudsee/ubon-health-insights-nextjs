'use server'

/**
 * KPI Server Actions
 * 
 * Server actions for KPI-related operations including:
 * - Fetching KPI definitions and results
 * - Creating and updating KPI results
 * - Aggregating KPI performance data
 */

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import type { 
  KpiResultWithRelations, 
  KpiPerformanceSummary, 
  DistrictPerformance,
  RecentKpiResult,
  ApiResponse,
  KpiResultFilters,
  PaginationParams,
  CreateKpiResultInput,
  UpdateKpiResultInput
} from '@/types'
import { Prisma } from '@prisma/client'

// ============================================================
// Validation Schemas
// ============================================================

const createKpiResultSchema = z.object({
  kpiId: z.number().int().positive(),
  healthUnitId: z.number().int().positive(),
  fiscalPeriodId: z.number().int().positive(),
  targetValue: z.number().min(0),
  actualValue: z.number().min(0),
  notes: z.string().optional(),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
})

const updateKpiResultSchema = z.object({
  targetValue: z.number().min(0).optional(),
  actualValue: z.number().min(0).optional(),
  notes: z.string().optional(),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
  reviewStatus: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
})

const kpiResultFiltersSchema = z.object({
  fiscalYear: z.number().int().positive().optional(),
  quarter: z.number().int().min(1).max(4).optional(),
  amphoeId: z.number().int().positive().optional(),
  healthUnitId: z.number().int().positive().optional(),
  kpiId: z.number().int().positive().optional(),
  categoryId: z.number().int().positive().optional(),
  reviewStatus: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
  minPercentage: z.number().min(0).max(100).optional(),
  maxPercentage: z.number().min(0).max(100).optional(),
})

// ============================================================
// KPI Definitions Actions
// ============================================================

/**
 * Get all active KPI definitions with their categories
 */
export async function getKpiDefinitions(): Promise<ApiResponse> {
  try {
    const definitions = await prisma.kpiDefinition.findMany({
      where: { 
        isActive: true,
        isDeleted: false,
      },
      include: {
        category: {
          select: {
            id: true,
            code: true,
            nameTh: true,
            nameEn: true,
            colorCode: true,
            displayOrder: true,
          },
        },
      },
      orderBy: [
        { category: { displayOrder: 'asc' } },
        { displayOrder: 'asc' },
      ],
    })

    return { success: true, data: definitions }
  } catch (error) {
    console.error('Error fetching KPI definitions:', error)
    return { success: false, error: 'Failed to fetch KPI definitions' }
  }
}

/**
 * Get KPI definitions by category code
 */
export async function getKpiDefinitionsByCategory(categoryCode: string): Promise<ApiResponse> {
  try {
    const definitions = await prisma.kpiDefinition.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        category: { code: categoryCode },
      },
      include: {
        category: true,
      },
      orderBy: { displayOrder: 'asc' },
    })

    return { success: true, data: definitions }
  } catch (error) {
    console.error('Error fetching KPI definitions by category:', error)
    return { success: false, error: 'Failed to fetch KPI definitions' }
  }
}

/**
 * Get a single KPI definition by ID
 */
export async function getKpiDefinition(id: number): Promise<ApiResponse> {
  try {
    const definition = await prisma.kpiDefinition.findUnique({
      where: { id },
      include: { category: true },
    })

    if (!definition) {
      return { success: false, error: 'KPI definition not found' }
    }

    return { success: true, data: definition }
  } catch (error) {
    console.error('Error fetching KPI definition:', error)
    return { success: false, error: 'Failed to fetch KPI definition' }
  }
}

// ============================================================
// KPI Results Actions
// ============================================================

/**
 * Get KPI results with filtering and pagination
 */
export async function getKpiResults(
  filters: KpiResultFilters = {},
  pagination: PaginationParams = {}
): Promise<ApiResponse<{ results: KpiResultWithRelations[]; total: number }>> {
  try {
    const {
      fiscalYear,
      quarter,
      amphoeId,
      healthUnitId,
      kpiId,
      categoryId,
      reviewStatus,
      minPercentage,
      maxPercentage,
    } = filters

    const { page = 1, pageSize = 20, sortBy = 'createdAt', sortOrder = 'desc' } = pagination

    // Build where clause
    const where: Prisma.KpiResultWhereInput = {}

    if (fiscalYear || quarter) {
      where.fiscalPeriod = {}
      if (fiscalYear) where.fiscalPeriod.fiscalYear = fiscalYear
      if (quarter) where.fiscalPeriod.quarter = quarter
    }

    if (healthUnitId) {
      where.healthUnitId = healthUnitId
    } else if (amphoeId) {
      where.healthUnit = { amphoeId }
    }

    if (kpiId) {
      where.kpiId = kpiId
    } else if (categoryId) {
      where.kpi = { categoryId }
    }

    if (reviewStatus) {
      where.reviewStatus = reviewStatus
    }

    if (minPercentage !== undefined || maxPercentage !== undefined) {
      where.percentage = {}
      if (minPercentage !== undefined) where.percentage.gte = minPercentage
      if (maxPercentage !== undefined) where.percentage.lte = maxPercentage
    }

    // Get total count
    const total = await prisma.kpiResult.count({ where })

    // Get results with relations
    const results = await prisma.kpiResult.findMany({
      where,
      include: {
        kpi: {
          include: { category: true },
        },
        healthUnit: {
          include: { amphoe: true },
        },
        fiscalPeriod: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    // Transform to KpiResultWithRelations
    const transformedResults: KpiResultWithRelations[] = results.map((r) => ({
      id: r.id,
      kpiId: r.kpiId,
      kpiCode: r.kpi.code,
      kpiNameTh: r.kpi.nameTh,
      kpiNameEn: r.kpi.nameEn,
      categoryId: r.kpi.categoryId,
      categoryCode: r.kpi.category.code,
      categoryNameTh: r.kpi.category.nameTh,
      healthUnitId: r.healthUnitId,
      unitCode: r.healthUnit.code,
      unitName: r.healthUnit.name,
      amphoeId: r.healthUnit.amphoeId,
      amphoeName: r.healthUnit.amphoe.nameTh,
      fiscalPeriodId: r.fiscalPeriodId,
      fiscalYear: r.fiscalPeriod.fiscalYear,
      quarter: r.fiscalPeriod.quarter,
      month: r.fiscalPeriod.month,
      monthNameTh: r.fiscalPeriod.monthNameTh,
      targetValue: Number(r.targetValue),
      actualValue: Number(r.actualValue),
      percentage: Number(r.percentage),
      notes: r.notes,
      evidenceUrl: r.evidenceUrl,
      reviewStatus: r.reviewStatus,
      submittedAt: r.submittedAt,
      reviewedAt: r.reviewedAt,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }))

    return { success: true, data: { results: transformedResults, total } }
  } catch (error) {
    console.error('Error fetching KPI results:', error)
    return { success: false, error: 'Failed to fetch KPI results' }
  }
}

/**
 * Get a single KPI result by ID
 */
export async function getKpiResult(id: number): Promise<ApiResponse<KpiResultWithRelations>> {
  try {
    const result = await prisma.kpiResult.findUnique({
      where: { id },
      include: {
        kpi: { include: { category: true } },
        healthUnit: { include: { amphoe: true, tambon: true } },
        fiscalPeriod: true,
      },
    })

    if (!result) {
      return { success: false, error: 'KPI result not found' }
    }

    const transformed: KpiResultWithRelations = {
      id: result.id,
      kpiId: result.kpiId,
      kpiCode: result.kpi.code,
      kpiNameTh: result.kpi.nameTh,
      kpiNameEn: result.kpi.nameEn,
      categoryId: result.kpi.categoryId,
      categoryCode: result.kpi.category.code,
      categoryNameTh: result.kpi.category.nameTh,
      healthUnitId: result.healthUnitId,
      unitCode: result.healthUnit.code,
      unitName: result.healthUnit.name,
      amphoeId: result.healthUnit.amphoeId,
      amphoeName: result.healthUnit.amphoe.nameTh,
      fiscalPeriodId: result.fiscalPeriodId,
      fiscalYear: result.fiscalPeriod.fiscalYear,
      quarter: result.fiscalPeriod.quarter,
      month: result.fiscalPeriod.month,
      monthNameTh: result.fiscalPeriod.monthNameTh,
      targetValue: Number(result.targetValue),
      actualValue: Number(result.actualValue),
      percentage: Number(result.percentage),
      notes: result.notes,
      evidenceUrl: result.evidenceUrl,
      reviewStatus: result.reviewStatus,
      submittedAt: result.submittedAt,
      reviewedAt: result.reviewedAt,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    }

    return { success: true, data: transformed }
  } catch (error) {
    console.error('Error fetching KPI result:', error)
    return { success: false, error: 'Failed to fetch KPI result' }
  }
}

/**
 * Create a new KPI result
 */
export async function createKpiResult(
  data: CreateKpiResultInput
): Promise<ApiResponse<{ id: number }>> {
  try {
    // Validate input
    const validated = createKpiResultSchema.parse(data)

    // Check for duplicate
    const existing = await prisma.kpiResult.findUnique({
      where: {
        kpiId_healthUnitId_fiscalPeriodId: {
          kpiId: validated.kpiId,
          healthUnitId: validated.healthUnitId,
          fiscalPeriodId: validated.fiscalPeriodId,
        },
      },
    })

    if (existing) {
      return { success: false, error: 'KPI result already exists for this unit and period' }
    }

    // Get KPI definition for target type
    const kpiDef = await prisma.kpiDefinition.findUnique({
      where: { id: validated.kpiId },
    })

    if (!kpiDef) {
      return { success: false, error: 'KPI definition not found' }
    }

    // Calculate percentage based on target type
    const percentage = calculatePercentage(
      kpiDef.targetType,
      Number(validated.targetValue),
      Number(validated.actualValue)
    )

    // Create result
    const result = await prisma.kpiResult.create({
      data: {
        kpiId: validated.kpiId,
        healthUnitId: validated.healthUnitId,
        fiscalPeriodId: validated.fiscalPeriodId,
        targetValue: validated.targetValue,
        actualValue: validated.actualValue,
        percentage,
        notes: validated.notes,
        evidenceUrl: validated.evidenceUrl || null,
      },
    })

    // Revalidate cache
    revalidatePath('/dashboard')
    revalidatePath('/ppfs')
    revalidatePath('/ttm')
    revalidateTag('kpi-results', 'max')

    return { success: true, data: { id: result.id }, message: 'KPI result created successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error creating KPI result:', error)
    return { success: false, error: 'Failed to create KPI result' }
  }
}

/**
 * Update an existing KPI result
 */
export async function updateKpiResult(
  id: number,
  data: UpdateKpiResultInput
): Promise<ApiResponse> {
  try {
    const validated = updateKpiResultSchema.parse(data)

    // Get existing result
    const existing = await prisma.kpiResult.findUnique({
      where: { id },
      include: { kpi: true },
    })

    if (!existing) {
      return { success: false, error: 'KPI result not found' }
    }

    // Calculate new percentage if values changed
    let percentage = Number(existing.percentage)
    if (data.targetValue !== undefined || data.actualValue !== undefined) {
      const targetValue = data.targetValue ?? Number(existing.targetValue)
      const actualValue = data.actualValue ?? Number(existing.actualValue)
      percentage = calculatePercentage(existing.kpi.targetType, targetValue, actualValue)
    }

    // Update result
    await prisma.kpiResult.update({
      where: { id },
      data: {
        ...validated,
        percentage,
        targetValue: validated.targetValue !== undefined ? validated.targetValue : undefined,
        actualValue: validated.actualValue !== undefined ? validated.actualValue : undefined,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/ppfs')
    revalidatePath('/ttm')
    revalidateTag('kpi-results', 'max')

    return { success: true, message: 'KPI result updated successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error updating KPI result:', error)
    return { success: false, error: 'Failed to update KPI result' }
  }
}

/**
 * Delete a KPI result (soft delete via status)
 */
export async function deleteKpiResult(id: number): Promise<ApiResponse> {
  try {
    const existing = await prisma.kpiResult.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'KPI result not found' }
    }

    await prisma.kpiResult.delete({ where: { id } })

    revalidatePath('/dashboard')
    revalidatePath('/ppfs')
    revalidatePath('/ttm')
    revalidateTag('kpi-results', 'max')

    return { success: true, message: 'KPI result deleted successfully' }
  } catch (error) {
    console.error('Error deleting KPI result:', error)
    return { success: false, error: 'Failed to delete KPI result' }
  }
}

/**
 * Submit KPI result for review
 */
export async function submitKpiResult(id: number): Promise<ApiResponse> {
  try {
    const existing = await prisma.kpiResult.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'KPI result not found' }
    }

    if (existing.reviewStatus !== 'draft') {
      return { success: false, error: 'Only draft results can be submitted' }
    }

    await prisma.kpiResult.update({
      where: { id },
      data: {
        reviewStatus: 'submitted',
        submittedAt: new Date(),
      },
    })

    revalidateTag('kpi-results', 'max')

    return { success: true, message: 'KPI result submitted for review' }
  } catch (error) {
    console.error('Error submitting KPI result:', error)
    return { success: false, error: 'Failed to submit KPI result' }
  }
}

/**
 * Approve or reject KPI result
 */
export async function reviewKpiResult(
  id: number,
  status: 'approved' | 'rejected'
): Promise<ApiResponse> {
  try {
    const existing = await prisma.kpiResult.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'KPI result not found' }
    }

    if (existing.reviewStatus !== 'submitted') {
      return { success: false, error: 'Only submitted results can be reviewed' }
    }

    await prisma.kpiResult.update({
      where: { id },
      data: {
        reviewStatus: status,
        reviewedAt: new Date(),
      },
    })

    revalidateTag('kpi-results', 'max')

    return { success: true, message: `KPI result ${status}` }
  } catch (error) {
    console.error('Error reviewing KPI result:', error)
    return { success: false, error: 'Failed to review KPI result' }
  }
}

// ============================================================
// Aggregation Actions
// ============================================================

/**
 * Get KPI performance summary by category
 */
export async function getKpiPerformanceSummary(
  fiscalYear?: number,
  quarter?: number,
  amphoeId?: number
): Promise<ApiResponse<KpiPerformanceSummary[]>> {
  try {
    const results = await prisma.kpiResult.findMany({
      where: {
        reviewStatus: 'approved',
        ...(fiscalYear && {
          fiscalPeriod: { fiscalYear },
        }),
        ...(quarter && {
          fiscalPeriod: { quarter },
        }),
        ...(amphoeId && {
          healthUnit: { amphoeId },
        }),
      },
      include: {
        kpi: { include: { category: true } },
      },
    })

    // Group by category
    const categoryMap = new Map<string, { percentages: number[]; name: string }>()

    for (const result of results) {
      const catCode = result.kpi.category.code
      if (!categoryMap.has(catCode)) {
        categoryMap.set(catCode, { 
          percentages: [], 
          name: result.kpi.category.nameTh 
        })
      }
      categoryMap.get(catCode)!.percentages.push(Number(result.percentage))
    }

    // Calculate summary
    const summary: KpiPerformanceSummary[] = Array.from(categoryMap.entries()).map(
      ([code, data]) => ({
        categoryCode: code,
        categoryName: data.name,
        avgPercentage: data.percentages.length > 0 
          ? data.percentages.reduce((a, b) => a + b, 0) / data.percentages.length 
          : 0,
        unitCount: new Set(results.filter(r => r.kpi.category.code === code).map(r => r.healthUnitId)).size,
        minPercentage: data.percentages.length > 0 ? Math.min(...data.percentages) : 0,
        maxPercentage: data.percentages.length > 0 ? Math.max(...data.percentages) : 0,
      })
    )

    return { success: true, data: summary }
  } catch (error) {
    console.error('Error fetching KPI performance summary:', error)
    return { success: false, error: 'Failed to fetch KPI performance summary' }
  }
}

/**
 * Get district performance ranking
 */
export async function getDistrictPerformance(
  fiscalYear: number,
  quarter?: number,
  categoryCode?: string
): Promise<ApiResponse<DistrictPerformance[]>> {
  try {
    const results = await prisma.kpiResult.findMany({
      where: {
        reviewStatus: 'approved',
        fiscalPeriod: {
          fiscalYear,
          ...(quarter && { quarter }),
        },
        ...(categoryCode && {
          kpi: { category: { code: categoryCode } },
        }),
      },
      include: {
        healthUnit: { include: { amphoe: true } },
      },
    })

    // Group by amphoe
    const amphoeMap = new Map<number, { name: string; percentages: number[]; units: Set<number> }>()

    for (const result of results) {
      const amphoeId = result.healthUnit.amphoeId
      if (!amphoeMap.has(amphoeId)) {
        amphoeMap.set(amphoeId, {
          name: result.healthUnit.amphoe.nameTh,
          percentages: [],
          units: new Set(),
        })
      }
      const data = amphoeMap.get(amphoeId)!
      data.percentages.push(Number(result.percentage))
      data.units.add(result.healthUnitId)
    }

    // Calculate and sort by average
    const performances: DistrictPerformance[] = Array.from(amphoeMap.entries())
      .map(([id, data]) => ({
        amphoeId: id,
        amphoeName: data.name,
        avgPercentage: data.percentages.length > 0
          ? data.percentages.reduce((a, b) => a + b, 0) / data.percentages.length
          : 0,
        unitCount: data.units.size,
        rank: 0,
      }))
      .sort((a, b) => b.avgPercentage - a.avgPercentage)
      .map((item, index) => ({ ...item, rank: index + 1 }))

    return { success: true, data: performances }
  } catch (error) {
    console.error('Error fetching district performance:', error)
    return { success: false, error: 'Failed to fetch district performance' }
  }
}

/**
 * Get recent KPI results for dashboard
 */
export async function getRecentKpiResults(limit = 10): Promise<ApiResponse<RecentKpiResult[]>> {
  try {
    const results = await prisma.kpiResult.findMany({
      where: { reviewStatus: 'approved' },
      include: {
        kpi: true,
        healthUnit: { include: { amphoe: true } },
      },
      orderBy: { submittedAt: 'desc' },
      take: limit,
    })

    const transformed: RecentKpiResult[] = results.map((r) => ({
      id: r.id,
      kpiCode: r.kpi.code,
      kpiName: r.kpi.nameTh,
      unitName: r.healthUnit.name,
      amphoeName: r.healthUnit.amphoe.nameTh,
      percentage: Number(r.percentage),
      targetValue: Number(r.targetValue),
      actualValue: Number(r.actualValue),
      reviewStatus: r.reviewStatus,
      submittedAt: r.submittedAt,
    }))

    return { success: true, data: transformed }
  } catch (error) {
    console.error('Error fetching recent KPI results:', error)
    return { success: false, error: 'Failed to fetch recent KPI results' }
  }
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Calculate percentage based on target type
 */
function calculatePercentage(
  targetType: string,
  targetValue: number,
  actualValue: number
): number {
  let percentage: number

  switch (targetType) {
    case 'min':
      // Higher is better (e.g., registration rate)
      percentage = targetValue > 0 ? (actualValue / targetValue) * 100 : 0
      break
    case 'max':
      // Lower is better (e.g., low birth weight rate)
      percentage = targetValue > 0 ? (1 - actualValue / targetValue) * 100 : 0
      break
    case 'exact':
      // Exact match is best
      percentage = targetValue > 0 
        ? Math.max(0, (1 - Math.abs(actualValue - targetValue) / targetValue) * 100) 
        : 0
      break
    default:
      percentage = targetValue > 0 ? (actualValue / targetValue) * 100 : 0
  }

  // Clamp to 0-100
  return Math.round(Math.max(0, Math.min(100, percentage)) * 100) / 100
}
