import React, { useMemo } from 'react';
import {
  Play,
  Trophy,
  Target,
  Award,
  Flame,
  Zap,
  SlidersHorizontal,
  BookOpen,
  Code,
  AlignLeft,
  Sparkles,
  ChevronRight,
  Activity,
  Wind,
} from 'lucide-react';
import { UserPreferences, UserStats, DifficultyLevel, TextType } from '../types';
import { getAllAchievements } from '../services/achievementService';

interface HomeScreenProps {
  stats: UserStats;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onStartTest: () => void;
  onStartWarmup: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenTrophies?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  preferences,
  onUpdatePreferences,
  onStartTest,
  onStartWarmup,
  onOpenSettings,
  onOpenHistory,
  onOpenTrophies,
}) => {
  const durations = [15, 30, 60, 120];

  const allAchievements = useMemo(() => {
    return getAllAchievements(stats, []);
  }, [stats]);

  const unlockedTrophyCount = useMemo(() => {
    return allAchievements.filter((a) => a.isUnlocked).length;
  }, [allAchievements]);

  const nextSpeedMilestone = useMemo(() => {
    return allAchievements
      .filter((a) => a.category === 'speed' && !a.isUnlocked)
      .sort((a, b) => a.targetValue - b.targetValue)[0];
  }, [allAchievements]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Master Your Typing Speed & Accuracy
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base sm:text-lg">
          Take a quick, real-time typing test to measure your WPM, accuracy, and consistency.
        </p>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Best WPM */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Best WPM</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.bestWpm > 0 ? stats.bestWpm : '--'}
            </span>
            <span className="text-xs text-slate-500 font-medium">WPM</span>
          </div>
        </div>

        {/* Best Accuracy */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Best Accuracy</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.bestAccuracy > 0 ? `${stats.bestAccuracy}%` : '--'}
            </span>
          </div>
        </div>

        {/* Total Tests */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Tests Taken</span>
            <Award className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalTestsCompleted}
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.currentStreakDays}
            </span>
            <span className="text-xs text-slate-500 font-medium">days</span>
          </div>
        </div>
      </div>

      {/* Trophies & Milestones Highlight Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/10 border border-amber-500/25 dark:border-amber-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Trophy className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                Typing Trophies &amp; Milestones
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                {unlockedTrophyCount} / {allAchievements.length} Unlocked
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {nextSpeedMilestone ? (
                <span>
                  Next Goal: <strong className="text-slate-900 dark:text-white">{nextSpeedMilestone.title} ({nextSpeedMilestone.targetValue} WPM)</strong>
                  {stats.bestWpm > 0 && ` • Need +${Math.max(1, nextSpeedMilestone.targetValue - stats.bestWpm)} WPM to unlock`}
                </span>
              ) : (
                <span>All speed milestone trophies mastered! Amazing job!</span>
              )}
            </p>
          </div>
        </div>

        {onOpenTrophies && (
          <button
            onClick={onOpenTrophies}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Trophy Showcase</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Warm-up Mode Feature Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-cyan-500/15 border-2 border-teal-500/30 dark:border-teal-500/40 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-teal-500/50 transition-all">
        {/* Glow backdrop decorative accent */}
        <div className="absolute -right-12 -top-12 w-44 h-44 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 relative z-10 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-600 text-white shadow-xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Warm-up Mode</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-500/20">
              30 Seconds • Low Pressure
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20">
              Rhythm &amp; Flow Focus
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Ease Into Your Flow
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              Loosen your wrists, relax hand tension, and lock into an even keystroke cadence before sprinting for personal bests. No speed pressure, no harsh penalties — pure rhythm and flow.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-2.5 py-1 rounded-lg border border-teal-500/20">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>Live Cadence Meter</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-2.5 py-1 rounded-lg border border-teal-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Calming Acoustic Feedback</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-2.5 py-1 rounded-lg border border-teal-500/20">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              <span>Ergonomic Flow Passages</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 relative z-10 flex flex-col sm:flex-row md:flex-col gap-2.5">
          <button
            onClick={onStartWarmup}
            className="py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-extrabold text-base shadow-lg shadow-teal-600/30 hover:shadow-teal-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Activity className="w-5 h-5" />
            <span>Start Warm-up (30s)</span>
          </button>
          <span className="text-[11px] text-center text-teal-700 dark:text-teal-400 font-semibold">
            Recommended before full tests
          </span>
        </div>
      </div>

      {/* Main Control Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        {/* Quick Options Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Duration Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-blue-500" />
              Duration
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              {durations.map((d) => (
                <button
                  key={d}
                  onClick={() => onUpdatePreferences({ testDuration: d })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    preferences.testDuration === d
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" />
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => onUpdatePreferences({ difficultyLevel: diff })}
                  className={`py-2 text-xs font-bold capitalize rounded-lg transition-all ${
                    preferences.difficultyLevel === diff
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Text Content Type Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-500" />
              Content Type
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              {[
                { id: 'words', label: 'Words', icon: AlignLeft },
                { id: 'sentences', label: 'Sentences', icon: BookOpen },
                { id: 'code', label: 'Code', icon: Code },
                { id: 'paragraph', label: 'Para', icon: BookOpen },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdatePreferences({ textType: item.id as TextType })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    preferences.textType === item.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Test Main Button */}
        <div className="pt-2 space-y-3">
          <button
            onClick={onStartTest}
            className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg sm:text-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Play className="w-6 h-6 fill-white group-hover:translate-x-0.5 transition-transform" />
            <span>Start Test ({preferences.testDuration}s - {preferences.difficultyLevel})</span>
          </button>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Want to loosen up wrists first?</span>
            <button
              type="button"
              onClick={onStartWarmup}
              className="text-teal-600 dark:text-teal-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Launch 30s Warm-up Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3D Feature Architecture Quick Access */}
      <div className="p-6 rounded-3xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <span className="text-blue-500">🎮</span>
              <span>3D Feature Matrix &amp; Diagnostic Tools</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live keystroke physics, anatomical finger guides, and synthesized acoustic feedback
            </p>
          </div>
          <button
            onClick={onOpenHistory}
            className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>View 3D Keyboard Heatmap</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700">
            <span className="font-extrabold text-blue-600 dark:text-blue-400 block mb-1">⚡ Physics Engine</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug block">Net WPM formula with strict error penalty deduction</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700">
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400 block mb-1">⌨️ 3D Heatmap</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug block">Color-coded 5-finger ergonomic placement mapping</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700">
            <span className="font-extrabold text-amber-600 dark:text-amber-400 block mb-1">🎯 Audio Synth</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug block">Web Audio API dual-wave mechanical switch clicks</span>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700">
            <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block mb-1">📱 Mobile Ready</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] leading-snug block">Zero-lag tap-to-focus virtual keyboard for iOS &amp; Android</span>
          </div>
        </div>
      </div>

      {/* Quick Links Footer */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        <button
          onClick={onOpenSettings}
          className="hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4 cursor-pointer"
        >
          Customize All Settings
        </button>
        <span>•</span>
        <button
          onClick={onOpenHistory}
          className="hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4 cursor-pointer"
        >
          View Full Performance History &amp; 3D Key Matrix
        </button>
      </div>
    </div>
  );
};
