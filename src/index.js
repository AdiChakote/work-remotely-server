import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";

import workspaceRoutes from "./routes/workspaceRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import taskBoardRoutes from "./routes/taskBoardRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: { origin: "*" },
});

const peers = {}; // Track connected peers per workspace

app.use(express.json());

// Attach io to req for routes if needed
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/taskboard", taskBoardRoutes);
app.use("/api/documents", documentRoutes);

// Socket.io events
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // --- Chat & TaskBoard events ---
  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    console.log(`User left room: ${room}`);
  });

  socket.on("sendMessage", (msg) => {
    if (msg?.workspace) {
      io.to(msg.workspace).emit("newMessage", msg);
    }
  });

  socket.on("taskUpdated", (payload) => {
    if (payload?.workspaceId) {
      io.to(payload.workspaceId).emit("taskUpdated", payload);
    }
  });

  // --- WebRTC / Video Call events ---
  socket.on("joinCall", ({ workspaceId, userId }) => {
    socket.join(workspaceId);
    if (!peers[workspaceId]) peers[workspaceId] = {};
    peers[workspaceId][userId] = socket.id;

    // Notify others in the workspace
    socket.to(workspaceId).emit("userJoined", { userId, socketId: socket.id });
  });

  socket.on("signal", ({ to, signal }) => {
    io.to(to).emit("signal", { signal, from: socket.id });
  });

  socket.on("disconnect", () => {
    // Remove user from peers and notify
    for (const ws in peers) {
      for (const uid in peers[ws]) {
        if (peers[ws][uid] === socket.id) {
          delete peers[ws][uid];
          socket.to(ws).emit("userLeft", { userId: uid });
        }
      }
    }
    console.log("Socket disconnected:", socket.id);
  });
});

// MongoDB connection & server start
const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
