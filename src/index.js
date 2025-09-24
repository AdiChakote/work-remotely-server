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

const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(express.json());

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

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
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
