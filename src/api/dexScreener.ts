import axios from "axios";

const BASE_URL = "https://api.dexscreener.com/latest/dex";

export const searchDexTokens = async (query: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/search?q=${query}`);
    return response.data.pairs; // array of tokens
  }catch (err: any) {
    console.error("DexScreener fetch failed:", err.message);
    return [];
  }
};

export const fetchDexTokenByAddress = async (tokenAddress: string) => {
  const response = await axios.get(`${BASE_URL}/tokens/${tokenAddress}`);
  return response.data;
};
