import express from "express";
import { getTokenData } from "../controllers/tokenController";

const router = express.Router();

router.get("/", getTokenData);

export default router;
