const Task = require("../schemas/taskSchema");

const getAllTasks = async () => {
  const tasks = await Task.find({});
  return tasks;
};

// Create a new task
const createTask = async (taskData) => {
  const task = new Task(taskData);
  await task.save();
  return task;
};

// Read a task by ID
const getTaskById = async (taskId) => {
  const task = await Task.findById(taskId);
  return task;
};

const getTasksByEventId = async (eventId) => {
  const task = await Task.find({ eventId });
  return task;
};

// Update a task by ID
const updateTaskById = async (taskId, updateData) => {
  const task = await Task.findByIdAndUpdate(taskId, updateData, { new: true });
  return task;
};

// Delete a task by ID
const deleteTaskById = async (taskId) => {
  const task = await Task.findByIdAndDelete(taskId);
  return task;
};

module.exports = {
  createTask,
  getTaskById,
  updateTaskById,
  deleteTaskById,
  getAllTasks,
  getTasksByEventId,
};
