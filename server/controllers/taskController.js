const {
  createTask,
  getTaskById,
  updateTaskById,
  deleteTaskById,
  getAllTasks,
  getTasksByEventId,
} = require("../models/taskModel");
const ServerUnableError = require("../errors/internalErrors");
const { PropertyNotFound, EntityNotFound } = require("../errors/notFoundErrors");

const createNewTask = async (req, res) => {
  const taskData = req.body;
  const { eventId } = req.params;
  if (!eventId) throw new PropertyNotFound("event Id");
  if (!taskData) throw new PropertyNotFound("task data");

  const task = await createTask(taskData);
  if (!task) throw new ServerUnableError("create task");

  task = { ...task, eventId };
  res.status(201).json(task);
};

const getTasks = async (req, res) => {
  const tasks = await getAllTasks();
  if (!tasks) throw new EntityNotFound("Tasks");

  res.status(200).json(tasks);
};

const getTask = async (req, res) => {
  const taskId = req.params.id;
  if (!taskId) throw new PropertyNotFound("task Id");

  const task = await getTaskById(taskId);
  if (!task) throw new EntityNotFound("Task");

  res.status(200).json(task);
};

const updateTask = async (req, res) => {
  const taskId = req.params.id;
  const updateData = req.body;
  if (!taskId) throw new PropertyNotFound("task Id");
  if (!updateData) throw new PropertyNotFound("update data");

  const task = await updateTaskById(taskId, updateData);
  if (!task) throw new EntityNotFound("Task");

  res.status(200).json(task);
};

const deleteTask = async (req, res) => {
  const taskId = req.params.id;
  if (!taskId) throw new PropertyNotFound("task Id");

  const task = await deleteTaskById(taskId);
  if (!task) throw new EntityNotFound("Task");

  res.status(200).json(task);
};

const getEventsTasks = async (req, res) => {
  const eventId = req.params.id;
  if (!eventId) throw new PropertyNotFound("event Id");

  const task = await getTasksByEventId(eventId);
  if (!task) throw new EntityNotFound("Task");

  res.status(200).json(task);
};

module.exports = {
  createNewTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  getEventsTasks,
};
