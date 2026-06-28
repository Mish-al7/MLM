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
        <h1 className="text-xl font-bold text-[#001B3A] font-heading uppercase tracking-wider">Quick Announcements</h1>
        <p className="text-slate-500 text-xs mt-1">Important notices and reminders.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {updatesList.map(item => (
          <div key={item._id.toString()} className="p-5 rounded-2xl bg-white border border-slate-100 flex items-start gap-4 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <div className="p-3 bg-amber-50 rounded-xl">
              <Bell className="text-amber-600" size={20} />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  {item.type}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-slate-750 mt-2 font-medium text-slate-700">{item.content}</p>
            </div>
          </div>
        ))}

        {updatesList.length === 0 && (
          <div className="p-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <Bell size={40} className="mx-auto mb-4 text-slate-300" />
            <p className="text-sm">No announcements right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
