'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  
  // Session & Auth States
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Auth: Credentials Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (!authEmail || !authPassword) return setAuthError('Please enter both email and password.');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword })
      });
      const json = await res.json();
      if (res.ok) {
        setAuthSuccess('Login successful!');
        router.push(json.user.role === 'super_admin' ? '/admin' : '/member');
      } else {
        setAuthError(json.error || 'Invalid email or password.');
      }
    } catch (err) {
      setAuthError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen relative overflow-hidden bg-coffee-brown px-4 py-8 font-sans">
      {/* Abstract Blur Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-zinc-200 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 font-heading">
            <span className="text-gold-gradient">ALLIANZA</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-2">Leadership Organization Platform</p>
        </div>

        {authError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
            {authSuccess}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              value={authEmail} 
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder="name@company.com" 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              value={authPassword} 
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gold-gradient py-3 rounded-lg font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            <span>{loading ? 'Logging in...' : 'Sign In'}</span>
          </button>
        </form>


      </div>
    </div>
  );
}
