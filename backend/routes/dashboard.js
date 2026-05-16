const express = require('express');
const router = express.Router();
const Project     = require('../models/Project');
const Task        = require('../models/Task');
const Client      = require('../models/Client');
const User        = require('../models/User');
const Transaction = require('../models/Transaction');
const Activity    = require('../models/Activity');
const { protect } = require('../middleware/auth');

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const [projects, tasks, clients, team, txns, activities] = await Promise.all([
      Project.find({ isArchived: false }),
      Task.find(),
      Client.find({ createdBy: req.user._id }),
      User.find().select('-password'),
      Transaction.find({ createdBy: req.user._id }),
      Activity.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const totalEarned  = txns.filter(t => t.type === 'income'  && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const totalExpense = txns.filter(t => t.type === 'expense' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
    const pending      = txns.filter(t => t.type === 'income'  && t.status === 'pending').reduce((s, t) => s + t.amount, 0);

    // This month income
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyIncome = txns.filter(t => t.type === 'income' && t.status === 'completed' && new Date(t.date) >= monthStart).reduce((s, t) => s + t.amount, 0);

    res.json({
      projects: {
        total:     projects.length,
        active:    projects.filter(p => ['Development', 'Testing', 'Revision'].includes(p.status)).length,
        completed: projects.filter(p => p.status === 'Completed').length,
        onHold:    projects.filter(p => p.status === 'On Hold').length,
        planning:  projects.filter(p => ['Planning', 'Design'].includes(p.status)).length,
      },
      tasks: {
        total:      tasks.length,
        todo:       tasks.filter(t => t.status === 'todo').length,
        inprogress: tasks.filter(t => t.status === 'inprogress').length,
        done:       tasks.filter(t => t.status === 'done').length,
      },
      clients: { total: clients.length },
      team:    { total: team.length, online: team.filter(m => m.isOnline).length },
      finance: { totalEarned, totalExpense, pending, profit: totalEarned - totalExpense, monthlyIncome },
      recentProjects: projects.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
      activities,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
