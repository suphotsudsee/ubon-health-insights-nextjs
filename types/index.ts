/**
 * Type definitions for Ubon Health Insights
 * Re-exports Prisma types and adds custom application types
 */

// Re-export Prisma types
export type {
  // Models
  DimAmphoe,
  DimTambon,
  KpiCategory,
  KpiDefinition,
  FiscalPeriod,
  HealthUnit,
  User,
  KpiResult,
  FinanceRecord,
  HealthUnitDemographic,
  AuditLog,
} from '@prisma/client'

export {
  // Enums
  TargetType,
  UnitStatus,
  UserRole,
  ReviewStatus,
  AuditAction,

  // Prisma namespace for advanced types
  Prisma,
} from '@prisma/client'

// ============================================================
// DTOs (Data Transfer Objects)
// ============================================================

export interface CreateKpiResultInput {
  kpiId: number
  healthUnitId: number
  fiscalPeriodId: number
  targetValue: number
  actualValue: number
  notes?: string
  evidenceUrl?: string
}

export interface UpdateKpiResultInput {
  targetValue?: number
  actualValue?: number
  notes?: string
  evidenceUrl?: string
}

export interface CreateFinanceRecordInput {
  healthUnitId: number
  fiscalPeriodId: number
  income: number
  expense: number
  incomeBreakdown?: Record<string, number>
  expenseBreakdown?: Record<string, number>
  openingDebit?: number
  openingCredit?: number
  movementDebit?: number
  movementCredit?: number
  closingDebit?: number
  closingCredit?: number
  trialBalanceRows?: Array<Record<string, unknown>>
  notes?: string
  recorder?: string
}

export interface UpdateFinanceRecordInput {
  income?: number
  expense?: number
  incomeBreakdown?: Record<string, number>
  expenseBreakdown?: Record<string, number>
  openingDebit?: number
  openingCredit?: number
  movementDebit?: number
  movementCredit?: number
  closingDebit?: number
  closingCredit?: number
  trialBalanceRows?: Array<Record<string, unknown>>
  notes?: string
  recorder?: string
}

export interface CreateUserInput {
  email: string
  password: string
  name: string
  role?: 'admin' | 'manager' | 'staff' | 'viewer'
  healthUnitId?: number
}

export interface UpdateUserInput {
  name?: string
  role?: 'admin' | 'manager' | 'staff' | 'viewer'
  healthUnitId?: number | null
  isActive?: boolean
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export interface KpiResultWithRelations {
  id: number
  kpiId: number
  kpiCode: string
  kpiNameTh: string
  kpiNameEn: string | null
  categoryId: number
  categoryCode: string
  categoryNameTh: string
  healthUnitId: number
  unitCode: string
  unitName: string
  amphoeId: number
  amphoeName: string
  fiscalPeriodId: number
  fiscalYear: number
  quarter: number
  month: number
  monthNameTh: string
  targetValue: number
  actualValue: number
  percentage: number
  notes: string | null
  evidenceUrl: string | null
  reviewStatus: 'draft' | 'submitted' | 'approved' | 'rejected'
  submittedAt: Date | null
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface FinanceRecordWithRelations {
  id: number
  healthUnitId: number
  unitCode: string
  unitName: string
  amphoeName: string
  fiscalPeriodId: number
  fiscalYear: number
  month: number
  monthNameTh: string
  income: number
  expense: number
  balance: number
  incomeBreakdown: Record<string, number> | null
  expenseBreakdown: Record<string, number> | null
  openingDebit: number
  openingCredit: number
  movementDebit: number
  movementCredit: number
  closingDebit: number
  closingCredit: number
  trialBalanceRows: Array<Record<string, unknown>> | null
  notes: string | null
  recorder: string | null
  submittedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface HealthUnitWithRelations {
  id: number
  code: string
  name: string
  shortName: string | null
  amphoeId: number
  amphoeName: string
  tambonId: number | null
  tambonName: string | null
  moo: string | null
  affiliation: string | null
  email: string | null
  phone: string | null
  transferYear: number | null
  unitSize: string | null
  cupCode: string | null
  cupName: string | null
  localAuthority: string | null
  province: string | null
  ucPopulation66: number | null
  ucPopulation67: number | null
  ucPopulation68: number | null
  templeCount: number
  primarySchoolCount: number
  opportunitySchoolCount: number
  secondarySchoolCount: number
  childDevelopmentCenterCount: number
  healthStationCount: number
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}

export interface HealthUnitWithDemographics extends HealthUnitWithRelations {
  demographics: {
    totalPopulation: number | null
    male: number | null
    female: number | null
    elderlyPopulation: number | null
    villages: number | null
    households: number | null
    healthVolunteers: number | null
  } | null
}

// ============================================================
// Dashboard Types
// ============================================================

export interface DashboardStats {
  totalUnits: number
  totalPopulation: number
  totalVillages: number
  totalHouseholds: number
  totalVolunteers: number
}

export interface KpiPerformanceSummary {
  categoryCode: string
  categoryName: string
  avgPercentage: number
  unitCount: number
  minPercentage: number
  maxPercentage: number
}

export interface DistrictPerformance {
  amphoeId: number
  amphoeName: string
  avgPercentage: number
  unitCount: number
  rank: number
}

export interface RecentKpiResult {
  id: number
  kpiCode: string
  kpiName: string
  unitName: string
  amphoeName: string
  percentage: number
  targetValue: number
  actualValue: number
  reviewStatus: 'draft' | 'submitted' | 'approved' | 'rejected'
  submittedAt: Date | null
}

// ============================================================
// Filter Types
// ============================================================

export interface KpiResultFilters {
  fiscalYear?: number
  quarter?: number
  amphoeId?: number
  healthUnitId?: number
  kpiId?: number
  categoryId?: number
  reviewStatus?: 'draft' | 'submitted' | 'approved' | 'rejected'
  minPercentage?: number
  maxPercentage?: number
}

export interface FinanceRecordFilters {
  fiscalYear?: number
  month?: number
  amphoeId?: number
  healthUnitId?: number
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// ============================================================
// Auth Types
// ============================================================

export interface AuthUser {
  id: number
  email: string
  name: string
  role: 'admin' | 'manager' | 'staff' | 'viewer'
  healthUnitId: number | null
  healthUnitName?: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SessionUser extends AuthUser {
  // Extended session properties
  iat: number
  exp: number
}

// ============================================================
// Audit Types
// ============================================================

export interface AuditEntry {
  tableName: string
  recordId: string
  action: 'INSERT' | 'UPDATE' | 'DELETE'
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  changedBy: number | null
  ipAddress: string | null
  userAgent: string | null
}

// ============================================================
// Color coding for KPI performance
// ============================================================

export type PerformanceLevel = 'critical' | 'low' | 'medium' | 'good' | 'excellent'

export function getPerformanceLevel(percentage: number): PerformanceLevel {
  if (percentage <= 20) return 'critical'
  if (percentage <= 40) return 'low'
  if (percentage <= 60) return 'medium'
  if (percentage <= 80) return 'good'
  return 'excellent'
}

export const performanceColors: Record<PerformanceLevel, { bg: string; text: string; hex: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', hex: '#ef4444' },
  low: { bg: 'bg-orange-100', text: 'text-orange-800', hex: '#f97316' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', hex: '#eab308' },
  good: { bg: 'bg-green-100', text: 'text-green-800', hex: '#22c55e' },
  excellent: { bg: 'bg-blue-100', text: 'text-blue-800', hex: '#0ea5e9' },
}
