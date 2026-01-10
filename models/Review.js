import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String },
  barber: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  approved: { type: Boolean, default: false }
}, { timestamps: true });

// Prevent OverwriteModelError
const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default Review;
