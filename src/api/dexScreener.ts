import axios from "axios";
import { retryRequest } from "../utils/retryRequest";


const BASE_URL = "https://api.dexscreener.com/latest/dex";

export const searchDexTokens = async (query: string) => {
  try {
    const url = `https://api.dexscreener.com/latest/dex/search?q=${query}`;
    const data = await retryRequest(url);
    return data?.pairs || [];
  } catch (err:any) {
    console.error("❌ DexScreener fetch failed after retries:", err.message);
    return [];
  }
};


export const fetchDexTokenByAddress = async (tokenAddress: string) => {
  const response = await axios.get(`${BASE_URL}/tokens/${tokenAddress}`);
  return response.data;
};
