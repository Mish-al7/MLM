'use client';

import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import AddNewsModal from '@/components/modals/AddNewsModal';

export default function AdminNewsClient({ initialNews }) {
  const [news, setNews] = useState(initialNews || []);
  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const json = await res.json();
        setNews(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">News Center</h1>
          <p className="text-zinc-400 text-xs mt-1">Manage and publish news announcements.</p>
        </div>
        <button 
          onClick={() => setIsAddNewsOpen(true)}
          className="flex items-center gap-1.5 bg-amber-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <span>Publish News</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {news.map(item => (
          <div key={item._id} className="p-6 rounded-xl glass-panel border border-zinc-800 relative">
            {item.pinned && (
              <span className="absolute top-4 right-4 text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded font-bold uppercase tracking-wider">
                Pinned
              </span>
            )}
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-zinc-400 mb-4 whitespace-pre-wrap">{item.content}</p>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>By {item.author}</span>
              <span>•</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}

        {news.length === 0 && (
          <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl glass-panel">
            <Volume2 size={40} className="mx-auto mb-4 text-zinc-700" />
            <p>No news highlights published yet.</p>
          </div>
        )}
      </div>

      <AddNewsModal 
        isOpen={isAddNewsOpen} 
        onClose={() => setIsAddNewsOpen(false)}
        onSuccess={(newItem) => {
          setNews([newItem, ...news]);
          alert('News published successfully!');
        }}
      />
    </div>
  );
}
