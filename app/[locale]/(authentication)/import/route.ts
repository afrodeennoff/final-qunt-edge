import { NextRequest, NextResponse } from 'next/server'

const LOCALE_PATTERN = /^[a-z]{2}(?:-[A-Za-z]{2})?$/

function getAuthRedirectUrl(request: NextRequest): URL {
  const [, maybeLocale] = request.nextUrl.pathname.split('/')
  const locale = maybeLocale && LOCALE_PATTERN.test(maybeLocale) ? maybeLocale : 'en'
  return new URL(`/${locale}/authentication`, request.url)
}

export async function GET(request: NextRequest) {
  return NextResponse.redirect(getAuthRedirectUrl(request))
}

export async function POST(request: NextRequest) {
  return NextResponse.redirect(getAuthRedirectUrl(request))
}
