import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error", err);
});
let isConnected = false;

export const connectRedis = async () => {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
    console.log("✅ Redis connected");
  }
};

export default redisClient;
