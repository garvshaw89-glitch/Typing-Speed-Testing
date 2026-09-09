import React, { useState, useMemo } from 'react';
import { Achievement, UserStats, TestResult } from '../types';
import { getAllAchievements } from '../services/achievementService';
import { TrophyCard } from './TrophyCard';
import {
  Trophy,
  Award,
  Zap,
  Target,
  Sparkles,
  Flame,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Filter,
} from 'lucide-react';

interface TrophiesViewProps {
  stats: UserStats;
  history: TestResult[];
  onStartTest?: () => void;
}

type TrophyFilter = 'all' | 'speed' | 'accuracy' | 'endurance' | 'unlocked';

export const TrophiesView: React.FC<TrophiesViewProps> = ({ stats, history, onStartTest }) => {
  const [filter, setFilter] = useState<TrophyFilter>('all');

  const achievements = useMemo(() => {
    return getAllAchievements(stats, history);
  }, [stats, history]);

  // Statistics
  const totalCount = achievements.length;
  const unlockedAchievements = achievements.filter((a) => a.isUnlocked);
  const unlockedCount = unlockedAchievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const speedAchievements = achievements.filter((a) => a.category === 'speed');
  const unlockedSpeedCount = speedAchievements.filter((a) => a.isUnlocked).length;

  // Find next speed milestone
  const nextSpeedMilestone = useMemo(() => {
    return speedAchievements.find((a) => !a.isUnlocked);
  }, [speedAchievements]);

  // Filtered list
  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      if (filter === 'all') return true;
      if (filter === 'unlocked') return a.isUnlocked;
      return a.category === filter;
    });
  }, [achievements, filter]);

  return (
    <div className="space-y-6">
      {/* Milestone Progress Overview Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/30 shrink-0">
              <Trophy className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Typing Trophies &amp; Milestones
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Earn visual medals and prestigious trophies by shattering speed thresholds and refining accuracy
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Trophies Earned</span>
              <span className="text-base font-black text-amber-600 dark:text-amber-400">
                {unlockedCount} / {totalCount}
              </span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Speed Tier</span>
              <span className="text-base font-black text-blue-600 dark:text-blue-400">
                {unlockedSpeedCount} / {speedAchievements.length}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Gauge */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-600 dark:text-slate-400 font-sans font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Overall Achievement Mastery</span>
            </span>
            <span className="font-extrabold text-slate-800 dark:text-slate-200">
              {completionPercentage}% Complete
            </span>
          </div>
          <div className="w-full bg-slate-200/80 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(4, completionPercentage)}%` }}
            />
          </div>
        </div>

        {/* Next Speed Milestone Spotlight */}
        {nextSpeedMilestone && (
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                  Next Milestone Chasing
                </span>
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {nextSpeedMilestone.title} ({nextSpeedMilestone.targetValue} WPM)
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                  (Current Best: {stats.bestWpm} WPM • Need +{Math.max(1, nextSpeedMilestone.targetValue - stats.bestWpm)} WPM)
                </span>
              </div>
            </div>

            {onStartTest && (
              <button
                onClick={onStartTest}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <span>Take Test to Unlock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          All Trophies ({totalCount})
        </button>

        <button
          onClick={() => setFilter('speed')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filter === 'speed'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Speed Milestones ({speedAchievements.length})</span>
        </button>

        <button
          onClick={() => setFilter('accuracy')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filter === 'accuracy'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>Precision &amp; Rhythm</span>
        </button>

        <button
          onClick={() => setFilter('endurance')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            filter === 'endurance'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Endurance &amp; Streaks</span>
        </button>

        <button
          onClick={() => setFilter('unlocked')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ml-auto ${
            filter === 'unlocked'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Unlocked Only ({unlockedCount})</span>
        </button>
      </div>

      {/* Trophies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAchievements.map((achievement) => (
          <TrophyCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
};
