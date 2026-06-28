import React from 'react';
import { getSessionUser } from '@/lib/auth';
import BOPClient from '@/components/shared/BOPClient';

export default async function AdminBOPPage() {
  const session = await getSessionUser();
  if (!session) return null;

  return <BOPClient isAdmin={true} />;
}
