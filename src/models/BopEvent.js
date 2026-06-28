import mongoose from 'mongoose';

const REGIONS = ['Kerala', 'Karnataka', 'Tamil Nadu', 'Rest of India', 'Abroad'];

const KERALA_DISTRICTS = [
  'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
  'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
  'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
];

const BopEventSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  dateTime:  { type: Date,   required: true },
  venue:     { type: String, required: true, trim: true },
  region:    { type: String, required: true, enum: REGIONS },
  district:  { type: String, default: null },   // only valid when region = 'Kerala'
  lat:       { type: Number, default: null },    // optional map coordinates
  lng:       { type: Number, default: null },
  published: { type: Boolean, default: false },  // admin toggles visibility
}, {
  timestamps: true,
});

export { REGIONS, KERALA_DISTRICTS };
export default mongoose.models.BopEvent || mongoose.model('BopEvent', BopEventSchema);
