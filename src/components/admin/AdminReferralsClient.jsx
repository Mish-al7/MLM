'use client';

import React, { useState, useMemo } from 'react';
import {
  Users, UserPlus, Plus, Search, ChevronDown, ChevronRight,
  Award, TrendingUp, TrendingDown, Phone, Mail, Calendar,
  X, Edit2, Save, Flame, ShieldCheck, Activity
} from 'lucide-react';
import AddMemberModal from '@/components/modals/AddMemberModal';

// ─── Utility Helpers ───────────────────────────────────────────────────────────

function countDescendants(userId, memberMap) {
  const node = memberMap.get(userId);
  if (!node || !node.children || node.children.length === 0) return 0;
  let count = node.children.length;
  for (const child of node.children) {
    count += countDescendants(child.userId, memberMap);
  }
  return count;
}

function buildMemberMap(allMembers) {
  const map = new Map(allMembers.map(m => [m.userId, { ...m, children: [] }]));
  map.forEach(node => {
    if (node.managerId && map.has(node.managerId)) {
      map.get(node.managerId).children.push(node);
    }
  });
  return map;
}

const rankColors = {
  Crown:     'text-purple-400 bg-purple-400/10 border-purple-400/20',
  Diamond:   'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  Platinum:  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  Gold:      'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Silver:    'text-zinc-300 bg-zinc-300/10 border-zinc-300/20',
  Associate: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20',
};

const statusColors = {
  active:   'text-emerald-400 bg-emerald-400/10',
  inactive: 'text-red-400 bg-red-400/10',
  archived: 'text-zinc-500 bg-zinc-500/10',
};

// ─── Sub-tree Renderer ─────────────────────────────────────────────────────────

