import { getTradesAction, type SerializedTrade } from "@/server/database";
import { getRedisJson, setRedisJson } from "@/lib/redis-client";
import { createLogger } from "@/lib/logger";

const log = createLogger('ai-data');

const DEFAULT_PAGE_SIZE = 500;
const MAX_PAGES = 200;

type GetAllTradesOptions = {
  pageSize?: number;
  maxPages?: number;
  forceRefresh?: boolean;
  userId?: string;  // explicit for MCP context (bypasses getUserId for strict scoping)
};

export type AiTradesFetchResult = {
  trades: SerializedTrade[];
  truncated: boolean;
  fetchedPages: number;
  dataQualityWarning?: string;
};

/**
 * AI analytics tools need complete user trade history; getTradesAction is paginated.
 * This helper fetches all pages with conservative guards.
 */
export async function getAllTradesForAi(
  options: GetAllTradesOptions = {},
): Promise<AiTradesFetchResult> {
  const pageSize = Math.max(1, Math.floor(options.pageSize ?? DEFAULT_PAGE_SIZE));
  const maxPages = Math.max(1, Math.floor(options.maxPages ?? MAX_PAGES));
  const forceRefresh = options.forceRefresh ?? false;

  const userId = options.userId;
  if (!userId) {
    throw new Error('MISSING_USER_ID_FOR_AI_TRADES: AI data tools require explicit userId. Routes must pass the authenticated userId from guardAiRequest (or MCP context) when creating tools or calling these functions.');
  }

  log.info('AI data fetch starting', { userId, pageSize, maxPages, forceRefresh });

  const cacheKey = `user:${userId}:ps:${pageSize}:mp:${maxPages}`;

  if (!forceRefresh) {
    const cached = await getRedisJson<AiTradesFetchResult>("ai-trades", cacheKey);
    if (cached) {
      return cached;
    }
  }

  const allTrades: SerializedTrade[] = [];
  let page = 1;
  let truncated = false;

  while (page <= maxPages) {
    // Pass explicit userId as trustedUserId bypass.
    // This prevents getTradesAction from calling getDatabaseUserId() (which requires cookies()/request context)
    // inside AI tool execute callbacks.
    const paginated = await getTradesAction(
      userId,
      page,
      pageSize,
      forceRefresh && page === 1,
      false,
      userId, // trustedUserId
    );
    allTrades.push(...paginated.trades);

    if (!paginated.metadata.hasMore) {
      break;
    }

    if (page === maxPages) {
      truncated = true;
      break;
    }

    page += 1;
  }

  const result: AiTradesFetchResult = {
    trades: allTrades,
    truncated,
    fetchedPages: page,
    dataQualityWarning: truncated
      ? "Analysis is based on a capped subset of trade history. Results may be incomplete."
      : undefined,
  };

  await setRedisJson("ai-trades", cacheKey, result, 90);

  log.info('AI data fetch completed', { 
    userId, 
    tradesFetched: allTrades.length, 
    pages: page, 
    truncated, 
    fromCache: !forceRefresh && !! (await getRedisJson("ai-trades", cacheKey)) // rough
  });

  return result;
}
