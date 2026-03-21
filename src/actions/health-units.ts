'use server'

/**
 * Health Units Server Actions
 * 
 * Server actions for health unit operations including:
 * - Fetching health units with filtering
 * - Demographic data management
 * - Unit CRUD operations
 */

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import type { 
  HealthUnitWithRelations, 
  HealthUnitWithDemographics,
  DashboardStats,
  ApiResponse 
} from '@/types'
import { Prisma } from '@prisma/client'

// ============================================================
// Validation Schemas
// ============================================================

const createHealthUnitSchema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  shortName: z.string().max(100).optional(),
  amphoeId: z.number().int().positive(),
  tambonId: z.number().int().positive().optional(),
  moo: z.string().max(10).optional(),
  affiliation: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
})

const updateHealthUnitSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(200).optional(),
  shortName: z.string().max(100).optional(),
  amphoeId: z.number().int().positive().optional(),
  tambonId: z.number().int().positive().nullable().optional(),
  moo: z.string().max(10).optional(),
  affiliation: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

const createDemographicsSchema = z.object({
  healthUnitId: z.number().int().positive(),
  fiscalPeriodId: z.number().int().positive(),
  male: z.number().int().nonnegative().optional(),
  female: z.number().int().nonnegative().optional(),
  totalPopulation: z.number().int().nonnegative().optional(),
  villages: z.number().int().nonnegative().optional(),
  households: z.number().int().nonnegative().optional(),
  healthVolunteers: z.number().int().nonnegative().optional(),
})

// ============================================================
// Health Units Actions
// ============================================================

/**
 * Get all health units (with optional filtering)
 */
export async function getHealthUnits(
  filters: {
    amphoeId?: number
    status?: 'active' | 'inactive'
    search?: string
  } = {}
): Promise<ApiResponse<HealthUnitWithRelations[]>> {
  try {
    const { amphoeId, status, search } = filters

    const where: Prisma.HealthUnitWhereInput = {
      isDeleted: false,
      ...(status && { status }),
      ...(amphoeId && { amphoeId }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
          { shortName: { contains: search } },
        ],
      }),
    }

    const units = await prisma.healthUnit.findMany({
      where,
      include: {
        amphoe: true,
        tambon: true,
      },
      orderBy: [{ amphoe: { nameTh: 'asc' } }, { name: 'asc' }],
    })

    const transformed: HealthUnitWithRelations[] = units.map((u) => ({
      id: u.id,
      code: u.code,
      name: u.name,
      shortName: u.shortName,
      amphoeId: u.amphoeId,
      amphoeName: u.amphoe.nameTh,
      tambonId: u.tambonId,
      tambonName: u.tambon?.nameTh || null,
      moo: u.moo,
      affiliation: u.affiliation,
      email: u.email,
      phone: u.phone,
      status: u.status,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }))

    return { success: true, data: transformed }
  } catch (error) {
    console.error('Error fetching health units:', error)
    return { success: false, error: 'Failed to fetch health units' }
  }
}

/**
 * Get a single health unit by ID
 */
export async function getHealthUnit(id: number): Promise<ApiResponse<HealthUnitWithRelations>> {
  try {
    const unit = await prisma.healthUnit.findUnique({
      where: { id },
      include: {
        amphoe: true,
        tambon: true,
      },
    })

    if (!unit) {
      return { success: false, error: 'Health unit not found' }
    }

    const transformed: HealthUnitWithRelations = {
      id: unit.id,
      code: unit.code,
      name: unit.name,
      shortName: unit.shortName,
      amphoeId: unit.amphoeId,
      amphoeName: unit.amphoe.nameTh,
      tambonId: unit.tambonId,
      tambonName: unit.tambon?.nameTh || null,
      moo: unit.moo,
      affiliation: unit.affiliation,
      email: unit.email,
      phone: unit.phone,
      status: unit.status,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    }

    return { success: true, data: transformed }
  } catch (error) {
    console.error('Error fetching health unit:', error)
    return { success: false, error: 'Failed to fetch health unit' }
  }
}

/**
 * Get health unit with demographics
 */
