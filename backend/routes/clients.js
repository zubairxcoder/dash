const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

// GET /api/clients
router.get('/', protect, async (req, res) => {
  try {
    const clients = await Client.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/clients
router.post('/', protect, async (req, res) => {
  try {
    const client = await Client.create({ ...req.body, createdBy: req.user._id });
    await Activity.create({ type: 'client_added', title: `New client "${client.name}" added`, color: '#10b981', relatedTo: client.name, user: req.user._id, userName: req.user.name }).catch(() => {});
    res.status(201).json(client);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/clients/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/clients/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'Client deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
