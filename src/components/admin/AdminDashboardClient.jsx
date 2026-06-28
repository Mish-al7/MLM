'use client';

import React, { useMemo } from 'react';
import { 
  TrendingUp, Calendar as CalendarIcon, Cake, Phone, 
  Users, UsersRound, Volume2, Star, Award as AwardIcon, 
  Trophy, Compass, Car, ChevronRight, ArrowUpRight, Crown, Gem, Megaphone, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';

const getRankIcon = (iconName) => {
  const cls = "text-blue-600";
  const props = { className: cls, size: 18, strokeWidth: 1.75 };
  switch (iconName) {
    case 'Star':    return <Star {...props} />;
    case 'Award':   return <AwardIcon {...props} />;
    case 'Compass': return <Compass {...props} />;
    case 'MapPin':  return <Compass {...props} />;
    case 'Trophy':  return <Gem {...props} />;
    case 'Car':     return <Crown {...props} />;
    default:        return <AwardIcon {...props} />;
  }
};

const STAT_CARDS = (membersCount, referralsCount, eventsCount, updatesCount) => [
  {
    label: 'Total team size',
    value: membersCount,
    icon: Users,
  },
  {
    label: 'Direct referrals',
    value: referralsCount,
    icon: Users,
  },
  {
    label: 'Upcoming programs',
    value: eventsCount,
    icon: CalendarIcon,
  },
  {
    label: 'Announcements',
    value: updatesCount,
    icon: Megaphone,
  },
];

// Smooth cubic bezier spline through points
function getCurvePath(pts) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cp1x = pts[i].x + (pts[i + 1].x - pts[i].x) / 3;
    const cp1y = pts[i].y;
    const cp2x = pts[i + 1].x - (pts[i + 1].x - pts[i].x) / 3;
    const cp2y = pts[i + 1].y;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  return d;
}

