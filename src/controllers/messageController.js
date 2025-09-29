import { sendNotification } from "../utils/notify.js";

export const createMessage = async (req, res) => {
  const { text, workspaceId } = req.body;
  sendNotification(workspaceId, "📩 New message posted");
  res.json({ success: true });
};
