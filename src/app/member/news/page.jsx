import React from 'react';
import { Volume2, Pin, User, Clock } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import News from '@/models/News';
import PageHeader from '@/components/shared/PageHeader';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  if (days < 7)  return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function MemberNewsPage() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  const newsList = await News.find({ archived: false }).sort({ pinned: -1, createdAt: -1 }).lean();

  return (
    <div className="space-y-6">
      <PageHeader
        title="News Center"
        subtitle="Read the latest announcements and organizational updates."
      />

      {newsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <Volume2 size={24} strokeWidth={1.5} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No news highlights published yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {newsList.map(item => (
            <article
              key={item._id.toString()}
              className={`relative bg-white rounded-2xl border shadow-[0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] ${
                item.pinned ? 'border-blue-100' : 'border-slate-100'
              }`}
            >
              {item.pinned && (
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />
              )}

              <div className="p-6">
                {/* Meta row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  {item.pinned && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                      <Pin size={9} strokeWidth={2.5} />
                      Pinned
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <User size={11} strokeWidth={1.75} />
                    {item.author}
                  </span>
                  <span className="text-slate-200">·</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock size={11} strokeWidth={1.75} />
                    {timeAgo(item.createdAt.toString())}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-base font-bold text-slate-800 mb-2 leading-snug">{item.title}</h2>

                {/* Content */}
                <div
                  className="text-sm text-slate-500 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-p:text-slate-500"
                  dangerouslySetInnerHTML={{ __html: item.content }}
                />

                {/* Banner image */}
                {item.image && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full max-h-64 object-cover"
                    />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
