import { NextRequest, NextResponse } from 'next/server'
import { searchUsersByUsername, searchUsersByEmail } from '@/lib/username-search'
import { getDatabaseUserId } from '@/server/auth'
import { apiError } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  // SECURITY: Require authentication to prevent user enumeration
  try {
    const userId = await getDatabaseUserId()
    if (!userId) {
      return apiError('UNAUTHORIZED', 'Authentication required', 401)
    }
  } catch {
    return apiError('UNAUTHORIZED', 'Authentication required', 401)
  }

  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''

  if (!query) {
    return NextResponse.json({ users: [] })
  }

  // Validate query length to prevent abuse
  if (query.length > 200) {
    return apiError('BAD_REQUEST', 'Search query too long', 400)
  }

  // Try username search first, then email search
  const usernameResults = await searchUsersByUsername(query)

  if (usernameResults.length > 0) {
    return NextResponse.json({
      users: usernameResults,
      searchType: 'username'
    })
  }

  const emailResults = await searchUsersByEmail(query)

  return NextResponse.json({
    users: emailResults,
    searchType: 'email'
  })
}
