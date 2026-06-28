import React from 'react';
import { getSessionUser } from '@/lib/auth';
import PageHeader from '@/components/shared/PageHeader';
import MediaClient from '@/components/shared/MediaClient';

export default async function AdminMediaPage() {
  const session = await getSessionUser();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Gallery"
        subtitle="Manage photos and videos from recent events."
      />

      <MediaClient isAdmin={true} />
    </div>
  );
}
