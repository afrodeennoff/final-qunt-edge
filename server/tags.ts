'use server'

import { getDatabaseUserId } from './auth'
import { prisma } from '@/lib/prisma'
import { cacheTag, cacheLife } from 'next/cache'
import { CACHE_TAGS, invalidateTagRelatedCaches } from '@/lib/cache/cache-invalidation'

async function _getTags(userId: string) {
  const tags = await prisma.tag.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  return tags
}

async function _getTagsCached(userId: string) {
  'use cache'
  cacheTag(CACHE_TAGS.TAGS(userId))
  cacheLife({ stale: 300, revalidate: 300, expire: 1800 })
  return _getTags(userId)
}

export async function getTagsAction() {
  const userId = await getDatabaseUserId()
  return _getTagsCached(userId)
}

export async function createTagAction(formData: {
  name: string
  description?: string
  color: string
}) {
  const userId = await getDatabaseUserId()

  try {
    const tag = await prisma.tag.create({
      data: {
        ...formData,
        userId,
      },
    })

    invalidateTagRelatedCaches(userId)
    return { tag }
  } catch (error) {
    console.error('Failed to create tag:', error)
    throw new Error('Failed to create tag')
  }
}

export async function updateTagAction(id: string, formData: {
  name: string
  description?: string
  color: string
}) {
  const userId = await getDatabaseUserId()

  try {

    // First get the old tag name
    const oldTag = await prisma.tag.findUnique({
      where: {
        id,
        userId,
      },
      select: { name: true }
    })

    if (!oldTag) {
      throw new Error('Tag not found')
    }

    // Start a transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Update the tag itself
      await tx.tag.update({
        where: {
          id,
          userId,
        },
        data: formData,
      })

      // Update all trades that have the old tag name to use the new tag name
      await tx.$executeRaw`
        UPDATE "Trade" SET tags = (
          SELECT array_agg(CASE WHEN unnest = ${oldTag.name} THEN ${formData.name} ELSE unnest END)
          FROM unnest(tags) AS unnest
        ) WHERE "userId" = ${userId} AND ${oldTag.name} = ANY(tags)
      `
    })

    invalidateTagRelatedCaches(userId)
    return { success: true }
  } catch (error) {
    console.error('Failed to update tag:', error)
    throw new Error('Failed to update tag')
  }
}

export async function deleteTagAction(id: string) {
  const userId = await getDatabaseUserId()

  try {
    // First get the tag name
    const tag = await prisma.tag.findUnique({
      where: {
        id,
        userId,
      },
      select: { name: true }
    })

    if (!tag) {
      throw new Error('Tag not found')
    }

    // Start a transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Remove tag from all trades that have it
      await tx.$executeRaw`
        UPDATE "Trade" SET tags = array_remove(tags, ${tag.name})
        WHERE "userId" = ${userId} AND ${tag.name} = ANY(tags)
      `

      // Delete the tag itself
      await tx.tag.delete({
        where: {
          id,
          userId,
        }
      })
    })

    invalidateTagRelatedCaches(userId)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete tag:', error)
    throw new Error('Failed to delete tag')
  }
}

export async function syncTradeTagsToTagTableAction() {
  const userId = await getDatabaseUserId()

  try {
    // Get all unique tags from trades
    const trades = await prisma.trade.findMany({
      where: { userId },
      select: { tags: true },
      take: 10_000,
    })

    // Extract unique tags from trades
    const uniqueTradeTagsSet = new Set<string>()
    trades.forEach(trade => {
      trade.tags.forEach(tag => uniqueTradeTagsSet.add(tag.toLowerCase()))
    })
    const uniqueTradeTags = Array.from(uniqueTradeTagsSet)

    // Get existing tags from Tag table
    const existingTags = await prisma.tag.findMany({
      where: { userId },
      select: { name: true }
    })
    const existingTagNames = new Set(existingTags.map(tag => tag.name.toLowerCase()))

    // Find tags that need to be created
    const tagsToCreate = uniqueTradeTags.filter(tag => !existingTagNames.has(tag))

    // Create missing tags
    if (tagsToCreate.length > 0) {
      await prisma.tag.createMany({
        data: tagsToCreate.map(tag => ({
          name: tag,
          userId,
          color: 'hsl(var(--muted-foreground))', // Default color (theme token)
        })),
        skipDuplicates: true,
      })
    }

    invalidateTagRelatedCaches(userId)
    return { 
      tagsCreated: tagsToCreate.length,
      totalUniqueTags: uniqueTradeTags.length
    }
  } catch (error) {
    console.error('Failed to sync tags:', error)
    throw new Error('Failed to sync tags')
  }
} 
