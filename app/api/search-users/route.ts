import { NextRequest, NextResponse } from 'next/server'
import { searchUsersByUsername, searchUsersByEmail } from '@/lib/username-search'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q') || ''

  if (!query) {
    return NextResponse.json({ users: [] })
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
