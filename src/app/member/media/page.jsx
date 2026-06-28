import React from 'react';
import { getSessionUser } from '@/lib/auth';
import PageHeader from '@/components/shared/PageHeader';
import MediaClient from '@/components/shared/MediaClient';

export default async function MemberMediaPage() {
  const session = await getSessionUser();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Gallery"
        subtitle="Photos and videos from recent events."
      />

      <MediaClient isAdmin={false} />
    </div>
  );
}
