const mongoose = require('mongoose');

const MainUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['phm', 'patient'], required: true },
});

module.exports = mongoose.model('MainUser', MainUserSchema);
