import { connectRedis } from "../cache/redisClient";
import { searchDexTokens } from "../api/dexScreener";
import { fetchGeckoToken } from "../api/geckoTerminal";
import { getAggregatedTokenData } from "../services/tokenAggregator";

(async () => {
  await connectRedis(); // 🧠 MUST call this before using redis

  const dexTokens = await searchDexTokens("bonk");
  console.log("DexScreener Result:", dexTokens[0]);

  const geckoToken = await fetchGeckoToken("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263");
  console.log("Gecko Result:", geckoToken);

  const tokens = await getAggregatedTokenData("bonk");
  console.log("Aggregated Tokens:", tokens);
})();
