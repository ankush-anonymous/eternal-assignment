import redisClient from "./redisClient";

const TTL_SECONDS = 30;

export const setCachedTokens = async (query: string, data: any) => {
  await redisClient.set(`tokens:${query}`, JSON.stringify(data), {
    EX: TTL_SECONDS,
  });
};

export const getCachedTokens = async (query: string) => {
  const raw = await redisClient.get(`tokens:${query}`);
  return raw ? JSON.parse(raw) : null;
};
