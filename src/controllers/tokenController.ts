import { Request, Response } from "express";
import { getAggregatedTokenData } from "../services/tokenAggregator";
import { io } from "../index"; // Import Socket.IO instance

export const getTokenData = async (req: Request, res: Response): Promise<void> => {
  const query = req.query.q as string;

  if (!query) {
    res.status(400).json({ error: "Missing query param 'q'" });
    return;
  }

  try {
    const tokens = await getAggregatedTokenData(query);

    // ✅ Broadcast tokens to all connected clients
    io.emit("token:update", tokens);

    res.json(tokens); // ✅ No return needed here
  } catch (err) {
    console.error("Token fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
