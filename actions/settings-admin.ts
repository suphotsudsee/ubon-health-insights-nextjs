'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { TargetType } from '@prisma/client'
import type { ApiResponse } from '@/types'

const createFiscalYearSchema = z.object({
  fiscalYear: z.number().int().min(2500).max(3000),
})

const updateFiscalPeriodSchema = z.object({
  monthNameTh: z.string().min(1).max(20).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isClosed: z.boolean().optional(),
})

const createKpiDefinitionSchema = z.object({
  categoryId: z.number().int().positive(),
  code: z.string().min(1).max(20),
  nameTh: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional().or(z.literal('')),
  unit: z.string().min(1).max(50),
  targetValue: z.number().min(0).optional(),
  targetType: z.nativeEnum(TargetType),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

const updateKpiDefinitionSchema = createKpiDefinitionSchema.partial()

const createKpiCategorySchema = z.object({
  code: z.string().min(1).max(20),
  nameTh: z.string().min(1).max(100),
  nameEn: z.string().max(100).optional().or(z.literal('')),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

const updateKpiCategorySchema = createKpiCategorySchema.partial()

function getGregorianYearForFiscalMonth(fiscalYear: number, month: number) {
  const baseGregorian = fiscalYear - 543
  return month >= 10 ? baseGregorian - 1 : baseGregorian
}

function getLastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function getQuarterByMonth(month: number) {
  if (month >= 10 && month <= 12) return 1
  if (month >= 1 && month <= 3) return 2
  if (month >= 4 && month <= 6) return 3
  return 4
}

const thaiMonths = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
]

export async function getFiscalYearsWithUsage(): Promise<ApiResponse> {
  try {
    const periods = await prisma.fiscalPeriod.findMany({
      include: {
        _count: {
          select: {
            kpiResults: true,
            financeRecords: true,
            demographics: true,
          },
        },
      },
      orderBy: [{ fiscalYear: 'desc' }, { month: 'asc' }],
    })

    const byYear = new Map<number, {
      fiscalYear: number
      periodCount: number
      closedCount: number
      hasUsage: boolean
      totalKpiResults: number
      totalFinanceRecords: number
      totalDemographics: number
    }>()

    for (const period of periods) {
      const current = byYear.get(period.fiscalYear) ?? {
        fiscalYear: period.fiscalYear,
        periodCount: 0,
        closedCount: 0,
        hasUsage: false,
        totalKpiResults: 0,
        totalFinanceRecords: 0,
        totalDemographics: 0,
      }

      current.periodCount += 1
      current.closedCount += period.isClosed ? 1 : 0
      current.totalKpiResults += period._count.kpiResults
      current.totalFinanceRecords += period._count.financeRecords
      current.totalDemographics += period._count.demographics
      current.hasUsage = current.totalKpiResults + current.totalFinanceRecords + current.totalDemographics > 0

      byYear.set(period.fiscalYear, current)
    }

    return { success: true, data: Array.from(byYear.values()) }
  } catch (error) {
    console.error('Error fetching fiscal years with usage:', error)
    return { success: false, error: 'Failed to fetch fiscal years' }
  }
}

export async function createFiscalYear(data: unknown): Promise<ApiResponse> {
  try {
    const validated = createFiscalYearSchema.parse(data)
    const months = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const existingPeriods = await prisma.fiscalPeriod.findMany({
      where: { fiscalYear: validated.fiscalYear },
      select: { month: true },
    })
    const existingMonths = new Set(existingPeriods.map((period) => period.month))
    const missingMonths = months.filter((month) => !existingMonths.has(month))

    if (missingMonths.length === 0) {
      return { success: true, message: 'Fiscal year already complete' }
    }

    await prisma.$transaction(
      missingMonths.map((month) => {
        const year = getGregorianYearForFiscalMonth(validated.fiscalYear, month)
        const lastDay = getLastDayOfMonth(year, month)

        return prisma.fiscalPeriod.create({
          data: {
            fiscalYear: validated.fiscalYear,
            quarter: getQuarterByMonth(month),
            month,
            monthNameTh: thaiMonths[month - 1],
            startDate: new Date(`${year}-${String(month).padStart(2, '0')}-01`),
            endDate: new Date(`${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`),
          },
        })
      })
    )

    revalidatePath('/settings')
    revalidateTag('fiscal-periods', 'max')

    return {
      success: true,
      message: existingPeriods.length > 0 ? 'Missing fiscal periods created successfully' : 'Fiscal year created successfully',
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error creating fiscal year:', error)
    return { success: false, error: 'Failed to create fiscal year' }
  }
}

export async function updateFiscalPeriodAdmin(id: number, data: unknown): Promise<ApiResponse> {
  try {
    const validated = updateFiscalPeriodSchema.parse(data)
    const existing = await prisma.fiscalPeriod.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'Fiscal period not found' }
    }

    await prisma.fiscalPeriod.update({
      where: { id },
      data: {
        monthNameTh: validated.monthNameTh,
        startDate: validated.startDate ? new Date(validated.startDate) : undefined,
        endDate: validated.endDate ? new Date(validated.endDate) : undefined,
        isClosed: validated.isClosed,
        closedAt: validated.isClosed === true ? new Date() : validated.isClosed === false ? null : undefined,
        closedBy: validated.isClosed === false ? null : undefined,
      },
    })

    revalidatePath('/settings')
    revalidateTag('fiscal-periods', 'max')

    return { success: true, message: 'Fiscal period updated successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error updating fiscal period:', error)
    return { success: false, error: 'Failed to update fiscal period' }
  }
}

export async function deleteFiscalYear(fiscalYear: number): Promise<ApiResponse> {
  try {
    const periods = await prisma.fiscalPeriod.findMany({
      where: { fiscalYear },
      include: {
        _count: {
          select: {
            kpiResults: true,
            financeRecords: true,
            demographics: true,
          },
        },
      },
    })

    if (periods.length === 0) {
      return { success: false, error: 'Fiscal year not found' }
    }

    const usage = periods.reduce(
      (sum, period) => sum + period._count.kpiResults + period._count.financeRecords + period._count.demographics,
      0
    )

    if (usage > 0) {
      return { success: false, error: 'Cannot delete fiscal year with existing KPI, finance, or demographic data' }
    }

    await prisma.fiscalPeriod.deleteMany({
      where: { fiscalYear },
    })

    revalidatePath('/settings')
    revalidateTag('fiscal-periods', 'max')

    return { success: true, message: 'Fiscal year deleted successfully' }
  } catch (error) {
    console.error('Error deleting fiscal year:', error)
    return { success: false, error: 'Failed to delete fiscal year' }
  }
}

export async function getKpiDefinitionsAdmin(): Promise<ApiResponse> {
  try {
    const definitions = await prisma.kpiDefinition.findMany({
      include: {
        category: true,
        _count: {
          select: { results: true },
        },
      },
      orderBy: [{ category: { displayOrder: 'asc' } }, { displayOrder: 'asc' }],
    })

    const categories = await prisma.kpiCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    })

    return { success: true, data: { definitions, categories } }
  } catch (error) {
    console.error('Error fetching KPI master admin data:', error)
    return { success: false, error: 'Failed to fetch KPI master data' }
  }
}

