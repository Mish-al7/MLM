'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Heart, Plus, Upload, X, CheckCircle, AlertCircle, Clock,
  ChevronDown, ChevronUp, ExternalLink, Trash2, Image as ImageIcon,
  IndianRupee, Calendar, MessageSquare, RefreshCw
} from 'lucide-react';

// ─── Contribute Modal ─────────────────────────────────────────────────────────
function ContributeModal({ cause, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (res.ok && json.url) {
        setScreenshotUrl(json.url);
      } else {
        setError(json.error || 'Upload failed');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/care-fund/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          causeId: cause._id,
          amount: Number(amount),
          note,
          screenshotUrl,
          month: currentMonth,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        onSuccess(json.data);
        onClose();
      } else {
        setError(json.error || 'Failed to submit contribution.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
              <Heart size={18} className="text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100 text-sm font-heading">Submit Contribution</h3>
              <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{cause.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-zinc-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">
              Amount Contributed <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                required
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-500"
              />
            </div>
          </div>

          {/* Month (read-only display) */}
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg">
            <Calendar size={13} className="text-zinc-500 flex-shrink-0" />
            <p className="text-xs text-zinc-550">Recording for: <span className="text-zinc-100 font-semibold">{new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</span></p>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Note (Optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Any remarks about this contribution..."
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 placeholder-zinc-500 resize-none"
            />
          </div>

          {/* Screenshot Upload */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">Payment Screenshot</label>
            {screenshotUrl ? (
              <div className="flex items-center gap-3 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                <p className="text-xs text-emerald-400 flex-1 truncate">Screenshot uploaded</p>
                <a href={screenshotUrl} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-zinc-100 transition-colors flex-shrink-0">
                  <ExternalLink size={14} />
                </a>
                <button type="button" onClick={() => setScreenshotUrl('')} className="text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-zinc-800 rounded-lg cursor-pointer hover:border-amber-500/40 hover:bg-[#C5A059]/5 transition-colors">
                {uploading ? (
                  <RefreshCw size={14} className="text-zinc-500 animate-spin" />
                ) : (
                  <Upload size={14} className="text-zinc-500" />
                )}
                <span className="text-xs text-zinc-500">{uploading ? 'Uploading...' : 'Upload screenshot (optional)'}</span>
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 border border-zinc-800 hover:bg-zinc-900 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#C5A059] hover:bg-[#B8934C] text-[#001B3A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Heart size={13} />
              {loading ? 'Submitting...' : 'Submit Contribution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Cause Card ───────────────────────────────────────────────────────────────
function CauseCard({ cause, myEntries, onContribute, onDeleteEntry }) {
  const [expanded, setExpanded] = useState(false);
  const myTotal = myEntries.reduce((sum, e) => sum + e.amount, 0);
  const progressPct = cause.targetAmount > 0
    ? Math.min(100, Math.round((cause.totalRaised / cause.targetAmount) * 100))
    : null;

  return (
    <div className={`rounded-2xl border transition-all duration-200 bg-zinc-950 ${cause.isDefault
      ? 'border-rose-500/30 shadow-sm'
      : 'border-zinc-800 shadow-sm'
    }`}>
      {/* Card Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              cause.isDefault ? 'bg-rose-500/15 border border-rose-500/30' : 'bg-amber-500/15 border border-amber-500/30'
            }`}>
              <Heart size={18} className={cause.isDefault ? 'text-rose-400' : 'text-amber-400'} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-zinc-100 text-sm leading-tight">{cause.title}</h3>
                {cause.isDefault && (
                  <span className="text-[9px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider">Monthly</span>
                )}
                {!cause.isOpen && (
                  <span className="text-[9px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Closed</span>
                )}
              </div>
              {cause.description && (
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{cause.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Total Raised</p>
            <p className="text-base font-extrabold text-zinc-100 mt-0.5">₹{(cause.totalRaised || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Contributors</p>
            <p className="text-base font-extrabold text-emerald-500 mt-0.5">{cause.contributorCount || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider">My Total</p>
            <p className={`text-base font-extrabold mt-0.5 ${myTotal > 0 ? 'text-[#C5A059]' : 'text-zinc-500'}`}>
              ₹{myTotal.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Progress bar if target set */}
        {progressPct !== null && (
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-[10px] text-zinc-500">
              <span>Progress</span>
              <span>{progressPct}% of ₹{cause.targetAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 mt-4">
          {cause.isOpen && (
            <button
              onClick={() => onContribute(cause)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                cause.isDefault
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-black'
              }`}
            >
              <Plus size={13} />
              Contribute
            </button>
          )}
          {myEntries.length > 0 && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-100 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              My History ({myEntries.length})
            </button>
          )}
        </div>
      </div>

      {/* My Contributions Timeline */}
      {expanded && myEntries.length > 0 && (
        <div className="border-t border-zinc-800/60 px-5 py-4 space-y-3">
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">My Contributions</p>
          {myEntries.map(entry => (
            <div key={entry._id} className="flex items-start gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-800/50">
              <div className="w-8 h-8 rounded-full bg-[#C5A059]/10 border border-[#C5A059]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <IndianRupee size={13} className="text-[#C5A059]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-zinc-100 text-sm">₹{entry.amount.toLocaleString('en-IN')}</p>
                  <p className="text-[10px] text-zinc-500 flex-shrink-0">
                    {new Date(entry.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {entry.month && (
                  <p className="text-[10px] text-zinc-500 mt-0.5">{entry.month}</p>
                )}
                {entry.note && (
                  <p className="text-xs text-zinc-600 mt-1 flex items-start gap-1">
                    <MessageSquare size={10} className="mt-0.5 flex-shrink-0 text-zinc-500" />
                    {entry.note}
                  </p>
                )}
                {entry.screenshotUrl && (
                  <a
                    href={entry.screenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <ImageIcon size={10} />
                    View Screenshot
                  </a>
                )}
              </div>
              <button
                onClick={() => onDeleteEntry(entry._id)}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors flex-shrink-0"
                title="Delete this entry"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────
export default function MemberCareFundClient({ currentUserId }) {
  const [causes, setCauses] = useState([]);
  const [myEntries, setMyEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCause, setActiveCause] = useState(null); // for modal

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [causesRes, entriesRes] = await Promise.all([
        fetch('/api/care-fund/causes'),
        fetch('/api/care-fund/entries'),
      ]);
      const causesJson = await causesRes.json();
      const entriesJson = await entriesRes.json();
      if (causesJson.success) setCauses(causesJson.data);
      if (entriesJson.success) setMyEntries(entriesJson.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleContributeSuccess = (newEntry) => {
    setMyEntries(prev => [newEntry, ...prev]);
    // Re-fetch to get updated totals
    fetchData();
  };

  const handleDeleteEntry = async (entryId) => {
    if (!confirm('Are you sure you want to remove this contribution record?')) return;
    try {
      const res = await fetch(`/api/care-fund/entries/${entryId}`, { method: 'DELETE' });
      if (res.ok) {
        setMyEntries(prev => prev.filter(e => e._id !== entryId));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const myTotalAll = myEntries.reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
        {[1, 2].map(i => <div key={i} className="h-48 bg-zinc-900 rounded-2xl border border-zinc-800 animate-pulse" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <Heart size={16} className="text-rose-400" fill="currentColor" />
            </div>
            <h1 className="text-xl font-bold text-zinc-100 font-heading">Care Fund</h1>
          </div>
          <p className="text-zinc-600 text-xs mt-1.5 ml-10.5">
            Set apart your monthly contribution &amp; support teammates in need.
          </p>
        </div>
      </div>

      {/* My Summary Banner */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel border border-zinc-800 rounded-2xl p-5 flex flex-col gap-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">My Total Given</p>
          <p className="text-2xl font-extrabold text-[#C5A059] font-mono">₹{myTotalAll.toLocaleString('en-IN')}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Across all causes</p>
        </div>
        <div className="glass-panel border border-zinc-800 rounded-2xl p-5 flex flex-col gap-1">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Contributions Made</p>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono">{myEntries.length}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">All time entries</p>
        </div>
      </div>

      {/* Causes */}
      <div className="space-y-4">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <Heart size={12} className="text-rose-400" />
          Active Causes
        </h2>
        {causes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center glass-panel border border-zinc-800 rounded-2xl">
            <Heart size={28} className="text-zinc-700 mb-3" />
            <p className="text-zinc-500 font-medium">No causes available</p>
          </div>
        ) : (
          causes.map(cause => (
            <CauseCard
              key={cause._id}
              cause={cause}
              myEntries={myEntries.filter(e =>
                e.causeId?._id === cause._id || e.causeId === cause._id
              )}
              onContribute={setActiveCause}
              onDeleteEntry={handleDeleteEntry}
            />
          ))
        )}
      </div>

      {/* Contribute Modal */}
      {activeCause && (
        <ContributeModal
          cause={activeCause}
          onClose={() => setActiveCause(null)}
          onSuccess={handleContributeSuccess}
        />
      )}
    </div>
  );
}
