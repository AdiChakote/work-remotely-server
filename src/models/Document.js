import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  workspaceId: { type: String, required: true },
  content: { type: Buffer }, // stores Yjs encoded state
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Document", documentSchema);
