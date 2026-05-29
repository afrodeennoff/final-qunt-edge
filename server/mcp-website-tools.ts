import type { McpAuthContext } from './mcp-auth'
import { prisma } from '@/lib/prisma'

export const websiteTools = [
  {
    name: 'list_blog_posts',
    description: 'List published blog posts with optional category filter and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', enum: ['TRADING_TIPS', 'MARKET_ANALYSIS', 'PSYCHOLOGY', 'RISK_MANAGEMENT', 'PLATFORM_UPDATES'], description: 'Filter by category' },
        limit: { type: 'number', description: 'Max posts to return (default 20, max 50)' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
    },
  },
  {
    name: 'get_blog_post',
    description: 'Get a single published blog post by slug',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'The blog post slug' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'list_prop_firms',
    description: 'List active prop firms with optional category filter',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Filter by prop firm category' },
        platform: { type: 'string', description: 'Filter by platform (e.g. MT4, MT5, cTrader)' },
        limit: { type: 'number', description: 'Max firms to return (default 50, max 100)' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
    },
  },
  {
    name: 'get_prop_firm',
    description: 'Get detailed information about a specific prop firm including reviews, coupons, rules, and challenges',
    inputSchema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'The prop firm slug' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'list_challenges',
    description: 'List challenges for a specific prop firm',
    inputSchema: {
      type: 'object',
      properties: {
        propFirmSlug: { type: 'string', description: 'The prop firm slug' },
        limit: { type: 'number', description: 'Max challenges to return (default 20, max 50)' },
      },
    },
  },
  {
    name: 'list_prop_firm_reviews',
    description: 'List approved reviews for a specific prop firm',
    inputSchema: {
      type: 'object',
      properties: {
        propFirmSlug: { type: 'string', description: 'The prop firm slug' },
        limit: { type: 'number', description: 'Max reviews to return (default 20, max 50)' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
    },
  },
  {
    name: 'list_active_deals',
    description: 'List active coupons and deals across all prop firms',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max deals to return (default 20, max 50)' },
      },
    },
  },
  {
    name: 'list_community_posts',
    description: 'List public community posts (feature requests, bug reports, discussions)',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['FEATURE_REQUEST', 'BUG_REPORT', 'DISCUSSION'], description: 'Filter by post type' },
        status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CLOSED'], description: 'Filter by status' },
        limit: { type: 'number', description: 'Max posts to return (default 20, max 50)' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
    },
  },
  {
    name: 'get_leaderboard',
    description: 'Get top traders sorted by total PnL (users who opted into the leaderboard)',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Max traders to return (default 10, max 50)' },
        offset: { type: 'number', description: 'Pagination offset' },
      },
    },
  },
  {
    name: 'get_trader_benchmarks',
    description: 'Get global trader benchmark statistics (risk-reward, drawdown, win rate, avg return)',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
]

export async function handleWebsiteMcpToolCall(toolName: string, args: Record<string, unknown>, ctx: McpAuthContext) {
  switch (toolName) {
    case 'list_blog_posts':
      return await listBlogPosts(args)
    case 'get_blog_post':
      return await getBlogPost(args.slug as string)
    case 'list_prop_firms':
      return await listPropFirms(args)
    case 'get_prop_firm':
      return await getPropFirm(args.slug as string)
    case 'list_challenges':
      return await listChallenges(args.propFirmSlug as string, args)
    case 'list_prop_firm_reviews':
      return await listPropFirmReviews(args.propFirmSlug as string, args)
    case 'list_active_deals':
      return await listActiveDeals(args)
    case 'list_community_posts':
      return await listCommunityPosts(args)
    case 'get_leaderboard':
      return await getLeaderboard(args)
    case 'get_trader_benchmarks':
      return await getTraderBenchmarks()
    default:
      throw new Error(`Unknown website tool: ${toolName}`)
  }
}

async function listBlogPosts(args: Record<string, unknown>) {
  const limit = Math.min(Number(args.limit) || 20, 50)
  const offset = Number(args.offset) || 0
  const where: Record<string, unknown> = { published: true }
  if (args.category) where.category = args.category

  const posts = await prisma.blogPost.findMany({
    where: where as any,
    select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, category: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(posts, null, 2) }] }
}

async function getBlogPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
    include: { author: { select: { username: true } } },
  })
  if (!post) throw new Error('Blog post not found')
  return { content: [{ type: 'text' as const, text: JSON.stringify(post, null, 2) }] }
}

