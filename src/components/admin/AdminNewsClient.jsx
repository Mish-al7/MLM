'use client';

import React, { useState, useEffect } from 'react';
import { Volume2, Plus, Pin, User, Clock, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import AddNewsModal from '@/components/modals/AddNewsModal';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminNewsClient({ initialNews }) {
  const [news, setNews] = useState(initialNews || []);
  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => { fetchNews(); }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      if (res.ok) setNews((await res.json()).data);
    } catch (err) { console.error(err); }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsAddNewsOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this news article?')) return;
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNews(prev => prev.filter(item => item._id !== id));
      } else {
        alert('Failed to delete news article.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalSuccess = (savedItem) => {
    if (editingItem) {
      // Update existing item
      setNews(prev => prev.map(item => item._id === savedItem._id ? savedItem : item));
    } else {
      // Add new item
      setNews(prev => [savedItem, ...prev]);
    }
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="News Center"
        subtitle="Manage and publish news announcements for your organisation."
        actions={
          <button
            onClick={() => {
              setEditingItem(null);
              setIsAddNewsOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Publish News</span>
          </button>
        }
      />

      {/* Pinned items first, then rest */}
      {(() => {
        const pinned  = news.filter(n => n.pinned);
        const regular = news.filter(n => !n.pinned);
        const ordered = [...pinned, ...regular];

        if (ordered.length === 0) return (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Volume2 size={24} strokeWidth={1.5} className="text-slate-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600">No news published yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Publish News" to create your first article.</p>
          </div>
        );

        return (
          <div className="grid grid-cols-1 gap-4">
            {ordered.map(item => (
              <article
                key={item._id}
                className={`relative bg-white rounded-2xl border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] ${
                  item.pinned ? 'border-blue-100' : 'border-slate-100'
                }`}
              >
                {/* Pinned top stripe */}
                {item.pinned && (
                  <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                )}

                <div className="p-6">
                  {/* Meta row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {item.pinned && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                          <Pin size={9} strokeWidth={2.5} />
                          Pinned
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <User size={11} strokeWidth={1.75} />
                        {item.author}
                      </span>
                      <span className="text-slate-200">·</span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={11} strokeWidth={1.75} />
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>

                    {/* Action buttons (Edit/Delete) */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        title="Edit article"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        title="Delete article"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-base font-bold text-slate-800 mb-2 leading-snug">{item.title}</h2>

                  {/* Content — render as HTML since it may contain rich text */}
                  <div
                    className="text-sm text-slate-500 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-p:text-slate-500"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />

                  {/* Banner image */}
                  {item.image && (
                    <div className="mt-4 rounded-xl overflow-hidden border border-slate-100">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full max-h-64 object-cover"
                      />
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        );
      })()}

      <AddNewsModal
        isOpen={isAddNewsOpen}
        onClose={() => {
          setIsAddNewsOpen(false);
          setEditingItem(null);
        }}
        onSuccess={handleModalSuccess}
        editItem={editingItem}
      />
    </div>
  );
}
