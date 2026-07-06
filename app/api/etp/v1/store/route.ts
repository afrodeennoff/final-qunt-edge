import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { verifySecureToken } from '@/lib/api-auth'

const PAYLOAD_SIZE_LIMIT = 2 * 1024 * 1024

async function authenticateRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false as const, error: { code: 'UNAUTHORIZED' as const, message: 'Unauthorized', status: 401 as const } }
  }

  const token = authHeader.split(' ')[1]

  const user = await verifySecureToken(token, 'etp')
  if (!user) {
    return { authenticated: false as const, error: { code: 'UNAUTHORIZED' as const, message: 'Unauthorized', status: 401 as const } }
  }

  return { authenticated: true as const, user }
}

export async function POST(req: NextRequest) {
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > PAYLOAD_SIZE_LIMIT) {
    return NextResponse.json(
      { error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request payload is too large' } },
      { status: 413 },
    )
  }

  try {
    const auth = await authenticateRequest(req)
    if (!auth.authenticated) {
      const err = auth as { authenticated: false; error: { code: string; message: string; status: number } }
      return NextResponse.json(
        { error: { code: err.error.code, message: err.error.message } },
        { status: err.error.status },
      )
    }

    const user = auth.user
    const body = await req.json()
    const { orders } = body

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: { code: 'INVALID_PAYLOAD', message: 'Invalid orders data' } }, { status: 400 })
    }

    await Promise.all(
      orders.map(async (order) => {
        return prisma.order.upsert({
          where: {
            userId_orderId: {
              userId: user.id,
              orderId: order.OrderId,
            },
          },
          update: {
            accountId: order.AccountId,
            orderId: order.OrderId,
            orderAction: order.OrderAction,
            quantity: order.Quantity,
            averageFilledPrice: order.AverageFilledPrice,
            isOpeningOrder: order.IsOpeningOrder,
            time: new Date(order.Time),
            symbol: order.Instrument.Symbol,
            instrumentType: order.Instrument.Type,
          },
          create: {
            accountId: order.AccountId,
            orderId: order.OrderId,
            orderAction: order.OrderAction,
            quantity: order.Quantity,
            averageFilledPrice: order.AverageFilledPrice,
            isOpeningOrder: order.IsOpeningOrder,
            time: new Date(order.Time),
            symbol: order.Instrument.Symbol,
            instrumentType: order.Instrument.Type,
            userId: user.id,
          },
        })
      }),
    )

    return NextResponse.json({ success: true, message: `${orders.length} orders stored successfully` }, { status: 200 })
  } catch {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to store orders' } }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req)
    if (!auth.authenticated) {
      const err = auth as { authenticated: false; error: { code: string; message: string; status: number } }
      return NextResponse.json(
        { error: { code: err.error.code, message: err.error.message } },
        { status: err.error.status },
      )
    }

    const user = auth.user
    const result = await prisma.order.deleteMany({
      where: { userId: user.id },
    })

    return NextResponse.json({ success: true, message: `${result.count} orders deleted successfully` }, { status: 200 })
  } catch {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Failed to delete orders' } }, { status: 500 })
  }
}
