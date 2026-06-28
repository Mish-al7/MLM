'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  Award, Edit2, TrendingUp, DollarSign, Calendar as CalendarIcon, 
  MapPin, CheckCircle, Flame, ShieldAlert, Navigation, ArrowUpRight 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MemberDashboardClient({ initialUser, allRanks, initialBanners, adminContacts = [] }) {
  const [user, setUser] = useState(initialUser);
  const [banners, setBanners] = useState(initialBanners || []);
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

  // 1. Calculate Milestone Eligibility Progress
  const milestoneProgress = useMemo(() => {
    // Find next rank that is higher than current
    const currentRankIdx = allRanks.findIndex(r => r.name === (user.rank || 'Associate'));
    const nextRank = currentRankIdx !== -1 && currentRankIdx + 1 < allRanks.length 
      ? allRanks[currentRankIdx + 1] 
      : null;

    if (!nextRank) return null;

    const leftProgress = Math.min(100, ((user.leftBV || 0) / nextRank.targetLeftBv) * 100);
    const rightProgress = Math.min(100, ((user.rightBV || 0) / nextRank.targetRightBv) * 100);
    const overallProgress = Math.round((leftProgress + rightProgress) / 2);

    const remainingLeft = Math.max(0, nextRank.targetLeftBv - (user.leftBV || 0));
    const remainingRight = Math.max(0, nextRank.targetRightBv - (user.rightBV || 0));

    return {
      nextRank,
      leftProgress,
      rightProgress,
      overallProgress,
      remainingLeft,
      remainingRight
    };
  }, [user, allRanks]);

  // 2. Compute dynamic chart data (Left vs Right BV adjustments audit trail)
  const chartData = useMemo(() => {
    if (user.bvHistory && user.bvHistory.length >= 3) {
      return user.bvHistory.slice(-6).map((h, idx) => ({
        index: idx + 1,
        left: h.newLeft,
        right: h.newRight,
        label: new Date(h.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }));
    }
    // Baseline progression fallback chart to avoid empty displays
    const currLeft = user.leftBV || 0;
    const currRight = user.rightBV || 0;
    return [
      { index: 1, left: Math.round(currLeft * 0.3), right: Math.round(currRight * 0.2), label: 'Base' },
      { index: 2, left: Math.round(currLeft * 0.55), right: Math.round(currRight * 0.45), label: 'Phase 1' },
      { index: 3, left: Math.round(currLeft * 0.8), right: Math.round(currRight * 0.75), label: 'Phase 2' },
      { index: 4, left: currLeft, right: currRight, label: 'Current' }
    ];
  }, [user]);

  // SVG Chart Calculations
  const width = 500;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const leftVals = chartData.map(d => d.left);
  const rightVals = chartData.map(d => d.right);
  const maxVal = Math.max(...leftVals, ...rightVals, 1000) * 1.1;

  const leftPoints = chartData.map((d, idx) => {
    const x = paddingLeft + (idx * chartWidth / (chartData.length - 1));
    const y = height - paddingBottom - (d.left * chartHeight / maxVal);
    return { x, y, label: d.label, val: d.left };
  });

  const rightPoints = chartData.map((d, idx) => {
    const x = paddingLeft + (idx * chartWidth / (chartData.length - 1));
    const y = height - paddingBottom - (d.right * chartHeight / maxVal);
    return { x, y, label: d.label, val: d.right };
  });

  const leftPathD = leftPoints.reduce((acc, p, idx) => acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");
  const rightPathD = rightPoints.reduce((acc, p, idx) => acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), "");

  return (
    <div className="space-y-2">
      {/* Top Greeting Welcome Card */}
      <div className="p-2 px-3 rounded-xl border border-zinc-800 bg-zinc-950/20 flex justify-between items-center">
        <h1 className="text-sm font-bold text-zinc-100 font-heading">
          Good evening, {user.name.split(' ')[0]}.
        </h1>
        <span className="text-[10px] text-zinc-500 font-mono">ID: {user.userId}</span>
      </div>

      {/* Business Value Cards Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Left Business Value Card */}
        <div className="glass-panel p-3 rounded-xl relative border border-zinc-800 bg-zinc-950/40">
          <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Left Business Value</p>
          {editMode ? (
            <input 
              type="number" 
              value={leftBV} 
              onChange={(e) => setLeftBV(parseInt(e.target.value) || 0)}
              className="mt-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-white w-full font-mono text-lg focus:outline-none focus:border-amber-500"
            />
          ) : (
            <h3 className="text-xl font-extrabold text-amber-400 mt-0.5 font-mono">
              {(user.leftBV || 0).toLocaleString()}
            </h3>
          )}
        </div>

        {/* Right Business Value Card */}
        <div className="glass-panel p-3 rounded-xl relative border border-zinc-800 bg-zinc-950/40">
          <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Right Business Value</p>
          {editMode ? (
            <input 
              type="number" 
              value={rightBV} 
              onChange={(e) => setRightBV(parseInt(e.target.value) || 0)}
              className="mt-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-white w-full font-mono text-lg focus:outline-none focus:border-amber-500"
            />
          ) : (
            <h3 className="text-xl font-extrabold text-cyan-400 mt-0.5 font-mono">
              {(user.rightBV || 0).toLocaleString()}
            </h3>
          )}
        </div>

        {/* Ranks Milestone Indicator Card */}
        <div className="glass-panel p-3 rounded-xl relative border border-zinc-800 bg-zinc-950/40 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Current Rank Milestone</p>
            <h3 className="text-lg font-bold text-zinc-200 mt-0.5 uppercase tracking-wide">{user.rank || 'Associate'}</h3>
            <p className="text-[10px] text-amber-500 mt-0.5 font-semibold">Reward: {user.reward || 'None'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0A1E3D] flex items-center justify-center flex-shrink-0">
            <Award size={16} strokeWidth={0} fill="currentColor" className="text-white fill-current w-4 h-4 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Action Buttons for edit */}
      <div className="flex justify-end gap-3 -mt-2">
        {editMode ? (
          <>
            <button 
              onClick={() => { setEditMode(false); setLeftBV(user.leftBV || 0); setRightBV(user.rightBV || 0); }} 
              className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpdateSelfBv} 
              className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-black hover:opacity-90 transition-opacity cursor-pointer shadow-md"
            >
              Save Values
            </button>
          </>
        ) : (
          <button 
            onClick={() => setEditMode(true)} 
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <Edit2 size={13} />
            <span>Adjust Self BV</span>
          </button>
        )}
      </div>

      {/* Dual Banner Display Grid replacing Chart and Milestone cards */}
      {banners.filter(b => b.imageUrl).length > 0 && (
        <div className={`grid gap-6 w-full ${
          banners.filter(b => b.imageUrl).length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
        }`}>
          {banners.filter(b => b.imageUrl).map((b) => (
            <div key={b.id} className="relative h-72 md:h-96 w-full rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
              <Image
                src={b.imageUrl}
                alt={b.altText || `Promotional Banner ${b.id}`}
                fill
                className="object-cover"
                sizes={banners.filter(b => b.imageUrl).length === 2 ? "(max-width: 768px) 100vw, 50vw" : "100vw"}
                priority
                unoptimized
              />
            </div>
          ))}
        </div>
      )}

      {/* Admin / Support Contact Panel */}
      {adminContacts.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
          <div className="border-b border-slate-50 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 font-heading uppercase tracking-wider">Support & Admin Contacts</h3>
              <p className="text-[10px] text-slate-400 font-medium">Reach out to leadership team or administrators for support</p>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Helpdesk</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminContacts.map((admin, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-xl border border-slate-100/60 hover:bg-slate-50 transition-colors">
                <img
                  src={admin.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100'}
                  alt={admin.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shadow-sm flex-shrink-0"
                />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <h4 className="text-xs font-bold text-[#001B3A] uppercase tracking-wider truncate">{admin.name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-slate-400 uppercase">Email:</span> {admin.email}
                  </p>
                  {(admin.phone || admin.phone2) && (
                    <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5">
                      <span className="font-semibold text-slate-400 uppercase">Contact:</span> 
                      {admin.phone || 'N/A'}{admin.phone2 ? ` / ${admin.phone2}` : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
