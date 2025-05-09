const mongoose = require('mongoose');

const samurdhiApplicationSchema = new mongoose.Schema({
  residentId: { type: String, required: true },
  applicationType: { type: String, default: 'Samurdhi' },
  fullName: { type: String, required: true },
  nationalIdNumber: { type: String, required: true },
  permanentAddress: { type: String, required: true },
  contactNumber: { type: String, required: true },
  monthlyIncome: { type: Number, required: true },
  numberOfFamilyMembers: { type: Number, required: true },
  governmentAidHistory: { type: String },
  email: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  isDraft: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SamurdhiApplication', samurdhiApplicationSchema);