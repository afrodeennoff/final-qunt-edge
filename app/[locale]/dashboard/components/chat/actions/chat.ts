'use server'
import { UIMessage } from "ai"
import { prisma } from "@/lib/prisma"
import { addDays } from "date-fns"
import { Mood } from "@/prisma/generated/prisma"
import { getUserId } from "@/server/auth"
import { createStoredChatConversation, readStoredChatConversation } from "@/lib/chat-retention"
import { invalidateJournalRelatedCaches } from "@/lib/cache/cache-invalidation"

export async function saveChat(messages: UIMessage[]): Promise<Mood | null> {
  const userId = await getUserId()
  
  // Check if user exists before proceeding
  if (!userId) {
    console.error('No user ID found')
    return null
  }

  // Verify user exists in database
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) {
    console.error('User not found in database:', userId)
    return null
  }

  const today = new Date()
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12))

  // Try to find existing mood entry for today
  const existingMood = await prisma.mood.findFirst({
    where: {
      userId,
      day: {
        gte: todayUTC,
        lt: addDays(todayUTC, 1),
      },
    },
  })

  invalidateJournalRelatedCaches(userId)

  if (existingMood) {
    // Update existing mood entry
    const updatedMood = await prisma.mood.update({
      where: {
        id: existingMood.id,
      },
      data: {
        conversation: createStoredChatConversation(messages),
      },
    })
    return updatedMood
  } else {
    // Create new mood entry
    const newMood = await prisma.mood.create({
      data: {
        userId,
        day: todayUTC,
        mood: "NEUTRAL", // Default mood
        conversation: createStoredChatConversation(messages),
      },
    })
    return newMood
  }
}

export async function loadChat(): Promise<UIMessage[]> {
  const userId = await getUserId()
  
  // Check if user exists before proceeding
  if (!userId) {
    console.error('No user ID found')
    return []
  }

  // Verify user exists in database
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  if (!user) {
    console.error('User not found in database:', userId)
    return []
  }

  const today = new Date()
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 12))

  // Find mood entry for today
  const mood = await prisma.mood.findFirst({
    where: {
      userId,
      day: {
        gte: todayUTC,
        lt: addDays(todayUTC, 1),
      },
    },
  })

  // Return conversation if it exists, otherwise empty array
  return mood?.conversation ? readStoredChatConversation(mood.conversation) : []
} 
