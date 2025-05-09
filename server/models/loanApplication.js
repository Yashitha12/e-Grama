const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  residentId: { type: String, required: true },
  applicationType: { type: String, default: 'Loan' },
  fullName: { type: String, required: true },
  nationalIdNumber: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  contactNumber: { type: String, required: true },
  monthlyIncome: { type: Number, required: true },
  loanAmount: { type: Number, required: true },
  loanPurpose: { type: String, enum: ['Personal', 'Business', 'Medical', 'Education', 'Other'], required: true },
  loanDuration: { type: String, required: true },
  currentOccupation: { type: String, required: true },
  employerName: { type: String, required: true },
  employerContact: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  isDraft: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);