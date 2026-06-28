import React from 'react';
import { getSessionUser } from '@/lib/auth';
import AdminBannersClient from '@/components/admin/AdminBannersClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard Banners | Admin Panel',
  description: 'Manage Member Dashboard promotional banners.'
};

export default async function AdminBannersPage() {
  const session = await getSessionUser();
  if (!session || session.role !== 'super_admin') {
    redirect('/');
  }

  return <AdminBannersClient />;
}
