import mongoose from 'mongoose';

const RegistrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: String, required: true }, // references User.userId
  contactNumber: { type: String, required: true },
  mainLeader: { type: String, required: true },
  paymentReceipt: { type: String, required: true }, // Cloudinary URL or local file path
  paidTo: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  registrationDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);
