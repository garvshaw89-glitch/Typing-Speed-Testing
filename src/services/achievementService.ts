import { Achievement, TestResult, UserStats } from '../types';

const ACHIEVEMENTS_STORAGE_KEY = 'typingTest_unlocked_achievements';

interface StoredAchievementRecord {
  unlockedAt: number;
}

/**
 * Static definitions for all visual trophy and speed milestone achievements
 */
interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: Achievement['category'];
  tier: Achievement['tier'];
  targetValue: number;
  unit: string;
  iconName: Achievement['iconName'];
  badgeColor: string;
  badgeGradient: string;
  rewardText: string;
  checkUnlocked: (stats: UserStats, history: TestResult[]) => boolean;
  getProgress: (stats: UserStats, history: TestResult[]) => { current: number; progress: number };
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDef[] = [
  // --- SPEED MILESTONES (PRIMARY) ---
  {
    id: 'speed-30',
    title: 'Bronze Sprinter',
    description: 'Hit 30+ WPM in any typing test',
    category: 'speed',
    tier: 'bronze',
    targetValue: 30,
    unit: 'WPM',
    iconName: 'zap',
    badgeColor: 'text-amber-700 dark:text-amber-500',
    badgeGradient: 'from-amber-700/20 via-amber-600/10 to-transparent border-amber-700/30',
    rewardText: 'Bronze Speed Trophy',
    checkUnlocked: (stats) => stats.bestWpm >= 30,
    getProgress: (stats) => ({
      current: stats.bestWpm,
      progress: Math.min(100, Math.round((stats.bestWpm / 30) * 100)),
    }),
  },
  {
    id: 'speed-50',
    title: 'Silver Strider',
    description: 'Hit 50+ WPM (exceeds global average speed)',
    category: 'speed',
    tier: 'silver',
    targetValue: 50,
    unit: 'WPM',
    iconName: 'award',
    badgeColor: 'text-slate-600 dark:text-slate-300',
    badgeGradient: 'from-slate-400/25 via-slate-300/10 to-transparent border-slate-400/40',
    rewardText: 'Silver Speed Trophy',
    checkUnlocked: (stats) => stats.bestWpm >= 50,
    getProgress: (stats) => ({
      current: stats.bestWpm,
      progress: Math.min(100, Math.round((stats.bestWpm / 50) * 100)),
    }),
  },
  {
    id: 'speed-70',
    title: 'Gold Velocity',
    description: 'Hit 70+ WPM (fluent, high-velocity typing)',
    category: 'speed',
    tier: 'gold',
    targetValue: 70,
    unit: 'WPM',
    iconName: 'trophy',
    badgeColor: 'text-yellow-600 dark:text-amber-400',
    badgeGradient: 'from-amber-500/25 via-yellow-500/10 to-transparent border-amber-500/40',
    rewardText: 'Gold Speed Trophy',
    checkUnlocked: (stats) => stats.bestWpm >= 70,
    getProgress: (stats) => ({
      current: stats.bestWpm,
      progress: Math.min(100, Math.round((stats.bestWpm / 70) * 100)),
    }),
  },
  {
    id: 'speed-85',
    title: 'Platinum Typist',
    description: 'Hit 85+ WPM (elite touch-typist speed)',
    category: 'speed',
    tier: 'platinum',
    targetValue: 85,
    unit: 'WPM',
    iconName: 'crown',
    badgeColor: 'text-cyan-600 dark:text-cyan-300',
    badgeGradient: 'from-cyan-500/25 via-sky-500/10 to-transparent border-cyan-500/40',
    rewardText: 'Platinum Speed Trophy',
    checkUnlocked: (stats) => stats.bestWpm >= 85,
    getProgress: (stats) => ({
      current: stats.bestWpm,
      progress: Math.min(100, Math.round((stats.bestWpm / 85) * 100)),
    }),
  },
  {
    id: 'speed-100',
    title: 'Century Club Master',
    description: 'Break into the prestigious 100+ WPM triple-digit club!',
    category: 'speed',
    tier: 'diamond',
    targetValue: 100,
    unit: 'WPM',
    iconName: 'sparkles',
    badgeColor: 'text-blue-600 dark:text-sky-300',
    badgeGradient: 'from-blue-600/25 via-indigo-500/15 to-transparent border-blue-500/50 shadow-blue-500/20',
    rewardText: 'Diamond 100 WPM Trophy',
    checkUnlocked: (stats) => stats.bestWpm >= 100,
    getProgress: (stats) => ({
      current: stats.bestWpm,
      progress: Math.min(100, Math.round((stats.bestWpm / 100) * 100)),
    }),
  },
  {
    id: 'speed-120',
    title: 'Sonic Fingers',
    description: 'Reach an extraordinary 120+ WPM typing speed',
    category: 'speed',
    tier: 'master',
    targetValue: 120,
    unit: 'WPM',
    iconName: 'flame',
    badgeColor: 'text-purple-600 dark:text-purple-300',
    badgeGradient: 'from-purple-600/25 via-fuchsia-500/15 to-transparent border-purple-500/50 shadow-purple-500/20',
    rewardText: 'Master 120 WPM Trophy',
    checkUnlocked: (stats) => stats.bestWpm >= 120,
    getProgress: (stats) => ({
      current: stats.bestWpm,
      progress: Math.min(100, Math.round((stats.bestWpm / 120) * 100)),
    }),
  },
  {
    id: 'speed-140',
    title: 'Supersonic Legend',
    description: 'Achieve a staggering 140+ WPM (speed of sound)',
    category: 'speed',
    tier: 'master',
    targetValue: 140,
    unit: 'WPM',
    iconName: 'shield',
    badgeColor: 'text-rose-600 dark:text-rose-400',
    badgeGradient: 'from-rose-600/25 via-red-500/15 to-transparent border-rose-500/50 shadow-rose-500/20',
    rewardText: 'Mythic 140 WPM Trophy',
    checkUnlocked: (stats) => stats.bestWpm >= 140,
    getProgress: (stats) => ({
      current: stats.bestWpm,
      progress: Math.min(100, Math.round((stats.bestWpm / 140) * 100)),
    }),
  },

  // --- PRECISION & ACCURACY ---
  {
    id: 'acc-flawless',
    title: 'Sharpshooter (100% Acc)',
    description: 'Complete a test with flawless 100% accuracy',
    category: 'accuracy',
    tier: 'gold',
    targetValue: 100,
    unit: '%',
    iconName: 'target',
    badgeColor: 'text-emerald-600 dark:text-emerald-400',
    badgeGradient: 'from-emerald-600/25 via-teal-500/15 to-transparent border-emerald-500/40',
    rewardText: 'Flawless Accuracy Medal',
    checkUnlocked: (stats) => stats.bestAccuracy >= 100,
    getProgress: (stats) => ({
      current: stats.bestAccuracy,
      progress: Math.min(100, stats.bestAccuracy),
    }),
  },
  {
    id: 'acc-eagle',
    title: 'Eagle Eye (98% Acc)',
    description: 'Finish a typing test with 98% or higher accuracy',
    category: 'accuracy',
    tier: 'silver',
    targetValue: 98,
    unit: '%',
    iconName: 'check',
    badgeColor: 'text-teal-600 dark:text-teal-300',
    badgeGradient: 'from-teal-600/20 via-teal-500/10 to-transparent border-teal-500/30',
    rewardText: 'Eagle Precision Badge',
    checkUnlocked: (stats) => stats.bestAccuracy >= 98,
    getProgress: (stats) => ({
      current: stats.bestAccuracy,
      progress: Math.min(100, Math.round((stats.bestAccuracy / 98) * 100)),
    }),
  },
  {
    id: 'consistency-zen',
    title: 'Zen Rhythm',
    description: 'Score 90%+ keystroke interval consistency',
    category: 'accuracy',
    tier: 'platinum',
    targetValue: 90,
    unit: '%',
    iconName: 'shield',
    badgeColor: 'text-indigo-600 dark:text-indigo-300',
    badgeGradient: 'from-indigo-600/25 via-blue-500/10 to-transparent border-indigo-500/40',
    rewardText: 'Zen Flow Trophy',
    checkUnlocked: (_, history) => history.some((h) => h.consistencyScore >= 90),
    getProgress: (_, history) => {
      const bestConsistency = history.reduce((max, h) => Math.max(max, h.consistencyScore || 0), 0);
      return {
        current: bestConsistency,
        progress: Math.min(100, Math.round((bestConsistency / 90) * 100)),
      };
    },
  },

  // --- ENDURANCE & STREAK ---
  {
    id: 'endurance-10',
    title: 'Tenacity Champion',
    description: 'Complete 10 typing test sessions',
    category: 'endurance',
    tier: 'silver',
    targetValue: 10,
    unit: 'tests',
    iconName: 'award',
    badgeColor: 'text-blue-600 dark:text-blue-300',
    badgeGradient: 'from-blue-600/20 via-sky-500/10 to-transparent border-blue-500/30',
    rewardText: 'Dedication Medal',
    checkUnlocked: (stats) => stats.totalTestsCompleted >= 10,
    getProgress: (stats) => ({
      current: stats.totalTestsCompleted,
      progress: Math.min(100, Math.round((stats.totalTestsCompleted / 10) * 100)),
    }),
  },
  {
    id: 'streak-3',
    title: 'Streak on Fire',
    description: 'Maintain a 3-day consecutive typing streak',
    category: 'streak',
    tier: 'gold',
    targetValue: 3,
    unit: 'days',
    iconName: 'flame',
    badgeColor: 'text-amber-600 dark:text-amber-400',
    badgeGradient: 'from-amber-600/25 via-orange-500/15 to-transparent border-orange-500/40',
    rewardText: 'Fire Streak Badge',
    checkUnlocked: (stats) => stats.currentStreakDays >= 3,
    getProgress: (stats) => ({
      current: stats.currentStreakDays,
      progress: Math.min(100, Math.round((stats.currentStreakDays / 3) * 100)),
    }),
  },
];

