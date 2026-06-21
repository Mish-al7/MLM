import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';

export default async function AdminMediaPage() {
  const session = await getSessionUser();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading">Media Gallery</h1>
        <p className="text-zinc-400 text-xs mt-1">Manage photos and videos from recent events.</p>
      </div>

      <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl glass-panel">
        <ImageIcon size={40} className="mx-auto mb-4 text-zinc-700" />
        <p>Gallery is empty.</p>
      </div>
    </div>
  );
}
