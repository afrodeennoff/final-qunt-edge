export async function POST(request: Request) {
  try {
    await request.text()
  } catch {
    // Intentionally ignore malformed CSP payloads in development.
  }

  return new Response(null, { status: 204 })
}

export async function OPTIONS() {
  return new Response(null, { status: 204 })
}
