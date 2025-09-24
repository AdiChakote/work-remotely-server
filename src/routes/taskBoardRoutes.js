// routes/taskBoardRoutes.js
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createList,
  getLists,
  addTask,
  updateTask,
  deleteTask,
  deleteList,
  updateAllLists,
} from "../controllers/taskBoardController.js";

const router = express.Router();

router.post("/lists", authMiddleware, createList);
router.get("/lists/:workspaceId", authMiddleware, getLists);
router.post("/lists/:listId/tasks", authMiddleware, addTask);
router.put("/lists/:listId/tasks/:taskId", authMiddleware, updateTask);
router.delete("/lists/:listId/tasks/:taskId", authMiddleware, deleteTask);
router.delete("/lists/:listId", authMiddleware, deleteList);

// endpoint to replace/update entire lists array (from drag-drop)
router.put("/lists/workspace/:workspaceId", authMiddleware, updateAllLists);

export default router;