/**
 * Reads stored unlocked achievement records with timestamps from localStorage.
 */
export function getStoredAchievementRecords(): Record<string, StoredAchievementRecord> {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored achievements', e);
    return {};
  }
}

/**
 * Saves unlocked achievement record.
 */
export function recordUnlockedAchievements(unlockedIds: string[]): void {
  try {
    const current = getStoredAchievementRecords();
    const now = Date.now();
    let updated = false;

    unlockedIds.forEach((id) => {
      if (!current[id]) {
        current[id] = { unlockedAt: now };
        updated = true;
      }
    });

    if (updated) {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(current));
    }
  } catch (e) {
    console.error('Failed to save achievement records', e);
  }
}

/**
 * Returns all achievements populated with current progress, unlock status, and timestamps.
 */
export function getAllAchievements(stats: UserStats, history: TestResult[]): Achievement[] {
  const storedRecords = getStoredAchievementRecords();

  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const isUnlockedByCondition = def.checkUnlocked(stats, history);
    const storedRecord = storedRecords[def.id];
    const isUnlocked = Boolean(storedRecord) || isUnlockedByCondition;
    const { current, progress } = def.getProgress(stats, history);

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      category: def.category,
      tier: def.tier,
      targetValue: def.targetValue,
      unit: def.unit,
      iconName: def.iconName,
      isUnlocked,
      unlockedAt: storedRecord?.unlockedAt,
      currentValue: current,
      progress: isUnlocked ? 100 : progress,
      badgeColor: def.badgeColor,
      badgeGradient: def.badgeGradient,
      rewardText: def.rewardText,
    };
  });
}

