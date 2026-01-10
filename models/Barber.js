import mongoose from 'mongoose';

const barberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String },
  experience: { type: Number, default: 0 },
  bio: { type: String },
  workingHours: { type: String },
  available: { type: Boolean, default: true },
  image: { type: String, default: 'default.jpg' }
}, { timestamps: true });

const Barber = mongoose.models.Barber || mongoose.model('Barber', barberSchema);

export default Barber;
