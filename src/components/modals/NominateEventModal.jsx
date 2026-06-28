'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle } from 'lucide-react';

export default function NominateEventModal({ isOpen, onClose, onSuccess, eventItem, currentUser }) {
  const [formData, setFormData] = useState({
    contactNumber: currentUser?.phone || '',
    mainLeader: '',
    paidTo: '',
    paymentReceipt: 'PLACEHOLDER_RECEIPT', // Placeholder until S3 is wired
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !eventItem) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch(`/api/events/${eventItem._id}/nominate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (res.ok) {
        setSuccess(true);
        onSuccess(json.data);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({
            contactNumber: currentUser?.phone || '',
            mainLeader: '',
            paidTo: '',
            paymentReceipt: 'PLACEHOLDER_RECEIPT',
          });
        }, 1500);
      } else {
        setError(json.error || 'Failed to submit nomination.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-1 font-heading">Self Nomination</h2>
        <p className="text-sm text-zinc-400 mb-6">Event: <span className="text-amber-500 font-semibold">{eventItem.name}</span></p>

        {/* Event Summary */}
        <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Date</p>
              <p className="text-sm text-zinc-200 font-semibold mt-1">{new Date(eventItem.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Venue</p>
              <p className="text-sm text-zinc-200 font-semibold mt-1">{eventItem.venue}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Ticket</p>
              <p className="text-sm text-amber-500 font-bold mt-1">₹{eventItem.ticketPrice}</p>
            </div>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            <span>Nomination submitted successfully! Awaiting admin approval.</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Contact Number *</label>
            <input 
              type="tel" 
              name="contactNumber"
              required
              value={formData.contactNumber}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="+91..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Main Leader Name *</label>
            <input 
              type="text" 
              name="mainLeader"
              required
              value={formData.mainLeader}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Your upline leader's name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Payment Made To *</label>
            <input 
              type="text" 
              name="paidTo"
              required
              value={formData.paidTo}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Person or account you paid to"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Payment Receipt</label>
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-500 text-sm">
              📎 File upload will be available after S3 is connected. A placeholder receipt is used for now.
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading || success}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Nomination'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
