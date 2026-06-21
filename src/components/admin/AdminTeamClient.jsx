'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, ChevronDown, ChevronRight, Edit2 } from 'lucide-react';
import AddMemberModal from '@/components/modals/AddMemberModal';

export default function AdminTeamClient({ initialMembers, currentUser }) {
  const [members, setMembers] = useState(initialMembers || []);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSort, setMemberSort] = useState('date');
  const [collapsedTreeNodes, setCollapsedTreeNodes] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);

  // Form states for modals (Mocked for now since modals will be separate components)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [memberSort]);

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/members?sortBy=${memberSort}`);
      if (res.ok) {
        const json = await res.json();
        setMembers(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenMemberProfile = (memberItem) => {
    setSelectedMember(memberItem);
    // Open profile modal or navigate
  };

  const toggleNodeCollapse = (userId) => {
    setCollapsedTreeNodes(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const buildHierarchyTree = () => {
    const userMap = new Map(members.map(m => [m.userId, { ...m, children: [] }]));
    let rootNodes = [];

    userMap.forEach(node => {
      // Filter by search if applied
      const matchesSearch = memberSearch === '' || 
        node.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
        node.userId.toLowerCase().includes(memberSearch.toLowerCase());

      if (node.managerId && userMap.has(node.managerId)) {
        userMap.get(node.managerId).children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  const renderTreeNodes = (nodes) => {
    return (
      <ul className="pl-6 space-y-4 border-l border-zinc-800 relative">
        {nodes.map(node => {
          const isCollapsed = collapsedTreeNodes[node.userId];
          const hasChildren = node.children && node.children.length > 0;
          const matchesSearch = memberSearch === '' || 
            node.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
            node.userId.toLowerCase().includes(memberSearch.toLowerCase());

          // Hide node if it doesn't match search AND has no matching children (simplified for demo)
          if (!matchesSearch && !hasChildren && memberSearch !== '') return null;

          return (
            <li key={node.userId} className="relative py-2 pl-4">
              <div className="absolute left-0 top-6 w-4 h-[1px] bg-zinc-800" />
              
              <div className="flex items-center space-x-3">
                {hasChildren && (
                  <button 
                    onClick={() => toggleNodeCollapse(node.userId)}
                    className="p-1 rounded bg-zinc-900 border border-zinc-800 text-gold-primary hover:text-white"
                  >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
                
                <div 
                  onClick={() => handleOpenMemberProfile(node)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer glass-panel glass-panel-hover border border-zinc-800 ${
                    selectedMember?.userId === node.userId ? 'border-amber-500/50 bg-amber-500/5' : ''
                  }`}
                >
                  <img 
                    src={node.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} 
                    alt={node.name} 
                    className="w-10 h-10 rounded-full border border-zinc-700 object-cover" 
                  />
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-100 flex items-center gap-1.5">
                      {node.name}
                      {node.role === 'super_admin' && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">Admin</span>}
                    </h4>
                    <p className="text-xs text-zinc-500">{node.userId} | {node.rank}</p>
                  </div>
                  <div className="text-right pl-6 border-l border-zinc-800">
                    <p className="text-[10px] text-zinc-500">Combined BV</p>
                    <p className="text-xs font-semibold text-amber-500">{((node.leftBV ?? 0) + (node.rightBV ?? 0)).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {hasChildren && !isCollapsed && renderTreeNodes(node.children)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Organizational Hierarchy Tree</h1>
          <p className="text-zinc-400 text-xs mt-1">Collapsible list structure. Root users report to CEO directly.</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input 
              type="text" 
              placeholder="Search member ID or name..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 transition-colors w-64"
            />
          </div>

          <select
            value={memberSort}
            onChange={(e) => setMemberSort(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-amber-500"
          >
            <option value="date">Sort by Join Date</option>
            <option value="bv">Sort by Business Value</option>
            <option value="rank">Sort by Leadership Rank</option>
          </select>

          <button 
            onClick={() => setIsAddMemberOpen(true)}
            className="flex items-center gap-1.5 bg-amber-500 text-black px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={16} />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-zinc-800 min-h-[450px]">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6">Reporting Manager Hierarchy</h3>
          
          {members.length === 0 ? (
            <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
              No members found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              {renderTreeNodes(buildHierarchyTree())}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {selectedMember ? (
            <div className="p-6 rounded-2xl glass-panel border border-zinc-800 space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-zinc-900">
                <img 
                  src={selectedMember.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} 
                  alt={selectedMember.name} 
                  className="w-12 h-12 rounded-full border border-zinc-800 object-cover" 
                />
                <div>
                  <h3 className="font-bold text-base text-white">{selectedMember.name}</h3>
                  <p className="text-xs text-zinc-500">{selectedMember.userId} | {selectedMember.tezId || 'No TEZ ID'}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-400">Manage member details, ranks, and overrides here.</p>
              {/* Detailed editing form could go here */}
            </div>
          ) : (
            <div className="p-8 rounded-2xl glass-panel border border-zinc-800 text-center text-zinc-600 flex flex-col items-center justify-center min-h-[450px]">
              <Users size={40} className="mb-4 text-zinc-700" />
              <p>Select a member from the hierarchy tree to view and edit details.</p>
            </div>
          )}
        </div>
      </div>

      <AddMemberModal 
        isOpen={isAddMemberOpen} 
        onClose={() => setIsAddMemberOpen(false)}
        onSuccess={(newMember) => {
          setMembers([...members, newMember]);
          alert(`Successfully added ${newMember.name}`);
        }}
        existingMembers={members}
      />
    </div>
  );
}
