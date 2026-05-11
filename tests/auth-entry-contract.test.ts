import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('Auth entry contract', () => {
  it('auto-continues already signed-in users into the app', () => {
    const source = readFileSync(
      join(process.cwd(), 'app/[locale]/(authentication)/components/user-auth-form.tsx'),
      'utf8',
    )

    expect(source).toContain('router.prefetch(redirectDestination)')
    expect(source).toContain('window.location.replace(redirectDestination)')
    expect(source).toContain('window.location.assign(redirectDestination)')
  })
})
