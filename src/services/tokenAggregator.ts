import { searchDexTokens } from "../api/dexScreener";
import { fetchGeckoToken } from "../api/geckoTerminal";
import { getCachedTokens, setCachedTokens } from "../cache/tokenCache";

// Updated AggregatedToken with `protocols` array
export interface AggregatedToken {
  token_address: string;
  token_name: string;
  token_ticker: string;
  price_sol: number;
  market_cap_sol: number;
  volume_sol: number;
  liquidity_sol: number;
  transaction_count: number;
  price_1hr_change: number;
  protocols: string[]; // changed from single string
  image_url?: string;
}

export const getAggregatedTokenData = async (
  query: string,
  interval: "1h" | "24h" | "7d" = "24h"
): Promise<AggregatedToken[]> => {
  const cached = await getCachedTokens(query);
  if (cached) return cached;

  const dexPairs = await searchDexTokens(query);
  const tokenMap: Map<string, AggregatedToken> = new Map();

  for (const pair of dexPairs.slice(0, 10)) {
    const baseToken = pair.baseToken;
    const tokenAddress = baseToken.address;
    const gecko = await fetchGeckoToken(tokenAddress);

    const price_sol = parseFloat(pair.priceNative || "0");
    const marketCap = gecko?.attributes?.market_cap_usd
      ? parseFloat(gecko.attributes.market_cap_usd)
      : pair.marketCap / 20;

    const volume = gecko?.attributes?.volume_usd?.h24
      ? parseFloat(gecko.attributes.volume_usd.h24)
      : pair.volume.h24 / 20;

    const liquidity = pair.liquidity?.quote || 0;
    const txCount = pair.txns?.h24 ? pair.txns.h24.buys + pair.txns.h24.sells : 0;

    // ⏱ Interval-based price change
    let priceChange = 0;
    if (interval === "1h") priceChange = pair.priceChange?.h1 || 0;
    else if (interval === "24h") priceChange = pair.priceChange?.h24 || 0;
    else if (interval === "7d") priceChange = 0; // placeholder

    const imageUrl = gecko?.attributes?.image_url || pair.info?.imageUrl;

    const existing = tokenMap.get(tokenAddress);
    if (!existing) {
      tokenMap.set(tokenAddress, {
        token_address: tokenAddress,
        token_name: baseToken.name,
        token_ticker: baseToken.symbol,
        price_sol,
        market_cap_sol: marketCap,
        volume_sol: volume,
        liquidity_sol: liquidity,
        transaction_count: txCount,
        price_1hr_change: priceChange,
        protocols: [pair.dexId],
        image_url: imageUrl
      });
    } else {
      existing.price_sol = Math.max(existing.price_sol, price_sol);
      existing.liquidity_sol = Math.max(existing.liquidity_sol, liquidity);
      existing.transaction_count = Math.max(existing.transaction_count, txCount);
      existing.price_1hr_change = Math.max(existing.price_1hr_change, priceChange);
      existing.protocols = Array.from(new Set([...existing.protocols, pair.dexId]));
    }
  }

  const results = Array.from(tokenMap.values());
  await setCachedTokens(query, results);
  return results;
};