function SubTree({ nodes, memberMap, depth = 0 }) {
  const [collapsed, setCollapsed] = useState({});
  if (!nodes || nodes.length === 0) return null;

  return (
    <ul className={`space-y-2 border-l border-zinc-800 ${depth > 0 ? 'pl-5 mt-2' : 'pl-0 border-l-0'}`}>
      {nodes.map(node => {
        const isCollapsed = collapsed[node.userId];
        const hasChildren = node.children && node.children.length > 0;
        const descCount = countDescendants(node.userId, memberMap);
        const rankColor = rankColors[node.rank] || rankColors.Associate;

        return (
          <li key={node.userId} className={`relative ${depth > 0 ? 'pl-4' : ''}`}>
            {depth > 0 && <div className="absolute left-0 top-5 w-4 h-[1px] bg-zinc-800" />}
            <div className="flex items-center gap-2">
              {hasChildren ? (
                <button
                  onClick={() => setCollapsed(p => ({ ...p, [node.userId]: !p[node.userId] }))}
                  className="p-0.5 rounded bg-zinc-900 border border-zinc-800 text-amber-500 hover:text-white shrink-0 transition-colors"
                >
                  {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                </button>
              ) : (
                <div className="w-5 shrink-0" />
              )}
              <div className="flex-1 flex items-center gap-3 py-1.5 px-3 rounded-lg border border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 transition-colors">
                <img
                  src={node.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=60'}
                  alt={node.name}
                  className="w-7 h-7 rounded-full border border-zinc-700 object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-semibold text-zinc-200 truncate">{node.name}</span>
                  <p className="text-[10px] text-zinc-500 font-mono">{node.userId}</p>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${rankColor}`}>
                  {node.rank || 'Associate'}
                </span>
                {descCount > 0 && (
                  <span className="text-[10px] text-emerald-400 font-mono">+{descCount}</span>
                )}
              </div>
            </div>
            {hasChildren && !isCollapsed && (
              <SubTree nodes={node.children} memberMap={memberMap} depth={depth + 1} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

// ─── Member Detail Flyout ──────────────────────────────────────────────────────

function MemberFlyout({ member, memberMap, onClose, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [bvLeft, setBvLeft] = useState(member.leftBV || 0);
  const [bvRight, setBvRight] = useState(member.rightBV || 0);
  const [saving, setSaving] = useState(false);
  const rankColor = rankColors[member.rank] || rankColors.Associate;
  const statusColor = statusColors[member.status] || statusColors.active;
  const descCount = countDescendants(member.userId, memberMap);

  const handleSaveBV = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/members/${member.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leftBV: bvLeft, rightBV: bvRight }),
      });
      const json = await res.json();
      if (res.ok) {
        onUpdated(json.data);
        setEditing(false);
      } else {
        alert(json.error || 'Failed to update BV.');
      }
    } catch (e) {
      alert('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const combinedBV = (member.leftBV || 0) + (member.rightBV || 0);
  const leftPct = combinedBV > 0 ? Math.round(((member.leftBV || 0) / combinedBV) * 100) : 50;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-100">Member Details</h3>
        <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Avatar & Name */}
        <div className="flex items-center gap-3">
          <img
            src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'}
            alt={member.name}
            className="w-14 h-14 rounded-full border-2 border-zinc-700 object-cover shrink-0"
          />
          <div>
            <h4 className="font-bold text-base text-white">{member.name}</h4>
            <p className="text-xs text-zinc-500 font-mono">{member.userId}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rankColor}`}>
                {member.rank || 'Associate'}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${statusColor}`}>
                {member.status || 'active'}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2">
          {member.email && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Mail size={13} className="text-zinc-600 shrink-0" />
              <span className="truncate">{member.email}</span>
            </div>
          )}
          {member.phone && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Phone size={13} className="text-zinc-600 shrink-0" />
              <span>{member.phone}</span>
            </div>
          )}
          {member.joiningDate && (
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Calendar size={13} className="text-zinc-600 shrink-0" />
              <span>Joined {new Date(member.joiningDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        {/* Team Size */}
        {descCount > 0 && (
          <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-3">
            <Users size={16} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Total Downline Team</p>
              <p className="text-xl font-extrabold text-emerald-400 font-mono">{descCount}</p>
            </div>
          </div>
        )}

        {/* BV Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Business Values</p>
            {!editing ? (
              <button
                onClick={() => { setEditing(true); setBvLeft(member.leftBV || 0); setBvRight(member.rightBV || 0); }}
                className="flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 transition-colors"
              >
                <Edit2 size={11} /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="text-[10px] text-zinc-500 hover:text-white transition-colors"
                >Cancel</button>
                <button
                  onClick={handleSaveBV}
                  disabled={saving}
                  className="flex items-center gap-1 text-[10px] bg-amber-500 text-black px-2 py-0.5 rounded font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Save size={10} /> {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <p className="text-[10px] text-zinc-500 uppercase mb-1">Left BV</p>
              {editing ? (
                <input
                  type="number"
                  value={bvLeft}
                  onChange={e => setBvLeft(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-amber-500/40 rounded px-2 py-1 text-amber-400 font-mono text-sm focus:outline-none"
                />
              ) : (
                <p className="text-lg font-extrabold text-amber-400 font-mono">{(member.leftBV || 0).toLocaleString()}</p>
              )}
            </div>
            <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <p className="text-[10px] text-zinc-500 uppercase mb-1">Right BV</p>
              {editing ? (
                <input
                  type="number"
                  value={bvRight}
                  onChange={e => setBvRight(parseInt(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-cyan-500/40 rounded px-2 py-1 text-cyan-400 font-mono text-sm focus:outline-none"
                />
              ) : (
                <p className="text-lg font-extrabold text-cyan-400 font-mono">{(member.rightBV || 0).toLocaleString()}</p>
              )}
            </div>
          </div>

          {/* BV Balance bar */}
          {combinedBV > 0 && (
            <div>
              <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                <span>Left {leftPct}%</span>
                <span>Right {100 - leftPct}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-cyan-500" style={{ width: `${leftPct}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Reward */}
        {member.reward && (
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 flex items-start gap-2">
            <Award size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-zinc-500 uppercase">Current Reward</p>
              <p className="text-sm font-semibold text-zinc-200">{member.reward}</p>
            </div>
          </div>
        )}

        {/* Upcoming */}
        {member.upcomingRank && (
          <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 flex items-start gap-2">
            <TrendingUp size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-zinc-500 uppercase">Next Target</p>
              <p className="text-sm font-semibold text-zinc-200">{member.upcomingRank}</p>
              {member.upcomingReward && (
                <p className="text-xs text-zinc-500 mt-0.5">{member.upcomingReward}</p>
              )}
            </div>
          </div>
        )}

        {/* Sub-tree */}
        {memberMap.get(member.userId)?.children?.length > 0 && (
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-2">Their Downline</p>
            <SubTree nodes={memberMap.get(member.userId).children} memberMap={memberMap} depth={0} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminReferralsClient({ currentUser, allMembers }) {
  const [members, setMembers] = useState(allMembers);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'bv' | 'rank' | 'team'
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Build full member map for the entire org
  const memberMap = useMemo(() => buildMemberMap(members), [members]);

  // Direct referrals: members whose managerId is the current user
  const directReferrals = useMemo(() =>
    (memberMap.get(currentUser.userId)?.children || []),
    [memberMap, currentUser.userId]
  );

  // Stats
  const totalDirectCount = directReferrals.length;
  const totalDownlineCount = countDescendants(currentUser.userId, memberMap);
  const combinedBVContribution = useMemo(() =>
    directReferrals.reduce((sum, m) => sum + (m.leftBV || 0) + (m.rightBV || 0), 0),
    [directReferrals]
  );

  // Filter + Sort referrals
  const filteredReferrals = useMemo(() => {
    let list = [...directReferrals];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.userId.toLowerCase().includes(q) ||
        (m.email || '').toLowerCase().includes(q)
      );
    }
    if (sortBy === 'bv') {
      list.sort((a, b) => ((b.leftBV || 0) + (b.rightBV || 0)) - ((a.leftBV || 0) + (a.rightBV || 0)));
    } else if (sortBy === 'rank') {
      const w = { Crown: 6, Diamond: 5, Platinum: 4, Gold: 3, Silver: 2, Associate: 1 };
      list.sort((a, b) => (w[b.rank] || 1) - (w[a.rank] || 1));
    } else if (sortBy === 'team') {
      list.sort((a, b) => countDescendants(b.userId, memberMap) - countDescendants(a.userId, memberMap));
    } else {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [directReferrals, search, sortBy, memberMap]);

  const handleAddSuccess = (newMember) => {
    setMembers(prev => [...prev, newMember]);
  };

  const handleMemberUpdated = (updatedMember) => {
    setMembers(prev => prev.map(m => m.userId === updatedMember.userId ? { ...m, ...updatedMember } : m));
    setSelectedMember(updatedMember);
  };

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white font-heading">Referral Team</h1>
          <p className="text-zinc-400 text-xs mt-0.5">Members directly referred and managed by you.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm shadow-blue-500/10 shrink-0"
        >
          <UserPlus size={15} strokeWidth={2.5} />
          <span>Add Referral</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="glass-panel border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Direct Referrals</p>
            <p className="text-2xl font-extrabold text-amber-400 font-mono mt-0.5">{totalDirectCount}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">Reporting directly to you</p>
          </div>
          <div className="p-2 bg-amber-500/10 rounded-lg shrink-0">
            <Users size={18} className="text-amber-400" />
          </div>
        </div>
        <div className="glass-panel border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total Downline</p>
            <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">{totalDownlineCount}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">All levels combined</p>
          </div>
          <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
            <Activity size={18} className="text-emerald-400" />
          </div>
        </div>
        <div className="glass-panel border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Direct BV Pool</p>
            <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-0.5">{combinedBVContribution.toLocaleString()}</p>
            <p className="text-[10px] text-zinc-600 mt-0.5">Combined from direct referrals</p>
          </div>
          <div className="p-2 bg-cyan-500/10 rounded-lg shrink-0">
            <TrendingUp size={18} className="text-cyan-400" />
          </div>
        </div>
      </div>

      {/* Main Content: referral list + detail panel */}
      <div className={`grid grid-cols-1 ${selectedMember ? 'lg:grid-cols-3' : ''} gap-3`}>
        {/* Referral List Panel */}
        <div className={`${selectedMember ? 'lg:col-span-2' : ''} glass-panel border border-zinc-800 rounded-xl overflow-hidden`}>
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 border-b border-zinc-800">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by name, ID, or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-amber-500"
            >
              <option value="name">Sort: Name</option>
              <option value="bv">Sort: BV (High→Low)</option>
              <option value="rank">Sort: Rank (Top→Bottom)</option>
              <option value="team">Sort: Team Size</option>
            </select>
          </div>

          {/* Referral Cards */}
          {filteredReferrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-3">
                <UserPlus size={24} className="text-zinc-600" />
              </div>
              <p className="text-zinc-500 text-sm font-medium">
                {search ? 'No referrals match your search.' : 'No direct referrals yet.'}
              </p>
              {!search && (
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="mt-4 flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={14} /> Add your first referral
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/60">
              {filteredReferrals.map(member => {
                const rankColor = rankColors[member.rank] || rankColors.Associate;
                const combinedBV = (member.leftBV || 0) + (member.rightBV || 0);
                const descCount = countDescendants(member.userId, memberMap);
                const isSelected = selectedMember?.userId === member.userId;

                return (
                  <div
                    key={member.userId}
                    onClick={() => setSelectedMember(isSelected ? null : member)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition-colors hover:bg-zinc-800/40 ${
                      isSelected ? 'bg-amber-500/5 border-l-2 border-amber-500' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <img
                      src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'}
                      alt={member.name}
                      className="w-10 h-10 rounded-full border border-zinc-700 object-cover shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-zinc-100 truncate">{member.name}</h4>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${rankColor}`}>
                          {member.rank || 'Associate'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{member.userId}</p>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-600 uppercase">BV</p>
                        <p className="text-sm font-bold text-amber-400 font-mono">{combinedBV.toLocaleString()}</p>
                      </div>
                      {descCount > 0 && (
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-600 uppercase">Team</p>
                          <p className="text-sm font-bold text-emerald-400">{descCount}</p>
                        </div>
                      )}
                      {member.phone && (
                        <a
                          href={`tel:${member.phone.replace(/\s+/g, '')}`}
                          onClick={e => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                          title="Call"
                        >
                          <Phone size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredReferrals.length > 0 && (
            <div className="p-2 text-center text-[11px] text-zinc-600 border-t border-zinc-800">
              {filteredReferrals.length} of {totalDirectCount} direct referrals
            </div>
          )}
        </div>

        {/* Detail Flyout Panel */}
        {selectedMember && (
          <div className="glass-panel border border-zinc-800 rounded-xl overflow-hidden">
            <MemberFlyout
              member={selectedMember}
              memberMap={memberMap}
              onClose={() => setSelectedMember(null)}
              onUpdated={handleMemberUpdated}
            />
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleAddSuccess}
        existingMembers={members}
        lockedManagerId={currentUser.userId}
      />
    </div>
  );
}
