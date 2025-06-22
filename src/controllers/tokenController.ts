import { Request, Response } from "express";
import { getAggregatedTokenData } from "../services/tokenAggregator";
import redisClient from "../cache/redisClient";

export const getTokenData = async (req: Request, res: Response): Promise<void> => {
  const query = req.query.q as string;

  if (!query) {
    res.status(400).json({ error: "Missing query param 'q'" });
    return;
  }

  const cacheKey = `tokens:${query}`; // ✅ consistent key

  try {
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for key: ${cacheKey}`);
      res.json(JSON.parse(cached));
      return;
    }

    // Cache miss — fetch and store
    const tokens = await getAggregatedTokenData(query);

    await redisClient.setEx(cacheKey, 30, JSON.stringify(tokens)); // ✅ save with TTL
    console.log(`⚡ Cache miss – fetched and saved under key: ${cacheKey}`);

    res.json(tokens);
  } catch (err) {
    console.error("❌ Token fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
