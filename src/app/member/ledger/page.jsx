import React from 'react';
import LedgerClient from '@/components/shared/LedgerClient';
import { getSessionUser } from '@/lib/auth';

export const metadata = {
  title: 'Member Personal Ledger - Allianza',
  description: 'Manage personal financial records, track income and expense entries.'
};

export default async function MemberLedgerPage() {
  const session = await getSessionUser();
  if (!session) return null;

  return <LedgerClient />;
}
