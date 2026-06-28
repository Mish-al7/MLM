'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Users, Award, FileText, Calendar as CalendarIcon, Image as ImageIcon,
  Bell, Volume2, LayoutDashboard, LogOut, UserPlus,
  Menu, X, Trophy, BarChart2, Briefcase, Settings, BookOpen
} from 'lucide-react';

// ─── Navigation Architecture ──────────────────────────────────────────────────
const NAV_STRUCTURE = (isAdmin) => [
  {
    type: 'item',
    id: '', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false,
  },
  {
    type: 'group', label: 'My Network',
    items: [
      { id: 'team',      label: isAdmin ? 'Team Hierarchy' : 'My Team', icon: Users,     adminOnly: false },
      { id: 'referrals', label: 'Referral Team',                         icon: UserPlus,  adminOnly: true  },
      { id: 'bop',       label: 'Business Opp. Program',                 icon: Briefcase, adminOnly: false },
    ],
  },
  {
    type: 'group', label: 'Communications',
    items: [
      { id: 'updates', label: 'Announcements', icon: Bell,    adminOnly: false },
      { id: 'news',    label: 'News Center',   icon: Volume2, adminOnly: false },
    ],
  },
  {
    type: 'group', label: 'Events & Planning',
    items: [
      { id: 'events',   label: 'Events',   icon: Award,        adminOnly: false },
      { id: 'calendar', label: 'Calendar', icon: CalendarIcon, adminOnly: false },
    ],
  },
  {
    type: 'group', label: 'Performance & Reports',
    items: [
      { id: 'reports',      label: 'Reports & Analytics', icon: BarChart2, adminOnly: true },
      { id: 'achievements', label: 'Achievements',         icon: Trophy,   adminOnly: true },
    ],
  },
  {
    type: 'group', label: 'Resources',
    items: [
      { id: 'documents', label: 'Documents',     icon: FileText,  adminOnly: false },
      { id: 'media',     label: 'Media Gallery', icon: ImageIcon, adminOnly: false },
      { id: 'ledger',    label: 'Personal Ledger', icon: BookOpen,  adminOnly: false },
    ],
  },
];

// ─── NavItem component ─────────────────────────────────────────────────────────
function NavItem({ item, basePath, pathname, onClick, indented = false }) {
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
        group relative flex items-center gap-2.5 rounded-lg text-[13px] font-medium
        transition-all duration-150 select-none
        ${indented ? 'pl-3 pr-3 py-[7px] ml-2' : 'px-3 py-[7px]'}
        ${isActive
          ? 'text-blue-600 bg-blue-50'
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}
      `}
    >
      {isActive && (
        <span className="absolute left-0 inset-y-[5px] w-[3px] bg-blue-500 rounded-r-full" />
      )}
      <Icon
        size={15}
        strokeWidth={isActive ? 2.2 : 1.75}
        className={`flex-shrink-0 transition-colors duration-150 ${
          isActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-500'
        }`}
      />
      <span className="leading-none truncate">{item.label}</span>
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

  const filtered = structure
    .map(node => {
      if (node.type === 'item') return (!node.adminOnly || isAdmin) ? node : null;
      const items = node.items.filter(i => !i.adminOnly || isAdmin);
      return items.length > 0 ? { ...node, items } : null;
    })
    .filter(Boolean);

  const flatItems = filtered.flatMap(node =>
    node.type === 'item' ? [node] : node.items
  );

  // ── Profile card (clickable, no border box) ─────────────────────────────────
  const ProfileCard = ({ onClick }) => (
    <Link
      href={profileHref}
      onClick={onClick}
      className="group flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors border-b border-slate-100"
    >
      <div className="relative flex-shrink-0">
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover"
        />
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-slate-800 truncate leading-tight">{user.name}</p>
        <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
          {isAdmin ? 'Top leader' : 'Member'}
        </p>
      </div>
      <Settings
        size={13}
        strokeWidth={1.75}
        className="flex-shrink-0 text-slate-300 group-hover:text-blue-400 transition-colors"
      />
    </Link>
  );

  return (
    <>
      {/* ── Mobile header ────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 w-full h-14 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 z-50 md:hidden">
        <div>
          <h2 className="text-base font-black tracking-widest font-heading">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ALLIANZA</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Link href={profileHref} className="relative flex-shrink-0">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm"
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
            className="bg-white border-b border-slate-100 max-h-[80vh] overflow-y-auto flex flex-col shadow-xl"
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
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    <Icon size={17} strokeWidth={isActive ? 2.2 : 1.75} />
                    <span className="text-[10px] font-semibold leading-tight truncate max-w-full">{item.label}</span>
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
      <nav className="grid grid-cols-5 h-16 fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-md border-t border-slate-100 shadow-lg z-50 md:hidden">
        {/* Tab 1: Dashboard */}
        {(() => {
          const href = basePath;
          const isActive = pathname === href;
          return (
            <Link
              href={href}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutDashboard size={18} strokeWidth={isActive ? 2.2 : 1.75} />
              <span className="text-[10px] font-semibold tracking-wide">Dashboard</span>
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
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Users size={18} strokeWidth={isActive ? 2.2 : 1.75} />
              <span className="text-[10px] font-semibold tracking-wide truncate max-w-full px-1">{label}</span>
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
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <CalendarIcon size={18} strokeWidth={isActive ? 2.2 : 1.75} />
              <span className="text-[10px] font-semibold tracking-wide">Calendar</span>
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
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Bell size={18} strokeWidth={isActive ? 2.2 : 1.75} />
              <span className="text-[10px] font-semibold tracking-wide">Announcements</span>
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
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                isActive ? 'text-[#2563EB]' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <FileText size={18} strokeWidth={isActive ? 2.2 : 1.75} />
              <span className="text-[10px] font-semibold tracking-wide">Documents</span>
            </Link>
          );
        })()}
      </nav>

      {/* ── Desktop sidebar ───────────────────────────────────────────────────── */}
      <aside className="hidden md:flex w-[220px] flex-col bg-white border-r border-slate-100 z-20 h-screen shrink-0">

        {/* Brand */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <h2 className="text-[15px] font-black tracking-widest font-heading">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ALLIANZA</span>
          </h2>
          <p className="text-[8px] text-slate-400 uppercase tracking-[0.2em] mt-1 font-semibold">Leadership Platform</p>
        </div>

        {/* Profile — clickable, no border card */}
        <ProfileCard />

        {/* Categorized navigation */}
        <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5 custom-scrollbar">
          {filtered.map((node, i) => {
            if (node.type === 'item') {
              return (
                <NavItem
                  key={node.id}
                  item={node}
                  basePath={basePath}
                  pathname={pathname}
                />
              );
            }
            return (
              <div key={node.label} className={i > 0 ? 'pt-3' : ''}>
                <p className="px-3 pb-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase select-none">
                  {node.label}
                </p>
                <div className="space-y-0.5">
                  {node.items.map(item => (
                    <NavItem
                      key={item.id}
                      item={item}
                      basePath={basePath}
                      pathname={pathname}
                      indented
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Sign out — pinned to bottom */}
        <div className="px-2 pb-4 pt-2 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150"
          >
            <LogOut size={15} strokeWidth={1.75} className="flex-shrink-0 group-hover:text-red-500 transition-colors" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
