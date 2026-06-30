'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart, Plus, Download, Trash2, X, CheckCircle, AlertCircle,
  Users, IndianRupee, ExternalLink, ImageIcon, Edit3, Lock,
  Unlock, Search, Filter, RefreshCw, ChevronDown, MessageSquare,
  Calendar, TrendingUp, Eye
} from 'lucide-react';

// ─── New Cause Modal ──────────────────────────────────────────────────────────
function NewCauseModal({ onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Title is required.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/care-fund/causes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, targetAmount: Number(targetAmount) || 0 }),
      });
      const json = await res.json();
      if (res.ok) { onSuccess(json.data); onClose(); }
      else setError(json.error || 'Failed to create cause.');
    } catch { setError('An error occurred.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-zinc-100 font-heading">New Care Cause</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-zinc-100 transition-colors">
            <X size={16} />
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
            <AlertCircle size={14} /><span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Cause Title <span className="text-red-400">*</span></label>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Medical Emergency — Rahul K."
              required
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Description</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Brief context for team members..."
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-500 resize-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Target Amount (₹) — Optional</label>
            <input
              type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)}
              placeholder="0 = no specific target"
              min="0"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-500"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 border border-zinc-800 hover:bg-zinc-900 transition-colors">
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#C5A059] hover:bg-[#B8934C] text-[#001B3A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus size={13} />
              {loading ? 'Creating...' : 'Create Cause'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Cause Admin Card ─────────────────────────────────────────────────────────
function AdminCauseCard({ cause, onToggle, onDelete }) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      cause.isOpen
        ? 'border-emerald-500/20 bg-emerald-500/5'
        : 'border-zinc-700/50 bg-zinc-900/30 opacity-75'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
            cause.isDefault ? 'bg-rose-500/15 border border-rose-500/30' : 'bg-amber-500/15 border border-amber-500/30'
          }`}>
            <Heart size={15} className={cause.isDefault ? 'text-rose-400' : 'text-amber-400'} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-zinc-100 text-sm truncate">{cause.title}</p>
              {cause.isDefault && <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0">Default</span>}
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0 ${
                cause.isOpen ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
              }`}>{cause.isOpen ? 'Open' : 'Closed'}</span>
            </div>
            {cause.description && <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{cause.description}</p>}
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-zinc-400">
                <span className="font-bold text-zinc-100">₹{(cause.totalRaised || 0).toLocaleString('en-IN')}</span> raised
              </span>
              <span className="text-xs text-zinc-400">
                <span className="font-bold text-emerald-400">{cause.contributorCount || 0}</span> contributors
              </span>
              {cause.targetAmount > 0 && (
                <span className="text-xs text-zinc-400">
                  Target: <span className="font-bold text-[#C5A059]">₹{cause.targetAmount.toLocaleString('en-IN')}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onToggle(cause._id, !cause.isOpen)}
            className={`p-2 rounded-lg text-xs transition-colors ${
              cause.isOpen
                ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300'
                : 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
            }`}
            title={cause.isOpen ? 'Close this cause' : 'Re-open this cause'}
          >
            {cause.isOpen ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
          {!cause.isDefault && (
            <button
              onClick={() => onDelete(cause._id, cause.title)}
              className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete cause"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Component ────────────────────────────────────────────────────
export default function AdminCareFundClient() {
  const [causes, setCauses] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewCause, setShowNewCause] = useState(false);
  const [filterCause, setFilterCause] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, eRes] = await Promise.all([
        fetch('/api/care-fund/causes'),
        fetch('/api/care-fund/entries'),
      ]);
      const cJson = await cRes.json();
      const eJson = await eRes.json();
      if (cJson.success) setCauses(cJson.data);
      if (eJson.success) setEntries(eJson.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleCause = async (id, isOpen) => {
    try {
      const res = await fetch(`/api/care-fund/causes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen }),
      });
      if (res.ok) {
        setCauses(prev => prev.map(c => c._id === id ? { ...c, isOpen } : c));
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteCause = async (id, title) => {
    if (!confirm(`Delete "${title}" and all its contributions? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/care-fund/causes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCauses(prev => prev.filter(c => c._id !== id));
        setEntries(prev => prev.filter(e => e.causeId?._id !== id && e.causeId !== id));
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteEntry = async (id) => {
    if (!confirm('Delete this contribution entry?')) return;
    try {
      const res = await fetch(`/api/care-fund/entries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEntries(prev => prev.filter(e => e._id !== id));
        fetchData(); // refresh totals
      }
    } catch (err) { console.error(err); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const url = filterCause
        ? `/api/care-fund/export?causeId=${filterCause}`
        : '/api/care-fund/export';
      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `care-fund-${new Date().toISOString().slice(0, 10)}.xlsx`;
        link.click();
      }
    } catch (err) { console.error(err); }
    finally { setExporting(false); }
  };

  // Filtered entries
  const filteredEntries = entries.filter(e => {
    const matchesCause = !filterCause ||
      e.causeId?._id === filterCause ||
      e.causeId === filterCause;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      e.userName?.toLowerCase().includes(q) ||
      e.userId?.toLowerCase().includes(q) ||
      e.note?.toLowerCase().includes(q);
    return matchesCause && matchesSearch;
  });

  // Summary stats
  const totalRaisedAll = entries.reduce((sum, e) => sum + e.amount, 0);
  const uniqueContributors = new Set(entries.map(e => e.userId)).size;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-900 rounded-2xl border border-zinc-800 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <Heart size={16} className="text-rose-400" fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold text-zinc-100 font-heading">Care Fund</h1>
          </div>
          <p className="text-zinc-600 text-xs mt-1.5">Manage causes, review member contributions, and download reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={exporting || entries.length === 0}
            className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <Download size={13} />
            {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
          <button
            onClick={() => setShowNewCause(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-sm shadow-blue-500/10 cursor-pointer"
          >
            <Plus size={13} />
            New Cause
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Raised', value: `₹${totalRaisedAll.toLocaleString('en-IN')}`, color: 'text-[#C5A059]', icon: IndianRupee },
          { label: 'Contributors', value: uniqueContributors, color: 'text-emerald-400', icon: Users },
          { label: 'Total Entries', value: entries.length, color: 'text-blue-600', icon: TrendingUp },
          { label: 'Active Causes', value: causes.filter(c => c.isOpen).length, color: 'text-rose-400', icon: Heart },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="glass-panel border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} className="text-zinc-500" />
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{label}</p>
            </div>
            <p className={`text-2xl font-extrabold font-mono ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Causes Management */}
      <div className="glass-panel border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Heart size={12} className="text-rose-400" /> Manage Causes
        </h2>
        {causes.length === 0 ? (
          <p className="text-sm text-zinc-500 py-4 text-center">No causes yet.</p>
        ) : (
          <div className="space-y-3">
            {causes.map(cause => (
              <AdminCauseCard
                key={cause._id}
                cause={cause}
                onToggle={handleToggleCause}
                onDelete={handleDeleteCause}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contributions Table */}
      <div className="glass-panel border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="p-5 border-b border-zinc-800 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search member name or ID..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-500"
            />
          </div>
          <select
            value={filterCause}
            onChange={e => setFilterCause(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Causes</option>
            {causes.map(c => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                {['Member', 'Cause', 'Amount', 'Month', 'Note', 'Screenshot', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-zinc-500">
                    No contributions found.
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <tr key={entry._id} className="hover:bg-zinc-900/10 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-zinc-100">{entry.userName}</p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{entry.userId}</p>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="text-zinc-600 truncate">{entry.causeId?.title || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#C5A059] font-mono whitespace-nowrap">₹{entry.amount.toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{entry.month || '—'}</td>
                    <td className="px-4 py-3 max-w-[160px]">
                      <p className="text-zinc-600 truncate">{entry.note || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      {entry.screenshotUrl ? (
                        <a
                          href={entry.screenshotUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </a>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteEntry(entry._id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filteredEntries.length > 0 && (
          <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-500">
            <span>Showing {filteredEntries.length} of {entries.length} entries</span>
            <span className="font-bold text-[#C5A059]">
              Filtered Total: ₹{filteredEntries.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}
            </span>
          </div>
        )}
      </div>

      {/* New Cause Modal */}
      {showNewCause && (
        <NewCauseModal
          onClose={() => setShowNewCause(false)}
          onSuccess={(newCause) => {
            setCauses(prev => [newCause, ...prev]);
          }}
        />
      )}
    </div>
  );
}
