import React from 'react';
import { Play, Trophy, Target, Award, Flame, Zap, SlidersHorizontal, BookOpen, Code, AlignLeft } from 'lucide-react';
import { UserPreferences, UserStats, DifficultyLevel, TextType } from '../types';

interface HomeScreenProps {
  stats: UserStats;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onStartTest: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  preferences,
  onUpdatePreferences,
  onStartTest,
  onOpenSettings,
  onOpenHistory,
}) => {
  const durations = [15, 30, 60, 120];

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
        <div className="pt-2">
          <button
            onClick={onStartTest}
            className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg sm:text-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Play className="w-6 h-6 fill-white group-hover:translate-x-0.5 transition-transform" />
            <span>Start Test ({preferences.testDuration}s - {preferences.difficultyLevel})</span>
          </button>
        </div>
      </div>

      {/* Quick Links Footer */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        <button
          onClick={onOpenSettings}
          className="hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4"
        >
          Customize All Settings
        </button>
        <span>•</span>
        <button
          onClick={onOpenHistory}
          className="hover:text-blue-600 dark:hover:text-blue-400 underline underline-offset-4"
        >
          View Detailed History
        </button>
      </div>
    </div>
  );
};
