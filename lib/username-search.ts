import { prisma } from '@/lib/prisma'

export interface SearchUserResult {
  id: string
  username: string
  email: string
}

export async function searchUsersByUsername(query: string): Promise<SearchUserResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  const results = await prisma.user.findMany({
    where: {
      username: {
        contains: query.toLowerCase(),
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      username: true,
      email: true
    },
    take: 10
  })

  return results as SearchUserResult[]
}

export async function searchUsersByEmail(query: string): Promise<SearchUserResult[]> {
  if (!query || query.length < 2) {
    return []
  }

  const results = await prisma.user.findMany({
    where: {
      email: {
        contains: query.toLowerCase(),
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      username: true,
      email: true
    },
    take: 10
  })

  return results as SearchUserResult[]
}
