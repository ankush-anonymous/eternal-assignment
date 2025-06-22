import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import redisClient from "./cache/redisClient";
import tokenRoutes from "./routes/tokenRoutes";
import { startTokenPolling } from "./services/realTimeUpdater"; // or wherever the poller is


dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Export io for use in controllers
export let io: Server;
io = new Server(server, {
  cors: { origin: "*" }
});

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.get("/", (req, res) => {
  res.send("Meme Coin Aggregator is running");
});
app.use("/api/v1/tokens", tokenRoutes);
// startTokenPolling(["bonk", "pepe", "doge", "wif", "pipecto"]); // popular meme coins


// ✅ WebSocket Events
io.on("connection", (socket) => {
  console.log("⚡ Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});



// ✅ Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected");

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
