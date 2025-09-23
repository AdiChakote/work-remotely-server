import express from "express";
import { getMessages, postMessage } from "../controllers/chatController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:workspaceId", authMiddleware, getMessages);
router.post("/:workspaceId", authMiddleware, postMessage);

export default router;