export async function getHealthUnitWithDemographics(
  id: number,
  fiscalPeriodId?: number
): Promise<ApiResponse<HealthUnitWithDemographics>> {
  try {
    const unit = await prisma.healthUnit.findUnique({
      where: { id },
      include: {
        amphoe: true,
        tambon: true,
        demographics: {
          where: fiscalPeriodId ? { fiscalPeriodId } : undefined,
          orderBy: { fiscalPeriodId: 'desc' },
          take: 1,
        },
      },
    })

    if (!unit) {
      return { success: false, error: 'Health unit not found' }
    }

    const latestDemo = unit.demographics[0]

    const transformed: HealthUnitWithDemographics = {
      id: unit.id,
      code: unit.code,
      name: unit.name,
      shortName: unit.shortName,
      amphoeId: unit.amphoeId,
      amphoeName: unit.amphoe.nameTh,
      tambonId: unit.tambonId,
      tambonName: unit.tambon?.nameTh || null,
      moo: unit.moo,
      affiliation: unit.affiliation,
      email: unit.email,
      phone: unit.phone,
      status: unit.status,
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      demographics: latestDemo ? {
        totalPopulation: latestDemo.totalPopulation,
        male: latestDemo.male,
        female: latestDemo.female,
        villages: latestDemo.villages,
        households: latestDemo.households,
        healthVolunteers: latestDemo.healthVolunteers,
      } : null,
    }

    return { success: true, data: transformed }
  } catch (error) {
    console.error('Error fetching health unit with demographics:', error)
    return { success: false, error: 'Failed to fetch health unit' }
  }
}

/**
 * Create a new health unit (admin only)
 */
export async function createHealthUnit(data: z.infer<typeof createHealthUnitSchema>): Promise<ApiResponse<{ id: number }>> {
  try {
    const validated = createHealthUnitSchema.parse(data)

    // Check if code already exists
    const existing = await prisma.healthUnit.findUnique({
      where: { code: validated.code },
    })

    if (existing) {
      return { success: false, error: 'Health unit with this code already exists' }
    }

    const unit = await prisma.healthUnit.create({
      data: {
        code: validated.code,
        name: validated.name,
        shortName: validated.shortName || null,
        amphoeId: validated.amphoeId,
        tambonId: validated.tambonId || null,
        moo: validated.moo || null,
        affiliation: validated.affiliation || 'อบจ.อุบลราชธานี',
        email: validated.email || null,
        phone: validated.phone || null,
        status: 'active',
      },
    })

    revalidatePath('/basic-info')
    revalidateTag('health-units', 'max')

    return { success: true, data: { id: unit.id }, message: 'Health unit created successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error creating health unit:', error)
    return { success: false, error: 'Failed to create health unit' }
  }
}

/**
 * Update a health unit (admin only)
 */
export async function updateHealthUnit(
  id: number,
  data: z.infer<typeof updateHealthUnitSchema>
): Promise<ApiResponse> {
  try {
    const validated = updateHealthUnitSchema.parse(data)

    const existing = await prisma.healthUnit.findUnique({ where: { id } })

    if (!existing) {
      return { success: false, error: 'Health unit not found' }
    }

    if (validated.code && validated.code !== existing.code) {
      const duplicate = await prisma.healthUnit.findUnique({
        where: { code: validated.code },
      })

      if (duplicate) {
        return { success: false, error: 'Health unit with this code already exists' }
      }
    }

    await prisma.healthUnit.update({
      where: { id },
      data: validated,
    })

    revalidatePath('/basic-info')
    revalidateTag('health-units', 'max')

    return { success: true, message: 'Health unit updated successfully' }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error updating health unit:', error)
    return { success: false, error: 'Failed to update health unit' }
  }
}

/**
 * Soft delete a health unit (admin only)
 */
export async function deleteHealthUnit(id: number): Promise<ApiResponse> {
  try {
    const existing = await prisma.healthUnit.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            kpiResults: true,
            financeRecords: true,
            demographics: true,
          },
        },
      },
    })

    if (!existing) {
      return { success: false, error: 'Health unit not found' }
    }

    const referenceCount =
      existing._count.users +
      existing._count.kpiResults +
      existing._count.financeRecords +
      existing._count.demographics

    if (referenceCount > 0) {
      return {
        success: false,
        error: 'Cannot delete health unit because it is still referenced by users or operational data',
      }
    }

    await prisma.healthUnit.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    })

    revalidatePath('/basic-info')
    revalidateTag('health-units', 'max')

    return { success: true, message: 'Health unit deleted successfully' }
  } catch (error) {
    console.error('Error deleting health unit:', error)
    return { success: false, error: 'Failed to delete health unit' }
  }
}

// ============================================================
// Demographics Actions
// ============================================================