export async function getKpiCategoriesAdmin(): Promise<ApiResponse> {
  try {
    const categories = await prisma.kpiCategory.findMany({
      include: {
        _count: {
          select: {
            definitions: true,
          },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { code: 'asc' }],
    })

    return { success: true, data: categories }
  } catch (error) {
    console.error('Error fetching KPI categories:', error)
    return { success: false, error: 'Failed to fetch KPI categories' }
  }
}

export async function createKpiCategoryAdmin(data: unknown): Promise<ApiResponse> {
  try {
    const validated = createKpiCategorySchema.parse(data)

    const existing = await prisma.kpiCategory.findUnique({ where: { code: validated.code } })
    if (existing) {
      return { success: false, error: 'KPI category code already exists' }
    }

    await prisma.kpiCategory.create({
      data: {
        code: validated.code,
        nameTh: validated.nameTh,
        nameEn: validated.nameEn || null,
        displayOrder: validated.displayOrder ?? 0,
        isActive: validated.isActive ?? true,
      },
    })

    revalidatePath('/settings')
    revalidateTag('kpi-categories', 'max')
    revalidateTag('kpi-definitions', 'max')

    return { success: true, message: 'KPI category created successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error creating KPI category:', error)
    return { success: false, error: 'Failed to create KPI category' }
  }
}

export async function updateKpiCategoryAdmin(id: number, data: unknown): Promise<ApiResponse> {
  try {
    const validated = updateKpiCategorySchema.parse(data)
    const existing = await prisma.kpiCategory.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'KPI category not found' }
    }

    if (validated.code && validated.code !== existing.code) {
      const duplicate = await prisma.kpiCategory.findUnique({ where: { code: validated.code } })
      if (duplicate) {
        return { success: false, error: 'KPI category code already exists' }
      }
    }

    await prisma.kpiCategory.update({
      where: { id },
      data: {
        code: validated.code,
        nameTh: validated.nameTh,
        nameEn: validated.nameEn === '' ? null : validated.nameEn,
        displayOrder: validated.displayOrder,
        isActive: validated.isActive,
      },
    })

    revalidatePath('/settings')
    revalidateTag('kpi-categories', 'max')
    revalidateTag('kpi-definitions', 'max')

    return { success: true, message: 'KPI category updated successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error updating KPI category:', error)
    return { success: false, error: 'Failed to update KPI category' }
  }
}

