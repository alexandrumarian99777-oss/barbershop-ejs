// models/Barber.js
const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String },
  experience: { type: Number },
  bio: { type: String },
  image: { type: String },
  workingHours: { type: String } // if you want to keep this
});

// ✅ Avoid OverwriteModelError
module.exports = mongoose.models.Barber || mongoose.model('Barber', barberSchema);
