import { beforeEach, afterEach, describe, expect, it } from "vitest"

const DB_ENV_KEYS = [
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL",
  "DATABASE_URL",
  "DIRECT_URL",
  "POSTGRES_URL_NON_POOLING",
] as const

const originalDbEnv = new Map(DB_ENV_KEYS.map((key) => [key, process.env[key]]))

function clearDbEnv() {
  for (const key of DB_ENV_KEYS) {
    process.env[key] = ""
  }
}

function restoreDbEnv() {
  for (const key of DB_ENV_KEYS) {
    const value = originalDbEnv.get(key)
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

describe("lib/prisma fallback", () => {
  beforeEach(() => {
    restoreDbEnv()
    clearDbEnv()
  })

  afterEach(() => {
    restoreDbEnv()
  })

  it("exports a lazy proxy when no database URL is configured", async () => {
    const { prisma } = await import("@/lib/prisma")

    expect(() => prisma.user.findMany()).toThrow(
      /Database connection is not configured/
    )
  })
})
