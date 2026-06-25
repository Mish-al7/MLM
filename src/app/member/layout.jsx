import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Sidebar from '@/components/layout/Sidebar';

export default async function MemberLayout({ children }) {
  const session = await getSessionUser();

  if (!session || session.role !== 'member') {
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 bg-white text-zinc-900">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
