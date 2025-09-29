import { getIO } from "../socket.js";

export const sendNotification = (userId, message) => {
  const io = getIO();
  io.emit("notification", { userId, message });
};
