// models/taskBoardModel.js
import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ListSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tasks: [TaskSchema],
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("List", ListSchema);
