'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import AddUpdateModal from '@/components/modals/AddUpdateModal';

export default function AdminUpdatesClient({ initialUpdates }) {
  const [updates, setUpdates] = useState(initialUpdates || []);
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      const res = await fetch('/api/updates');
      if (res.ok) {
        const json = await res.json();
        setUpdates(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Quick Announcements</h1>
          <p className="text-zinc-400 text-xs mt-1">Publish important notices and reminders.</p>
        </div>
        <button 
          onClick={() => setIsAddUpdateOpen(true)}
          className="flex items-center gap-1.5 bg-amber-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <span>Post Announcement</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {updates.map(item => (
          <div key={item._id} className="p-4 rounded-xl glass-panel border border-zinc-800 flex items-start gap-4">
            <div className="p-3 bg-zinc-900 rounded-lg">
              <Bell className="text-amber-500" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {item.type}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-zinc-200 mt-2">{item.content}</p>
            </div>
          </div>
        ))}

        {updates.length === 0 && (
          <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl glass-panel">
            <Bell size={40} className="mx-auto mb-4 text-zinc-700" />
            <p>No announcements right now.</p>
          </div>
        )}
      </div>

      <AddUpdateModal 
        isOpen={isAddUpdateOpen} 
        onClose={() => setIsAddUpdateOpen(false)}
        onSuccess={(newItem) => {
          setUpdates([newItem, ...updates]);
          alert('Announcement posted successfully!');
        }}
      />
    </div>
  );
}
