import { startTokenPolling } from "./services/realTimeUpdater";

const popularTokens = ["bonk", "doge", "sol", "usdc", "ray"];

startTokenPolling(popularTokens);
