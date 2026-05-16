const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

// GET /api/activity
router.get('/', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(limit);
    res.json(activities);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/activity — manual log
router.post('/', protect, async (req, res) => {
  try {
    const act = await Activity.create({ ...req.body, user: req.user._id, userName: req.user.name });
    res.status(201).json(act);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/activity/clear
router.delete('/clear', protect, async (req, res) => {
  try {
    await Activity.deleteMany();
    res.json({ message: 'Activity log cleared' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
