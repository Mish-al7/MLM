'use client';

import React from 'react';
import { Briefcase, Sparkles, Clock } from 'lucide-react';

export default function BOPClient({ isAdmin = false }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white font-heading">Business Opportunity Program</h1>
        <p className="text-zinc-400 text-xs mt-0.5">
          {isAdmin
            ? 'Manage and publish business opportunity programs for your team.'
            : 'Explore business opportunity programs available to you.'}
        </p>
      </div>

      {/* Coming Soon Card */}
      <div className="flex flex-col items-center justify-center min-h-[480px] rounded-2xl glass-panel border border-zinc-800 p-10 text-center gap-6">
        {/* Icon glow */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-2xl scale-150" />
          <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/30 flex items-center justify-center shadow-xl shadow-amber-500/10">
            <Briefcase size={40} className="text-amber-400" />
          </div>
        </div>

        {/* Title */}
        <div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-bold uppercase tracking-widest">Coming Soon</span>
            <Sparkles size={14} className="text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white font-heading">Feature in Development</h2>
          <p className="text-zinc-400 text-sm mt-3 max-w-md leading-relaxed">
            The Business Opportunity Program module is currently being built.
            Check back soon for powerful tools to grow and manage your business opportunities.
          </p>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-zinc-900 border border-zinc-800">
          <Clock size={13} className="text-zinc-500" />
          <span className="text-zinc-400 text-xs font-semibold">Under construction — functionality coming in next release</span>
        </div>
      </div>
    </div>
  );
}
