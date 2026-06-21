'use client';

import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';

export default function AddNewsModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: 'Super Admin',
    pinned: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (res.ok) {
        onSuccess(json.data);
        onClose();
        setFormData({ title: '', content: '', author: 'Super Admin', pinned: false });
      } else {
        setError(json.error || 'Failed to publish news.');
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

        <h2 className="text-xl font-bold text-white mb-6 font-heading">Publish News</h2>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2">
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Headline / Title *</label>
            <input 
              type="text" 
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="e.g. Q3 Organization Review"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Content *</label>
            <textarea 
              name="content"
              required
              value={formData.content}
              onChange={handleChange}
              rows={5}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Write your news article here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              name="pinned"
              id="pinned"
              checked={formData.pinned}
              onChange={handleChange}
              className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 accent-amber-500"
            />
            <label htmlFor="pinned" className="text-sm text-zinc-300">Pin this news to the top</label>
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
              {loading ? 'Publishing...' : 'Publish News'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
