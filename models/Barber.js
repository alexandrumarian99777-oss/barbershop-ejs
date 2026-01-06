const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema({
  name: String,
  specialty: String,
  experience: Number,
  workingHours: String,
  bio: String,
  image: String,
  available: { type: Boolean, default: true }
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Barber || mongoose.model('Barber', barberSchema);
