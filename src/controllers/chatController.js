import Chat from "../models/ChatModel.js";

export const getMessages = async (req, res) => {
  const { workspaceId } = req.params;
  try {
    const messages = await Chat.find({ workspace: workspaceId }).sort(
      "createdAt"
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const postMessage = async (req, res) => {
  const { workspaceId } = req.params;
  const { content } = req.body;
  const sender = req.user._id;
  const senderName = req.user.name;

  try {
    const msg = await Chat.create({
      workspace: workspaceId,
      sender,
      senderName,
      content,
    });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
};