/**
 * Evaluates the results of the just-completed test and checks if any new achievements were unlocked!
 */
export function checkNewlyUnlockedAchievements(
  result: TestResult,
  stats: UserStats,
  history: TestResult[]
): Achievement[] {
  const storedRecords = getStoredAchievementRecords();
  const allAchievements = getAllAchievements(stats, history);

  const newlyUnlocked: Achievement[] = [];
  const newlyUnlockedIds: string[] = [];

  allAchievements.forEach((ach) => {
    // If it was already in storage before this test, skip
    if (storedRecords[ach.id]) return;

    // Check if current test or new stats fulfills it
    const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.id === ach.id);
    if (!def) return;

    let qualifies = false;

    // Direct check on this test result
    if (def.category === 'speed' && result.wpm >= def.targetValue) {
      qualifies = true;
    } else if (def.id === 'acc-flawless' && result.accuracy >= 100) {
      qualifies = true;
    } else if (def.id === 'acc-eagle' && result.accuracy >= 98) {
      qualifies = true;
    } else if (def.id === 'consistency-zen' && result.consistencyScore >= 90) {
      qualifies = true;
    } else if (def.checkUnlocked(stats, history)) {
      qualifies = true;
    }

    if (qualifies) {
      newlyUnlocked.push({
        ...ach,
        isUnlocked: true,
        unlockedAt: Date.now(),
        progress: 100,
      });
      newlyUnlockedIds.push(ach.id);
    }
  });

  if (newlyUnlockedIds.length > 0) {
    recordUnlockedAchievements(newlyUnlockedIds);
  }

  return newlyUnlocked;
}
