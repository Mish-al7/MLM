import React from 'react';
import { getSessionUser } from '@/lib/auth';
import RoyalKingsClubClient from '@/components/shared/RoyalKingsClubClient';

export const metadata = {
  title: 'Royal Kings Club | Allianza Leadership Platform',
  description: 'Manage the Royal Kings Club top-performer directory and hero banner.',
};

export default async function AdminRoyalKingsClubPage() {
  const session = await getSessionUser();
  if (!session) return null;

  return <RoyalKingsClubClient isAdmin={true} />;
}
