import type { McpAuthContext } from './mcp-auth'
import { prisma } from '@/lib/prisma'
import { toolError, toolSuccess, clampInt, requireParam, type McpToolResult, type ToolDefinition } from './mcp-helpers'

export const websiteTools: ToolDefinition[] = [
  {
    name: 'list_blog_posts',
    description: 'List published blog posts with optional category filter and pagination',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
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
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { slug: { type: 'string', description: 'The blog post slug' } },
      required: ['slug'],
    },
  },
  {
    name: 'list_prop_firms',
    description: 'List active prop firms with optional category filter',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
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
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { slug: { type: 'string', description: 'The prop firm slug' } },
      required: ['slug'],
    },
  },
  {
    name: 'list_challenges',
    description: 'List challenges for a specific prop firm',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
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
      $schema: 'https://json-schema.org/draft/2020-12/schema',
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
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: { limit: { type: 'number', description: 'Max deals to return (default 20, max 50)' } },
    },
  },
  {
    name: 'list_community_posts',
    description: 'List public community posts (feature requests, bug reports, discussions)',
    inputSchema: {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
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
      $schema: 'https://json-schema.org/draft/2020-12/schema',
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
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      type: 'object',
      properties: {},
    },
  },
]

export async function handleWebsiteMcpToolCall(toolName: string, args: Record<string, unknown>, _ctx?: McpAuthContext | null): Promise<McpToolResult> {
  switch (toolName) {
    case 'list_blog_posts':
      return await listBlogPosts(args)
    case 'get_blog_post':
      return await getBlogPost(requireParam(args, 'slug'))
    case 'list_prop_firms':
      return await listPropFirms(args)
    case 'get_prop_firm':
      return await getPropFirm(requireParam(args, 'slug'))
    case 'list_challenges':
      return await listChallenges(requireParam(args, 'propFirmSlug'), args)
    case 'list_prop_firm_reviews':
      return await listPropFirmReviews(requireParam(args, 'propFirmSlug'), args)
    case 'list_active_deals':
      return await listActiveDeals(args)
    case 'list_community_posts':
      return await listCommunityPosts(args)
    case 'get_leaderboard':
      return await getLeaderboard(args)
    case 'get_trader_benchmarks':
      return await getTraderBenchmarks()
    default:
      return toolError(`Unknown website tool: ${toolName}`)
  }
}

