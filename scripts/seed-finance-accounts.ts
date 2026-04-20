/**
 * Seed finance accounts from finance-accounts-seed.json
 * 
 * Usage: npx tsx scripts/seed-finance-accounts.ts
 * 
 * This script upserts 35 income accounts from the 440404 chart of accounts
 * used by รพ.สต. under อบจ.อุบลราชธานี
 */
import { readFileSync } from 'fs'
import { join } from 'path'
import { prisma } from '../lib/db'

type SeedAccount = {
  type: string
  accountCode: string
  nameTh: string
  displayOrder: number
  isActive: boolean
}

type SeedData = {
  description: string
  sourcePcucode: string
  fiscalYear: number
  accounts: SeedAccount[]
}

async function main() {
  const seedPath = join(__dirname, '..', 'data', 'finance-accounts-seed.json')
  const raw = readFileSync(seedPath, 'utf-8')
  const seed: SeedData = JSON.parse(raw)

  console.log(`📋 ${seed.description}`)
  console.log(`   Source: ${seed.sourcePcucode} | FY: ${seed.fiscalYear}`)
  console.log(`   Accounts: ${seed.accounts.length}`)
  console.log()

  let created = 0
  let skipped = 0

  for (const acct of seed.accounts) {
    const result = await prisma.financeAccount.upsert({
      where: {
        type_nameTh: {
          type: acct.type as 'income' | 'expense',
          nameTh: acct.nameTh,
        },
      },
      update: {
        accountCode: acct.accountCode,
        displayOrder: acct.displayOrder,
        isActive: acct.isActive,
      },
      create: {
        type: acct.type as 'income' | 'expense',
        accountCode: acct.accountCode,
        nameTh: acct.nameTh,
        displayOrder: acct.displayOrder,
        isActive: acct.isActive,
      },
    })

    if (result.createdAt === result.updatedAt) {
      created++
      console.log(`  ✅ Created: [${acct.accountCode}] ${acct.nameTh}`)
    } else {
      skipped++
      console.log(`  ⏭️  Updated: [${acct.accountCode}] ${acct.nameTh}`)
    }
  }

  console.log()
  console.log(`✅ Done! Created: ${created}, Updated: ${skipped}`)

  // Verify by count
  const total = await prisma.financeAccount.count()
  const incomeCount = await prisma.financeAccount.count({ where: { type: 'income' } })
  const expenseCount = await prisma.financeAccount.count({ where: { type: 'expense' } })
  console.log(`📊 Total accounts in DB: ${total} (income: ${incomeCount}, expense: ${expenseCount})`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})