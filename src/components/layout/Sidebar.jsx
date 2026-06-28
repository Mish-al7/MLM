'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users, Award, FileText, Calendar as CalendarIcon, Image as ImageIcon,
  Bell, Volume2, LayoutDashboard, LogOut, UserPlus,
  Menu, X, Trophy, BarChart2, Briefcase, Settings, BookOpen,
  Network, GitFork, Megaphone, Shield, TrendingUp, Crown
} from 'lucide-react';

// ─── Navigation Architecture (Flat List) ──────────────────────────────────────
const NAV_STRUCTURE = (isAdmin) => [
  { id: '',            label: 'Dashboard',             icon: Network,      adminOnly: false },
  { id: 'team',        label: isAdmin ? 'Team Hierarchy' : 'My Team', icon: GitFork,      adminOnly: false },
  { id: 'referrals',   label: 'Referral Team',         icon: Users,        adminOnly: true  },
  { id: 'royal-kings-club',  label: 'Royal Kings Club',      icon: Crown,        adminOnly: false },
  { id: 'bop',         label: 'Business Opp. Program', icon: Briefcase,    adminOnly: false },
  { id: 'updates',     label: 'Announcements',         icon: Megaphone,    adminOnly: false },
  { id: 'news',        label: 'News Center',           icon: Bell,         adminOnly: false },
  { id: 'events',      label: 'Events',                icon: Shield,       adminOnly: false },
  { id: 'calendar',    label: 'Calendar',              icon: CalendarIcon, adminOnly: false },
  { id: 'reports',     label: 'Reports & Analytics',   icon: TrendingUp,   adminOnly: true  },
  { id: 'achievements',label: 'Achievements',          icon: Trophy,       adminOnly: true  },
  { id: 'banners',     label: 'Dashboard Banners',     icon: ImageIcon,    adminOnly: true  },
  { id: 'documents',        label: 'Documents',             icon: FileText,     adminOnly: false },
  { id: 'media',             label: 'Media Gallery',         icon: ImageIcon,    adminOnly: false },
  { id: 'ledger',            label: 'Personal Ledger',       icon: BookOpen,     adminOnly: false },
];

// ─── NavItem component ─────────────────────────────────────────────────────────
function NavItem({ item, basePath, pathname, onClick }) {
  const href = `${basePath}${item.id ? '/' + item.id : ''}`;
  const isActive = item.id === ''
    ? pathname === href
    : pathname === href || pathname.startsWith(href + '/');
  const Icon = item.icon;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        group relative flex items-center gap-3 rounded-lg text-xs font-semibold
        transition-all duration-150 select-none px-3.5 py-2.5 uppercase tracking-wider
        ${isActive
          ? 'text-white bg-[#0A1E3D]'
          : 'text-slate-500 hover:text-[#0A1E3D] hover:bg-slate-100/50'}
      `}
    >
      {isActive && (
        <span className="absolute left-0 inset-y-0 w-[4px] bg-[#C5A059] rounded-l-lg" />
      )}
      
      {/* Pinned circular badge icon system */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${
        isActive ? 'bg-[#C5A059]' : 'bg-[#0A1E3D]'
      }`}>
        <Icon
          size={16}
          strokeWidth={0}
          fill="currentColor"
          className={`fill-current w-4 h-4 flex-shrink-0 transition-colors duration-150 ${
            isActive ? 'text-[#0A1E3D]' : 'text-[#C5A059]'
          }`}
        />
      </div>
      
      <span className="leading-snug whitespace-normal">{item.label}</span>
    </Link>
  );
}

