const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    projectName: { type: String, default: '' },
    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assigneeName:{ type: String, default: '' },
    status:      { type: String, enum: ['todo', 'inprogress', 'review', 'done'], default: 'todo' },
    priority:    { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    dueDate:     { type: Date },
    completedAt: { type: Date },
    tags:        [String],
    timeEstimate:{ type: Number, default: 0 }, // hours
    timeSpent:   { type: Number, default: 0 },
    order:       { type: Number, default: 0 },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
