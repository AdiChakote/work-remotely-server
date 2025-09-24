import List from "../models/TaskBoardModel.js";

export const createList = async (req, res) => {
  try {
    const { name, workspaceId } = req.body;
    const newList = await List.create({
      name,
      workspace: workspaceId,
      tasks: [],
    });

    if (req.io)
      req.io
        .to(workspaceId)
        .emit("taskUpdated", {
          workspaceId,
          updatedLists: await List.find({ workspace: workspaceId }),
        });

    res.status(201).json(newList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLists = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const lists = await List.find({ workspace: workspaceId }).sort({
      createdAt: 1,
    });
    res.json(lists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addTask = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, description } = req.body;
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ error: "List not found" });

    list.tasks.push({ title, description });
    await list.save();

    const updatedLists = await List.find({ workspace: list.workspace });
    if (req.io)
      req.io
        .to(String(list.workspace))
        .emit("taskUpdated", {
          workspaceId: String(list.workspace),
          updatedLists,
        });

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { listId, taskId } = req.params;
    const { title, description, completed } = req.body;
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ error: "List not found" });

    const task = list.tasks.id(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    await list.save();
    const updatedLists = await List.find({ workspace: list.workspace });
    if (req.io)
      req.io
        .to(String(list.workspace))
        .emit("taskUpdated", {
          workspaceId: String(list.workspace),
          updatedLists,
        });

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { listId, taskId } = req.params;
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ error: "List not found" });

    list.tasks.id(taskId).remove();
    await list.save();
    const updatedLists = await List.find({ workspace: list.workspace });
    if (req.io)
      req.io
        .to(String(list.workspace))
        .emit("taskUpdated", {
          workspaceId: String(list.workspace),
          updatedLists,
        });

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteList = async (req, res) => {
  try {
    const { listId } = req.params;
    const list = await List.findById(listId);
    if (!list) return res.status(404).json({ error: "List not found" });

    const workspaceId = String(list.workspace);
    await list.remove();
    const updatedLists = await List.find({ workspace: workspaceId });
    if (req.io)
      req.io.to(workspaceId).emit("taskUpdated", { workspaceId, updatedLists });

    res.json({ message: "List deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateAllLists = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { updatedLists } = req.body;
    await List.deleteMany({ workspace: workspaceId });
    const created = await List.insertMany(
      updatedLists.map((l) => ({
        name: l.name,
        tasks: l.tasks,
        workspace: workspaceId,
      }))
    );

    if (req.io)
      req.io
        .to(workspaceId)
        .emit("taskUpdated", { workspaceId, updatedLists: created });

    res.json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
