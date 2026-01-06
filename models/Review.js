const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  comment: { type: String, required: true },
  rating: { type: Number, required: true },
  approved: { type: Boolean, default: false }
}, { timestamps: true });

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);
