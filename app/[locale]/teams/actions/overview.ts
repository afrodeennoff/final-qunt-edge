'use server'

import { getTeamOverviewData } from '@/server/teams'
import { getDatabaseUserId } from '@/server/auth'

export async function getTeamOverviewDataAction(teamId: string) {
    try {
        // MUDI: resolve identity from the session. Never trust a client-supplied
        // userId for authorization — it enables team-existence enumeration.
        const userId = await getDatabaseUserId()
        const result = await getTeamOverviewData(teamId, userId)
        return result
    } catch (error) {
        console.error('Action error:', error)
        return { success: false, error: 'Failed to fetch overview' }
    }
}
