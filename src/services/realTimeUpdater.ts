import { getAggregatedTokenData } from "./tokenAggregator";
import redisClient from "../cache/redisClient";
import { io } from "../index"; // Socket.IO instance

let lastSentTokens: Record<string, any[]> = {};

export const startTokenPolling = (tokens: string[], interval = 30000) => {
  tokens.forEach((query) => {
    setInterval(async () => {
      try {
        const tokenData = await getAggregatedTokenData(query);
        io.emit("token:update", {
          query,
          tokens: tokenData
        });
        console.log(`📡 Emitted updates for "${query}" (${tokenData.length} tokens)`);
      } catch (err:any) {
        console.error(`❌ Polling error for "${query}":`, err.message);
      }
    }, interval);
  });
};

