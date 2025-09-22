import Workspace from "../models/Workspace.js";

export const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    const workspace = new Workspace({
      name,
      owner: userId,
      members: [userId],
    });
    await workspace.save();
    res.status(201).json(workspace);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const joinWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.body;
    const userId = req.user.id;

    const workspace = await Workspace.findNyId(workspaceId);
    if (!workspace)
      return res.status(400).json({ error: "Workspace not found" });

    if (!workspace.members.includes(userId)) {
      workspace.members.push(userId);
      await workspace.save();
    }
    res.json(workspace);
  } catch (err) {
    res.json(500).json({ error: "Server error" });
  }
};

export const getWorkspaces = async (req, res) => {
  try {
    const userId = req.user.id;
    const workspace = await Workspace.find({ members: userId }).populate(
      "members",
      "name email"
    );
    res.json(workspace);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace)
      return res.status(404).json({ error: "Workspace not found" });

    if (workspace.owner.toString() !== userId) {
      return res.status(403).json({ error: "Only owner can delete workspace" });
    }

    await workspace.remove();
    res.json({ message: "Workspace deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const leaveWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user.id;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace)
      return res.status(404).json({ error: "Workspace not found" });

    workspace.members = workspace.members.filter(
      (id) => id.toString() !== userId
    );
    await workspace.save();

    res.json({ message: "You left the workspace" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
