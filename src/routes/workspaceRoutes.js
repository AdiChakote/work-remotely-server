import express from "express";
import upload from "../middleware/upload.js";
import cloudinary from "../config/cloudinary.js";
import Workspace from "../models/Workspace.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

import {
  createWorkspace,
  joinWorkspace,
  getWorkspaces,
  deleteWorkspace,
  leaveWorkspace,
} from "../controllers/workspaceController.js";

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

export default router;
