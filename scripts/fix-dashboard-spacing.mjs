import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs'
import { join, extname } from 'path'

const dashboardDirs = [
  'app/[locale]/dashboard/components',
  'app/[locale]/dashboard/pages',
  'components/charts',
  'components/widgets'
]

function fixDashboardSpacing() {
  for (const dir of dashboardDirs) {
    // Only process directories that exist
    if (!existsSync(dir) || !statSync(dir).isDirectory()) {
      console.log(`Skipping non-existent directory: ${dir}`)
      continue
    }
    const files = readdirSync(dir)

    for (const file of files) {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const fullPath = join(dir, file)
        const content = readFileSync(fullPath, 'utf-8')

        // Fix common spacing issues in dashboard
        let fixedContent = content
          .replace(/gap-5/g, 'gap-6')
          .replace(/gap-7/g, 'gap-6')
          .replace(/gap-9/g, 'gap-8')
          .replace(/mb-7/g, 'mb-6')
          .replace(/mb-9/g, 'mb-8')
          .replace(/mt-7/g, 'mt-6')
          .replace(/mt-9/g, 'mt-8')
          .replace(/py-20/g, 'py-16 sm:py-20')
          .replace(/py-24/g, 'py-16 sm:py-20 lg:py-24')
          .replace(/px-\[([0-9]+)px\]/g, 'px-$1')

        if (fixedContent !== content) {
          writeFileSync(fullPath, fixedContent)
          console.log(`Fixed spacing in ${fullPath}`)
        }
      }
    }
  }
}

fixDashboardSpacing()
console.log('Dashboard spacing fixes completed')