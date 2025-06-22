import { Request, Response } from "express";
import { getAggregatedTokenData } from "../services/tokenAggregator";
import redisClient from "../cache/redisClient";

export const getTokenData = async (req: Request, res: Response): Promise<void> => {
  const query = req.query.q as string;
  const sort = req.query.sort as string | undefined;
  const order = (req.query.order as "asc" | "desc") || "desc";
  const interval = (req.query.interval as "1h" | "24h" | "7d") || "24h";
  const cursor = req.query.cursor as string | undefined;
  const limit = parseInt(req.query.limit as string) || 10;

  if (!query) {
    res.status(400).json({ error: "Missing query param 'q'" });
    return;
  }

  const cacheKey = `tokens:${query}:${interval}`;

  try {
    const cached = await redisClient.get(cacheKey);
    const tokens = cached
      ? JSON.parse(cached)
      : await getAndCacheTokens(query, interval, cacheKey);

    const sortedTokens = sortTokens(tokens, sort, order);
    const paginated = paginate(sortedTokens, cursor, limit);

    res.json(paginated);
  } catch (err) {
    console.error("❌ Token fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAndCacheTokens = async (query: string, interval: "1h" | "24h" | "7d", key: string) => {
  const tokens = await getAggregatedTokenData(query, interval);
  await redisClient.setEx(key, 30, JSON.stringify(tokens));
  console.log(`⚡ Cache miss – fetched and saved under key: ${key}`);
  return tokens;
};

const sortTokens = (
  tokens: any[],
  sort?: string,
  order: "asc" | "desc" = "desc"
): any[] => {
  if (!sort || !tokens.length || typeof tokens[0][sort] === "undefined") return tokens;
  return tokens.sort((a, b) => {
    const aValue = a[sort] ?? 0;
    const bValue = b[sort] ?? 0;
    return order === "asc" ? aValue - bValue : bValue - aValue;
  });
};

// ✅ Cursor-based pagination
const paginate = (tokens: any[], cursor?: string, limit = 10) => {
  let startIndex = 0;

  if (cursor) {
    const index = tokens.findIndex((t) => t.token_address === cursor);
    startIndex = index >= 0 ? index + 1 : 0;
  }

  const paginated = tokens.slice(startIndex, startIndex + limit);
  const nextCursor = paginated.length === limit ? paginated[paginated.length - 1].token_address : null;

  return {
    data: paginated,
    nextCursor
  };
};
