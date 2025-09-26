import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import workspaceRoutes from "./routes/workspaceRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import taskBoardRoutes from "./routes/taskBoardRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/auth", authRoutes);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

const peers = {};

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/workspaces", workspaceRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/taskboard", taskBoardRoutes);
app.use("/api/documents", documentRoutes);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

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

  socket.on("joinCall", ({ workspaceId, userId }) => {
    socket.join(workspaceId);
    if (!peers[workspaceId]) peers[workspaceId] = {};
    peers[workspaceId][userId] = socket.id;

    socket.to(workspaceId).emit("userJoined", { userId, socketId: socket.id });
  });

  socket.on("signal", ({ to, signal }) => {
    io.to(to).emit("signal", { signal, from: socket.id });
  });

  socket.on("disconnect", () => {
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

  socket.on("joinWhiteboard", ({ workspaceId, userId }) => {
    socket.join(`whiteboard:${workspaceId}`);
    console.log(`Socket ${socket.id} joined whiteboard:${workspaceId}`);
  });

  socket.on("whiteboard:draw", ({ workspaceId, line }) => {
    io.to(`whiteboard:${workspaceId}`).emit("whiteboard:draw", { line });
  });

  socket.on("whiteboard:undo", ({ workspaceId }) => {
    io.to(`whiteboard:${workspaceId}`).emit("whiteboard:undo");
  });

  socket.on("whiteboard:clear", ({ workspaceId }) => {
    io.to(`whiteboard:${workspaceId}`).emit("whiteboard:clear");
  });

  socket.on("whiteboard:save", async ({ workspaceId, dataUrl }) => {
    io.to(`whiteboard:${workspaceId}`).emit("whiteboard:saved", {
      workspaceId,
    });
  });
});

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
