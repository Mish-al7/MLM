'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, Edit2, Lock, Save, X, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminProfileClient({ currentUser }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState(currentUser.name || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [phone2, setPhone2] = useState(currentUser.phone2 || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [dob, setDob] = useState(currentUser.dob ? new Date(currentUser.dob).toISOString().split('T')[0] : '');
  const [password, setPassword] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(`/api/members/${currentUser.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          phone2,
          avatar,
          dob,
          ...(password ? { password } : {})
        })
      });

      const json = await res.json();
      if (res.ok) {
        setMessage('Admin profile updated successfully! Refreshing...');
        setIsEditing(false);
        setPassword('');
        router.refresh();
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(json.error || 'Failed to update profile.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white font-heading">Admin Profile</h1>
          <p className="text-zinc-400 text-xs mt-0.5">View and update your administrator credentials and profile details.</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-md"
          >
            <Edit2 size={13} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="p-4 md:p-8 rounded-2xl glass-panel border border-zinc-800">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="flex flex-col items-center gap-2">
                <img 
                  src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'} 
                  alt="Profile Avatar" 
                  className="w-32 h-32 rounded-full border-4 border-zinc-800 object-cover" 
                />
                <span className="text-[10px] text-zinc-500">Preview</span>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Admin Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Primary Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Secondary Phone Number</label>
                  <input
                    type="text"
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Avatar Image</label>
                  <label className="bg-[#0A1E3D] hover:bg-[#001B3A] text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors w-full border border-[#C5A059]/30">
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            body: formData
                          });
                          const json = await res.json();
                          if (res.ok && json.url) {
                            setAvatar(json.url);
                          } else {
                            alert(json.error || 'Upload failed');
                          }
                        } catch (err) {
                          alert('Upload failed');
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-500 uppercase font-semibold">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-950 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(currentUser.name);
                  setEmail(currentUser.email);
                  setPhone(currentUser.phone || '');
                  setPhone2(currentUser.phone2 || '');
                  setAvatar(currentUser.avatar || '');
                  setDob(currentUser.dob ? new Date(currentUser.dob).toISOString().split('T')[0] : '');
                  setPassword('');
                }}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200"
              >
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-sm shadow-blue-500/10 cursor-pointer disabled:opacity-50"
              >
                <Save size={14} strokeWidth={2.5} />
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="relative">
              <img 
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'} 
                alt={currentUser.name} 
                className="w-32 h-32 rounded-full border-4 border-zinc-800 object-cover shadow-lg" 
              />
              <div className="absolute -bottom-2 -right-2 bg-red-600 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-red-500">
                <ShieldAlert size={10} />
                <span>{currentUser.role === 'super_admin' ? 'Admin' : 'Member'}</span>
              </div>
            </div>

            <div className="flex-1 space-y-6 w-full">
              <div>
                <h2 className="text-2xl font-bold text-white">{currentUser.name}</h2>
                <p className="text-zinc-500 font-mono text-sm">{currentUser.userId} {currentUser.allianzaId && `| ${currentUser.allianzaId}`}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                  <Mail className="text-zinc-500" size={16} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">Email Address</p>
                    <p className="text-sm text-zinc-300 truncate">{currentUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                  <Phone className="text-zinc-500" size={16} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">Contact Numbers</p>
                    <p className="text-sm text-zinc-300">
                      {currentUser.phone || 'N/A'}{currentUser.phone2 ? ` / ${currentUser.phone2}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                  <Calendar className="text-zinc-500" size={16} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">Date of Birth</p>
                    <p className="text-sm text-zinc-300">
                      {currentUser.dob ? new Date(currentUser.dob).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                  <Shield className="text-zinc-500" size={16} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-zinc-500 uppercase font-semibold">System Privileges</p>
                    <p className="text-sm text-red-400 font-bold capitalize">Super Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
