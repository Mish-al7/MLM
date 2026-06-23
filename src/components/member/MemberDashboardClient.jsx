'use client';

import React, { useState } from 'react';
import { Award, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MemberDashboardClient({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [leftBV, setLeftBV] = useState(user.leftBV || 0);
  const [rightBV, setRightBV] = useState(user.rightBV || 0);
  const router = useRouter();

  const handleUpdateSelfBv = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/members/${user.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leftBV, rightBV })
      });
      const json = await res.json();
      if (res.ok) {
        alert('Business values updated successfully!');
        setUser({ ...user, leftBV: json.data.leftBV, rightBV: json.data.rightBV });
        setEditMode(false);
        router.refresh();
      } else {
        alert(json.error || 'Failed to update');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Greeting Welcome Card */}
      <div className="p-6 rounded-2xl glass-panel relative overflow-hidden border border-zinc-800/80">
        <div className="relative z-10">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-widest">
            Member Workspace
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-100 mt-1 font-heading">
            Good evening, {user.name.split(' ')[0]}.
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Your ranks. Your milestones. Your organization metrics at a glance.</p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <Award size={150} className="text-amber-500" />
        </div>
      </div>

      {/* Business Value Cards Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Business Value Card */}
        <div className="glass-panel p-6 rounded-2xl relative border border-zinc-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Left Business Value</p>
              {editMode ? (
                <input 
                  type="number" 
                  value={leftBV} 
                  onChange={(e) => setLeftBV(e.target.value)}
                  className="mt-2 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-100 w-full font-mono text-xl"
                />
              ) : (
                <h3 className="text-4xl font-extrabold text-zinc-100 mt-2 font-mono flex items-center gap-2">
                  {(user.leftBV || 0).toLocaleString()}
                  <button 
                    onClick={() => setEditMode(true)}
                    className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                    title="Edit Left Business Value"
                  >
                    <Edit2 size={14} />
                  </button>
                </h3>
              )}
            </div>
          </div>
        </div>

        {/* Right Business Value Card */}
        <div className="glass-panel p-6 rounded-2xl relative border border-zinc-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Right Business Value</p>
              {editMode ? (
                <input 
                  type="number" 
                  value={rightBV} 
                  onChange={(e) => setRightBV(e.target.value)}
                  className="mt-2 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-100 w-full font-mono text-xl"
                />
              ) : (
                <h3 className="text-4xl font-extrabold text-zinc-100 mt-2 font-mono flex items-center gap-2">
                  {(user.rightBV || 0).toLocaleString()}
                  <button 
                    onClick={() => setEditMode(true)}
                    className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                    title="Edit Right Business Value"
                  >
                    <Edit2 size={14} />
                  </button>
                </h3>
              )}
            </div>
          </div>
        </div>

        {/* Ranks Milestone Indicator Card */}
        <div className="glass-panel p-6 rounded-2xl relative border border-zinc-800">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">Current Rank Milestone</p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1">{user.rank || 'Associate'}</h3>
              <p className="text-xs text-amber-500 mt-1">Reward: {user.reward || 'None'}</p>
            </div>
            <div className="p-3 bg-zinc-900 rounded-lg text-amber-500">
              <Award size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        {editMode ? (
          <>
            <button onClick={() => setEditMode(false)} className="px-4 py-2 rounded-lg font-semibold text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleUpdateSelfBv} className="px-4 py-2 rounded-lg font-bold text-sm bg-amber-500 text-zinc-100 hover:opacity-90 transition-opacity">
              Save Values
            </button>
          </>
        ) : (
          <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors">
            <Edit2 size={16} />
            Update Business Values
          </button>
        )}
      </div>

    </div>
  );
}
