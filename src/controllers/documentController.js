import Document from "../models/Document.js";
import * as Y from "yjs";

export const saveDocument = async (req, res) => {
  const { workspaceId, update } = req.body;
  try {
    const doc =
      (await Document.findOne({ workspaceId })) ||
      new Document({ workspaceId });
    doc.content = Buffer.from(update, "base64"); // store as buffer
    doc.updatedAt = new Date();
    await doc.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
