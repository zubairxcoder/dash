const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    type:        { type: String, enum: ['income', 'expense'], required: true },
    amount:      { type: Number, required: true },
    currency:    { type: String, default: 'PKR' },
    project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    projectName: { type: String, default: '' },
    client:      { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
    clientName:  { type: String, default: '' },
    category:    {
      type: String,
      enum: ['Project Payment', 'Partial Payment', 'Hosting', 'Domain', 'Tools', 'Salary', 'Marketing', 'Office', 'Other'],
      default: 'Project Payment',
    },
    status:      { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'completed' },
    date:        { type: Date, default: Date.now },
    dueDate:     { type: Date },
    notes:       { type: String, default: '' },
    invoiceNo:   { type: String, default: '' },
    paymentMethod:{ type: String, enum: ['Bank Transfer', 'Cash', 'Easypaisa', 'JazzCash', 'PayPal', 'Other'], default: 'Bank Transfer' },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
