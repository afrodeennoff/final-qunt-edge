import { prisma } from '@/lib/prisma'

export const DEFAULT_TAG_CATEGORIES: Record<string, string[]> = {
  'Week Days': [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
    'Best Day', 'Worst Day'
  ],
  'Setup Types': [
    'Breakout', 'Reversal', 'Trend Following', 'Scalp', 'Swing', 'Momentum',
    'Mean Reversion', 'Gap Fill', 'Range Break', 'News Play', 'Opening Range', 'Closing Range',
    'Fader', 'Break and Retest', 'Pullback Entry', 'Continuation'
  ],
  'Market Conditions': [
    'Trending', 'Ranging', 'Volatile', 'Low Vol', 'Pre-News', 'Post-News',
    'Overnight', 'Session Open', 'High Impact News', 'Low Liquidity'
  ],
  'Mistakes': [
    'FOMO', 'Revenge Trade', 'Overtrading', 'Premature Entry', 'Late Entry',
    'Moving Stops', 'Abandoning Plan', 'Overconfidence', 'Hesitation', 'Tilt',
    'Chasing', 'Averaging Down', 'No Stop', 'Too Big Size'
  ],
  'Psychology': [
    'Confident', 'Anxious', 'Focused', 'Distracted', 'Patient', 'Impatient',
    'Disciplined', 'Tired', 'Euphoric', 'Fearful', 'Greedy', 'Calm'
  ],
  'Execution': [
    'Perfect Entry', 'Slippage', 'Good Risk', 'Poor Risk', 'Scaled In',
    'Scaled Out', 'Held Too Long', 'Cut Too Early', 'Good Exit', 'Bad Exit'
  ],
  'Environment': [
    'Home', 'Office', 'Mobile', 'Desktop', 'With Mentor', 'Alone',
    'Tired', 'Well Rested', 'Distracted Environment'
  ]
}

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

// ---------------------------------------------------------------------------
// Server actions for client components (daily journal + Settings)
// ---------------------------------------------------------------------------

import { getDatabaseUserId } from './auth'

export async function getJournalTagTemplatesAction() {
  try {
    const userId = await getDatabaseUserId()
    return await getUserTagTemplates(userId)
  } catch (error) {
    console.error('Error getting journal tag templates:', error)
    return DEFAULT_TAG_CATEGORIES // graceful fallback to rich defaults
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
