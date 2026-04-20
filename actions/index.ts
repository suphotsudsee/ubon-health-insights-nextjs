'use server'

/**
 * Index export for Server Actions
 * 
 * This file re-exports all server actions for convenient importing.
 * 
 * Usage:
 * ```typescript
 * import { 
 *   getKpiResults, 
 *   createKpiResult,
 *   getFinanceRecords,
 *   verifyCredentials
 * } from '@/actions'
 * ```
 */

// KPI Actions
export {
  // Definitions
  getKpiDefinitions,
  getKpiDefinitionsByCategory,
  getKpiDefinition,
  // Results
  getKpiResults,
  getKpiResult,
  createKpiResult,
  updateKpiResult,
  deleteKpiResult,
  submitKpiResult,
  reviewKpiResult,
  // Aggregations
  getKpiPerformanceSummary,
  getDistrictPerformance,
  getRecentKpiResults,
} from './kpi'

// Finance Actions
export {
  // Records
  getFinanceRecords,
  getFinanceRecord,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
  // Aggregations
  getFinanceSummary,
  getFinanceTrends,
  getFinanceByUnit,
} from './finance'

// Auth Actions
export {
  // User Management
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  // Authentication
  verifyCredentials,
  changePassword,
  resetUserPassword,
  // Authorization
  hasRole,
  canAccessHealthUnit,
  getAccessibleHealthUnits,
} from './auth'

// Health Units Actions
export {
  // Units
  getHealthUnits,
  getHealthUnit,
  getHealthUnitWithDemographics,
  createHealthUnit,
  updateHealthUnit,
  deleteHealthUnit,
  // Demographics
  getDemographics,
  upsertDemographics,
  // Dashboard
  getDashboardStats,
  // Reference Data
  getDistricts,
  getSubdistricts,
} from './health-units'

// Fiscal Periods Actions
export {
  getFiscalPeriods,
  getFiscalPeriodsByYear,
  getFiscalPeriodsByQuarter,
  getCurrentFiscalPeriod,
  getAvailableFiscalYears,
  closeFiscalPeriod,
  reopenFiscalPeriod,
} from './fiscal-periods'