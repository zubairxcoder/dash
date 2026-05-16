const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/team — all users
router.get('/', protect, async (req, res) => {
  try {
    const team = await User.find().select('-password').sort({ createdAt: 1 });
    res.json(team);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/team — invite/add member (admin creates account)
router.post('/', protect, async (req, res) => {
  try {
    const { name, email, password, role, skills, color, hourlyRate, phone } = req.body;
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password: password || 'Password123', role, skills, color, hourlyRate, phone });
    res.status(201).json(user);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/team/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, rest, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Member not found' });
    res.json(user);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/team/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
