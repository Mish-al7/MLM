import mongoose from 'mongoose';

const LedgerEntrySchema = new mongoose.Schema({
  ledgerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ledger', required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true, min: 0 }
}, {
  timestamps: true
});

export default mongoose.models.LedgerEntry || mongoose.model('LedgerEntry', LedgerEntrySchema);
