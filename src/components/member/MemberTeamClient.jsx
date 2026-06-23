'use client';

import React, { useState } from 'react';
import { Users, Plus, ChevronDown, ChevronRight, Award, TrendingUp } from 'lucide-react';
import AddMemberModal from '@/components/modals/AddMemberModal';

// Recursively count all descendants of a node
function countDescendants(userId, memberMap) {
  const node = memberMap.get(userId);
  if (!node || !node.children || node.children.length === 0) return 0;
  let count = node.children.length;
  for (const child of node.children) {
    count += countDescendants(child.userId, memberMap);
  }
  return count;
}

// Build tree map from flat member list, rooted at a specific userId
function buildDownlineTree(rootUserId, allMembers) {
  const memberMap = new Map(allMembers.map(m => [m.userId, { ...m, children: [] }]));

  // Attach children to parents
  memberMap.forEach(node => {
    if (node.managerId && memberMap.has(node.managerId)) {
      memberMap.get(node.managerId).children.push(node);
    }
  });

  return memberMap;
}

const rankColors = {
  Crown: 'text-purple-400 bg-purple-400/10',
  Diamond: 'text-cyan-400 bg-cyan-400/10',
  Platinum: 'text-blue-400 bg-blue-400/10',
  Gold: 'text-amber-400 bg-amber-400/10',
  Silver: 'text-zinc-300 bg-zinc-300/10',
  Associate: 'text-zinc-500 bg-zinc-500/10',
};

export default function MemberTeamClient({ currentUser, allMembers }) {
  const [members, setMembers] = useState(allMembers);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [collapsed, setCollapsed] = useState({});

  const memberMap = buildDownlineTree(currentUser.userId, members);
  const rootNode = memberMap.get(currentUser.userId);
  const directChildren = rootNode?.children || [];
  const totalDownline = countDescendants(currentUser.userId, memberMap);

  const toggleCollapse = (userId) => {
    setCollapsed(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleAddSuccess = (newMember) => {
    setMembers(prev => [...prev, newMember]);
  };

  const renderNodes = (nodes, depth = 0) => {
    if (!nodes || nodes.length === 0) return null;
    return (
      <ul className={`space-y-3 border-l border-zinc-800 ${depth > 0 ? 'pl-6 mt-3' : 'pl-0 border-l-0'}`}>
        {nodes.map(node => {
          const isCollapsed = collapsed[node.userId];
          const hasChildren = node.children && node.children.length > 0;
          const descCount = countDescendants(node.userId, memberMap);
          const rankColor = rankColors[node.rank] || rankColors.Associate;

          return (
            <li key={node.userId} className={`relative ${depth > 0 ? 'pl-4' : ''}`}>
              {depth > 0 && <div className="absolute left-0 top-7 w-4 h-[1px] bg-zinc-800" />}

              <div className="flex items-start gap-2">
                {/* Collapse toggle */}
                {hasChildren ? (
                  <button
                    onClick={() => toggleCollapse(node.userId)}
                    className="mt-3 p-1 rounded bg-zinc-900 border border-zinc-800 text-amber-500 hover:text-white shrink-0 transition-colors"
                  >
                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  </button>
                ) : (
                  <div className="w-6 shrink-0" />
                )}

                {/* Member Card */}
                <div className="flex-1 flex items-center gap-4 p-4 rounded-xl glass-panel border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <img
                    src={node.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'}
                    alt={node.name}
                    className="w-10 h-10 rounded-full border border-zinc-700 object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-zinc-100">{node.name}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rankColor}`}>
                        {node.rank || 'Associate'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{node.userId}</p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-5 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Combined BV</p>
                      <p className="text-sm font-bold text-amber-500 font-mono">
                        {((node.leftBV || 0) + (node.rightBV || 0)).toLocaleString()}
                      </p>
                    </div>
                    {hasChildren && (
                      <div className="text-right">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Team Size</p>
                        <p className="text-sm font-bold text-emerald-400">
                          {descCount + node.children.length} members
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Children */}
              {hasChildren && !isCollapsed && renderNodes(node.children, depth + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">My Team</h1>
          <p className="text-zinc-400 text-xs mt-1">
            Members you have added under your network
          </p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 bg-amber-500 text-black px-5 py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass-panel border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Direct Members</p>
          <p className="text-3xl font-extrabold text-white mt-1 font-mono">{directChildren.length}</p>
          <p className="text-xs text-zinc-600 mt-1">Reporting to you</p>
        </div>
        <div className="glass-panel border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Downline</p>
          <p className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">{totalDownline}</p>
          <p className="text-xs text-zinc-600 mt-1">All levels combined</p>
        </div>
        <div className="glass-panel border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Your Rank</p>
          <p className="text-2xl font-extrabold text-amber-400 mt-1">{currentUser.rank || 'Associate'}</p>
          <p className="text-xs text-zinc-600 mt-1">{currentUser.reward || 'No reward yet'}</p>
        </div>
      </div>

      {/* Tree */}
      <div className="glass-panel border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-6 flex items-center gap-2">
          <Users size={14} />
          Your Network Tree
        </h3>

        {directChildren.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <Users size={28} className="text-zinc-600" />
            </div>
            <p className="text-zinc-500 font-medium">No members yet</p>
            <p className="text-zinc-600 text-xs mt-1">Click "Add Member" to grow your team</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-5 flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-500/20 transition-colors"
            >
              <Plus size={14} />
              Add your first member
            </button>
          </div>
        ) : (
          renderNodes(directChildren)
        )}
      </div>

      {/* Add Member Modal — locked to current user's team */}
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
