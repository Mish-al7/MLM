'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, Image as ImageIcon } from 'lucide-react';

export default function AddEventModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    ticketPrice: '',
    maxParticipants: '',
    registrationDeadline: '',
    minLeftBV: '',
    minRightBV: '',
    bannerImage: '',
    notes: '',
    region: 'Kerala',
    district: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      ticketPrice: formData.ticketPrice ? parseFloat(formData.ticketPrice) : 0,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      minLeftBV: formData.minLeftBV ? parseInt(formData.minLeftBV) : 0,
      minRightBV: formData.minRightBV ? parseInt(formData.minRightBV) : 0,
      date: formData.date ? new Date(`${formData.date}T${formData.time || '00:00'}`) : null,
      registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline) : null,
      district: formData.region === 'Kerala' ? formData.district : null
    };

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok) {
        onSuccess();
        setFormData({
          name: '',
          description: '',
          date: '',
          time: '',
          venue: '',
          ticketPrice: '',
          maxParticipants: '',
          registrationDeadline: '',
          minLeftBV: '',
          minRightBV: '',
          bannerImage: '',
          notes: '',
          region: 'Kerala',
          district: ''
        });
        onClose();
      } else {
        setError(json.error || 'Failed to create event');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div>
          <h2 className="text-lg font-bold text-white font-heading">Create New Event</h2>
          <p className="text-zinc-500 text-xs mt-0.5">Publish a leadership seminar or training program.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-1.5">
            <ShieldAlert size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Event Title *</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="e.g. Leadership Summit 2024"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
              placeholder="Details about the event..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Banner Image</label>
            <label className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 px-4 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors w-full">
              <ImageIcon size={14} className="text-[#C5A059]" />
              <span>Select & Upload Event Banner</span>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const data = new FormData();
                  data.append('file', file);
                  try {
                    const res = await fetch('/api/upload', { method: 'POST', body: data });
                    const json = await res.json();
                    if (res.ok && json.url) {
                      setFormData(prev => ({ ...prev, bannerImage: json.url }));
                    } else {
                      alert(json.error || 'Upload failed');
                    }
                  } catch (err) {
                    alert('Upload failed');
                  }
                }}
                className="hidden"
              />
            </label>
            {formData.bannerImage && (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-zinc-800 max-h-32 bg-zinc-900 flex items-center justify-center">
                <img 
                  src={formData.bannerImage} 
                  alt="Banner Preview" 
                  className="w-full h-full object-cover max-h-32"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
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
              className="px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
