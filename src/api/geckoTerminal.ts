// src/api/geckoTerminal.ts
import { retryRequest } from "../utils/retryRequest";

export const fetchGeckoToken = async (tokenAddress: string) => {
  try {
    const url = `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${tokenAddress}`;
    const data = await retryRequest(url);
    return data?.data;
  } catch (err:any) {
    console.error("❌ GeckoTerminal fetch failed after retries:", err.message);
    return null;
  }
};
