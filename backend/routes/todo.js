const express = require('express');
const router = express.Router();
const Todo = require('../models/ToDo');
const User = require("../models/User");

// GET all tasks for a user
router.get('/:userId', async (req, res) => {
  try {
    const tasks = await Todo.find({ userId: req.params.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new task
router.post('/:userId', async (req, res) => {
  try {
    const { name, category, priority } = req.body;
    const newTask = new Todo({
      userId: req.params.userId,
      name,
      category,
      priority
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update a task
router.put('/:taskId', async (req, res) => {
  try {
    const updatedTask = await Todo.findByIdAndUpdate(
      req.params.taskId,
      req.body,
      { new: true }
    );
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a task
router.delete('/:taskId', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.taskId);
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
