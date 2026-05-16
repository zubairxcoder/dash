const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

// GET /api/finance
router.get('/', protect, async (req, res) => {
  try {
    const filter = { createdBy: req.user._id };
    if (req.query.type)    filter.type = req.query.type;
    if (req.query.project) filter.project = req.query.project;
    if (req.query.status)  filter.status = req.query.status;
    if (req.query.month) {
      const d = new Date(req.query.month);
      filter.date = { $gte: new Date(d.getFullYear(), d.getMonth(), 1), $lt: new Date(d.getFullYear(), d.getMonth() + 1, 1) };
    }
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.json(transactions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/finance/summary
router.get('/summary', protect, async (req, res) => {
  try {
    const all = await Transaction.find({ createdBy: req.user._id });
    const income   = all.filter(t => t.type === 'income'  && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const expenses = all.filter(t => t.type === 'expense' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const pending  = all.filter(t => t.type === 'income'  && t.status === 'pending').reduce((s, t) => s + t.amount, 0);

    // monthly breakdown (last 6 months)
    const now = new Date();
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      const inc = all.filter(t => t.type === 'income'  && t.status === 'completed' && t.date >= d && t.date < end).reduce((s, t) => s + t.amount, 0);
      const exp = all.filter(t => t.type === 'expense' && t.status === 'completed' && t.date >= d && t.date < end).reduce((s, t) => s + t.amount, 0);
      monthly.push({ label, income: inc, expense: exp, profit: inc - exp });
    }

    res.json({ income, expenses, pending, profit: income - expenses, monthly });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/finance
router.post('/', protect, async (req, res) => {
  try {
    const tx = await Transaction.create({ ...req.body, createdBy: req.user._id });
    const icon = tx.type === 'income' ? '💰' : '💸';
    await Activity.create({ type: 'transaction', title: `${icon} ${tx.type === 'income' ? 'Payment' : 'Expense'}: ₨${tx.amount.toLocaleString()} — ${tx.title}`, color: tx.type === 'income' ? '#4ade80' : '#f87171', relatedTo: tx.projectName || tx.clientName, user: req.user._id, userName: req.user.name }).catch(() => {});
    res.status(201).json(tx);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// PUT /api/finance/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const tx = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    res.json(tx);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// DELETE /api/finance/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Transaction deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
