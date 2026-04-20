'use server'

/**
 * Fiscal Periods Server Actions
 * 
 * Server actions for fiscal period operations including:
 * - Fetching fiscal periods
 * - Period management (for admins)
 */

import { prisma } from '@/lib/db'
import type { ApiResponse } from '@/types'
import { revalidatePath } from 'next/cache'

// ============================================================
// Fiscal Periods Actions
// ============================================================

/**
 * Get all fiscal periods
 */
export async function getFiscalPeriods(): Promise<ApiResponse> {
  try {
    const periods = await prisma.fiscalPeriod.findMany({
      orderBy: [
        { fiscalYear: 'desc' },
        { quarter: 'asc' },
        { month: 'asc' },
      ],
    })

    return { success: true, data: periods }
  } catch (error) {
    console.error('Error fetching fiscal periods:', error)
    return { success: false, error: 'Failed to fetch fiscal periods' }
  }
}

/**
 * Get fiscal periods by year
 */
export async function getFiscalPeriodsByYear(fiscalYear: number): Promise<ApiResponse> {
  try {
    const periods = await prisma.fiscalPeriod.findMany({
      where: { fiscalYear },
      orderBy: { month: 'asc' },
    })

    return { success: true, data: periods }
  } catch (error) {
    console.error('Error fetching fiscal periods by year:', error)
    return { success: false, error: 'Failed to fetch fiscal periods' }
  }
}

/**
 * Get fiscal periods by quarter
 */
export async function getFiscalPeriodsByQuarter(
  fiscalYear: number,
  quarter: number
): Promise<ApiResponse> {
  try {
    const periods = await prisma.fiscalPeriod.findMany({
      where: {
        fiscalYear,
        quarter,
      },
      orderBy: { month: 'asc' },
    })

    return { success: true, data: periods }
  } catch (error) {
    console.error('Error fetching fiscal periods by quarter:', error)
    return { success: false, error: 'Failed to fetch fiscal periods' }
  }
}

/**
 * Get current fiscal period
 * Thai fiscal year starts October (month 10)
 */
export async function getCurrentFiscalPeriod(): Promise<ApiResponse> {
  try {
    const now = new Date()
    const month = now.getMonth() + 1 // JavaScript months are 0-indexed
    
    // Thai fiscal year starts in October
    // Oct-Dec belong to next fiscal year, Jan-Sep belong to current Buddhist year
    let fiscalYear: number
    const buddhistYear = now.getFullYear() + 543 // Convert to Buddhist year
    
    if (month >= 10) {
      fiscalYear = buddhistYear + 1
    } else {
      fiscalYear = buddhistYear
    }

    // Find the period for current month
    const period = await prisma.fiscalPeriod.findFirst({
      where: {
        fiscalYear,
        month,
      },
    })

    // If not found, try to get latest available
    const latestPeriod = period || await prisma.fiscalPeriod.findFirst({
      where: { fiscalYear },
      orderBy: { month: 'desc' },
    })

    return { 
      success: true, 
      data: latestPeriod || { fiscalYear, quarter: 1, month }
    }
  } catch (error) {
    console.error('Error fetching current fiscal period:', error)
    return { success: false, error: 'Failed to fetch current fiscal period' }
  }
}

/**
 * Get available fiscal years
 */
export async function getAvailableFiscalYears(): Promise<ApiResponse<number[]>> {
  try {
    const years = await prisma.fiscalPeriod.findMany({
      select: { fiscalYear: true },
      distinct: ['fiscalYear'],
      orderBy: { fiscalYear: 'desc' },
    })

    return { 
      success: true, 
      data: years.map(y => y.fiscalYear) 
    }
  } catch (error) {
    console.error('Error fetching available fiscal years:', error)
    return { success: false, error: 'Failed to fetch available fiscal years' }
  }
}

/**
 * Close a fiscal period (prevent further edits)
 */
export async function closeFiscalPeriod(
  periodId: number,
  closedBy: number
): Promise<ApiResponse> {
  try {
    const period = await prisma.fiscalPeriod.findUnique({
      where: { id: periodId },
    })

    if (!period) {
      return { success: false, error: 'Fiscal period not found' }
    }

    if (period.isClosed) {
      return { success: false, error: 'Fiscal period is already closed' }
    }

    await prisma.fiscalPeriod.update({
      where: { id: periodId },
      data: {
        isClosed: true,
        closedAt: new Date(),
        closedBy,
      },
    })

    revalidatePath('/admin/periods')

    return { success: true, message: 'Fiscal period closed successfully' }
  } catch (error) {
    console.error('Error closing fiscal period:', error)
    return { success: false, error: 'Failed to close fiscal period' }
  }
}

/**
 * Reopen a closed fiscal period (admin only)
 */
export async function reopenFiscalPeriod(periodId: number): Promise<ApiResponse> {
  try {
    const period = await prisma.fiscalPeriod.findUnique({
      where: { id: periodId },
    })

    if (!period) {
      return { success: false, error: 'Fiscal period not found' }
    }

    if (!period.isClosed) {
      return { success: false, error: 'Fiscal period is already open' }
    }

    await prisma.fiscalPeriod.update({
      where: { id: periodId },
      data: {
        isClosed: false,
        closedAt: null,
        closedBy: null,
      },
    })

    revalidatePath('/admin/periods')

    return { success: true, message: 'Fiscal period reopened successfully' }
  } catch (error) {
    console.error('Error reopening fiscal period:', error)
    return { success: false, error: 'Failed to reopen fiscal period' }
  }
}
