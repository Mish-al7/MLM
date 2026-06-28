import React from 'react';
import { getSessionUser } from '@/lib/auth';
import RoyalKingsClubClient from '@/components/shared/RoyalKingsClubClient';

export const metadata = {
  title: 'Royal Kings Club | Allianza Leadership Platform',
  description: 'Explore the Royal Kings Club top-performer membership directory.',
};

export default async function MemberRoyalKingsClubPage() {
  const session = await getSessionUser();
  if (!session) return null;

  return <RoyalKingsClubClient isAdmin={false} />;
}