export async function deleteKpiCategoryAdmin(id: number): Promise<ApiResponse> {
  try {
    const existing = await prisma.kpiCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            definitions: true,
          },
        },
      },
    })

    if (!existing) {
      return { success: false, error: 'KPI category not found' }
    }

    if (existing._count.definitions > 0) {
      return { success: false, error: 'Cannot delete KPI category with existing KPI definitions' }
    }

    await prisma.kpiCategory.delete({ where: { id } })

    revalidatePath('/settings')
    revalidateTag('kpi-categories', 'max')
    revalidateTag('kpi-definitions', 'max')

    return { success: true, message: 'KPI category deleted successfully' }
  } catch (error) {
    console.error('Error deleting KPI category:', error)
    return { success: false, error: 'Failed to delete KPI category' }
  }
}

export async function createKpiDefinitionAdmin(data: unknown): Promise<ApiResponse> {
  try {
    const validated = createKpiDefinitionSchema.parse(data)
    const existing = await prisma.kpiDefinition.findUnique({ where: { code: validated.code } })

    if (existing) {
      return { success: false, error: 'KPI code already exists' }
    }

    await prisma.kpiDefinition.create({
      data: {
        categoryId: validated.categoryId,
        code: validated.code,
        nameTh: validated.nameTh,
        nameEn: validated.nameEn || null,
        unit: validated.unit,
        targetValue: validated.targetValue,
        targetType: validated.targetType,
        displayOrder: validated.displayOrder ?? 0,
        isActive: validated.isActive ?? true,
      },
    })

    revalidatePath('/settings')
    revalidateTag('kpi-definitions', 'max')

    return { success: true, message: 'KPI definition created successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error creating KPI definition:', error)
    return { success: false, error: 'Failed to create KPI definition' }
  }
}

export async function updateKpiDefinitionAdmin(id: number, data: unknown): Promise<ApiResponse> {
  try {
    const validated = updateKpiDefinitionSchema.parse(data)
    const existing = await prisma.kpiDefinition.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'KPI definition not found' }
    }

    if (validated.code && validated.code !== existing.code) {
      const duplicate = await prisma.kpiDefinition.findUnique({ where: { code: validated.code } })
      if (duplicate) {
        return { success: false, error: 'KPI code already exists' }
      }
    }

    await prisma.kpiDefinition.update({
      where: { id },
      data: {
        categoryId: validated.categoryId,
        code: validated.code,
        nameTh: validated.nameTh,
        nameEn: validated.nameEn === '' ? null : validated.nameEn,
        unit: validated.unit,
        targetValue: validated.targetValue,
        targetType: validated.targetType,
        displayOrder: validated.displayOrder,
        isActive: validated.isActive,
      },
    })

    revalidatePath('/settings')
    revalidateTag('kpi-definitions', 'max')

    return { success: true, message: 'KPI definition updated successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error updating KPI definition:', error)
    return { success: false, error: 'Failed to update KPI definition' }
  }
}

export async function deleteKpiDefinitionAdmin(id: number): Promise<ApiResponse> {
  try {
    const existing = await prisma.kpiDefinition.findUnique({
      where: { id },
      include: { _count: { select: { results: true } } },
    })

    if (!existing) {
      return { success: false, error: 'KPI definition not found' }
    }

    if (existing._count.results > 0) {
      return { success: false, error: 'Cannot delete KPI definition with existing KPI results' }
    }

    await prisma.kpiDefinition.update({
      where: { id },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
    })

    revalidatePath('/settings')
    revalidateTag('kpi-definitions', 'max')

    return { success: true, message: 'KPI definition deleted successfully' }
  } catch (error) {
    console.error('Error deleting KPI definition:', error)
    return { success: false, error: 'Failed to delete KPI definition' }
  }
}
