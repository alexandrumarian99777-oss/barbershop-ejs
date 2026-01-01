const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  experience: {
    type: Number,
    required: true
  },
  workingHours: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Barber', barberSchema);
