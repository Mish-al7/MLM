import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Event from '@/models/Event';


// Let's fallback to fetch API or just simple Mongoose queries.
import { Award, TrendingUp, Volume2, Calendar as CalendarIcon } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  
  const user = await User.findOne({ userId: session.userId }).lean();
  const membersCount = await User.countDocuments();
  const eventsCount = await Event.countDocuments();
  
  // Note: Since we are splitting, we might just create Client Components that fetch data, 
  // or use Server Components. Let's use Server Components for data fetching.

  return (
    <div className="space-y-8">
      {/* Top Greeting Welcome Card */}
      <div className="p-6 rounded-2xl glass-panel relative overflow-hidden border border-zinc-800/80">
        <div className="relative z-10">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-widest">
            Super Admin Overview
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1 font-heading">
            Good evening, {user.name.split(' ')[0]}.
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Your ranks. Your milestones. Your organization metrics at a glance.</p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <Award size={150} className="text-amber-500" />
        </div>
      </div>

      {/* Stats KPI Block */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-panel p-4 rounded-xl text-center border border-zinc-800">
          <p className="text-xs text-zinc-500 font-semibold uppercase">Total Team Size</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{membersCount}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center border border-zinc-800">
          <p className="text-xs text-zinc-500 font-semibold uppercase">My Direct Referrals</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">0</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center border border-zinc-800">
          <p className="text-xs text-zinc-500 font-semibold uppercase">Upcoming Programs</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">{eventsCount}</p>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center border border-zinc-800">
          <p className="text-xs text-zinc-500 font-semibold uppercase">Updates Published</p>
          <p className="text-2xl font-bold text-zinc-100 mt-1">0</p>
        </div>
      </div>
      
      {/* Rest of the Admin Dashboard features can be added here or via Client Components */}
      <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
        Select a module from the sidebar to manage team, events, news, and more.
      </div>
    </div>
  );
}
