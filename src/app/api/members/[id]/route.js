import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // id represents the userId (e.g. TEZ-0001)

    const user = await User.findOne({ userId: id }).lean();
    if (!user) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Attach reporting manager name if exists
    if (user.managerId) {
      const manager = await User.findOne({ userId: user.managerId }).select('name');
      user.managerName = manager ? manager.name : 'None';
    } else {
      user.managerName = 'None';
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching member profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params; // userId of target user
    const body = await req.json();

    // Fetch target user from DB
    const targetUser = await User.findOne({ userId: id });
    if (!targetUser) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const isSelf = currentUser.userId === id;
    const isAdmin = currentUser.role === 'super_admin';

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own values or you must be Super Admin.' }, { status: 403 });
    }

    if (isAdmin) {
      // Super Admin edit flow (can edit anything)
      const {
        name, email, phone, tezId, managerId, status, role,
        leftBV, rightBV, rank, reward, upcomingRank, upcomingReward,
        achievementDate, personalNotes
      } = body;

      // Handle Manager update checks
      if (managerId && managerId !== targetUser.managerId) {
        if (managerId === targetUser.userId) {
          return NextResponse.json({ error: 'A member cannot report to themselves' }, { status: 400 });
        }
        const managerExists = await User.findOne({ userId: managerId });
        if (!managerExists) {
          return NextResponse.json({ error: `Reporting manager with ID ${managerId} not found` }, { status: 400 });
        }
        targetUser.managerId = managerId;
      } else if (managerId === '') {
        targetUser.managerId = null;
      }

      // Check Email unique constraint if email is changed
      if (email && email.toLowerCase() !== targetUser.email) {
        const emailExists = await User.findOne({ email: email.toLowerCase() });
        if (emailExists) {
          return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
        }
        targetUser.email = email.toLowerCase();
      }

      // Business Values change tracking
      const newLeft = leftBV !== undefined ? Number(leftBV) : targetUser.leftBV;
      const newRight = rightBV !== undefined ? Number(rightBV) : targetUser.rightBV;

      if (newLeft !== targetUser.leftBV || newRight !== targetUser.rightBV) {
        targetUser.bvHistory.push({
          oldLeft: targetUser.leftBV,
          newLeft: newLeft,
          oldRight: targetUser.rightBV,
          newRight: newRight,
          updatedBy: currentUser.userId,
          timestamp: new Date()
        });
        targetUser.leftBV = newLeft;
        targetUser.rightBV = newRight;
      }

      // Rank & Reward change tracking
      const newRank = rank || targetUser.rank;
      const newReward = reward !== undefined ? reward : targetUser.reward;

      if (newRank !== targetUser.rank || newReward !== targetUser.reward) {
        targetUser.rankHistory.push({
          oldRank: targetUser.rank,
          newRank: newRank,
          reward: newReward,
          achievementDate: achievementDate ? new Date(achievementDate) : new Date(),
          updatedBy: currentUser.userId,
          timestamp: new Date()
        });
        targetUser.rank = newRank;
        targetUser.reward = newReward;
      }

      // Standard fields updates
      if (name) targetUser.name = name;
      if (phone !== undefined) targetUser.phone = phone;
      if (tezId !== undefined) targetUser.tezId = tezId;
      if (status) targetUser.status = status;
      if (role) targetUser.role = role;
      if (upcomingRank !== undefined) targetUser.upcomingRank = upcomingRank;
      if (upcomingReward !== undefined) targetUser.upcomingReward = upcomingReward;
      if (achievementDate !== undefined) targetUser.achievementDate = achievementDate ? new Date(achievementDate) : null;
      if (personalNotes !== undefined) targetUser.personalNotes = personalNotes;

      await targetUser.save();
      return NextResponse.json({ success: true, data: targetUser });

    } else {
      // Member edit flow (can ONLY edit leftBV and rightBV)
      const { leftBV, rightBV } = body;

      if (leftBV === undefined && rightBV === undefined) {
        return NextResponse.json({ error: 'You are only authorized to update Left or Right Business Values.' }, { status: 400 });
      }

      const newLeft = leftBV !== undefined ? Number(leftBV) : targetUser.leftBV;
      const newRight = rightBV !== undefined ? Number(rightBV) : targetUser.rightBV;

      if (newLeft !== targetUser.leftBV || newRight !== targetUser.rightBV) {
        targetUser.bvHistory.push({
          oldLeft: targetUser.leftBV,
          newLeft: newLeft,
          oldRight: targetUser.rightBV,
          newRight: newRight,
          updatedBy: currentUser.userId,
          timestamp: new Date()
        });
        targetUser.leftBV = newLeft;
        targetUser.rightBV = newRight;
      }

      await targetUser.save();
      return NextResponse.json({ success: true, data: targetUser });
    }
  } catch (error) {
    console.error('Error updating member profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
