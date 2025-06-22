import axios from "axios";

const BASE_URL = "https://price.jup.ag/v4/price?ids={token1,token2}";

export const fetchJupiterPrices = async (tokenIds: string[]) => {
  try {
    const ids = tokenIds.join(",");
    const response = await axios.get(`${BASE_URL}${ids}`);
    return response.data.data; // { token1: { price: x }, token2: { price: y }, ... }
  }catch (err: any) {
    console.error("Jupiter fetch failed:", err.message);
    return {};
  }
};
