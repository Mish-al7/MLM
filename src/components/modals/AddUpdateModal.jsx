'use client';

import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';

export default function AddUpdateModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    content: '',
    type: 'Notice',
    author: 'Super Admin',
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
      const res = await fetch('/api/updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (res.ok) {
        onSuccess(json.data);
        onClose();
        setFormData({ content: '', type: 'Notice', author: 'Super Admin' });
      } else {
        setError(json.error || 'Failed to post announcement.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-6 font-heading">Post Quick Announcement</h2>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Message Content *</label>
            <textarea 
              name="content"
              required
              value={formData.content}
              onChange={handleChange}
              rows={4}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="What's the update?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Category Type</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="Notice">Notice</option>
                <option value="Reminder">Reminder</option>
                <option value="Policy">Policy</option>
                <option value="Training">Training</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Author</label>
              <input 
                type="text" 
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors"
              />
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
              {loading ? 'Posting...' : 'Post Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
