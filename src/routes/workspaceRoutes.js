import express from "express";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import Workspace from "../models/Workspace.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { sendInviteEmail } from "../utils/email.js"; // ✅ import added

import {
  createWorkspace,
  joinWorkspace,
  getWorkspaces,
  deleteWorkspace,
  leaveWorkspace,
} from "../controllers/workspaceController.js";

const router = express.Router();

// Regular workspace routes
router.post("/create", authMiddleware, createWorkspace);
router.post("/join", authMiddleware, joinWorkspace);
router.get("/", authMiddleware, getWorkspaces);
router.delete("/delete/:workspaceId", authMiddleware, deleteWorkspace);
router.post("/leave/:workspaceId", authMiddleware, leaveWorkspace);

// ✅ Workspace file upload
router.post(
  "/:id/files",
  authMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const workspace = await Workspace.findById(req.params.id);
      if (!workspace)
        return res.status(404).json({ message: "Workspace not found" });

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "workspace_files" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        req.file && stream.end(req.file.buffer);
      });

      if (!workspace.files) workspace.files = [];
      workspace.files.push({
        name: req.file.originalname,
        url: result.secure_url,
      });
      await workspace.save();

      res.json({ file: result.secure_url });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// ✅ Workspace invite route
router.post("/:id/invite", authMiddleware, async (req, res) => {
  const { email } = req.body;
  const inviteLink = `http://localhost:3000/workspace/${req.params.id}/join`;

  try {
    await sendInviteEmail(email, "Workspace", inviteLink);
    res.json({ success: true, message: "Invite sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
