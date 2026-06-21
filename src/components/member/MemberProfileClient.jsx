'use client';

import React from 'react';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';

export default function MemberProfileClient({ currentUser }) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading">My Profile Details</h1>
        <p className="text-zinc-400 text-xs mt-1">View your personal information and account status.</p>
      </div>

      <div className="p-8 rounded-2xl glass-panel border border-zinc-800 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="relative">
          <img 
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} 
            alt={currentUser.name} 
            className="w-32 h-32 rounded-full border-4 border-zinc-800 object-cover" 
          />
          <div className="absolute -bottom-2 -right-2 bg-amber-500 text-black px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
            {currentUser.rank || 'Associate'}
          </div>
        </div>

        <div className="flex-1 space-y-6 w-full">
          <div>
            <h2 className="text-2xl font-bold text-white">{currentUser.name}</h2>
            <p className="text-zinc-500 font-mono text-sm">{currentUser.userId} {currentUser.tezId && `| ${currentUser.tezId}`}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
              <Mail className="text-zinc-500" size={16} />
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Email Address</p>
                <p className="text-sm text-zinc-300 truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
              <Phone className="text-zinc-500" size={16} />
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Phone Number</p>
                <p className="text-sm text-zinc-300">{currentUser.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
              <Calendar className="text-zinc-500" size={16} />
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Join Date</p>
                <p className="text-sm text-zinc-300">{new Date(currentUser.joiningDate || new Date()).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
              <Shield className="text-zinc-500" size={16} />
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Account Status</p>
                <p className="text-sm text-emerald-400 capitalize">{currentUser.status || 'Active'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
