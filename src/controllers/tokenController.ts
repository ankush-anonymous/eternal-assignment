import { Request, Response } from "express";
import { getAggregatedTokenData } from "../services/tokenAggregator";

export const getTokenData = async (req: Request, res: Response): Promise<void> => {
  const query = req.query.q as string;

  if (!query) {
    res.status(400).json({ error: "Missing query param 'q'" });
    return;
  }

  try {
    const tokens = await getAggregatedTokenData(query);
    res.json(tokens);
  } catch (err) {
    console.error("Token fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

