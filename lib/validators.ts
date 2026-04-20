/**
 * Zod validation schemas for API input validation
 */

import { z } from 'zod'

// ============================================================
// Common Schemas
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const idSchema = z.coerce.number().int().positive()

// ============================================================
// KPI Schemas
// ============================================================

export const createKpiResultSchema = z.object({
  kpiId: z.coerce.number().int().positive('KPI ID is required'),
  healthUnitId: z.coerce.number().int().positive('Health unit ID is required'),
  fiscalPeriodId: z.coerce.number().int().positive('Fiscal period ID is required'),
  targetValue: z.coerce.number().min(0, 'Target value must be non-negative'),
  actualValue: z.coerce.number().min(0, 'Actual value must be non-negative'),
  notes: z.string().max(2000).optional(),
  evidenceUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
})

export const updateKpiResultSchema = z.object({
  targetValue: z.coerce.number().min(0).optional(),
  actualValue: z.coerce.number().min(0).optional(),
  notes: z.string().max(2000).optional(),
  evidenceUrl: z.string().url().optional().or(z.literal('')),
  reviewStatus: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
})

export const kpiResultFiltersSchema = z.object({
  fiscalYear: z.coerce.number().int().positive().optional(),
  quarter: z.coerce.number().int().min(1).max(4).optional(),
  amphoeId: z.coerce.number().int().positive().optional(),
  healthUnitId: z.coerce.number().int().positive().optional(),
  kpiId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  reviewStatus: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
  minPercentage: z.coerce.number().min(0).max(100).optional(),
  maxPercentage: z.coerce.number().min(0).max(100).optional(),
})

// ============================================================
// Finance Schemas
// ============================================================

export const createFinanceRecordSchema = z.object({
  healthUnitId: z.coerce.number().int().positive('Health unit ID is required'),
  fiscalPeriodId: z.coerce.number().int().positive('Fiscal period ID is required'),
  income: z.coerce.number().min(0, 'Income must be non-negative'),
  expense: z.coerce.number().min(0, 'Expense must be non-negative'),
  incomeBreakdown: z.record(z.string(), z.coerce.number()).optional(),
  expenseBreakdown: z.record(z.string(), z.coerce.number()).optional(),
  notes: z.string().max(2000).optional(),
  recorder: z.string().max(100).optional(),
})

export const updateFinanceRecordSchema = z.object({
  income: z.coerce.number().min(0).optional(),
  expense: z.coerce.number().min(0).optional(),
  incomeBreakdown: z.record(z.string(), z.coerce.number()).optional(),
  expenseBreakdown: z.record(z.string(), z.coerce.number()).optional(),
  notes: z.string().max(2000).optional(),
  recorder: z.string().max(100).optional(),
})

export const financeRecordFiltersSchema = z.object({
  fiscalYear: z.coerce.number().int().positive().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  amphoeId: z.coerce.number().int().positive().optional(),
  healthUnitId: z.coerce.number().int().positive().optional(),
})

// ============================================================
// Health Unit Schemas
// ============================================================

export const createHealthUnitSchema = z.object({
  code: z.string().min(1, 'Code is required').max(20),
  name: z.string().min(1, 'Name is required').max(200),
  shortName: z.string().max(100).optional(),
  amphoeId: z.coerce.number().int().positive('District is required'),
  tambonId: z.coerce.number().int().positive().optional(),
  moo: z.string().max(10).optional(),
  affiliation: z.string().max(100).optional(),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
})

export const updateHealthUnitSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  shortName: z.string().max(100).optional(),
  amphoeId: z.coerce.number().int().positive().optional(),
  tambonId: z.coerce.number().int().positive().nullable().optional(),
  moo: z.string().max(10).optional(),
  affiliation: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

export const healthUnitFiltersSchema = z.object({
  amphoeId: z.coerce.number().int().positive().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().max(200).optional(),
})

// ============================================================
// Demographics Schemas
// ============================================================

export const createDemographicsSchema = z.object({
  healthUnitId: z.coerce.number().int().positive('Health unit ID is required'),
  fiscalPeriodId: z.coerce.number().int().positive('Fiscal period ID is required'),
  male: z.coerce.number().int().nonnegative().optional(),
  female: z.coerce.number().int().nonnegative().optional(),
  totalPopulation: z.coerce.number().int().nonnegative().optional(),
  villages: z.coerce.number().int().nonnegative().optional(),
  households: z.coerce.number().int().nonnegative().optional(),
  healthVolunteers: z.coerce.number().int().nonnegative().optional(),
})

// ============================================================
// User Schemas
// ============================================================

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']).default('viewer'),
  healthUnitId: z.coerce.number().int().positive().optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  role: z.enum(['admin', 'manager', 'staff', 'viewer']).optional(),
  healthUnitId: z.coerce.number().int().positive().nullable().optional(),
  isActive: z.boolean().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

// ============================================================
// Fiscal Period Schemas
// ============================================================

export const createFiscalPeriodSchema = z.object({
  fiscalYear: z.coerce.number().int().min(2500).max(2600),
  quarter: z.coerce.number().int().min(1).max(4),
  month: z.coerce.number().int().min(1).max(12),
  monthNameTh: z.string().min(1).max(20),
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
})

// ============================================================
// Type exports
// ============================================================

export type CreateKpiResultInput = z.infer<typeof createKpiResultSchema>
export type UpdateKpiResultInput = z.infer<typeof updateKpiResultSchema>
export type KpiResultFilters = z.infer<typeof kpiResultFiltersSchema>

export type CreateFinanceRecordInput = z.infer<typeof createFinanceRecordSchema>
export type UpdateFinanceRecordInput = z.infer<typeof updateFinanceRecordSchema>
export type FinanceRecordFilters = z.infer<typeof financeRecordFiltersSchema>

export type CreateHealthUnitInput = z.infer<typeof createHealthUnitSchema>
export type UpdateHealthUnitInput = z.infer<typeof updateHealthUnitSchema>

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>