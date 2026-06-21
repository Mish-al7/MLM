'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, Award, FileText, Calendar as CalendarIcon, Image as ImageIcon, 
  Bell, Volume2, Layers, LogOut, UserPlus, User as UserIcon
} from 'lucide-react';

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();

  if (!user) return null;

  const isAdmin = user.role === 'super_admin';
  const basePath = isAdmin ? '/admin' : '/member';

  const menuItems = [
    { id: '', label: 'Dashboard', icon: <Layers size={18} />, adminOnly: false },
    { id: 'team', label: 'Team Hierarchy', icon: <Users size={18} />, adminOnly: true },
    { id: 'referrals', label: 'Referral Team', icon: <UserPlus size={18} />, adminOnly: true },
    { id: 'news', label: 'News Center', icon: <Volume2 size={18} />, adminOnly: false },
    { id: 'updates', label: 'Quick Announcements', icon: <Bell size={18} />, adminOnly: false },
    { id: 'documents', label: 'Business Documents', icon: <FileText size={18} />, adminOnly: false },
    { id: 'media', label: 'Media Gallery', icon: <ImageIcon size={18} />, adminOnly: false },
    { id: 'events', label: 'Events Module', icon: <Award size={18} />, adminOnly: false },
    { id: 'calendar', label: 'Organization Calendar', icon: <CalendarIcon size={18} />, adminOnly: false },
    { id: 'profile', label: 'My Profile Detail', icon: <UserIcon size={18} />, adminOnly: false }
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-64 flex flex-col bg-zinc-950 border-r border-zinc-900 z-20 h-screen overflow-hidden">
      {/* Sidebar Header & Brand */}
      <div className="p-6 border-b border-zinc-900">
        <h2 className="text-xl font-bold tracking-tight text-white font-heading">
          TEZ <span className="text-gold-gradient">INTERNATIONAL</span>
        </h2>
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Leadership Platform</p>
      </div>

      {/* Current Active User Info */}
      <div className="p-4 border-b border-zinc-900 flex items-center space-x-3">
        <img 
          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} 
          alt={user.name} 
          className="w-10 h-10 rounded-full border border-zinc-800 object-cover" 
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-zinc-100 truncate">{user.name}</h4>
          <p className="text-xs text-zinc-500 font-mono truncate">{user.userId}</p>
          <span className="inline-block mt-1 text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 tracking-wider">
            {isAdmin ? 'Super Admin' : 'Member'}
          </span>
        </div>
      </div>

      {/* Navigation Options list */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems
          .filter(item => !item.adminOnly || isAdmin)
          .map(item => {
            const href = `${basePath}${item.id ? '/' + item.id : ''}`;
            const isActive = pathname === href || (item.id && pathname.startsWith(href));

            return (
              <Link
                href={href}
                key={item.id}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-amber-500/10 text-amber-500 border-l-2 border-amber-500 pl-2' 
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
      </nav>

      {/* Logout Control */}
      <div className="p-4 border-t border-zinc-900">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-semibold border border-zinc-800 bg-zinc-900/20 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-all"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
