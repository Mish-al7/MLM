import React from 'react';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminCareFundClient from '@/components/admin/AdminCareFundClient';

export const metadata = {
  title: 'Care Fund Admin — Allianza',
  description: 'Manage Care Fund causes and view all member contributions.',
};

export default async function AdminCareFundPage() {
  const session = await getSessionUser();
  if (!session || session.role !== 'super_admin') redirect('/');

  return <AdminCareFundClient />;
}
