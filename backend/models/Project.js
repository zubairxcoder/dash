const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    description:   { type: String, default: '' },
    client:        { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    clientName:    { type: String, default: '' },
    websiteUrl:    { type: String, default: '' },
    adminUrl:      { type: String, default: '' },
    stagingUrl:    { type: String, default: '' },
    hostingProvider:{ type: String, default: '' },
    hostingUrl:    { type: String, default: '' },
    githubRepo:    { type: String, default: '' },
    figmaUrl:      { type: String, default: '' },
    techStack:     [String],
    status: {
      type: String,
      enum: ['Planning', 'Design', 'Development', 'Testing', 'Revision', 'Completed', 'On Hold', 'Cancelled'],
      default: 'Planning',
    },
    priority:      { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
    progress:      { type: Number, default: 0, min: 0, max: 100 },
    startDate:     { type: Date },
    deadline:      { type: Date },
    completedDate: { type: Date },
    budget:        { type: Number, default: 0 },
    totalEarned:   { type: Number, default: 0 },
    pendingPayment:{ type: Number, default: 0 },
    expenses:      { type: Number, default: 0 },
    icon:          { type: String, default: '🌐' },
    color:         { type: String, default: '#3b82f6' },
    notes:         { type: String, default: '' },
    teamMembers:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags:          [String],
    isArchived:    { type: Boolean, default: false },
    createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// Virtual: profit
projectSchema.virtual('profit').get(function () {
  return this.totalEarned - this.expenses;
});

projectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
