'use server'

import { prisma } from '@/lib/prisma'
import { DEFAULT_TAG_CATEGORIES } from '@/lib/journal-utils'

export async function getUserTagTemplates(userId: string) {
  const userTemplates = await prisma.journalTagTemplate.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' }
  })

  // Merge defaults with user overrides
  const result: Record<string, string[]> = { ...DEFAULT_TAG_CATEGORIES }

  for (const tmpl of userTemplates) {
    result[tmpl.name] = tmpl.tags
  }

  return result
}

export async function saveTagTemplate(userId: string, name: string, tags: string[]) {
  return prisma.journalTagTemplate.upsert({
    where: {
      userId_name: {
        userId,
        name
      }
    },
    update: { tags },
    create: {
      userId,
      name,
      tags
    }
  })
}

export async function deleteTagTemplate(userId: string, name: string) {
  return prisma.journalTagTemplate.deleteMany({
    where: { userId, name }
  })
}

export async function resetToDefaults(userId: string) {
  await prisma.journalTagTemplate.deleteMany({ where: { userId } })
  return getUserTagTemplates(userId)
}

// Thin server action wrappers (only loaded dynamically from client components)
import { getDatabaseUserId } from './auth'

export async function getJournalTagTemplatesAction() {
  try {
    const userId = await getDatabaseUserId()
    return await getUserTagTemplates(userId)
  } catch (error) {
    console.error('Error getting journal tag templates:', error)
    const { DEFAULT_TAG_CATEGORIES } = await import('@/lib/journal-utils')
    return DEFAULT_TAG_CATEGORIES
  }
}

export async function saveJournalTagTemplateAction(name: string, tags: string[]) {
  try {
    const userId = await getDatabaseUserId()
    return await saveTagTemplate(userId, name, tags)
  } catch (error) {
    console.error('Error saving journal tag template:', error)
    throw error
  }
}

export async function deleteJournalTagTemplateAction(name: string) {
  try {
    const userId = await getDatabaseUserId()
    return await deleteTagTemplate(userId, name)
  } catch (error) {
    console.error('Error deleting journal tag template:', error)
    throw error
  }
}

export async function resetJournalTagTemplatesToDefaultsAction() {
  try {
    const userId = await getDatabaseUserId()
    return await resetToDefaults(userId)
  } catch (error) {
    console.error('Error resetting journal tag templates:', error)
    throw error
  }
}
