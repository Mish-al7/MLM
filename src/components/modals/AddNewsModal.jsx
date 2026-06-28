'use client';

import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Image as ImageIcon } from 'lucide-react';

export default function AddNewsModal({ isOpen, onClose, onSuccess, editItem = null }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: 'Super Admin',
    image: '',
    pinned: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setFormData({
        title: editItem.title || '',
        content: editItem.content || '',
        author: editItem.author || 'Super Admin',
        image: editItem.image || '',
        pinned: !!editItem.pinned,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        author: 'Super Admin',
        image: '',
        pinned: false,
      });
    }
    setError('');
  }, [editItem, isOpen]);

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
      const url = editItem ? `/api/news/${editItem._id}` : '/api/news';
      const method = editItem ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (res.ok) {
        onSuccess(json.data);
        onClose();
        if (!editItem) {
          setFormData({ title: '', content: '', author: 'Super Admin', image: '', pinned: false });
        }
      } else {
        setError(json.error || `Failed to ${editItem ? 'update' : 'publish'} news.`);
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

        <h2 className="text-xl font-bold text-white mb-6 font-heading">
          {editItem ? 'Edit News Article' : 'Publish News'}
        </h2>

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
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="e.g. Q3 Organization Review"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Content * (HTML/Plain Text)</label>
            <textarea 
              name="content"
              required
              value={formData.content}
              onChange={handleChange}
              rows={5}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Write your news article here..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Preview Image URL</label>
            <input 
              type="text" 
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="e.g. https://images.unsplash.com/photo-..."
            />
            {formData.image && (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-zinc-800 max-h-32 bg-zinc-900 flex items-center justify-center">
                <img 
                  src={formData.image} 
                  alt="Preview" 
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
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Author</label>
              <input 
                type="text" 
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2.5 text-black focus:outline-none focus:border-amber-500 transition-colors"
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
              className="px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : editItem ? 'Save Changes' : 'Publish News'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
