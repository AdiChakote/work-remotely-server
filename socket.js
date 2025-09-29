import { Server } from "socket.io";

let io;
const onlineUsers = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*", // change to your frontend domain in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("⚡ User connected:", socket.id);

    socket.on("user_online", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("update_online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("disconnect", () => {
      for (let [userId, id] of onlineUsers) {
        if (id === socket.id) {
          onlineUsers.delete(userId);
        }
      }
      io.emit("update_online_users", Array.from(onlineUsers.keys()));
      console.log("❌ User disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => io;
