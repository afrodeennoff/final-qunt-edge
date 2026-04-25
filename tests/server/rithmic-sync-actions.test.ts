import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  getUserIdMock,
  getDatabaseUserIdMock,
  findManyMock,
  upsertMock,
  deleteManyMock,
  encryptTokenMock,
} = vi.hoisted(() => ({
  getUserIdMock: vi.fn(),
  getDatabaseUserIdMock: vi.fn(),
  findManyMock: vi.fn(),
  upsertMock: vi.fn(),
  deleteManyMock: vi.fn(),
  encryptTokenMock: vi.fn(),
}))

vi.mock("@/server/auth", () => ({
  getUserId: getUserIdMock,
  getDatabaseUserId: getDatabaseUserIdMock,
}))

vi.mock("@/lib/prisma", () => ({
  prisma: {
    synchronization: {
      findMany: findManyMock,
      upsert: upsertMock,
      deleteMany: deleteManyMock,
    },
  },
}))

vi.mock("@/lib/prisma-guard", () => ({
  withPrismaSchemaMismatchFallback: vi.fn(async (_key: string, run: () => unknown) => run()),
}))

vi.mock("@/lib/security/auth-config", () => ({
  authSecurityConfig: {
    tradovateTokenEncryptionEnabled: true,
  },
}))

vi.mock("@/lib/security/token-crypto", () => ({
  encryptToken: encryptTokenMock,
}))

vi.mock("next/cache", () => ({
  updateTag: vi.fn(),
}))

import {
  getRithmicSynchronizations,
  removeRithmicSynchronization,
  setRithmicSynchronization,
} from "@/app/[locale]/dashboard/components/import/rithmic/sync/actions"

describe("rithmic sync actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUserIdMock.mockResolvedValue("auth-user-1")
    getDatabaseUserIdMock.mockResolvedValue("db-user-1")
    encryptTokenMock.mockReturnValue({
      tokenCiphertext: "ciphertext",
      tokenIv: "iv",
      tokenTag: "tag",
      tokenKeyVersion: "v-test",
    })
  })

  it("lists synchronizations using resolved database user id", async () => {
    findManyMock.mockResolvedValue([])

    await getRithmicSynchronizations()

    expect(findManyMock).toHaveBeenCalledWith({
      where: {
        userId: "db-user-1",
        service: "rithmic",
      },
    })
  })

  it("deletes synchronization using resolved database user id", async () => {
    deleteManyMock.mockResolvedValue({ count: 1 })

    await removeRithmicSynchronization("ACC-1")

    expect(deleteManyMock).toHaveBeenCalledWith({
      where: {
        userId: "db-user-1",
        service: "rithmic",
        accountId: "ACC-1",
      },
    })
  })

  it("upserts synchronization with database user id ownership", async () => {
    upsertMock.mockResolvedValue({})

    await setRithmicSynchronization({
      service: "rithmic",
      accountId: "ACC-1",
      token: "token",
    })

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_service_accountId: {
            userId: "db-user-1",
            service: "rithmic",
            accountId: "ACC-1",
          },
        },
        update: expect.objectContaining({
          userId: "db-user-1",
          token: null,
          tokenCiphertext: "ciphertext",
          tokenIv: "iv",
          tokenTag: "tag",
          tokenKeyVersion: "v-test",
        }),
        create: expect.objectContaining({
          userId: "db-user-1",
          token: null,
          tokenCiphertext: "ciphertext",
          tokenIv: "iv",
          tokenTag: "tag",
          tokenKeyVersion: "v-test",
        }),
      })
    )
  })
})
