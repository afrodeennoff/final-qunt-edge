import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const importPlatformConfig = readFileSync(
  join(
    process.cwd(),
    'app/[locale]/dashboard/components/import/config/platforms.tsx',
  ),
  'utf8',
)

describe('trade import platform parity', () => {
  it('exposes the Deltalytix direct sync import options', () => {
    expect(importPlatformConfig).toContain("platformName: 'rithmic-sync'")
    expect(importPlatformConfig).not.toMatch(
      /platformName:\s*'rithmic-sync'[\s\S]*?isDisabled:\s*true/,
    )
    expect(importPlatformConfig).toContain("platformName: 'tradovate-sync'")
    expect(importPlatformConfig).toContain("platformName: 'dxfeed-sync'")
    expect(importPlatformConfig).toContain('customComponent: DxFeedSync')
  })
})
