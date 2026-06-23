'use client';

import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';

export default function AddEventModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    ticketPrice: 0,
    maxParticipants: '',
    minLeftBV: 0,
    minRightBV: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (res.ok) {
        onSuccess(json.data);
        onClose();
        setFormData({
          name: '',
          description: '',
          date: '',
          time: '',
          venue: '',
          ticketPrice: 0,
          maxParticipants: '',
          minLeftBV: 0,
          minRightBV: 0,
        });
      } else {
        setError(json.error || 'Failed to create event.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6 font-heading">Create New Event</h2>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Event Name *</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="e.g. Leadership Summit 2024"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Details about the event..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Date *</label>
              <input 
                type="date" 
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Time *</label>
              <input 
                type="time" 
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Venue / Location *</label>
            <input 
              type="text" 
              name="venue"
              required
              value={formData.venue}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="e.g. Grand Hyatt, Mumbai"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Ticket Price (₹) *</label>
              <input 
                type="number" 
                name="ticketPrice"
                required
                min="0"
                value={formData.ticketPrice}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Max Participants</label>
              <input 
                type="number" 
                name="maxParticipants"
                min="1"
                value={formData.maxParticipants}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Leave blank for unlimited"
              />
            </div>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-xl border border-amber-500/20">
            <h4 className="text-sm font-semibold text-amber-500 mb-3">Eligibility Requirements</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Min Left BV</label>
                <input 
                  type="number" 
                  name="minLeftBV"
                  min="0"
                  value={formData.minLeftBV}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Min Right BV</label>
                <input 
                  type="number" 
                  name="minRightBV"
                  min="0"
                  value={formData.minRightBV}
                  onChange={handleChange}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-black focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-zinc-800 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-semibold text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2 rounded-lg font-bold text-sm bg-amber-500 text-black hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
