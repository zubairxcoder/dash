const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    type:       { type: String, required: true }, // project_created, payment_received, task_done etc
    title:      { type: String, required: true },
    description:{ type: String, default: '' },
    icon:       { type: String, default: '📌' },
    color:      { type: String, default: '#3b82f6' },
    relatedTo:  { type: String, default: '' }, // project/task/client name
    user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName:   { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