export default function AdminDashboardClient({
  user,
  membersCount,
  eventsCount,
  referralsCount,
  updatesCount,
  todayBirthdays,
  tomorrowBirthdays,
  allUsers
}) {

  // 1. Platform BV totals
  const totalBv = useMemo(() => {
    const left  = allUsers.reduce((s, u) => s + (u.leftBV  || 0), 0);
    const right = allUsers.reduce((s, u) => s + (u.rightBV || 0), 0);
    return { left, right };
  }, [allUsers]);

  // 2. Monthly registration trend (last 6 months)
  const monthlyData = useMemo(() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const counts = Array(12).fill(0);
    allUsers.forEach(u => {
      if (u.joiningDate) counts[new Date(u.joiningDate).getMonth()]++;
    });
    const cur = new Date().getMonth();
    return Array.from({ length: 6 }, (_, i) => {
      const mIdx = (cur - (5 - i) + 12) % 12;
      return { month: months[mIdx], count: counts[mIdx] };
    });
  }, [allUsers]);

  // 3. Ranks distribution
  const ranksDistribution = useMemo(() => {
    const dist = {};
    allUsers.forEach(u => { const r = u.rank || 'Associate'; dist[r] = (dist[r] || 0) + 1; });
    return Object.entries(dist).map(([name, count]) => ({ name, count }));
  }, [allUsers]);

  // SVG chart
  const W = 500, H = 160, PL = 44, PR = 20, PT = 24, PB = 32;
  const cW = W - PL - PR;
  const cH = H - PT - PB;
  const values = monthlyData.map(d => d.count);
  const maxVal = Math.max(...values, 1) + 1;

  const pts = monthlyData.map((d, i) => ({
    x: PL + (i / (monthlyData.length - 1)) * cW,
    y: H - PB - (d.count / maxVal) * cH,
    label: d.month,
    val: d.count,
  }));

  const curvePath = getCurvePath(pts);
  const areaPath = pts.length > 0
    ? curvePath + ` L ${pts[pts.length - 1].x} ${H - PB} L ${pts[0].x} ${H - PB} Z`
    : '';

  const hasBirthdays = todayBirthdays.length > 0 || tomorrowBirthdays.length > 0;
  const totalBirthdays = todayBirthdays.length + tomorrowBirthdays.length;
  const combined = totalBv.left + totalBv.right;
  const leftPct = ((totalBv.left / (combined || 1)) * 100).toFixed(1);
  const rightPct = ((totalBv.right / (combined || 1)) * 100).toFixed(1);

  const statCards = STAT_CARDS(membersCount, referralsCount, eventsCount, updatesCount);

  return (
    <div className="space-y-6">

      {/* Greeting row + birthday toast */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-800">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Here's what's happening with your team today.</p>
        </div>

        {/* Small button to redirect to dashboard banners */}
        <Link
          href="/admin/banners"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white transition-colors shrink-0"
        >
          <ImageIcon size={13} />
          <span>Manage Banners</span>
        </Link>

        {/* Compact birthday toast — only if birthdays exist */}
        {hasBirthdays && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-100 shrink-0 shadow-sm">
            <Cake size={16} strokeWidth={1.75} className="text-amber-500 animate-pulse flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-amber-700">
                {totalBirthdays} Birthday{totalBirthdays > 1 ? 's' : ''}
                {todayBirthdays.length > 0 && ' today'}
                {todayBirthdays.length > 0 && tomorrowBirthdays.length > 0 && ' &'}
                {tomorrowBirthdays.length > 0 && ' tomorrow'}
              </p>
              <p className="text-[11px] text-amber-600 truncate max-w-[200px]">
                {[...todayBirthdays, ...tomorrowBirthdays].map(m => m.name.split(' ')[0]).join(', ')}
              </p>
            </div>
            {/* If only 1 birthday and has phone, show call button */}
            {totalBirthdays === 1 && [...todayBirthdays, ...tomorrowBirthdays][0]?.phone && (
              <a
                href={`tel:${[...todayBirthdays, ...tomorrowBirthdays][0].phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition-colors ml-1 shrink-0"
              >
                <Phone size={10} />
                <span>Call</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* KPI Stat Cards — 4 columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-shadow"
            >
              <div className="w-8 h-8 rounded-full bg-[#0A1E3D] flex items-center justify-center flex-shrink-0">
                <Icon size={16} strokeWidth={0} fill="currentColor" className="text-white fill-current w-4 h-4 flex-shrink-0" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-medium leading-tight">{card.label}</p>
                <p className="text-2xl font-extrabold text-slate-800 mt-0.5 leading-none font-mono">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Smooth Spline Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <TrendingUp size={15} strokeWidth={1.75} className="text-blue-500" />
                Member Registration Trend
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">New members per month, last 6 months</p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              {allUsers.length} total
            </span>
          </div>

          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"  />
              </linearGradient>
            </defs>

            {/* Ultra-light gridlines */}
            {[0, 0.5, 1].map((ratio, i) => {
              const y = PT + ratio * cH;
              return (
                <line key={i} x1={PL} y1={y} x2={W - PR} y2={y}
                  stroke="#f1f5f9" strokeWidth={1} />
              );
            })}

            {/* Area fill */}
            {pts.length > 0 && <path d={areaPath} fill="url(#areaGrad)" />}

            {/* Smooth curve */}
            {pts.length > 0 && (
              <path d={curvePath} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            )}

            {/* Data points + labels */}
            {pts.map((p, i) => (
              <g key={i}>
                <text x={p.x} y={H - 10} fill="#94a3b8" fontSize={9} textAnchor="middle">{p.label}</text>
                <circle cx={p.x} cy={p.y} r={4} fill="white" stroke="#3b82f6" strokeWidth={2} />
                <text x={p.x} y={p.y - 9} fill="#3b82f6" fontSize={9} fontWeight="700" textAnchor="middle">{p.val}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* Business Volume Balance */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-700">Platform Business Volume</h3>
            <p className="text-xs text-slate-400 mt-0.5">Aggregated Left vs Right BV ratio</p>
          </div>

          {/* Combined volume — prominent */}
          <div className="flex items-end gap-3 mb-6">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Total combined volume</p>
              <p className="text-4xl font-extrabold text-slate-800 leading-none font-mono">
                {combined.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-1 pb-1 text-emerald-500">
              <ArrowUpRight size={14} strokeWidth={2} />
              <span className="text-xs font-bold">Active</span>
            </div>
          </div>

          {/* BV Labels */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-blue-600">Left · {totalBv.left.toLocaleString()} <span className="text-slate-400 font-normal">({leftPct}%)</span></span>
              <span className="text-slate-400">Right · {totalBv.right.toLocaleString()} <span className="font-normal">({rightPct}%)</span></span>
            </div>

            {/* Sleek progress track */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-blue-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${leftPct}%` }}
              />
              <div
                className="bg-slate-200 h-full rounded-full transition-all duration-700"
                style={{ width: `${rightPct}%` }}
              />
            </div>

            <div className="flex gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />Left BV</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />Right BV</span>
            </div>
          </div>

          <Link
            href="/admin/reports"
            className="mt-6 w-full flex items-center justify-center gap-1.5 py-2.5 border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-100 hover:text-blue-600 text-slate-500 rounded-xl text-xs font-semibold transition-all"
          >
            <span>View full reports</span>
            <ChevronRight size={13} strokeWidth={2} />
          </Link>
        </div>
      </div>

      {/* Birthday Detail Cards — shown below when multiple birthdays */}
      {hasBirthdays && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cake size={13} strokeWidth={1.75} className="text-amber-500" />
            Birthday Reminders
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...todayBirthdays.map(m => ({ ...m, tag: 'Today', tagColor: 'bg-amber-500 text-white' })),
              ...tomorrowBirthdays.map(m => ({ ...m, tag: 'Tomorrow', tagColor: 'bg-slate-100 text-slate-500' }))
            ].map(member => (
              <div key={member.userId} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="p-2 rounded-lg bg-amber-50 flex-shrink-0">
                  <Cake size={15} strokeWidth={1.75} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${member.tagColor}`}>{member.tag}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{member.userId}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 truncate">{member.name}</p>
                </div>
                {member.phone && (
                  <a
                    href={`tel:${member.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-lg font-bold text-[10px] transition-colors shrink-0"
                  >
                    <Phone size={10} />
                    <span>Call</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ranks Distribution */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="mb-5">
          <h3 className="text-sm font-bold text-slate-700">Achievement Distribution</h3>
          <p className="text-xs text-slate-400 mt-0.5">Team members in each milestone rank</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {ranksDistribution.map(r => (
            <div
              key={r.name}
              className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center flex flex-col items-center gap-2 hover:border-blue-100 hover:bg-blue-50/40 transition-colors"
            >
              <div className="p-2 rounded-xl bg-blue-50">
                {getRankIcon(r.name)}
              </div>
              <span className="text-xs text-slate-600 font-semibold leading-tight">{r.name}</span>
              <p className="text-xl font-extrabold text-slate-800 font-mono leading-none">{r.count}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
