import React from 'react';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import News from '@/models/News';
import AdminNewsClient from '@/components/admin/AdminNewsClient';

export default async function AdminNewsPage() {
  const session = await getSessionUser();
  if (!session) return null;

  await dbConnect();
  const news = await News.find({}).sort({ pinned: -1, createdAt: -1 }).lean();
  
  // Serialize ObjectIds
  const safeNews = news.map(n => ({
    ...n,
    _id: n._id.toString(),
    createdAt: n.createdAt.toISOString()
  }));

  return <AdminNewsClient initialNews={safeNews} />;
}
