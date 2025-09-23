import express from "express";
import {
  createWorkspace,
  joinWorkspace,
  getWorkspaces,
  deleteWorkspace,
  leaveWorkspace,
} from "../controllers/workspaceController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createWorkspace);
router.post("/join", authMiddleware, joinWorkspace);
router.get("/", authMiddleware, getWorkspaces);
router.delete("/delete/:workspaceId", authMiddleware, deleteWorkspace);
router.post("/leave/:workspaceId", authMiddleware, leaveWorkspace);

export default router;
