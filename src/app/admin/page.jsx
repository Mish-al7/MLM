import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Event from '@/models/Event';

import { Award, TrendingUp, Volume2, Calendar as CalendarIcon, Cake, Phone } from 'lucide-react';

export default async function AdminDashboard() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  
  const user = await User.findOne({ userId: session.userId }).lean();
  const membersCount = await User.countDocuments();
  const eventsCount = await Event.countDocuments();
  const allUsers = await User.find({}).lean();
  
  // Get current date/time in India (IST, UTC+5:30) for accurate birthday checks
  const localTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
  const today = new Date(localTimeStr);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const tomorrowMonth = tomorrow.getMonth();
  const tomorrowDate = tomorrow.getDate();

  const todayBirthdays = [];
  const tomorrowBirthdays = [];

  for (const u of allUsers) {
    if (!u.dob || u.userId === session.userId) continue;
    const dob = new Date(u.dob);
    const m = dob.getUTCMonth();
    const d = dob.getUTCDate();
    
    if (m === todayMonth && d === todayDate) {
      todayBirthdays.push(u);
    } else if (m === tomorrowMonth && d === tomorrowDate) {
      tomorrowBirthdays.push(u);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Greeting Welcome Card */}
      <div className="p-6 rounded-2xl glass-panel relative overflow-hidden border border-zinc-800/80">
        <div className="relative z-10">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-widest">
            Super Admin Overview
          </span>
          <h1 className="text-3xl font-extrabold text-zinc-100 mt-1 font-heading">
            Good evening, {user.name.split(' ')[0]}.
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Your ranks. Your milestones. Your organization metrics at a glance.</p>
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
          <Award size={150} className="text-amber-500" />
        </div>
      </div>

      {/* Birthday Alerts / Notifications Banner */}
      {(todayBirthdays.length > 0 || tomorrowBirthdays.length > 0) && (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-2">
            <Cake className="text-amber-500 animate-pulse" size={16} />
            <span>Birthday Reminders</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayBirthdays.map((member) => (
              <div 
                key={member.userId} 
                className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                    <Cake size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Today
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">{member.userId}</span>
                    </div>
                    <h4 className="text-base font-bold text-zinc-900 mt-1">
                      {member.name}'s Birthday! 🎉
                    </h4>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      ഇന്ന് {member.name}-ന്റെ ജന്മദിനമാണ്. ആശംസകൾ അറിയിക്കൂ!
                    </p>
                  </div>
                </div>
                {member.phone && (
                  <a
                    href={`tel:${member.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-black px-4 py-2.5 rounded-xl font-extrabold text-xs transition-colors shadow-sm cursor-pointer shrink-0"
                  >
                    <Phone size={13} />
                    <span>Call Now</span>
                  </a>
                )}
              </div>
            ))}
            
            {tomorrowBirthdays.map((member) => (
              <div 
                key={member.userId} 
                className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    <Cake size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Tomorrow
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">{member.userId}</span>
                    </div>
                    <h4 className="text-base font-bold text-zinc-900 mt-1">
                      {member.name}'s Birthday Tomorrow! 🎂
                    </h4>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      നാളെ {member.name}-ന്റെ ജന്മദിനമാണ്. ഒരു കോളിനായി തയ്യാറെടുക്കൂ!
                    </p>
                  </div>
                </div>
                {member.phone && (
                  <a
                    href={`tel:${member.phone.replace(/\s+/g, '')}`}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-extrabold text-xs transition-colors shadow-sm cursor-pointer shrink-0"
                  >
                    <Phone size={13} />
                    <span>Call Now</span>
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

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