async function listPropFirms(args: Record<string, unknown>) {
  const limit = Math.min(Number(args.limit) || 50, 100)
  const offset = Number(args.offset) || 0
  const where: Record<string, unknown> = { isActive: true }
  if (args.category) where.category = args.category
  if (args.platform) where.platform = args.platform

  const firms = await prisma.propFirm.findMany({
    where: where as any,
    select: { id: true, slug: true, name: true, category: true, shortDesc: true, logoUrl: true, platform: true, payoutModel: true, profitSplit: true, referralUrl: true },
    orderBy: { name: 'asc' },
    take: limit,
    skip: offset,
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(firms, null, 2) }] }
}

async function getPropFirm(slug: string) {
  const firm = await prisma.propFirm.findUnique({
    where: { slug },
    include: {
      reviews: { where: { status: 'approved' }, orderBy: { createdAt: 'desc' }, take: 10 },
      coupons: { where: { isActive: true, expiresAt: { gte: new Date() } } },
      rules: { where: { isActive: true } },
    },
  })
  if (!firm) throw new Error('Prop firm not found')

  const challenges = await prisma.challenge.findMany({ where: { propFirmId: firm.id, isActive: true } })

  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ ...firm, challenges }, null, 2) }],
  }
}

async function listChallenges(propFirmSlug: string, args: Record<string, unknown>) {
  const firm = await prisma.propFirm.findUnique({ where: { slug: propFirmSlug }, select: { id: true } })
  if (!firm) throw new Error('Prop firm not found')

  const limit = Math.min(Number(args.limit) || 20, 50)
  const challenges = await prisma.challenge.findMany({
    where: { propFirmId: firm.id, isActive: true },
    orderBy: { accountSize: 'asc' },
    take: limit,
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(challenges, null, 2) }] }
}

async function listPropFirmReviews(propFirmSlug: string, args: Record<string, unknown>) {
  const firm = await prisma.propFirm.findUnique({ where: { slug: propFirmSlug }, select: { id: true } })
  if (!firm) throw new Error('Prop firm not found')

  const limit = Math.min(Number(args.limit) || 20, 50)
  const offset = Number(args.offset) || 0
  const reviews = await prisma.propFirmReview.findMany({
    where: { propFirmId: firm.id, status: 'approved' },
    select: { id: true, rating: true, title: true, content: true, helpfulVotes: true, createdAt: true, user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(reviews, null, 2) }] }
}

async function listActiveDeals(args: Record<string, unknown>) {
  const limit = Math.min(Number(args.limit) || 20, 50)
  const deals = await prisma.propFirmCoupon.findMany({
    where: { isActive: true, expiresAt: { gte: new Date() } },
    select: { id: true, code: true, description: true, discountPercent: true, challengeFee: true, expiresAt: true, propFirm: { select: { name: true, slug: true, logoUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(deals, null, 2) }] }
}

async function listCommunityPosts(args: Record<string, unknown>) {
  const limit = Math.min(Number(args.limit) || 20, 50)
  const offset = Number(args.offset) || 0
  const where: Record<string, unknown> = {}
  if (args.type) where.type = args.type
  if (args.status) where.status = args.status

  const posts = await prisma.post.findMany({
    where: where as any,
    select: { id: true, title: true, type: true, status: true, createdAt: true, userId: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
  return { content: [{ type: 'text' as const, text: JSON.stringify(posts, null, 2) }] }
}

async function getLeaderboard(args: Record<string, unknown>) {
  const limit = Math.min(Number(args.limit) || 10, 50)
  const offset = Number(args.offset) || 0

  const users = await prisma.user.findMany({
    where: { showOnLeaderboard: true },
    select: { id: true, username: true, language: true },
    take: limit,
    skip: offset,
  })

  const leaderboard = await Promise.all(
    users.map(async (user) => {
      const summary = await prisma.trade.aggregate({
        where: { userId: user.id },
        _sum: { pnl: true },
        _count: { id: true },
      })
      return {
        userId: user.id,
        username: user.username || 'Anonymous',
        language: user.language,
        totalPnL: summary._sum.pnl ? Number(summary._sum.pnl) : 0,
        totalTrades: summary._count.id,
      }
    }),
  )

  leaderboard.sort((a, b) => b.totalPnL - a.totalPnL)

  return { content: [{ type: 'text' as const, text: JSON.stringify(leaderboard, null, 2) }] }
}

async function getTraderBenchmarks() {
  const snapshot = await prisma.traderBenchmarkSnapshot.findFirst({ orderBy: { updatedAt: 'desc' } })
  if (!snapshot) return { content: [{ type: 'text' as const, text: JSON.stringify({ message: 'No benchmark data available yet' }) }] }
  return { content: [{ type: 'text' as const, text: JSON.stringify(snapshot, null, 2) }] }
}
