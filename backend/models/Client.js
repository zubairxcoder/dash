const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    email:       { type: String, trim: true, default: '' },
    phone:       { type: String, default: '' },
    company:     { type: String, default: '' },
    country:     { type: String, default: 'Pakistan' },
    city:        { type: String, default: '' },
    address:     { type: String, default: '' },
    avatar:      { type: String, default: '' },
    color:       { type: String, default: '#3b82f6' },
    notes:       { type: String, default: '' },
    status:      { type: String, enum: ['active', 'inactive', 'prospect'], default: 'active' },
    totalPaid:   { type: Number, default: 0 },
    totalDue:    { type: Number, default: 0 },
    projectCount:{ type: Number, default: 0 },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Client', clientSchema);
