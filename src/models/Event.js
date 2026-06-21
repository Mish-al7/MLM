import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  ticketPrice: { type: Number, default: 0 },
  maxParticipants: { type: Number, default: null },
  registrationDeadline: { type: Date, default: null },
  minLeftBV: { type: Number, default: 0 },
  minRightBV: { type: Number, default: 0 },
  bannerImage: { type: String, default: '' },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
