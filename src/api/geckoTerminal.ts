import axios from "axios";

const BASE_URL = "https://api.geckoterminal.com/api/v2/networks/solana/tokens/{token_address}";

export const fetchGeckoToken = async (tokenAddress: string) => {
  try {
    const response = await axios.get(
      `https://api.geckoterminal.com/api/v2/networks/solana/tokens/${tokenAddress}`
    );
    return response.data.data;
  } catch (err: any) {
    console.error("GeckoTerminal fetch failed:", err.message);
    return null;
  }
};



