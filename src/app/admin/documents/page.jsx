import React from 'react';
import { getSessionUser } from '@/lib/auth';
import PageHeader from '@/components/shared/PageHeader';
import DocumentsClient from '@/components/shared/DocumentsClient';

export default async function AdminDocumentsPage() {
  const session = await getSessionUser();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Documents"
        subtitle="Manage knowledge sharing materials and training presentations."
      />

      <DocumentsClient isAdmin={true} />
    </div>
  );
}
