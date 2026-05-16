import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

const SPACING_REGEX = /(?:space-(y|x)|gap|mt?|mb?|ml?|mr?|mx?|my?|p[xy]?|m[xy]?)-\d+(?:\.\d+)?(?:\/\d+)?/g
const BANNED_VALUES = new Set(['gap-5', 'gap-7', 'gap-9', 'mb-7', 'mb-9', 'mt-7', 'mt-9'])

function findSpacingIssues(dir, issues = []) {
  const files = readdirSync(dir)

  for (const file of files) {
    const fullPath = join(dir, file)
    const stat = statSync(fullPath)

    if (stat.isDirectory() && !file.startsWith('.')) {
      findSpacingIssues(fullPath, issues)
    } else if (extname(file) === '.tsx' || extname(file) === '.ts') {
      try {
        const content = readFileSync(fullPath, 'utf-8')
        const matches = content.match(SPACING_REGEX)

        if (matches) {
          for (const match of matches) {
            if (BANNED_VALUES.has(match)) {
              issues.push({
                file: fullPath.replace(process.cwd(), ''),
                issue: `Banned spacing value: ${match}`,
                line: content.split('\n').findIndex(line => line.includes(match)) + 1
              })
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  return issues
}

const issues = findSpacingIssues('./app')
console.log('Spacing Issues Found:', issues.length)
if (issues.length > 0) {
  console.table(issues)
  process.exit(1)
} else {
  console.log('✅ All spacing values compliant with system')
}