import { prisma } from '@/lib/prisma'
import { getVerifiedPropFirmSeedRows } from '@/lib/prop-firms/verified-profiles'

const FIRMS = getVerifiedPropFirmSeedRows()

async function main() {
  console.log('Seeding prop firms...')
  for (const firm of FIRMS) {
    await prisma.propFirm.upsert({
      where: { slug: firm.slug },
      update: firm,
      create: firm,
    })
    console.log(`  ✓ ${firm.name}`)
  }
  console.log(`Done. Seeded ${FIRMS.length} firms.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
