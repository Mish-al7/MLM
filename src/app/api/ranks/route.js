import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Rank from '@/models/Rank';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
  try {
    await dbConnect();
    const ranks = await Rank.find({}).sort({ targetLeftBv: 1 }).lean();
    return NextResponse.json({ success: true, data: ranks });
  } catch (error) {
    console.error('Error fetching ranks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, reward, target, targetLeftBv, targetRightBv, iconName } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Rank name is required' }, { status: 400 });
    }

    // Check if rank already exists (case-insensitive or exact)
    const existing = await Rank.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) {
      existing.reward = reward || existing.reward;
      existing.target = target || existing.target;
      existing.targetLeftBv = targetLeftBv !== undefined ? Number(targetLeftBv) : existing.targetLeftBv;
      existing.targetRightBv = targetRightBv !== undefined ? Number(targetRightBv) : existing.targetRightBv;
      existing.iconName = iconName || existing.iconName;
      await existing.save();
      return NextResponse.json({ success: true, data: existing });
    }

    const newRank = new Rank({
      name,
      reward: reward || 'None',
      target: target || '',
      targetLeftBv: Number(targetLeftBv) || 0,
      targetRightBv: Number(targetRightBv) || 0,
      iconName: iconName || 'Award'
    });

    await newRank.save();
    return NextResponse.json({ success: true, data: newRank });
  } catch (error) {
    console.error('Error creating/updating rank:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
