const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

// Helper: log activity
const log = (type, title, color, relatedTo, userId, userName) =>
  Activity.create({ type, title, color, relatedTo, user: userId, userName }).catch(() => {});

// GET /api/projects  — all projects (with optional filters)
router.get('/', protect, async (req, res) => {
  try {
    const filter = { isArchived: false };
    if (req.query.status)   filter.status = req.query.status;
    if (req.query.client)   filter.client = req.query.client;
    if (req.query.priority) filter.priority = req.query.priority;
    const projects = await Project.find(filter)
      .populate('client', 'name email')
      .populate('teamMembers', 'name role color')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/projects/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email phone')
      .populate('teamMembers', 'name role color');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/projects
router.post('/', protect, async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, createdBy: req.user._id });
    await log('project_created', `New project "${project.name}" created`, '#3b82f6', project.name, req.user._id, req.user.name);
    const populated = await project.populate('client', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/projects/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('client', 'name email')
      .populate('teamMembers', 'name role color');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (req.body.status === 'Completed' && !project.completedDate) {
      project.completedDate = new Date();
      await project.save();
    }
    await log('project_updated', `Project "${project.name}" updated`, '#6366f1', project.name, req.user._id, req.user.name);
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/projects/:id/progress
router.patch('/:id/progress', protect, async (req, res) => {
  try {
    const { progress } = req.body;
    const project = await Project.findByIdAndUpdate(req.params.id, { progress }, { new: true });
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/projects/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await project.deleteOne();
    await log('project_deleted', `Project "${project.name}" deleted`, '#ef4444', project.name, req.user._id, req.user.name);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
