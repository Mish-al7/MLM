'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { 
  Award, Edit2, TrendingUp, DollarSign, Calendar as CalendarIcon, 
  MapPin, CheckCircle, Flame, ShieldAlert, Navigation, ArrowUpRight,
  Mail, Phone, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MemberDashboardClient({ initialUser, allRanks, initialBanners, adminContacts = [] }) {
  const [user, setUser] = useState(initialUser);
  const [banners, setBanners] = useState(initialBanners || []);
  const [editMode, setEditMode] = useState(false);
  const [leftBV, setLeftBV] = useState(user.leftBV || 0);
  const [rightBV, setRightBV] = useState(user.rightBV || 0);
  const router = useRouter();

  const [currentSlide, setCurrentSlide] = useState(0);
  const activeBanners = useMemo(() => banners.filter(b => b.imageUrl), [banners]);

  useEffect(() => {
    if (activeBanners.length <= 1) {
      setCurrentSlide(0);
      return;
    }
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

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
        const d = json.data;
        const rankChanged = d.rank !== user.rank;
        setUser({
          ...user,
          leftBV: d.leftBV,
          rightBV: d.rightBV,
          rank: d.rank,
          reward: d.reward,
          upcomingRank: d.upcomingRank,
          upcomingReward: d.upcomingReward,
          achievementDate: d.achievementDate
        });
        setEditMode(false);
        if (rankChanged) {
          alert(`🎉 Congratulations! You've been promoted to ${d.rank}! Reward: ${d.reward}`);
        } else {
          alert('Business values updated successfully!');
        }
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
        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#0A1E3D] text-white border border-[#C5A059]/40 shadow-sm font-mono">
          ID: {user.userId}
        </span>
      </div>

      {/* Business Value Cards Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {/* Left Business Value Card */}
        <div className="p-3 rounded-xl relative border border-zinc-800 bg-zinc-900 shadow-[0_2px_8px_rgba(197,160,89,0.04)]">
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
        <div className="p-3 rounded-xl relative border border-zinc-800 bg-zinc-900 shadow-[0_2px_8px_rgba(197,160,89,0.04)]">
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

        {/* Current Rank Milestone Indicator Card */}
        <div className="glass-panel p-3 rounded-xl relative border border-zinc-800 bg-zinc-900 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-[#0A1E3D] uppercase">Current Rank Milestone</p>
            <h3 className="text-lg font-bold text-[#0A1E3D] mt-0.5 uppercase tracking-wide !text-[#0A1E3D]">{user.rank || 'Associate'}</h3>
            <p className="text-[10px] text-[#0A1E3D]/80 mt-0.5 font-semibold">Reward: {user.reward || 'None'}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0A1E3D] flex items-center justify-center flex-shrink-0">
            <Award size={16} strokeWidth={0} fill="currentColor" className="text-white fill-current w-4 h-4 flex-shrink-0" />
          </div>
        </div>

        {/* Next Rank Milestone Card */}
        <div className="glass-panel p-3 rounded-xl relative border border-zinc-800 bg-zinc-900 flex justify-between items-start">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-[#0A1E3D] uppercase">Next Rank Milestone</p>
            <h3 className="text-lg font-bold text-[#0A1E3D] mt-0.5 uppercase tracking-wide !text-[#0A1E3D]">
              {milestoneProgress?.nextRank?.name || 'Max Rank Reached'}
            </h3>
            <p className="text-[10px] text-[#0A1E3D]/80 mt-0.5 font-semibold">
              Reward: {milestoneProgress?.nextRank?.reward || 'None'}
            </p>
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

      {/* Dynamic Banner Carousel (Constrained Height, Native Aspect Ratio, No Crop, No Empty Spaces) */}
      {activeBanners.length > 0 && (
        <div className="relative group w-full">
          {/* Slides Container using Fade Transition */}
          <div className="relative w-full">
            {activeBanners.map((b, idx) => (
              <div 
                key={b.id || idx} 
                className={`w-full flex justify-center items-center transition-all duration-500 ease-in-out ${
                  currentSlide === idx 
                    ? 'relative opacity-100 z-10' 
                    : 'absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none z-0'
                }`}
              >
                <img
                  src={b.imageUrl}
                  alt={b.altText || `Promotional Banner ${b.id}`}
                  className="max-h-[200px] sm:max-h-[280px] md:max-h-[360px] lg:max-h-[420px] w-auto h-auto block select-none rounded-2xl shadow-sm border border-slate-100/60"
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer border border-slate-100/60"
                aria-label="Previous slide"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % activeBanners.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-slate-800 shadow-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-20 cursor-pointer border border-slate-100/60"
                aria-label="Next slide"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Indicators (Dots) */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-slate-900/10 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentSlide === idx ? 'bg-amber-500 w-5' : 'bg-white/80 hover:bg-white w-2'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
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
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="text-sm font-black text-black uppercase tracking-wider truncate">{admin.name}</h4>
                  <div className="text-xs text-slate-500 font-medium flex items-center gap-2 truncate">
                    <Mail size={13} className="text-[#0A1E3D] flex-shrink-0" />
                    <a href={`mailto:${admin.email}`} className="text-[#0A1E3D] hover:text-[#001B3A] font-bold hover:underline">
                      {admin.email}
                    </a>
                  </div>
                  {(admin.phone || admin.phone2) && (
                    <div className="text-sm text-slate-500 flex items-center gap-2 flex-wrap">
                      <Phone size={13} className="text-[#0A1E3D] flex-shrink-0" />
                      {admin.phone ? (
                        <a href={`tel:${admin.phone}`} className="text-[#0A1E3D] hover:text-[#001B3A] font-bold hover:underline">
                          {admin.phone}
                        </a>
                      ) : (
                        <span className="text-[#0A1E3D] font-bold">N/A</span>
                      )}
                      {admin.phone2 && (
                        <>
                          <span className="text-slate-400">{' / '}</span>
                          <a href={`tel:${admin.phone2}`} className="text-[#0A1E3D] hover:text-[#001B3A] font-bold hover:underline">
                            {admin.phone2}
                          </a>
                        </>
                      )}
                      {admin.phone && (
                        <a
                          href={`https://wa.me/${admin.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center p-1 rounded hover:bg-emerald-50 transition-colors ml-1"
                          title="Chat on WhatsApp"
                        >
                          <svg className="w-4.5 h-4.5 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.451 5.403.002 9.799-4.394 9.802-9.799.002-2.618-1.01-5.08-2.859-6.93C16.37 2.025 13.91 1.013 11.299 1.013c-5.405 0-9.801 4.393-9.804 9.799 0 1.91.498 3.779 1.455 5.414L1.93 21.98l5.858-1.534L6.647 19.15zm9.582-4.704c-.266-.134-1.58-.78-1.821-.867-.243-.088-.419-.133-.596.13-.176.265-.685.867-.839 1.045-.156.177-.311.2-.577.067-.266-.133-1.127-.415-2.148-1.326-.79-.704-1.326-1.574-1.48-1.84-.155-.267-.017-.411.117-.544.12-.12.266-.31.4-.464.133-.155.177-.265.266-.443.089-.176.044-.331-.022-.464-.067-.132-.596-1.437-.816-1.967-.215-.518-.432-.447-.597-.456-.153-.008-.33-.009-.507-.009-.177 0-.464.067-.707.331-.243.265-.929.907-.929 2.21 0 1.302.946 2.56 1.078 2.738.133.177 1.86 2.84 4.507 3.985.63.272 1.12.435 1.503.556.633.201 1.21.173 1.666.105.508-.076 1.58-.646 1.802-1.238.222-.593.222-1.101.156-1.21-.067-.105-.243-.17-.509-.304z"/>
                          </svg>
                        </a>
                      )}
                    </div>
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
