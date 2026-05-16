const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const log = (type, title, color, relatedTo, userId, userName) =>
  Activity.create({ type, title, color, relatedTo, user: userId, userName }).catch(() => {});

// GET /api/tasks
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.status)  filter.status = req.query.status;
    if (req.query.project) filter.project = req.query.project;
    if (req.query.priority)filter.priority = req.query.priority;
    if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
    const tasks = await Task.find(filter)
      .populate('project', 'name color')
      .populate('assignedTo', 'name role color')
      .sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tasks
router.post('/', protect, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, createdBy: req.user._id });
    await log('task_created', `Task "${task.title}" created`, '#8b5cf6', task.projectName, req.user._id, req.user.name);
    const populated = await task.populate([
      { path: 'project', select: 'name color' },
      { path: 'assignedTo', select: 'name role color' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/tasks/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('project', 'name color')
      .populate('assignedTo', 'name role color');
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.body.status === 'done') {
      task.completedAt = new Date();
      await task.save();
      await log('task_done', `Task "${task.title}" completed ✅`, '#4ade80', task.projectName, req.user._id, req.user.name);
    }
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/tasks/:id/status  — quick status change (kanban drag)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
