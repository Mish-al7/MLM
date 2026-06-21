import React from 'react';
import { UserIcon } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';

export default async function AdminProfilePage() {
  const session = await getSessionUser();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading">My Profile Detail</h1>
        <p className="text-zinc-400 text-xs mt-1">View your personal information and account status.</p>
      </div>

      <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl glass-panel">
        <UserIcon size={40} className="mx-auto mb-4 text-zinc-700" />
        <p>Admin profile details go here.</p>
      </div>
    </div>
  );
}
