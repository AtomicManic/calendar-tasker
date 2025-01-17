const { createTask, getTaskById, updateTaskById, deleteTaskById, getAllTasks, getTasksByEventId } = require('../models/taskModel');

const createNewTask = async (req, res) => {
    try {
        const taskData = req.body;
        const task = await createTask(taskData);
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getTasks = async (req, res) => {
    try {
        const tasks = await getAllTasks();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await getTaskById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found!' });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const updateData = req.body;
        const task = await updateTaskById(taskId, updateData);
        if (!task) {
            return res.status(404).json({ error: 'Task not found!' });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await deleteTaskById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found!' });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

const getEventsTasks = async (req, res) => {
    try {
        const eventId = req.params.id;
        const task = await getTasksByEventId(eventId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found!' });
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    createNewTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    getEventsTasks
};