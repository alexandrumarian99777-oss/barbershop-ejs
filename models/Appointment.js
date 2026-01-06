const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber' },
  service: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
