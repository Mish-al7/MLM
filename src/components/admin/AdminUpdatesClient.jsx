'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Plus, AlertCircle, CalendarClock, BookOpen, GraduationCap, Clock } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import AddUpdateModal from '@/components/modals/AddUpdateModal';

// Config per announcement type
const TYPE_CONFIG = {
  Notice: {
    icon: AlertCircle,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    badge: 'bg-blue-50 text-blue-600 border-blue-100',
    bar: 'bg-blue-500',
  },
  Reminder: {
    icon: CalendarClock,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    badge: 'bg-amber-50 text-amber-600 border-amber-100',
    bar: 'bg-amber-500',
  },
  Policy: {
    icon: BookOpen,
    bg: 'bg-violet-50',
    iconColor: 'text-violet-500',
    badge: 'bg-violet-50 text-violet-600 border-violet-100',
    bar: 'bg-violet-500',
  },
  Training: {
    icon: GraduationCap,
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-500',
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    bar: 'bg-emerald-500',
  },
};

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

export default function AdminUpdatesClient({ initialUpdates }) {
  const [updates, setUpdates] = useState(initialUpdates || []);
  const [isAddUpdateOpen, setIsAddUpdateOpen] = useState(false);

  useEffect(() => { fetchUpdates(); }, []);

  const fetchUpdates = async () => {
    try {
      const res = await fetch('/api/updates');
      if (res.ok) setUpdates((await res.json()).data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quick Announcements"
        subtitle="Publish important notices and reminders for your team."
        actions={
          <button
            onClick={() => setIsAddUpdateOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Post Announcement</span>
          </button>
        }
      />

      {updates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Bell size={24} strokeWidth={1.5} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No announcements yet</p>
          <p className="text-xs text-slate-400 mt-1">Use "Post Announcement" to notify your team instantly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {updates.map(item => {
            const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.Notice;
            const Icon = cfg.icon;

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden flex hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-shadow"
              >
                {/* Left color bar */}
                <div className={`w-1 shrink-0 ${cfg.bar}`} />

                <div className="flex items-start gap-4 p-5 flex-1">
                  {/* Icon bubble */}
                  <div className={`p-2.5 rounded-xl ${cfg.bg} flex-shrink-0 mt-0.5`}>
                    <Icon size={18} strokeWidth={1.75} className={cfg.iconColor} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {item.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock size={10} strokeWidth={1.75} />
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{item.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddUpdateModal
        isOpen={isAddUpdateOpen}
        onClose={() => setIsAddUpdateOpen(false)}
        onSuccess={(newItem) => {
          setUpdates([newItem, ...updates]);
        }}
      />
    </div>
  );
}