async function listBlogPosts(args: Record<string, unknown>) {
  const limit = clampInt(args.limit, 1, 50, 20)
  const offset = clampInt(args.offset, 0, 1_000_000, 0)
  const where: Record<string, unknown> = { published: true }
  if (typeof args.category === 'string' && args.category) where.category = args.category

  const posts = await prisma.blogPost.findMany({
    where,
    select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, category: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
  return toolSuccess(posts)
}

async function getBlogPost(slug: string): Promise<McpToolResult> {
  const post = await prisma.blogPost.findUnique({
    where: { slug, published: true },
    include: { author: { select: { username: true } } },
  })
  if (!post) return toolError('Blog post not found')
  return toolSuccess(post)
}

async function listPropFirms(args: Record<string, unknown>) {
  const limit = clampInt(args.limit, 1, 100, 50)
  const offset = clampInt(args.offset, 0, 1_000_000, 0)
  const where: Record<string, unknown> = { isActive: true }
  if (typeof args.category === 'string' && args.category) where.category = args.category
  if (typeof args.platform === 'string' && args.platform) where.platform = args.platform

  const firms = await prisma.propFirm.findMany({
    where,
    select: { id: true, slug: true, name: true, category: true, shortDesc: true, logoUrl: true, platform: true, payoutModel: true, profitSplit: true, referralUrl: true },
    orderBy: { name: 'asc' },
    take: limit,
    skip: offset,
  })
  return toolSuccess(firms)
}

async function getPropFirm(slug: string): Promise<McpToolResult> {
  const firm = await prisma.propFirm.findUnique({
    where: { slug, isActive: true },
    include: {
      reviews: { where: { status: 'approved' }, orderBy: { createdAt: 'desc' }, take: 10 },
      coupons: { where: { isActive: true, expiresAt: { gte: new Date() } } },
      rules: { where: { isActive: true } },
    },
  })
  if (!firm) return toolError('Prop firm not found')

  const challenges = await prisma.challenge.findMany({ where: { propFirmId: firm.id, isActive: true } })

  return toolSuccess({ ...firm, challenges })
}

async function listChallenges(propFirmSlug: string, args: Record<string, unknown>): Promise<McpToolResult> {
  const firm = await prisma.propFirm.findUnique({ where: { slug: propFirmSlug, isActive: true }, select: { id: true } })
  if (!firm) return toolError('Prop firm not found')

  const limit = clampInt(args.limit, 1, 50, 20)
  const challenges = await prisma.challenge.findMany({
    where: { propFirmId: firm.id, isActive: true },
    orderBy: { accountSize: 'asc' },
    take: limit,
  })
  return toolSuccess(challenges)
}

async function listPropFirmReviews(propFirmSlug: string, args: Record<string, unknown>): Promise<McpToolResult> {
  const firm = await prisma.propFirm.findUnique({ where: { slug: propFirmSlug, isActive: true }, select: { id: true } })
  if (!firm) return toolError('Prop firm not found')

  const limit = clampInt(args.limit, 1, 50, 20)
  const offset = clampInt(args.offset, 0, 1_000_000, 0)
  const reviews = await prisma.propFirmReview.findMany({
    where: { propFirmId: firm.id, status: 'approved' },
    select: { id: true, rating: true, title: true, content: true, helpfulVotes: true, createdAt: true, user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
  return toolSuccess(reviews)
}

async function listActiveDeals(args: Record<string, unknown>) {
  const limit = clampInt(args.limit, 1, 50, 20)
  const now = new Date()
  const deals = await prisma.propFirmCoupon.findMany({
    where: {
      isActive: true,
      expiresAt: { gte: now },
      OR: [
        { startsAt: null },
        { startsAt: { lte: now } },
      ],
    },
    select: { id: true, code: true, description: true, discountPercent: true, challengeFee: true, expiresAt: true, propFirm: { select: { name: true, slug: true, logoUrl: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return toolSuccess(deals)
}

async function listCommunityPosts(args: Record<string, unknown>): Promise<McpToolResult> {
  const limit = clampInt(args.limit, 1, 50, 20)
  const offset = clampInt(args.offset, 0, 1_000_000, 0)
  const where: Record<string, unknown> = {}
  if (typeof args.type === 'string' && args.type) where.type = args.type
  if (typeof args.status === 'string' && args.status) where.status = args.status

  const posts = await prisma.post.findMany({
    where,
    select: { id: true, title: true, type: true, status: true, createdAt: true, user: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  })
  return toolSuccess(posts)
}

async function getLeaderboard(args: Record<string, unknown>): Promise<McpToolResult> {
  const limit = clampInt(args.limit, 1, 50, 10)
  const offset = clampInt(args.offset, 0, 1_000_000, 0)

  // Aggregate all leaderboard users in one query, then sort and paginate in-memory
  const users = await prisma.user.findMany({
    where: { showOnLeaderboard: true },
    select: { id: true, username: true, language: true },
  })

  const userIds = users.map((u) => u.id)

  const aggregates = await prisma.trade.groupBy({
    by: ['userId'],
    where: { userId: { in: userIds } },
    _sum: { pnl: true },
    _count: { id: true },
  })

  const aggMap = new Map(aggregates.map((a) => [a.userId, a]))

  const leaderboard = users
    .map((user) => {
      const agg = aggMap.get(user.id)
      return {
        userId: user.id,
        username: user.username || 'Anonymous',
        language: user.language,
        totalPnL: agg?._sum.pnl ? Number(agg._sum.pnl) : 0,
        totalTrades: agg?._count.id ?? 0,
      }
    })
    .sort((a, b) => b.totalPnL - a.totalPnL)
    .slice(offset, offset + limit)

  return toolSuccess(leaderboard)
}

async function getTraderBenchmarks(): Promise<McpToolResult> {
  const snapshot = await prisma.traderBenchmarkSnapshot.findFirst({ orderBy: { updatedAt: 'desc' } })
  if (!snapshot) return toolSuccess({ message: 'No benchmark data available yet' })
  return toolSuccess(snapshot)
}
