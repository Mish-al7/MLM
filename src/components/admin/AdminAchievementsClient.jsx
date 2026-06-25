'use client';

import React, { useState } from 'react';
import { 
  Trophy, Award, Gift, Calendar as CalendarIcon, Users, 
  Search, Plus, CheckCircle, ArrowRight, RefreshCw, Star, 
  MapPin, Compass, Car, ShieldAlert 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const STANDARD_RANKS = [
  { name: 'Associate', reward: 'None', target: 'Default onboarding level', icon: <Star className="text-zinc-400" size={24} />, bg: 'bg-zinc-950/40 border-zinc-800 text-zinc-400' },
  { name: 'Silver', reward: 'Leadership Pin', target: 'Left & Right BV > 5,000', icon: <Award className="text-slate-300" size={24} />, bg: 'bg-slate-500/10 border-slate-500/30 text-slate-300' },
  { name: 'Gold', reward: 'Phuket Trip', target: 'Left & Right BV > 25,000', icon: <Compass className="text-yellow-500" size={24} />, bg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' },
  { name: 'Platinum', reward: 'Goa Trip', target: 'Left & Right BV > 50,000', icon: <MapPin className="text-cyan-400" size={24} />, bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' },
  { name: 'Diamond', reward: 'Bali Leadership Retreat', target: 'Left & Right BV > 80,000', icon: <Trophy className="text-amber-500 animate-pulse" size={24} />, bg: 'bg-amber-500/10 border-amber-500/30 text-amber-500' },
  { name: 'Crown', reward: 'Lexus ES', target: 'Left & Right BV > 150,000', icon: <Car className="text-purple-400" size={24} />, bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400' }
];

export default function AdminAchievementsClient({ initialUsers, currentUser }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers || []);
  const [selectedRankFilter, setSelectedRankFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Award Form State
  const [targetUserId, setTargetUserId] = useState('');
  const [newRank, setNewRank] = useState('Silver');
  const [newReward, setNewReward] = useState('Leadership Pin');
  const [achievementDate, setAchievementDate] = useState(new Date().toISOString().split('T')[0]);
  const [upcomingRank, setUpcomingRank] = useState('');
  const [upcomingReward, setUpcomingReward] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Handle auto-populating default rewards when rank is changed
  const handleRankChange = (rankName) => {
    setNewRank(rankName);
    const standard = STANDARD_RANKS.find(r => r.name === rankName);
    if (standard) {
      setNewReward(standard.reward);
    }
  };

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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading flex items-center gap-2">
            <Trophy className="text-amber-500" />
            <span>Achievements & Prizes Registry</span>
          </h1>
          <p className="text-zinc-400 text-xs mt-1">
            Award milestones, monitor user rank accomplishments, and select qualifying prizes.
          </p>
        </div>
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

      {/* Grid of Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STANDARD_RANKS.map((rank) => {
          const achieversCount = users.filter(u => u.rank === rank.name).length;
          const isSelected = selectedRankFilter === rank.name;

          return (
            <div 
              key={rank.name}
              onClick={() => setSelectedRankFilter(isSelected ? 'All' : rank.name)}
              className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${rank.bg} ${
                isSelected ? 'ring-2 ring-amber-500 translate-y-[-2px]' : 'hover:scale-[1.02]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  {rank.icon}
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-300">
                    {achieversCount} {achieversCount === 1 ? 'User' : 'Users'}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-zinc-100 font-heading">{rank.name}</h3>
                <p className="text-[10px] text-zinc-400 mt-1 font-medium leading-relaxed">
                  Prize: <span className="text-zinc-200 font-bold">{rank.reward}</span>
                </p>
              </div>
              <p className="text-[9px] text-zinc-500 mt-3 border-t border-zinc-900 pt-2">{rank.target}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Achievers Registry */}
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
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          user.rank === 'Crown' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          user.rank === 'Diamond' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          user.rank === 'Platinum' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                          user.rank === 'Gold' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                          user.rank === 'Silver' ? 'bg-slate-500/10 text-slate-300 border border-slate-500/20' :
                          'bg-zinc-950/40 text-zinc-400 border border-zinc-900'
                        }`}>
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

        {/* Action Panel: Award Achievements */}
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
            </div>

            {/* Achievement Rank */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase font-semibold">Achievement Rank</label>
              <select
                value={newRank}
                onChange={(e) => handleRankChange(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                required
              >
                {STANDARD_RANKS.map(r => (
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
                    {STANDARD_RANKS.map(r => (
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
              className="w-full bg-amber-500 hover:bg-amber-600 text-black py-2.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Submitting...' : 'Save Achievement'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
