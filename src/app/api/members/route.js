import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getSessionUser, hashPassword } from '@/lib/auth';

// Helper to map rank names to numerical weights for sorting
const rankWeights = {
  'Associate': 1,
  'Silver': 2,
  'Gold': 3,
  'Platinum': 4,
  'Diamond': 5,
  'Crown': 6
};

export async function GET(req) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const sortBy = searchParams.get('sortBy') || ''; // 'bv' | 'rank'
    const status = searchParams.get('status') || ''; // 'active' | 'inactive' | 'archived'

    let filter = {};

    // Apply search query (Name, User ID, Allianza ID, Phone, Email)
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { userId: { $regex: query, $options: 'i' } },
        { allianzaId: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ];
    }

    // Apply status filter
    if (status) {
      filter.status = status;
    }

    let members = await User.find(filter).lean();

    // Map manager names if available
    const memberMap = new Map(members.map(m => [m.userId, m]));
    members = members.map(m => {
      if (m.managerId && memberMap.has(m.managerId)) {
        m.managerName = memberMap.get(m.managerId).name;
      } else {
        m.managerName = m.managerId ? m.managerId : 'None';
      }
      return m;
    });

    // Custom sorting logic
    if (sortBy === 'bv') {
      // Sort by combined Left + Right BV descending
      members.sort((a, b) => (b.leftBV + b.rightBV) - (a.leftBV + a.rightBV));
    } else if (sortBy === 'rank') {
      // Sort by rank weight descending
      members.sort((a, b) => {
        const weightA = rankWeights[a.rank] || 0;
        const weightB = rankWeights[b.rank] || 0;
        return weightB - weightA;
      });
    } else {
      // Default: sort by joining date descending
      members.sort((a, b) => new Date(b.joiningDate) - new Date(a.joiningDate));
    }

    return NextResponse.json({ success: true, data: members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = currentUser.role === 'super_admin';
    const body = await req.json();
    const { name, email, dob, phone, allianzaId, joiningDate, password } = body;

    // Members can only add under themselves; admins can pick any managerId/role/status
    const managerId = isAdmin ? (body.managerId || null) : currentUser.userId;
    const role = isAdmin ? (body.role || 'member') : 'member';
    const status = isAdmin ? (body.status || 'active') : 'active';

    if (!name || !email || !dob || !allianzaId) {
      return NextResponse.json({ error: 'Name, email, date of birth (DOB), and Tez ID are required' }, { status: 400 });
    }

    // Check if email already registered
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Use the user-inputted Tez ID as the primary unique userId key
    const targetUserId = allianzaId.trim().toUpperCase();
    const duplicateId = await User.findOne({ userId: targetUserId });
    if (duplicateId) {
      return NextResponse.json({ error: `Tez ID "${targetUserId}" is already taken` }, { status: 400 });
    }

    // Verify manager exists if specified
    if (managerId) {
      const managerExists = await User.findOne({ userId: managerId });
      if (!managerExists) {
        return NextResponse.json({ error: `Reporting manager with User ID ${managerId} not found` }, { status: 400 });
      }
    }

    const newUser = new User({
      userId: targetUserId,
      name,
      email: email.toLowerCase(),
      dob: new Date(dob),
      phone: phone || '',
      allianzaId: targetUserId,
      managerId: managerId || null,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      role,
      status,
      password: password ? hashPassword(password) : hashPassword('password123')
    });

    await newUser.save();
    return NextResponse.json({ success: true, data: newUser });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
