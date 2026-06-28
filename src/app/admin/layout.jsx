import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Sidebar from '@/components/layout/Sidebar';

export default async function AdminLayout({ children }) {
  const session = await getSessionUser();

  if (!session || session.role !== 'super_admin') {
    redirect('/');
  }

  await dbConnect();
  const user = await User.findOne({ userId: session.userId }).lean();

  if (!user) {
    redirect('/');
  }

  // Convert ObjectIds to strings recursively to pass to client component safely
  const safeUser = JSON.parse(JSON.stringify(user));

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white font-sans">
      <Sidebar user={safeUser} />
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative md:z-10 bg-white text-zinc-900">
        <div className="flex-1 overflow-y-auto pt-18 pb-20 md:p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
