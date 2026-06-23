'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Users, Award, FileText, Calendar as CalendarIcon, Image as ImageIcon, 
  Bell, Volume2, Layers, LogOut, UserPlus, User as UserIcon, Menu, X
} from 'lucide-react';

export default function Sidebar({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const isAdmin = user.role === 'super_admin';
  const basePath = isAdmin ? '/admin' : '/member';

  const menuItems = [
    { id: '', label: 'Dashboard', icon: <Layers size={18} />, adminOnly: false },
    { id: 'team', label: isAdmin ? 'Team Hierarchy' : 'My Team', icon: <Users size={18} />, adminOnly: false },
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
    <>
      {/* Mobile Top Navbar Header */}
      <header className="flex md:hidden items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 w-full z-30 shrink-0 shadow-sm">
        <div>
          <h2 className="text-lg font-black tracking-widest text-zinc-900 font-heading">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ALLIANZA</span>
          </h2>
          <p className="text-[8px] text-zinc-400 uppercase tracking-widest mt-0.5 font-bold">Leadership Platform</p>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 text-zinc-600 hover:bg-zinc-50 rounded-lg border border-zinc-200 transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu Panel: Expands as a responsive grid list of cards */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-[65px] bg-zinc-900/30 z-20 backdrop-blur-sm transition-all duration-300 flex flex-col justify-start">
          <div className="bg-white border-b border-zinc-200 p-4 max-h-[85vh] overflow-y-auto flex flex-col shadow-xl">
            {/* Active User Card on mobile */}
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center space-x-3 mb-4">
              <img 
                src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} 
                alt={user.name} 
                className="w-10 h-10 rounded-full border border-zinc-300 object-cover shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-zinc-100 truncate">{user.name}</h4>
                <p className="text-[10px] text-zinc-300 font-mono truncate">{user.userId}</p>
                <span className="inline-block mt-0.5 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 tracking-wider">
                  {isAdmin ? 'Super Admin' : 'Member'}
                </span>
              </div>
            </div>

            {/* Menu Links as Grid Cards in Mobile View */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {menuItems
                .filter(item => !item.adminOnly || isAdmin)
                .map(item => {
                  const href = `${basePath}${item.id ? '/' + item.id : ''}`;
                  const isActive = pathname === href || (item.id && pathname.startsWith(href));

                  return (
                    <Link
                      href={href}
                      key={item.id}
                      onClick={() => setIsOpen(false)}
                      className={`flex flex-col items-center justify-center p-4 rounded-xl text-center border transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20' 
                          : 'bg-zinc-50 text-zinc-300 border-zinc-200/80 hover:bg-zinc-100'
                      }`}
                    >
                      <span className={`mb-2 transition-colors ${isActive ? 'text-white' : 'text-blue-600'}`}>
                        {item.icon}
                      </span>
                      <span className="text-xs font-bold truncate max-w-full">{item.label}</span>
                    </Link>
                  );
                })}
            </div>

            {/* Logout on mobile */}
            <button 
              onClick={() => { setIsOpen(false); handleLogout(); }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-bold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all cursor-pointer"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Vertical Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-zinc-200 z-20 h-screen overflow-hidden text-zinc-700 shrink-0">
        {/* Sidebar Header & Brand */}
        <div className="px-6 py-5 border-b border-zinc-100">
          <h2 className="text-xl font-black tracking-widest text-zinc-900 font-heading">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">ALLIANZA</span>
          </h2>
          <p className="text-[9px] text-zinc-400 uppercase tracking-widest mt-1.5 font-bold">Leadership Platform</p>
        </div>

        {/* Current Active User Info Card */}
        <div className="px-4 py-4 border-b border-zinc-100">
          <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center space-x-3 shadow-inner">
            <img 
              src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} 
              alt={user.name} 
              className="w-10 h-10 rounded-full border border-zinc-300 object-cover shadow-sm shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-zinc-100 truncate leading-snug">{user.name}</h4>
              <p className="text-[10px] text-zinc-300 font-mono truncate leading-none mt-0.5">{user.userId}</p>
              <span className="inline-block mt-1 text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 tracking-wider">
                {isAdmin ? 'Super Admin' : 'Member'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Options list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {menuItems
            .filter(item => !item.adminOnly || isAdmin)
            .map(item => {
              const href = `${basePath}${item.id ? '/' + item.id : ''}`;
              const isActive = pathname === href || (item.id && pathname.startsWith(href));

              return (
                <Link
                  href={href}
                  key={item.id}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform cursor-pointer ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 pl-4 font-bold translate-x-1' 
                      : 'text-zinc-300 hover:bg-zinc-50 hover:text-zinc-100 hover:translate-x-1'
                  }`}
                >
                  <span className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-blue-600'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
        </nav>

        {/* Logout Control */}
        <div className="p-4 border-t border-zinc-200">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-bold border border-zinc-200 bg-zinc-50 text-zinc-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