/**
 * Get demographics for a health unit
 */
export async function getDemographics(
  healthUnitId: number,
  fiscalPeriodId?: number
): Promise<ApiResponse> {
  try {
    const where: Prisma.HealthUnitDemographicWhereInput = {
      healthUnitId,
      ...(fiscalPeriodId && { fiscalPeriodId }),
    }

    const demographics = await prisma.healthUnitDemographic.findMany({
      where,
      include: { fiscalPeriod: true },
      orderBy: { fiscalPeriod: { fiscalYear: 'desc' } },
    })

    return { success: true, data: demographics }
  } catch (error) {
    console.error('Error fetching demographics:', error)
    return { success: false, error: 'Failed to fetch demographics' }
  }
}

/**
 * Create or update demographics
 */
export async function upsertDemographics(
  data: z.infer<typeof createDemographicsSchema>
): Promise<ApiResponse<{ id: number }>> {
  try {
    const validated = createDemographicsSchema.parse(data)

    const demographic = await prisma.healthUnitDemographic.upsert({
      where: {
        healthUnitId_fiscalPeriodId: {
          healthUnitId: validated.healthUnitId,
          fiscalPeriodId: validated.fiscalPeriodId,
        },
      },
      create: {
        healthUnitId: validated.healthUnitId,
        fiscalPeriodId: validated.fiscalPeriodId,
        male: validated.male,
        female: validated.female,
        totalPopulation: validated.totalPopulation,
        villages: validated.villages,
        households: validated.households,
        healthVolunteers: validated.healthVolunteers,
      },
      update: {
        male: validated.male,
        female: validated.female,
        totalPopulation: validated.totalPopulation,
        villages: validated.villages,
        households: validated.households,
        healthVolunteers: validated.healthVolunteers,
      },
    })

    revalidatePath('/basic-info')
    revalidateTag('demographics', 'max')

    return { 
      success: true, 
      data: { id: demographic.id }, 
      message: 'Demographics saved successfully' 
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation error' }
    }
    console.error('Error saving demographics:', error)
    return { success: false, error: 'Failed to save demographics' }
  }
}

// ============================================================
// Dashboard Actions
// ============================================================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(
  fiscalPeriodId?: number
): Promise<ApiResponse<DashboardStats>> {
  try {
    // Get total active units
    const totalUnits = await prisma.healthUnit.count({
      where: { status: 'active', isDeleted: false },
    })

    // Get demographics for the period
    const where: Prisma.HealthUnitDemographicWhereInput = {}
    if (fiscalPeriodId) {
      where.fiscalPeriodId = fiscalPeriodId
    }

    const demographics = await prisma.healthUnitDemographic.findMany({
      where,
      select: {
        totalPopulation: true,
        villages: true,
        households: true,
        healthVolunteers: true,
      },
    })

    // Aggregate totals
    const stats: DashboardStats = {
      totalUnits,
      totalPopulation: demographics.reduce((sum, d) => sum + (d.totalPopulation || 0), 0),
      totalVillages: demographics.reduce((sum, d) => sum + (d.villages || 0), 0),
      totalHouseholds: demographics.reduce((sum, d) => sum + (d.households || 0), 0),
      totalVolunteers: demographics.reduce((sum, d) => sum + (d.healthVolunteers || 0), 0),
    }

    return { success: true, data: stats }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return { success: false, error: 'Failed to fetch dashboard statistics' }
  }
}

/**
 * Get reference data (districts, etc.)
 */
export async function getDistricts(): Promise<ApiResponse> {
  try {
    const districts = await prisma.dimAmphoe.findMany({
      orderBy: { nameTh: 'asc' },
    })

    return { success: true, data: districts }
  } catch (error) {
    console.error('Error fetching districts:', error)
    return { success: false, error: 'Failed to fetch districts' }
  }
}

/**
 * Get subdistricts by district
 */
export async function getSubdistricts(amphoeId?: number): Promise<ApiResponse> {
  try {
    const where: Prisma.DimTambonWhereInput = {}
    if (amphoeId) {
      where.amphoeId = amphoeId
    }

    const subdistricts = await prisma.dimTambon.findMany({
      where,
      orderBy: { nameTh: 'asc' },
    })

    return { success: true, data: subdistricts }
  } catch (error) {
    console.error('Error fetching subdistricts:', error)
    return { success: false, error: 'Failed to fetch subdistricts' }
  }
}