// ─── Main Sidebar ──────────────────────────────────────────────────────────────
export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const isAdmin  = user.role === 'super_admin';
  const basePath = isAdmin ? '/admin' : '/member';
  const profileHref = `${basePath}/profile`;
  const structure = NAV_STRUCTURE(isAdmin);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) router.push('/');
    } catch (err) { console.error(err); }
  };

  const flatItems = structure.filter(item => !item.adminOnly || isAdmin);

  // ── Profile card for mobile drawer ─────────────────────────────────
  const ProfileCard = ({ onClick }) => (
    <Link
      href={profileHref}
      onClick={onClick}
      className="group flex items-center gap-3 px-5 py-4 hover:bg-[#FBF9F4] transition-colors border-b border-[#C5A059]/20"
    >
      <div className="relative flex-shrink-0">
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover border border-[#C5A059]/30"
        />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#001B3A] truncate leading-tight uppercase tracking-wider">{user.name}</p>
        <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono uppercase">
          {isAdmin ? 'Top leader' : 'Member'}
        </p>
      </div>
      <Settings
        size={14}
        strokeWidth={1.75}
        className="flex-shrink-0 text-slate-400 group-hover:text-[#C5A059] transition-colors"
      />
    </Link>
  );

  // ── Profile avatar pinned block (Desktop Bottom) ───────────────────
  const ProfileAvatarBlock = () => (
    <div className="flex items-center gap-3 px-5 py-4 border-t border-[#C5A059]/20 bg-white">
      <Link
        href={profileHref}
        className="relative group block flex-shrink-0"
      >
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border border-[#C5A059]/30 hover:border-[#C5A059] transition-colors"
        />
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
      </Link>
      
      {/* User Info */}
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#001B3A] truncate leading-tight uppercase tracking-wider">{user.name}</p>
        <p className="text-[10px] text-slate-500 truncate mt-0.5 font-mono uppercase">
          {isAdmin ? 'Top leader' : 'Member'}
        </p>
      </div>

      <button
        onClick={handleLogout}
        title="Sign Out"
        className="p-2 rounded-lg text-[#001B3A] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex-shrink-0"
        aria-label="Sign Out"
      >
        <LogOut size={20} strokeWidth={2} className="text-[#001B3A] hover:text-red-600 transition-colors" />
      </button>
    </div>
  );

  return (
    <>
      {/* ── Mobile header ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full h-14 bg-white/80 backdrop-blur-md border-b border-[#C5A059]/20 flex items-center justify-between px-4 z-50 md:hidden">
        <div>
          <h2 className="text-base font-black tracking-widest font-heading text-[#001B3A]">
            ALLIANZA
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link href={profileHref} className="relative flex-shrink-0">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-[#C5A059]/20 shadow-sm"
            />
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-lg border border-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
          </button>
        </div>
      </header>

      {/* ── Mobile menu panel (Drawer overlay) ────────────────────────────────── */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 top-[56px] bg-black/10 z-20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white border-b border-[#C5A059]/20 max-h-[80vh] overflow-y-auto flex flex-col shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <ProfileCard onClick={() => setIsOpen(false)} />

            <div className="p-4 grid grid-cols-3 gap-2">
              {flatItems.map(item => {
                const href = `${basePath}${item.id ? '/' + item.id : ''}`;
                const isActive = item.id === ''
                  ? pathname === href
                  : pathname === href || pathname.startsWith(href + '/');
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                      isActive
                        ? 'bg-[#0A1E3D] text-white border-[#C5A059] shadow-sm'
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                      isActive ? 'bg-[#C5A059]' : 'bg-[#0A1E3D]'
                    }`}>
                      <Icon size={16} strokeWidth={0} fill="currentColor" className="text-white fill-current" />
                    </div>
                    <span className="text-[10px] font-semibold leading-tight truncate max-w-full uppercase tracking-wider">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="px-4 pb-5">
              <button
                onClick={() => { setIsOpen(false); handleLogout(); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-all"
              >
                <LogOut size={15} strokeWidth={2} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile bottom navigation 5 tabs ────────────────────────────────────── */}
      <nav className="grid grid-cols-5 h-16 fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-[#C5A059]/20 shadow-lg z-50 md:hidden">
        {/* Tab 1: Dashboard */}
        {(() => {
          const href = basePath;
          const isActive = pathname === href;
          return (
            <Link
              href={href}
              className="flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                isActive ? 'bg-[#C5A059]' : 'bg-[#0A1E3D]'
              }`}>
                <Network size={14} strokeWidth={0} fill="currentColor" className="text-white fill-current" />
              </div>
              <span className="text-[8px] font-semibold tracking-wide uppercase">Dashboard</span>
            </Link>
          );
        })()}

        {/* Tab 2: Team */}
        {(() => {
          const href = `${basePath}/team`;
          const isActive = pathname.startsWith(href);
          const label = isAdmin ? 'Team Hierarchy' : 'My Team';
          return (
            <Link
              href={href}
              className="flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                isActive ? 'bg-[#C5A059]' : 'bg-[#0A1E3D]'
              }`}>
                <GitFork size={14} strokeWidth={0} fill="currentColor" className="text-white fill-current" />
              </div>
              <span className="text-[8px] font-semibold tracking-wide truncate max-w-full px-1 uppercase">{label}</span>
            </Link>
          );
        })()}

        {/* Tab 3: Calendar */}
        {(() => {
          const href = `${basePath}/calendar`;
          const isActive = pathname.startsWith(href);
          return (
            <Link
              href={href}
              className="flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                isActive ? 'bg-[#C5A059]' : 'bg-[#0A1E3D]'
              }`}>
                <CalendarIcon size={14} strokeWidth={0} fill="currentColor" className="text-white fill-current" />
              </div>
              <span className="text-[8px] font-semibold tracking-wide uppercase">Calendar</span>
            </Link>
          );
        })()}

        {/* Tab 4: Announcements */}
        {(() => {
          const href = `${basePath}/updates`;
          const isActive = pathname.startsWith(href);
          return (
            <Link
              href={href}
              className="flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                isActive ? 'bg-[#C5A059]' : 'bg-[#0A1E3D]'
              }`}>
                <Megaphone size={14} strokeWidth={0} fill="currentColor" className="text-white fill-current" />
              </div>
              <span className="text-[8px] font-semibold tracking-wide uppercase">News</span>
            </Link>
          );
        })()}

        {/* Tab 5: Documents */}
        {(() => {
          const href = `${basePath}/documents`;
          const isActive = pathname.startsWith(href);
          return (
            <Link
              href={href}
              className="flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                isActive ? 'bg-[#C5A059]' : 'bg-[#0A1E3D]'
              }`}>
                <FileText size={14} strokeWidth={0} fill="currentColor" className="text-white fill-current" />
              </div>
              <span className="text-[8px] font-semibold tracking-wide uppercase">Docs</span>
            </Link>
          );
        })()}
      </nav>

      {/* ── Desktop sidebar ───────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[245px] flex-col bg-white border-r border-[#C5A059]/25 z-20 h-screen shrink-0">

        {/* Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-[#C5A059]/20">
          <h2 className="text-[20px] font-bold tracking-widest font-heading text-[#001B3A] leading-none">
            ALLIANZA
          </h2>
          <p className="text-[8px] text-[#C5A059] uppercase tracking-[0.2em] mt-1 font-semibold">Leadership Platform</p>
        </div>

        {/* Flat navigation list */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-1 custom-scrollbar">
          {flatItems.map(item => (
            <NavItem
              key={item.id}
              item={item}
              basePath={basePath}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* Profile Avatar pinned block (Desktop Bottom) */}
        <ProfileAvatarBlock />
      </aside>
    </>
  );
}
