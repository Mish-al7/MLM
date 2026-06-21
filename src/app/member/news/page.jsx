import React from 'react';
import { Volume2 } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import News from '@/models/News';

export default async function MemberNewsPage() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  // Fetch active news
  const newsList = await News.find({ archived: false }).sort({ pinned: -1, createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading">News Center</h1>
        <p className="text-zinc-400 text-xs mt-1">Read the latest announcements and organizational updates.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {newsList.map(item => (
          <div key={item._id.toString()} className="p-6 rounded-xl glass-panel border border-zinc-800 relative">
            {item.pinned && (
              <span className="absolute top-4 right-4 text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded font-bold uppercase tracking-wider">
                Pinned
              </span>
            )}
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-zinc-400 mb-4 whitespace-pre-wrap">{item.content}</p>
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span>By {item.author}</span>
              <span>•</span>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}

        {newsList.length === 0 && (
          <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl glass-panel">
            <Volume2 size={40} className="mx-auto mb-4 text-zinc-700" />
            <p>No news highlights published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
