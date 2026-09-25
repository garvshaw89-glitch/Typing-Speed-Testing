import React, { useMemo, useState } from 'react';
import {
  Play,
  Trophy,
  Target,
  Award,
  Flame,
  Zap,
  BookOpen,
  AlignLeft,
  Quote,
  Sparkles,
  ChevronRight,
  Activity,
  Sliders,
  Check,
  Shield,
  Layers,
} from 'lucide-react';
import { UserPreferences, UserStats, DifficultyLevel, TextType, TestMode, WordCountOption } from '../types';
import { getAllAchievements } from '../services/achievementService';
import { Button } from './ui/Button';

interface HomeScreenProps {
  stats: UserStats;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onStartTest: () => void;
  onStartWarmup: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenTrophies?: () => void;
  onOpenLeaderboard?: () => void;
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
  onOpenLeaderboard,
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const durations = [15, 30, 60, 120];
  const wordCounts: WordCountOption[] = [10, 25, 50, 100];

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

  // Handle start test with tactile loading state
  const handleLaunchTest = () => {
    setIsStarting(true);
    setTimeout(() => {
      onStartTest();
    }, 120);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-400/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 fill-current" />
          <span>High-Performance Typing Platform</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          Test Your Speed.
          <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
            {' '}Improve Your Accuracy.
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base sm:text-lg">
          Master keystroke cadence, eliminate typing errors, and benchmark your raw and adjusted WPM in real-time.
        </p>
      </div>

      {/* Quick Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Best WPM */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Best WPM</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
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
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
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
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
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
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tabular-nums">
              {stats.currentStreakDays}
            </span>
            <span className="text-xs text-slate-500 font-medium">days</span>
          </div>
        </div>
      </div>

      {/* Primary Configuration & Test Launcher Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
        {/* Test Mode Selector: Time / Words / Quote / Custom */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-500" />
              <span>Test Mode</span>
            </span>
            <span className="text-[11px] font-normal text-slate-400">
              {preferences.testMode === 'time' && 'Timed countdown duration'}
              {preferences.testMode === 'words' && 'Sprint through fixed word count'}
              {preferences.testMode === 'quote' && 'Famous quotes & literature'}
              {preferences.testMode === 'custom' && 'Configurable duration & words'}
            </span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800">
            {[
              { id: 'time', label: 'Time Mode', icon: Zap },
              { id: 'words', label: 'Word Mode', icon: AlignLeft },
              { id: 'quote', label: 'Quote Mode', icon: Quote },
              { id: 'custom', label: 'Custom Mode', icon: Sliders },
            ].map((mode) => {
              const Icon = mode.icon;
              const isSelected = preferences.testMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onUpdatePreferences({ testMode: mode.id as TestMode })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-options depending on mode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
          {/* Mode-specific Option 1: Duration or Word Count */}
          {preferences.testMode === 'time' && (
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
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      preferences.testDuration === d
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>
            </div>
          )}

          {preferences.testMode === 'words' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-blue-500" />
                Word Count
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                {wordCounts.map((wc) => (
                  <button
                    key={wc}
                    onClick={() => onUpdatePreferences({ wordCount: wc })}
                    className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      preferences.wordCount === wc
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {wc}w
                  </button>
                ))}
              </div>
            </div>
          )}

          {preferences.testMode === 'quote' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-blue-500" />
                Quote Library
              </label>
              <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Classic & Scientific Passages</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Curated
                </span>
              </div>
            </div>
          )}

          {preferences.testMode === 'custom' && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-500" />
                Custom Duration ({preferences.customDuration}s)
              </label>
              <input
                type="range"
                min={10}
                max={180}
                step={5}
                value={preferences.customDuration}
                onChange={(e) => onUpdatePreferences({ customDuration: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          )}

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => onUpdatePreferences({ difficultyLevel: diff })}
                  className={`py-2 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${
                    preferences.difficultyLevel === diff
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Text Content Type (only for Time / Words) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-500" />
              Content Style
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              {[
                { id: 'words', label: 'Words' },
                { id: 'sentences', label: 'Sentences' },
                { id: 'code', label: 'Code' },
                { id: 'paragraph', label: 'Para' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdatePreferences({ textType: item.id as TextType })}
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    preferences.textType === item.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Start Test Main Action CTA */}
        <div className="pt-2 space-y-3">
          <Button
            variant="primary"
            size="xl"
            fullWidth
            isLoading={isStarting}
            loadingText="Preparing Interface..."
            onClick={handleLaunchTest}
            leftIcon={<Play className="w-6 h-6 fill-white" />}
          >
            Start Typing Test{' '}
            {preferences.testMode === 'time'
              ? `(${preferences.testDuration}s · ${preferences.difficultyLevel})`
              : preferences.testMode === 'words'
              ? `(${preferences.wordCount} words · ${preferences.difficultyLevel})`
              : preferences.testMode === 'quote'
              ? '(Quote Mode)'
              : `(${preferences.customDuration}s · Custom)`}
          </Button>

          <div className="flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span>Want to loosen wrists first?</span>
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

        <div className="flex items-center gap-2 shrink-0">
          {onOpenLeaderboard && (
            <Button
              variant="outline"
              size="xs"
              onClick={onOpenLeaderboard}
              leftIcon={<Trophy className="w-3.5 h-3.5 text-amber-500" />}
            >
              Leaderboard
            </Button>
          )}
          {onOpenTrophies && (
            <Button
              variant="outline"
              size="xs"
              onClick={onOpenTrophies}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Showcase
            </Button>
          )}
        </div>
      </div>

      {/* Warm-up Mode Feature Card */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-teal-500/15 via-emerald-500/10 to-cyan-500/15 border-2 border-teal-500/30 dark:border-teal-500/40 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-teal-500/50 transition-all">
        <div className="space-y-3 relative z-10 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-teal-600 text-white shadow-xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" />
              <span>Warm-up Mode</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              30 Seconds · Low Pressure · Rhythm Focus
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
        </div>

        <div className="shrink-0 relative z-10">
          <Button
            variant="accent"
            size="lg"
            onClick={onStartWarmup}
            leftIcon={<Activity className="w-5 h-5 text-white" />}
          >
            Start Warm-up (30s)
          </Button>
        </div>
      </div>

      {/* Quick Links Footer */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2">
        <button
          onClick={onOpenSettings}
          className="hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4 cursor-pointer"
        >
          Sound &amp; Audio Packs
        </button>
        <span>•</span>
        <button
          onClick={onOpenHistory}
          className="hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4 cursor-pointer"
        >
          Performance History &amp; 3D Heatmap
        </button>
        {onOpenLeaderboard && (
          <>
            <span>•</span>
            <button
              onClick={onOpenLeaderboard}
              className="hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4 cursor-pointer"
            >
              Global Leaderboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};
