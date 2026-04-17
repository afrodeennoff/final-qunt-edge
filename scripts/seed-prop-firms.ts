/**
 * Seed script: Populate the PropFirm table from verified profiles.
 *
 * Usage:
 *   npx tsx scripts/seed-prop-firms.ts
 *
 * - Creates PropFirm rows for every verified profile that doesn't already exist.
 * - Updates existing rows if profile data has changed (name, category, platform, etc.).
 * - Idempotent — safe to run multiple times.
 * - Does NOT delete firms that are no longer in the verified profiles list.
 */
import 'dotenv/config'
import { PrismaClient } from '../prisma/generated/prisma/index.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { VERIFIED_PROPFIRM_PROFILES } from '../lib/prop-firms/verified-profiles.js'

const rawUrl =
  process.env.DIRECT_URL?.replace(/^"(.*)"$/, '$1') ||
  process.env.DATABASE_URL?.replace(/^"(.*)"$/, '$1') ||
  ''

if (!rawUrl) {
  console.error('ERROR: No DATABASE_URL or DIRECT_URL configured.')
  process.exit(1)
}

// Force IPv4 + SSL for Supabase
const url = rawUrl + (rawUrl.includes('?') ? '&' : '?') + 'family=4'
const pool = new pg.Pool({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  max: 3,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as never)

async function main() {
  console.log(`\n🌱 Seeding PropFirm table from ${VERIFIED_PROPFIRM_PROFILES.length} verified profiles...\n`)

  let created = 0
  let updated = 0
  let skipped = 0

  for (const profile of VERIFIED_PROPFIRM_PROFILES) {
    const existing = await prisma.propFirm.findUnique({ where: { slug: profile.slug } })

    const data = {
      name: profile.name,
      category: profile.category,
      shortDesc: profile.shortDesc,
      platform: profile.platform,
      payoutModel: profile.payoutModel,
      drawdownType: profile.drawdownType,
      profitSplit: profile.profitSplit,
      maxAllocation: profile.maxAllocation,
      referralUrl: profile.referralUrl,
      isActive: true,
    }

    if (!existing) {
      await prisma.propFirm.create({
        data: {
          slug: profile.slug,
          ...data,
        },
      })
      created++
      console.log(`  ✅ Created: ${profile.name} (${profile.slug})`)
    } else {
      // Check if any field changed
      const needsUpdate =
        existing.name !== data.name ||
        existing.category !== data.category ||
        existing.platform !== data.platform ||
        existing.payoutModel !== data.payoutModel ||
        existing.drawdownType !== data.drawdownType ||
        existing.profitSplit !== data.profitSplit ||
        existing.maxAllocation !== data.maxAllocation ||
        existing.referralUrl !== data.referralUrl ||
        existing.shortDesc !== data.shortDesc

      if (needsUpdate) {
        await prisma.propFirm.update({
          where: { slug: profile.slug },
          data,
        })
        updated++
        console.log(`  🔄 Updated: ${profile.name} (${profile.slug})`)
      } else {
        skipped++
        console.log(`  ⏭️  Skipped: ${profile.name} (${profile.slug}) — up to date`)
      }
    }
  }

  const totalFirms = await prisma.propFirm.count()
  const activeFirms = await prisma.propFirm.count({ where: { isActive: true } })

  console.log(`\n📊 Results:`)
  console.log(`   Created: ${created}`)
  console.log(`   Updated: ${updated}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Total firms in DB: ${totalFirms} (${activeFirms} active)\n`)

  await prisma.$disconnect()
  await pool.end()
}

main().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
