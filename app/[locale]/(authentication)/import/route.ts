import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/site-url'

export async function GET() {
  return NextResponse.redirect(getSiteUrl('/authentication'));
}

export async function POST() {
  return NextResponse.redirect(getSiteUrl('/authentication'));
}
