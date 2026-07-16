import Rank from '@/models/Rank';

/**
 * Evaluates a user's BV against all configured rank milestones and
 * automatically upgrades their rank if they qualify for a higher one.
 * 
 * IMPORTANT: This function only UPGRADES, never downgrades.
 * If a user's BV drops below their current rank, they keep it.
 * 
 * @param {Object} user - Mongoose User document (mutable, not .lean())
 * @param {string} updaterUserId - userId of who triggered the change (or 'SYSTEM')
 * @returns {{ upgraded: boolean, newRank: string, previousRank: string, nextTarget: object|null }}
 */
export async function evaluateAndUpdateRank(user, updaterUserId = 'SYSTEM') {
  const ranks = await Rank.find({}).sort({ targetLeftBv: 1 }).lean();

  if (!ranks || ranks.length === 0) {
    return { upgraded: false, newRank: user.rank, previousRank: user.rank, nextTarget: null };
  }

  const leftBV = user.leftBV || 0;
  const rightBV = user.rightBV || 0;

  // Find all ranks the user qualifies for
  const qualified = ranks.filter(r =>
    leftBV >= r.targetLeftBv && rightBV >= r.targetRightBv
  );

  // Highest qualified rank (sorted by targetLeftBv, so last one is highest)
  const highestQualified = qualified.length > 0
    ? qualified[qualified.length - 1]
    : null;

  // Find the current rank's position in the sorted list to prevent downgrade
  const currentRankIdx = ranks.findIndex(r => r.name === user.rank);
  const qualifiedRankIdx = highestQualified
    ? ranks.findIndex(r => r.name === highestQualified.name)
    : -1;

  const previousRank = user.rank || 'Associate';
  let upgraded = false;

  // Only upgrade: qualified rank must be HIGHER than current rank in the sorted list
  if (highestQualified && qualifiedRankIdx > currentRankIdx) {
    // Push rank history entry
    user.rankHistory.push({
      oldRank: user.rank,
      newRank: highestQualified.name,
      reward: highestQualified.reward,
      achievementDate: new Date(),
      updatedBy: updaterUserId,
      timestamp: new Date()
    });

    user.rank = highestQualified.name;
    user.reward = highestQualified.reward;
    user.achievementDate = new Date();
    upgraded = true;
  }

  // Compute next unqualified rank (upcoming target)
  const currentEffectiveIdx = upgraded ? qualifiedRankIdx : currentRankIdx;
  const nextTarget = currentEffectiveIdx >= 0 && currentEffectiveIdx + 1 < ranks.length
    ? ranks[currentEffectiveIdx + 1]
    : null;

  if (nextTarget) {
    user.upcomingRank = nextTarget.name;
    user.upcomingReward = nextTarget.reward;
  } else {
    user.upcomingRank = '';
    user.upcomingReward = '';
  }

  return {
    upgraded,
    newRank: user.rank,
    previousRank,
    nextTarget
  };
}
