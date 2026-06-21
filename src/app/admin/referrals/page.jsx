import React from 'react';
import { UserPlus } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';

export default async function AdminReferralsPage() {
  const session = await getSessionUser();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white font-heading">Referral Team</h1>
        <p className="text-zinc-400 text-xs mt-1">Manage members directly referred by you.</p>
      </div>

      <div className="p-8 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl glass-panel">
        <UserPlus size={40} className="mx-auto mb-4 text-zinc-700" />
        <p>No referrals found.</p>
      </div>
    </div>
  );
}
