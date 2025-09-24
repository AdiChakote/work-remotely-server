import express from "express";
import { saveDocument } from "../controllers/documentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/save", authMiddleware, saveDocument);

export default router;
