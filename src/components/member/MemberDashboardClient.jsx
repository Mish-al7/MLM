'use client';

import React, { useState, useMemo } from 'react';
import { 
  Award, Edit2, TrendingUp, DollarSign, Calendar as CalendarIcon, 
  MapPin, CheckCircle, Flame, ShieldAlert, Navigation, ArrowUpRight 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MemberDashboardClient({ initialUser, allRanks }) {
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
          <div className="p-1.5 bg-zinc-900 rounded-lg text-amber-500 shrink-0">
            <Award size={16} />
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

      {/* Dynamic Graph Trend and Milestone Progress Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Card: BV Growth Audit Line Chart */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="text-amber-500" size={16} />
              <span>BV Progression History</span>
            </h3>
            <div className="flex items-center gap-4 text-[9px] font-mono">
              <span className="flex items-center gap-1 text-amber-500">
                <span className="w-2.5 h-0.5 bg-amber-500 inline-block" /> Left
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" /> Right
              </span>
            </div>
          </div>

          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 mt-2">
            {/* Y Axis Grid lines */}
            {[0, 0.5, 1].map((ratio, idx) => {
              const y = paddingTop + ratio * chartHeight;
              return (
                <line key={idx} x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#1e1e1e" strokeWidth={1} strokeDasharray="3,3" />
              );
            })}
            
            {/* Left BV Line */}
            {leftPoints.length > 0 && (
              <path d={leftPathD} fill="none" stroke="#f59e0b" strokeWidth={2} />
            )}
            
            {/* Right BV Line */}
            {rightPoints.length > 0 && (
              <path d={rightPathD} fill="none" stroke="#22d3ee" strokeWidth={2} />
            )}
            
            {/* Left BV node circles and values */}
            {leftPoints.map((p, idx) => (
              <g key={`l-${idx}`}>
                <circle cx={p.x} cy={p.y} r={3} fill="#09090b" stroke="#f59e0b" strokeWidth={1.5} />
                <text x={p.x} y={p.y - 7} fill="#f59e0b" fontSize={8} fontWeight="semibold" textAnchor="middle">{p.val.toLocaleString()}</text>
              </g>
            ))}

            {/* Right BV node circles and values */}
            {rightPoints.map((p, idx) => (
              <g key={`r-${idx}`}>
                <circle cx={p.x} cy={p.y} r={3} fill="#09090b" stroke="#22d3ee" strokeWidth={1.5} />
                <text x={p.x} y={p.y + 11} fill="#22d3ee" fontSize={8} fontWeight="semibold" textAnchor="middle">{p.val.toLocaleString()}</text>
              </g>
            ))}

            {/* X Axis Labels */}
            {leftPoints.map((p, idx) => (
              <text key={`lbl-${idx}`} x={p.x} y={height - 5} fill="#71717a" fontSize={8.5} textAnchor="middle">{p.label}</text>
            ))}
          </svg>
        </div>

        {/* Right Card: Milestone Target Upgrade Progress Bar */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 flex flex-col justify-between">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="text-amber-500 animate-pulse" size={15} />
              <span>Next Milestone Qualification Progress</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">Live requirements verification for leadership promotion</p>
          </div>

          {milestoneProgress ? (
            <div className="my-5 space-y-5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-zinc-400">Target Rank:</span>
                <span className="text-amber-400 font-extrabold uppercase tracking-wider">{milestoneProgress.nextRank.name}</span>
              </div>

              {/* Progress sliders */}
              <div className="space-y-3.5">
                {/* Left Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-500">Left BV target:</span>
                    <span className="text-amber-500 font-bold">{user.leftBV.toLocaleString()} / {milestoneProgress.nextRank.targetLeftBv.toLocaleString()} BV</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${milestoneProgress.leftProgress}%` }}
                    />
                  </div>
                </div>

                {/* Right Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-zinc-500">Right BV target:</span>
                    <span className="text-cyan-400 font-bold">{user.rightBV.toLocaleString()} / {milestoneProgress.nextRank.targetRightBv.toLocaleString()} BV</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-400 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${milestoneProgress.rightProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Overall qualification completion card */}
              <div className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/30 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Qualification Progress</span>
                  <p className="text-sm font-bold text-zinc-300 mt-0.5">{milestoneProgress.overallProgress}% Complete</p>
                </div>
                <div className="text-[10px] text-right font-semibold text-zinc-400 max-w-[170px] leading-relaxed">
                  {milestoneProgress.remainingLeft === 0 && milestoneProgress.remainingRight === 0 ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle size={11} /> Qualified!
                    </span>
                  ) : (
                    <span>
                      Needs {milestoneProgress.remainingLeft > 0 && `${milestoneProgress.remainingLeft.toLocaleString()} L-BV`}
                      {milestoneProgress.remainingLeft > 0 && milestoneProgress.remainingRight > 0 && " and "}
                      {milestoneProgress.remainingRight > 0 && `${milestoneProgress.remainingRight.toLocaleString()} R-BV`} more.
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 italic my-auto text-xs border border-dashed border-zinc-900 rounded-xl">
              Qualified for all milestones! You have reached the maximum rank (Crown).
            </div>
          )}

          {/* Quick link button to achievements */}
          <div className="p-3 rounded-lg border border-amber-500/10 bg-amber-500/5 text-[10px] text-amber-500/80 flex items-start gap-2 mt-2 leading-relaxed">
            <Flame size={12} className="shrink-0 mt-0.5 text-amber-500" />
            <span>Milestone qualifications are evaluated by Super Admins. Adjust your BV balance above to qualify for promotions!</span>
          </div>
        </div>

      </div>

    </div>
  );
}
