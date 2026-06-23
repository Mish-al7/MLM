'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, Users } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  
  // Session & Auth States
  const [authEmail, setAuthEmail] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [demoRoleLoading, setDemoRoleLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Auth: Request OTP code
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setDevOtp(null);
    if (!authEmail) return setAuthError('Please enter email.');
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail })
      });
      const json = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setAuthSuccess('OTP code sent successfully!');
        if (json.testOtp) {
          setDevOtp(json.testOtp);
        }
      } else {
        setAuthError(json.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setAuthError('Connection error.');
    }
  };

  // Auth: Verify OTP code
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    if (!authOtp) return setAuthError('Please enter OTP.');
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, code: authOtp })
      });
      const json = await res.json();
      if (res.ok) {
        setAuthSuccess('Login successful!');
        router.push(json.user.role === 'super_admin' ? '/admin' : '/member');
      } else {
        setAuthError(json.error || 'Invalid or expired OTP.');
      }
    } catch (err) {
      setAuthError('Verification error.');
    }
  };

  // Demo Bypass Login: Switch roles instantly
  const handleDemoLogin = async (role) => {
    setDemoRoleLoading(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await fetch('/api/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const json = await res.json();
      if (res.ok) {
        router.push(json.user.role === 'super_admin' ? '/admin' : '/member');
      } else {
        setAuthError(json.error || 'Failed to switch demo role. Please run Seeding first.');
        if (json.error?.includes('seed')) {
          setSeedMessage('Please click the "Seed Initial Data" button first to populate members.');
        }
      }
    } catch (err) {
      setAuthError('Bypass login failed.');
    } finally {
      setDemoRoleLoading(false);
    }
  };

  // Trigger Database Seed
  const handleSeed = async () => {
    setLoading(true);
    setSeedMessage('');
    try {
      const res = await fetch('/api/dev/seed');
      const json = await res.json();
      if (res.ok) {
        setSeedMessage('Database seeded successfully! Try logging in or switching roles.');
      } else {
        setSeedMessage(json.error || 'Seed failed.');
      }
    } catch (err) {
      setSeedMessage('Error seeding database.');
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

        {!otpSent ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
              <input 
                type="email" 
                value={authEmail} 
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="name@company.com" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-gold-gradient py-3 rounded-lg font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
            >
              <span>Request OTP Code</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">6-Digit Verification Code</label>
              <input 
                type="text" 
                maxLength={6}
                value={authOtp} 
                onChange={(e) => setAuthOtp(e.target.value)}
                placeholder="Enter 6-digit OTP" 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-black tracking-[0.3em] text-center font-mono text-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {devOtp && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-center">
                <p className="text-xs text-zinc-500">Dev Testing OTP Helper</p>
                <button 
                  type="button" 
                  onClick={() => setAuthOtp(devOtp)}
                  className="mt-1 text-sm font-mono font-bold text-blue-600 underline cursor-pointer"
                >
                  Click to Auto-fill: {devOtp}
                </button>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-gold-gradient py-3 rounded-lg font-bold text-white hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-blue-500/20"
            >
              Verify & Login
            </button>
            <button 
              type="button" 
              onClick={() => setOtpSent(false)} 
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-700 transition-colors underline cursor-pointer"
            >
              Request another code
            </button>
          </form>
        )}

        {/* Quick Demo Switcher Section */}
        <div className="mt-8 pt-6 border-t border-zinc-100">
          <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center mb-4">Quick Testing Personas</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleDemoLogin('super_admin')}
              disabled={demoRoleLoading}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs transition-colors cursor-pointer"
            >
              <ShieldAlert size={14} />
              <span>Super Admin</span>
            </button>
            <button 
              onClick={() => handleDemoLogin('member')}
              disabled={demoRoleLoading}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Users size={14} />
              <span>Team Member</span>
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button 
              onClick={handleSeed}
              disabled={loading}
              className="text-[11px] text-zinc-400 hover:text-blue-600 transition-colors underline disabled:opacity-50 cursor-pointer"
            >
              Seed Initial Demo Database Tree (Ranks, Users, Events)
            </button>
            {seedMessage && <p className="mt-2 text-xs text-blue-600 font-medium">{seedMessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
