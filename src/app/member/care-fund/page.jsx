import React from 'react';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MemberCareFundClient from '@/components/member/MemberCareFundClient';

export const metadata = {
  title: 'Care Fund — Allianza',
  description: 'Contribute to the team care fund and support members through personal emergencies.',
};

export default async function MemberCareFundPage() {
  const session = await getSessionUser();
  if (!session) redirect('/');

  return <MemberCareFundClient currentUserId={session.userId} />;
}
