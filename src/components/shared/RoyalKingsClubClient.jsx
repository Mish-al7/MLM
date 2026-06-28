'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Crown, Plus, Trash2, Save, ImageIcon, X, UserCircle, Upload,
  ChevronDown, Edit2, CheckCircle
} from 'lucide-react';

// ─── Shared style constants ────────────────────────────────────────────────────
const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-[#C5A059]/25 bg-white text-sm text-[#001B3A] ' +
  'focus:outline-none focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 transition-colors placeholder-slate-400';

// ─── Portrait placeholder ──────────────────────────────────────────────────────
function PortraitPlaceholder({ name }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0A1E3D] to-[#001B3A]">
      <span className="text-3xl font-bold text-[#C5A059] font-heading tracking-widest">{initials}</span>
    </div>
  );
}

// ─── Member Card (member view) ─────────────────────────────────────────────────
function MemberCard({ member }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white border border-[#C5A059]/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#C5A059]/60 transition-all duration-300 flex flex-col items-center p-6 gap-4">
      {/* Portrait frame */}
      <div className="w-32 h-40 rounded-xl overflow-hidden border-2 border-[#C5A059]/40 flex-shrink-0 shadow-md relative">
        {member.portraitUrl && !imgError ? (
          <Image
            src={member.portraitUrl}
            alt={member.name}
            fill
            className="object-cover object-top"
            onError={() => setImgError(true)}
            sizes="128px"
            unoptimized
          />
        ) : (
          <PortraitPlaceholder name={member.name} />
        )}
      </div>

      {/* Info */}
      <div className="text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <Crown size={10} className="text-[#C5A059]" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#C5A059]">Royal Member</span>
        </div>
        <p className="font-bold text-[#001B3A] text-sm uppercase tracking-wider leading-tight font-sans">
          {member.name}
        </p>
        {member.title && (
          <p className="text-[11px] text-slate-500 tracking-wide">{member.title}</p>
        )}
      </div>
    </div>
  );
}

// ─── Admin Member Row ──────────────────────────────────────────────────────────
function AdminMemberRow({ member, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Remove "${member.name}" from Royal Kings Club?`)) return;
    setDeleting(true);
    await onDelete(member._id);
    setDeleting(false);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-[#C5A059]/15 hover:border-[#C5A059]/40 transition-colors">
      {/* Portrait thumbnail */}
      <div className="w-12 h-14 rounded-lg overflow-hidden border border-[#C5A059]/30 flex-shrink-0 relative">
        {member.portraitUrl && !imgError ? (
          <Image
            src={member.portraitUrl}
            alt={member.name}
            fill
            className="object-cover object-top"
            onError={() => setImgError(true)}
            sizes="48px"
            unoptimized
          />
        ) : (
          <PortraitPlaceholder name={member.name} />
        )}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-[#001B3A] text-sm uppercase tracking-wider truncate">{member.name}</p>
        <p className="text-xs text-slate-400 mt-0.5 truncate">{member.title || 'Royal Kings Club Member'}</p>
        {member.portraitUrl && (
          <p className="text-[10px] text-slate-300 mt-0.5 truncate">{member.portraitUrl}</p>
        )}
      </div>
      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 flex-shrink-0"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

// ─── Add Member Form ───────────────────────────────────────────────────────────
function AddMemberForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ name: '', title: '', portraitUrl: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Member name is required.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/royal-kings-club/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to add member');
      onAdd(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#FBF9F4] border border-[#C5A059]/20 rounded-xl p-5 space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-[#001B3A]">Add New Member</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            className={inputCls}
            placeholder="e.g. Anjali Kumar"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">Title / Role</label>
          <input
            className={inputCls}
            placeholder="e.g. Diamond Leader"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">
          Portrait Image
        </label>
        <div className="flex gap-2">
          {form.portraitUrl && (
            <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 truncate flex-1">
              File uploaded: {form.portraitUrl.substring(form.portraitUrl.lastIndexOf('/') + 1)}
            </div>
          )}
          <label className="bg-[#0A1E3D] hover:bg-[#001B3A] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors w-full border border-[#C5A059]/30">
            <span>Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const data = new FormData();
                data.append('file', file);
                try {
                  const res = await fetch('/api/upload', { method: 'POST', body: data });
                  const json = await res.json();
                  if (res.ok && json.url) {
                    setForm(f => ({ ...f, portraitUrl: json.url }));
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
        <p className="text-[10px] text-slate-400 mt-1">Upload a portrait image file. Leave blank to use initials placeholder.</p>
      </div>

      {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white transition-colors disabled:opacity-60"
        >
          {loading ? 'Adding…' : 'Add Member'}
        </button>
      </div>
    </form>
  );
}

// ─── Main RoyalKingsClubClient ─────────────────────────────────────────────────
export default function RoyalKingsClubClient({ isAdmin = false }) {
  const [data, setData]               = useState({ bannerUrl: '', members: [] });
  const [loading, setLoading]         = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Banner edit state (admin only)
  const [bannerDraft, setBannerDraft]   = useState('');
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerSaved, setBannerSaved]   = useState(false);
  const [bannerError, setBannerError]   = useState('');
  const [imgError, setImgError]         = useState(false);

  // Fetch on mount
  useEffect(() => {
    fetch('/api/royal-kings-club')
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setData(json.data);
          setBannerDraft(json.data.bannerUrl || '');
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Save banner URL
  const handleSaveBanner = async () => {
    setBannerSaving(true);
    setBannerError('');
    setBannerSaved(false);
    try {
      const res = await fetch('/api/royal-kings-club', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bannerUrl: bannerDraft }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      setData(prev => ({ ...prev, bannerUrl: json.data.bannerUrl }));
      setImgError(false);
      setBannerSaved(true);
      setTimeout(() => setBannerSaved(false), 3000);
    } catch (err) {
      setBannerError(err.message);
    } finally {
      setBannerSaving(false);
    }
  };

  // Member added callback
  const handleMemberAdded = (updatedDoc) => {
    setData(prev => ({ ...prev, members: updatedDoc.members }));
    setShowAddForm(false);
  };

  // Remove member
  const handleDeleteMember = async (memberId) => {
    const res = await fetch(`/api/royal-kings-club/members?memberId=${memberId}`, { method: 'DELETE' });
    if (res.ok) {
      const json = await res.json();
      setData(prev => ({ ...prev, members: json.data.members }));
    }
  };

  const sortedMembers = [...(data.members || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  // ── MEMBER VIEW ──────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return (
      <div className="space-y-8 pb-8">
        {/* Page Heading */}
        <div className="text-center space-y-2 pt-2">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#C5A059]/40 to-transparent max-w-24" />
            <Crown size={18} className="text-[#C5A059]" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#C5A059]/40 to-transparent max-w-24" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#001B3A] font-heading tracking-widest uppercase leading-tight">
            Royal Kings Club
          </h1>
          <p className="text-xs sm:text-sm text-[#C5A059] font-bold uppercase tracking-widest">Membership Directory</p>
        </div>

        {/* Hero Banner */}
        {loading ? (
          <div className="w-full rounded-2xl bg-slate-100 animate-pulse" style={{ height: '75vh' }} />
        ) : data.bannerUrl && !imgError ? (
          <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-[#C5A059]/20 relative" style={{ height: '75vh' }}>
            <Image
              src={data.bannerUrl}
              alt="Royal Kings Club Banner"
              fill
              className="object-cover"
              onError={() => setImgError(true)}
              priority
              sizes="100vw"
              unoptimized
            />
            {/* Gold overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#001B3A]/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center gap-2">
                <Crown size={16} className="text-[#C5A059]" />
                <span className="text-white text-sm font-bold uppercase tracking-widest">Allianza Leadership Platform</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="w-full rounded-2xl border border-[#C5A059]/20 flex items-center justify-center bg-gradient-to-br from-[#0A1E3D] to-[#001B3A]"
            style={{ height: '75vh' }}
          >
            <div className="text-center space-y-3">
              <Crown size={48} className="text-[#C5A059]/40 mx-auto" />
              <p className="text-[#C5A059]/60 text-sm font-semibold uppercase tracking-widest">Banner Coming Soon</p>
            </div>
          </div>
        )}

        {/* Member Grid */}
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[#C5A059]/20" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#C5A059] flex items-center gap-2">
              <Crown size={12} /> Club Members
            </h2>
            <div className="h-px flex-1 bg-[#C5A059]/20" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-[#C5A059]/20 p-6 animate-pulse">
                  <div className="w-32 h-40 rounded-xl bg-slate-100 mx-auto mb-4" />
                  <div className="h-4 bg-slate-100 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-3 bg-slate-50 rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : sortedMembers.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Crown size={40} className="text-slate-200 mx-auto" />
              <p className="text-slate-400 text-sm font-medium">No members have been added yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sortedMembers.map(member => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ADMIN VIEW ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#001B3A] font-heading tracking-widest uppercase flex items-center gap-2">
            <Crown size={18} className="text-[#C5A059]" />
            Royal Kings Club
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">Manage the club banner and top-performer membership directory.</p>
        </div>
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap shrink-0"
        >
          {showAddForm ? <X size={15} strokeWidth={2.5} /> : <Plus size={15} strokeWidth={2.5} />}
          {showAddForm ? 'Cancel' : 'Add Member'}
        </button>
      </div>

      {/* Banner Management Panel */}
      <div className="bg-white rounded-2xl border border-[#C5A059]/20 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#C5A059]/10 flex items-center gap-2">
          <ImageIcon size={14} className="text-[#C5A059]" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Hero Banner</span>
          <span className="text-xs text-slate-400 ml-auto">(75vh full-width display image)</span>
        </div>
        <div className="p-5 space-y-4">
          {/* Current banner preview — only shown when a URL is set */}
          {data.bannerUrl && !imgError && (
            <div className="w-full rounded-xl overflow-hidden border border-[#C5A059]/20 relative shadow-sm" style={{ height: '200px' }}>
              <Image
                src={data.bannerUrl}
                alt="Banner Preview"
                fill
                className="object-cover"
                onError={() => setImgError(true)}
                sizes="100vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
              <div className="absolute top-2 right-2">
                <span className="text-[10px] bg-emerald-500 text-white font-bold uppercase tracking-wider px-2 py-1 rounded-full">Active</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 flex-1">
            <div className="flex-1 flex gap-2">
              {bannerDraft && (
                <div className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 truncate flex-1">
                  File: {bannerDraft.substring(bannerDraft.lastIndexOf('/') + 1)}
                </div>
              )}
              <label className="bg-[#0A1E3D] hover:bg-[#001B3A] text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors w-full border border-[#C5A059]/30">
                <span>Upload Banner File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const data = new FormData();
                    data.append('file', file);
                    try {
                      const res = await fetch('/api/upload', { method: 'POST', body: data });
                      const json = await res.json();
                      if (res.ok && json.url) {
                        setBannerDraft(json.url);
                        setImgError(false);
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
            <button
              onClick={handleSaveBanner}
              disabled={bannerSaving || !bannerDraft.trim()}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
            >
              {bannerSaving ? (
                <>Saving…</>
              ) : bannerSaved ? (
                <><CheckCircle size={14} /> Saved!</>
              ) : (
                <><Save size={14} /> Save Banner</>
              )}
            </button>
          </div>
          {bannerError && <p className="text-xs text-red-500">{bannerError}</p>}
        </div>
      </div>

      {/* Add Member Form (inline, conditionally shown) */}
      {showAddForm && (
        <AddMemberForm
          onAdd={handleMemberAdded}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Members Management Panel */}
      <div className="bg-white rounded-2xl border border-[#C5A059]/20 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#C5A059]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown size={14} className="text-[#C5A059]" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Club Members</span>
          </div>
          <span className="text-xs text-slate-400">{sortedMembers.length} members</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Loading…</div>
        ) : sortedMembers.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Crown size={28} className="text-slate-200 mx-auto" />
            <p className="text-slate-400 text-sm">No members yet. Click "Add Member" to begin.</p>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sortedMembers.map(member => (
              <AdminMemberRow key={member._id} member={member} onDelete={handleDeleteMember} />
            ))}
          </div>
        )}
      </div>

      {/* Live preview section */}
      {sortedMembers.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#C5A059]/20 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#C5A059]/10 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Member Portal Preview</span>
            <span className="ml-auto text-[10px] bg-[#C5A059]/10 text-[#C5A059] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Read-only view</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedMembers.map(member => (
                <MemberCard key={member._id} member={member} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
