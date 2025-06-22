import { searchDexTokens } from "../api/dexScreener";
import { fetchGeckoToken } from "../api/geckoTerminal";
import { getCachedTokens, setCachedTokens } from "../cache/tokenCache";

// standard output format
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
  protocol: string;
  image_url?: string;
}

export const getAggregatedTokenData = async (query: string): Promise<AggregatedToken[]> => {
  // Step 1: Check cache
  const cached = await getCachedTokens(query);
  if (cached) return cached;

  // Step 2: Fetch from Dex
  const dexPairs = await searchDexTokens(query);
  const results: AggregatedToken[] = [];

  for (const pair of dexPairs.slice(0, 5)) {
    const baseToken = pair.baseToken;
    const tokenAddress = baseToken.address;
    const gecko = await fetchGeckoToken(tokenAddress);

    results.push({
      token_address: tokenAddress,
      token_name: baseToken.name,
      token_ticker: baseToken.symbol,
      price_sol: parseFloat(pair.priceNative || "0"),
      market_cap_sol: gecko?.attributes?.market_cap_usd
        ? parseFloat(gecko.attributes.market_cap_usd)
        : pair.marketCap / 20, // fallback
      volume_sol: gecko?.attributes?.volume_usd?.h24
        ? parseFloat(gecko.attributes.volume_usd.h24)
        : pair.volume.h24 / 20,
      liquidity_sol: pair.liquidity?.quote || 0,
      transaction_count: pair.txns?.h24
        ? pair.txns.h24.buys + pair.txns.h24.sells
        : 0,
      price_1hr_change: pair.priceChange?.h1 || 0,
      protocol: pair.dexId,
      image_url: gecko?.attributes?.image_url || pair.info?.imageUrl
    });
  }

  // Step 3: Cache it
  await setCachedTokens(query, results);

  return results;
};
