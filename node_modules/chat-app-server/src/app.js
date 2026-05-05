import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import chatRoutes from "./modules/chat/chat.routes.js";
import { initializeSocketServer } from "./sockets/socket.server.js";
import { ensureDatabaseSchema, verifyDatabaseConnection } from "./config/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const connectedUsers = new Map();

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

app.set("io", io);
app.set("connectedUsers", connectedUsers);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "Chat API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);

initializeSocketServer(io, connectedUsers);

const port = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await verifyDatabaseConnection();
    await ensureDatabaseSchema();
    server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
      console.log("Database connection is ready");
    });
  } catch (error) {
    console.error("Failed to connect to the database:", error.message);
    process.exit(1);
  }
};

startServer();
