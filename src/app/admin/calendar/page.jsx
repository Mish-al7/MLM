import React from 'react';
import { getSessionUser } from '@/lib/auth';
import CalendarView from '@/components/shared/CalendarView';

export default async function AdminCalendarPage() {
  const session = await getSessionUser();
  if (!session) return null;

  return <CalendarView isAdmin={true} />;
}
