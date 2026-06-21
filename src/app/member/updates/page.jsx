import React from 'react';
import { Bell } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Update from '@/models/Update';

export default async function MemberUpdatesPage() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  // Fetch active updates
  const updatesList = await Update.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading">Quick Announcements</h1>
        <p className="text-zinc-400 text-xs mt-1">Important notices and reminders.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {updatesList.map(item => (
          <div key={item._id.toString()} className="p-4 rounded-xl glass-panel border border-zinc-800 flex items-start gap-4">
            <div className="p-3 bg-zinc-900 rounded-lg">
              <Bell className="text-amber-500" size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {item.type}
                </span>
                <span className="text-xs text-zinc-500">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-zinc-200 mt-2">{item.content}</p>
            </div>
          </div>
        ))}

        {updatesList.length === 0 && (
          <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl glass-panel">
            <Bell size={40} className="mx-auto mb-4 text-zinc-700" />
            <p>No announcements right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
