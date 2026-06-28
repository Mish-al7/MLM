'use client';

import React, { useState } from 'react';
import { 
  Trophy, Award, Gift, Calendar as CalendarIcon, Users, 
  Search, Plus, CheckCircle, ArrowRight, RefreshCw, Star, 
  MapPin, Compass, Car, ShieldAlert, Edit, Trash2, Settings, X, Save,
  Crown, Gem
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Helper to map string icon names to Lucide icons
const getRankIcon = (iconName, colorClass = "text-amber-500") => {
  switch (iconName) {
    case 'Star': return <Star className={colorClass} size={24} />;
    case 'Award': return <Award className={colorClass} size={24} />;
    case 'Compass': return <Compass className={colorClass} size={24} />;
    case 'MapPin': return <MapPin className={colorClass} size={24} />;
    case 'Trophy': return <Gem className={colorClass} size={24} />;
    case 'Car': return <Crown className={colorClass} size={24} />;
    default: return <Award className={colorClass} size={24} />;
  }
};

// Helper to map icon names to card background styling
const getRankBg = (iconName) => {
  switch (iconName) {
    case 'Star': return 'bg-zinc-950/40 border-zinc-800 text-zinc-400';
    case 'Award': return 'bg-slate-500/10 border-slate-500/30 text-slate-300';
    case 'Compass': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500';
    case 'MapPin': return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
    case 'Trophy': return 'bg-amber-500/10 border-amber-500/30 text-amber-500';
    case 'Car': return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
    default: return 'bg-zinc-900/40 border-zinc-800 text-zinc-300';
  }
};

export default function AdminAchievementsClient({ initialUsers, currentUser, initialRanks }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers || []);
  const [ranks, setRanks] = useState(initialRanks || []);
  const [selectedRankFilter, setSelectedRankFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Award Form State (Awarding achievements to user)
  const [targetUserId, setTargetUserId] = useState('');
  const [newRank, setNewRank] = useState(initialRanks?.[0]?.name || 'Silver');
  const [newReward, setNewReward] = useState(initialRanks?.[0]?.reward || 'None');
  const [achievementDate, setAchievementDate] = useState(new Date().toISOString().split('T')[0]);
  const [upcomingRank, setUpcomingRank] = useState('');
  const [upcomingReward, setUpcomingReward] = useState('');

  // Rank Setup Form State (Managing ranks configuration)
  const [isManagingRanks, setIsManagingRanks] = useState(false);
  const [editingRankId, setEditingRankId] = useState(null); // If editing a rank
  const [rankForm, setRankForm] = useState({
    name: '',
    reward: '',
    target: '',
    targetLeftBv: 0,
    targetRightBv: 0,
    iconName: 'Award'
  });

  const [loading, setLoading] = useState(false);
  const [rankLoading, setRankLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Auto-calculate rank eligibility based on BV balance
  const selectedUser = React.useMemo(() => {
    return users.find(u => u.userId === targetUserId);
  }, [users, targetUserId]);

  const eligibilityInfo = React.useMemo(() => {
    if (!selectedUser) return null;
    
    // Find all ranks they qualify for (Left & Right BV >= targets)
    const qualified = ranks.filter(r => 
      (selectedUser.leftBV || 0) >= r.targetLeftBv && 
      (selectedUser.rightBV || 0) >= r.targetRightBv
    );
    
    // Sort qualified ranks by targetLeftBv descending to get the highest one
    const highestQualified = qualified.length > 0 
      ? [...qualified].sort((a, b) => b.targetLeftBv - a.targetLeftBv)[0] 
      : null;

    // Find the next rank they are close to qualifying for
    const unqualified = ranks.filter(r => 
      (selectedUser.leftBV || 0) < r.targetLeftBv || 
      (selectedUser.rightBV || 0) < r.targetRightBv
    );
    const nextTargetRank = unqualified.length > 0 
      ? [...unqualified].sort((a, b) => a.targetLeftBv - b.targetLeftBv)[0] 
      : null;

    return {
      highestQualified,
      nextTargetRank,
      currentRank: selectedUser.rank || 'Associate'
    };
  }, [selectedUser, ranks]);

  // Automatically update form fields when user selection changes
  React.useEffect(() => {
    if (selectedUser) {
      if (eligibilityInfo?.highestQualified) {
        setNewRank(eligibilityInfo.highestQualified.name);
        setNewReward(eligibilityInfo.highestQualified.reward);
      } else {
        setNewRank('Associate');
        setNewReward('None');
      }

      if (eligibilityInfo?.nextTargetRank) {
        setUpcomingRank(eligibilityInfo.nextTargetRank.name);
        setUpcomingReward(eligibilityInfo.nextTargetRank.reward);
      } else {
        setUpcomingRank('');
        setUpcomingReward('');
      }
    }
  }, [targetUserId, selectedUser, eligibilityInfo]);

  // Handle auto-populating default rewards when rank is changed manually
  const handleRankChange = (rankName) => {
    setNewRank(rankName);
    const standard = ranks.find(r => r.name === rankName);
    if (standard) {
      setNewReward(standard.reward);
    }
  };

  // Submit Award Achievement to User
  const handleAwardAchievement = async (e) => {
    e.preventDefault();
    if (!targetUserId) {
      setError('Please select a member.');
      return;
    }
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(`/api/members/${targetUserId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rank: newRank,
          reward: newReward,
          achievementDate,
          upcomingRank,
          upcomingReward
        })
      });

      const json = await res.json();
      if (res.ok) {
        setMessage(`Successfully updated achievement for ${json.data.name}!`);
        // Refresh local state list
        setUsers(users.map(u => u.userId === targetUserId ? { ...u, rank: newRank, reward: newReward, achievementDate, upcomingRank, upcomingReward } : u));
        // Reset form selections
        setTargetUserId('');
        setUpcomingRank('');
        setUpcomingReward('');
        router.refresh();
      } else {
        setError(json.error || 'Failed to update achievement.');
      }
    } catch (err) {
      setError('An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  // Save / Update dynamic Rank Setup
  const handleSaveRank = async (e) => {
    e.preventDefault();
    if (!rankForm.name.trim()) {
      setError('Rank name is required.');
      return;
    }
    setRankLoading(true);
    setMessage('');
    setError('');

    try {
      const isUpdate = !!editingRankId;
      const url = isUpdate ? `/api/ranks/${editingRankId}` : '/api/ranks';
      const method = isUpdate ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rankForm)
      });

      const json = await res.json();
      if (res.ok) {
        setMessage(`Milestone "${json.data.name}" saved successfully!`);
        if (isUpdate) {
          setRanks(ranks.map(r => r._id === editingRankId ? json.data : r));
        } else {
          setRanks([...ranks, json.data].sort((a, b) => a.targetLeftBv - b.targetLeftBv));
        }
        // Reset Setup Form
        setRankForm({
          name: '',
          reward: '',
          target: '',
          targetLeftBv: 0,
          targetRightBv: 0,
          iconName: 'Award'
        });
        setEditingRankId(null);
        router.refresh();
      } else {
        setError(json.error || 'Failed to save milestone.');
      }
    } catch (err) {
      setError('An error occurred while saving milestone.');
    } finally {
      setRankLoading(false);
    }
  };

  // Delete dynamic Rank
  const handleDeleteRank = async (rankId, rankName) => {
    if (!confirm(`Are you sure you want to delete the "${rankName}" milestone? Users with this rank will maintain it, but it will be removed from setup options.`)) {
      return;
    }
    setRankLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch(`/api/ranks/${rankId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMessage(`Milestone "${rankName}" deleted successfully!`);
        setRanks(ranks.filter(r => r._id !== rankId));
        router.refresh();
      } else {
        const json = await res.json();
        setError(json.error || 'Failed to delete milestone.');
      }
    } catch (err) {
      setError('An error occurred while deleting milestone.');
    } finally {
      setRankLoading(false);
    }
  };

  // Populate form for editing Rank
  const handleStartEditRank = (rank) => {
    setEditingRankId(rank._id);
    setRankForm({
      name: rank.name,
      reward: rank.reward,
      target: rank.target,
      targetLeftBv: rank.targetLeftBv,
      targetRightBv: rank.targetRightBv,
      iconName: rank.iconName || 'Award'
    });
  };

  // Cancel Rank Edit Mode
  const handleCancelEditRank = () => {
    setEditingRankId(null);
    setRankForm({
      name: '',
      reward: '',
      target: '',
      targetLeftBv: 0,
      targetRightBv: 0,
      iconName: 'Award'
    });
  };

  // Filter users list based on selections
  const filteredUsers = users.filter(u => {
    const matchesRank = selectedRankFilter === 'All' || u.rank === selectedRankFilter;
    const matchesSearch = searchQuery === '' || 
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.allianzaId && u.allianzaId.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRank && matchesSearch;
  });

  return (
    <div className="space-y-2">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            <span>Achievements & Prizes Registry</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-0.5">
            Award milestones, configure program ranks dynamically, and select qualifying prizes.
          </p>
        </div>

        {/* Setup Config toggle */}
        <button
          onClick={() => {
            setIsManagingRanks(!isManagingRanks);
            setMessage('');
            setError('');
          }}
          className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
        >
          <Settings size={14} className="text-amber-500" />
          <span>{isManagingRanks ? 'Hide Milestones Program Setup' : 'Manage Milestones Program'}</span>
        </button>
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

      {/* Dynamic Milestones Setup Control Panel */}
      {isManagingRanks && (
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/40 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Milestones List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Configured Milestones Program Setup
            </h3>
            
            <div className="overflow-x-auto border border-zinc-900 rounded-xl bg-zinc-950/30">
              <table className="w-full text-left border-collapse text-xs text-zinc-300">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/30 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-3">Icon & Name</th>
                    <th className="py-2.5 px-3">Left/Right BV Target</th>
                    <th className="py-2.5 px-3">Prize / Reward</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {ranks.map((rank) => (
                    <tr key={rank._id || rank.name} className="hover:bg-zinc-900/10">
                      <td className="py-2.5 px-3 flex items-center gap-2">
                        {getRankIcon(rank.iconName, "text-amber-500 shrink-0")}
                        <span className="font-bold text-zinc-200">{rank.name}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-zinc-400">
                        {rank.targetLeftBv.toLocaleString()} / {rank.targetRightBv.toLocaleString()} BV
                      </td>
                      <td className="py-2.5 px-3 text-zinc-300">{rank.reward}</td>
                      <td className="py-2.5 px-3 text-right space-x-2 shrink-0">
                        <button
                          onClick={() => handleStartEditRank(rank)}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer"
                          title="Edit Milestone"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteRank(rank._id, rank.name)}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                          title="Delete Milestone"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add / Edit Rank Form */}
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-4">
            <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider flex items-center justify-between border-b border-zinc-900 pb-2">
              <span>{editingRankId ? 'Edit Milestone' : 'Add New Milestone'}</span>
              {editingRankId && (
                <button
                  onClick={handleCancelEditRank}
                  className="text-zinc-500 hover:text-white flex items-center gap-0.5 font-normal text-[10px] uppercase"
                >
                  <X size={10} /> Cancel
                </button>
              )}
            </h4>

            <form onSubmit={handleSaveRank} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase font-semibold">Rank Name *</label>
                <input
                  type="text"
                  required
                  value={rankForm.name}
                  onChange={(e) => setRankForm({ ...rankForm, name: e.target.value })}
                  placeholder="e.g. Double Diamond"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase font-semibold">Reward / Prize *</label>
                <input
                  type="text"
                  required
                  value={rankForm.reward}
                  onChange={(e) => setRankForm({ ...rankForm, reward: e.target.value })}
                  placeholder="e.g. Phonet / Laptop / Trip"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase font-semibold">Target Description</label>
                <input
                  type="text"
                  value={rankForm.target}
                  onChange={(e) => setRankForm({ ...rankForm, target: e.target.value })}
                  placeholder="e.g. Left & Right BV > 100,000"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-semibold">Left BV Target</label>
                  <input
                    type="number"
                    value={rankForm.targetLeftBv}
                    onChange={(e) => setRankForm({ ...rankForm, targetLeftBv: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-zinc-500 uppercase font-semibold">Right BV Target</label>
                  <input
                    type="number"
                    value={rankForm.targetRightBv}
                    onChange={(e) => setRankForm({ ...rankForm, targetRightBv: parseInt(e.target.value) || 0 })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-zinc-500 uppercase font-semibold">Badge Icon</label>
                <select
                  value={rankForm.iconName}
                  onChange={(e) => setRankForm({ ...rankForm, iconName: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 px-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Star">Star Badge</option>
                  <option value="Award">Award Ribbon</option>
                  <option value="Compass">Compass</option>
                  <option value="MapPin">Map Pin</option>
                  <option value="Trophy">Trophy</option>
                  <option value="Car">Luxury Car</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={rankLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3 shadow-sm shadow-blue-500/10"
              >
                <Save size={13} strokeWidth={2.5} />
                <span>{rankLoading ? 'Saving...' : editingRankId ? 'Update Milestone' : 'Create Milestone'}</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Grid of Milestones Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {ranks.map((rank) => {
          const achieversCount = users.filter(u => u.rank === rank.name).length;
          const isSelected = selectedRankFilter === rank.name;
          const icon = getRankIcon(rank.iconName, rank.iconName === 'Trophy' ? 'text-amber-500 animate-pulse' : undefined);
          const bg = getRankBg(rank.iconName);

          return (
            <div 
              key={rank._id || rank.name}
              onClick={() => setSelectedRankFilter(isSelected ? 'All' : rank.name)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${bg} ${
                isSelected ? 'ring-2 ring-amber-500 translate-y-[-2px]' : 'hover:scale-[1.02]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  {icon}
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300">
                    {achieversCount} {achieversCount === 1 ? 'User' : 'Users'}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-zinc-100 font-heading">{rank.name}</h3>
                <p className="text-[10px] text-zinc-400 mt-1 font-medium leading-relaxed">
                  Prize: <span className="text-zinc-200 font-bold">{rank.reward}</span>
                </p>
              </div>
              <p className="text-[9px] text-zinc-500 mt-3 border-t border-zinc-900 pt-2">
                {rank.target || `L/R target: ${rank.targetLeftBv.toLocaleString()}/${rank.targetRightBv.toLocaleString()}`}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Achievers Registry Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl glass-panel border border-zinc-800 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Achievers List {selectedRankFilter !== 'All' && `(${selectedRankFilter})`}
              </h3>
              <p className="text-[10px] text-zinc-500">Showing {filteredUsers.length} members</p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                <input 
                  type="text"
                  placeholder="Search user name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 w-full sm:w-48"
                />
              </div>
              {selectedRankFilter !== 'All' && (
                <button
                  onClick={() => setSelectedRankFilter('All')}
                  className="text-xs text-amber-500 hover:underline shrink-0 font-bold"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto border border-zinc-900 rounded-xl bg-zinc-950/30">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/30 text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Member</th>
                  <th className="py-3.5 px-4">Milestone Rank</th>
                  <th className="py-3.5 px-4">Awarded Prize</th>
                  <th className="py-3.5 px-4">Achievement Date</th>
                  <th className="py-3.5 px-4">Upcoming Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-xs text-zinc-300">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      No members match the query or filter.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.userId} className="hover:bg-zinc-900/20">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img 
                          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} 
                          alt={user.name} 
                          className="w-8 h-8 rounded-full border border-zinc-800 object-cover shrink-0" 
                        />
                        <div>
                          <p className="font-bold text-zinc-200">{user.name}</p>
                          <p className="text-[10px] text-zinc-500 font-mono">{user.userId}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wide">
                          {user.rank || 'Associate'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-zinc-200">
                        {user.reward || 'None'}
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {user.achievementDate ? new Date(user.achievementDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {user.upcomingRank ? (
                          <div>
                            <span className="text-[10px] text-zinc-400 font-semibold">{user.upcomingRank}</span>
                            <p className="text-[9px] text-zinc-500 truncate max-w-[120px]" title={user.upcomingReward}>
                              Prize: {user.upcomingReward}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-500 italic">None set</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Panel: Award Achievements to Members */}
        <div className="p-6 rounded-2xl glass-panel border border-zinc-800 space-y-5 h-fit">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
              <Gift size={16} className="text-amber-500" />
              <span>Update Achievement Status</span>
            </h3>
            <p className="text-[10px] text-zinc-500 mt-1">Select a member to modify their leadership rank, qualifying awards, and upcoming targets.</p>
          </div>

          <form onSubmit={handleAwardAchievement} className="space-y-4">
            {/* Member Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold">Select Member</label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              >
                <option value="">-- Choose Member --</option>
                {users
                  .filter(u => u.role !== 'super_admin')
                  .map(u => (
                    <option key={u.userId} value={u.userId}>
                      {u.name} ({u.userId} - {u.rank})
                    </option>
                  ))
                }
              </select>

              {/* Dynamic Eligibility Calculator Details */}
              {eligibilityInfo && selectedUser && (
                <div className="p-3.5 rounded-xl border border-zinc-850 bg-zinc-950/60 text-xs space-y-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Current BV Balance:</span>
                    <span className="font-mono text-zinc-300 font-semibold">
                      L: {selectedUser.leftBV.toLocaleString()} / R: {selectedUser.rightBV.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Current Saved Rank:</span>
                    <span className="font-bold text-amber-500">{eligibilityInfo.currentRank}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Calculated Eligible Rank:</span>
                    <span className="font-bold text-emerald-400">{eligibilityInfo.highestQualified?.name || 'Associate'}</span>
                  </div>
                  
                  {eligibilityInfo.highestQualified && eligibilityInfo.highestQualified.name !== eligibilityInfo.currentRank ? (
                    <div className="pt-2 border-t border-zinc-900 mt-2 flex items-center justify-between text-[10px] text-emerald-400 bg-emerald-500/5 p-2 rounded border border-emerald-500/10 animate-pulse">
                      <span className="font-bold">Upgrade Eligible! 🎉</span>
                      <span>Auto-selected in form</span>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-zinc-900 mt-2 text-[9px] text-zinc-500">
                      BV matches current rank level.
                    </div>
                  )}

                  {eligibilityInfo.nextTargetRank && (
                    <div className="text-[10px] text-zinc-400 pt-2 border-t border-zinc-900 mt-1 space-y-1">
                      <div className="flex justify-between">
                        <span>Next Milestone:</span>
                        <strong className="text-amber-500">{eligibilityInfo.nextTargetRank.name}</strong>
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-normal">
                        Needs: L: {Math.max(0, eligibilityInfo.nextTargetRank.targetLeftBv - selectedUser.leftBV).toLocaleString()} BV, R: {Math.max(0, eligibilityInfo.nextTargetRank.targetRightBv - selectedUser.rightBV).toLocaleString()} BV more.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Achievement Rank (Populated from dynamic ranks) */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold">Achievement Rank</label>
              <select
                value={newRank}
                onChange={(e) => handleRankChange(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              >
                {ranks.map(r => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Reward / Prize */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold">Awarded Prize / Reward</label>
              <input
                type="text"
                value={newReward}
                onChange={(e) => setNewReward(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                placeholder="e.g. Goa Trip"
                required
              />
            </div>

            {/* Achievement Date */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold">Achievement Date</label>
              <input
                type="date"
                value={achievementDate}
                onChange={(e) => setAchievementDate(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Upcoming Targets Expansion */}
            <div className="border-t border-zinc-900 pt-3 space-y-4">
              <p className="text-[10px] text-zinc-400 font-bold uppercase">Next Milestone Targets (Optional)</p>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-500 uppercase font-semibold">Upcoming Rank</label>
                  <select
                    value={upcomingRank}
                    onChange={(e) => setUpcomingRank(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- None --</option>
                    {ranks.map(r => (
                      <option key={r.name} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] text-zinc-500 uppercase font-semibold">Upcoming Reward</label>
                  <input
                    type="text"
                    value={upcomingReward}
                    onChange={(e) => setUpcomingReward(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    placeholder="Upcoming Prize"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Submitting...' : 'Save Achievement'}</span>
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
