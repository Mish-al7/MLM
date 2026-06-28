import React from 'react';
import { FileText } from 'lucide-react';
import { getSessionUser } from '@/lib/auth';
import PageHeader from '@/components/shared/PageHeader';

export default async function MemberDocumentsPage() {
  const session = await getSessionUser();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Documents"
        subtitle="Access knowledge sharing materials and training presentations."
      />

      <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl bg-slate-50">
        <FileText size={40} className="mx-auto mb-4 text-slate-300" />
        <p className="text-sm font-semibold">No documents available right now</p>
      </div>
    </div>
  );
}
