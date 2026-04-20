/**
 * Prisma Client Singleton
 * 
 * This module provides a singleton Prisma client instance to prevent
 * multiple database connections in development mode (hot reloading).
 * 
 * Usage:
 * ```typescript
 * import { prisma } from '@/lib/db'
 * 
 * const users = await prisma.user.findMany()
 * ```
 */

import { Prisma, PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Export the Prisma namespace for access to types
export { Prisma } from '@prisma/client'

// Helper function to disconnect (useful for tests and cleanup)
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}

// Helper function to check database connection
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Database connection error:', error)
    return false
  }
}

/**
 * Transaction helper for complex operations
 * 
 * Usage:
 * ```typescript
 * await withTransaction(async (tx) => {
 *   await tx.kpiResult.create({ ... })
 *   await tx.auditLog.create({ ... })
 * })
 * ```
 */
export async function withTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(fn)
}

/**
 * Batch insert helper for bulk operations
 */
export async function batchInsert<T>(
  model: keyof PrismaClient,
  data: T[],
  batchSize = 100
): Promise<void> {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize)
    // @ts-expect-error - dynamic model access
    await prisma[model].createMany({ data: batch })
  }
}

// Default export
export default prisma
