import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Achievement, TestResult, UserStats } from '../types';
import { getPerformanceRating, getRhythmRating } from '../utils/calculations';
import { getAllAchievements } from '../services/achievementService';
import { KeyboardLayout } from './KeyboardLayout';
import { TrophyCard } from './TrophyCard';
import {
  Trophy,
  RotateCcw,
  Share2,
  History,
  Award,
  Zap,
  Sparkles,
  ChevronRight,
  Target,
  Activity,
  Play,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';

interface ResultsScreenProps {
  result: TestResult;
  stats: UserStats;
  newlyUnlockedAchievements?: Achievement[];
  onTryAgain: () => void;
  onNewTest: () => void;
  onViewHistory: () => void;
  onViewTrophies?: () => void;
  onStartTest?: () => void;
  onStartWarmup?: () => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  stats,
  newlyUnlockedAchievements = [],
  onTryAgain,
  onNewTest,
  onViewHistory,
  onViewTrophies,
  onStartTest,
  onStartWarmup,
  onShowToast,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const rating = getPerformanceRating(result.wpm);
  const rhythmRating = getRhythmRating(result.consistencyScore);
  const diffFromBest = stats.bestWpm > 0 ? result.wpm - stats.bestWpm : 0;

  // Retrieve all achievements & speed milestones
  const allAchievements = useMemo(() => {
    return getAllAchievements(stats, []);
  }, [stats]);

  // Highest unlocked speed milestone
  const highestUnlockedSpeedTrophy = useMemo(() => {
    return allAchievements
      .filter((a) => a.category === 'speed' && a.isUnlocked)
      .sort((a, b) => b.targetValue - a.targetValue)[0];
  }, [allAchievements]);

  // Next speed milestone
  const nextSpeedMilestone = useMemo(() => {
    return allAchievements
      .filter((a) => a.category === 'speed' && !a.isUnlocked)
      .sort((a, b) => a.targetValue - b.targetValue)[0];
  }, [allAchievements]);

  // Trigger confetti if personal best or newly unlocked achievement!
  useEffect(() => {
    if (result.isPersonalBest || newlyUnlockedAchievements.length > 0) {
      try {
        confetti({
          particleCount: newlyUnlockedAchievements.length > 0 ? 120 : 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#eab308', '#f59e0b', '#3b82f6', '#10b981', '#a855f7'],
        });
      } catch {
        // Ignore confetti error if unavailable
      }
    }
  }, [result.isPersonalBest, newlyUnlockedAchievements.length]);

  // Export card as high quality PNG
  const handleShareScreenshot = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement('a');
      link.download = `typing-test-results-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      onShowToast('Results image downloaded successfully!', 'success');
    } catch (e) {
      console.error('Failed to export image', e);
      onShowToast('Failed to generate screenshot image.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Result Card Container to capture for sharing */}
      <div
        ref={cardRef}
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/95 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Personal Best Ribbon */}
        {result.isPersonalBest && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider animate-bounce">
            <Trophy className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>New Personal Best!</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-1">
          {result.isWarmup ? (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-extrabold text-xs uppercase tracking-wider mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Warm-up Session Complete</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Fingers Primed & Warmed Up!
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                30s Low-Pressure Cadence Session • Consistency Focused
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Test Complete!
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {result.duration}s Test • {result.difficulty} • {result.textType}
              </p>
            </>
          )}
        </div>

        {/* Primary Scores Card / Grid */}
        {result.isWarmup ? (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-teal-500/15 border border-teal-500/30 dark:border-teal-500/40 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                Cadence Rhythm
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${rhythmRating.bg} ${rhythmRating.color} ${rhythmRating.borderColor}`}>
                {rhythmRating.badge}
              </span>
            </div>

            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl sm:text-6xl font-black text-teal-600 dark:text-teal-400">
                {result.consistencyScore}%
              </span>
              <span className="text-sm font-bold text-slate-500">Rhythm Score</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {rhythmRating.description}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 max-w-xs mx-auto text-center font-mono">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-teal-500/20">
                <div className="text-[10px] uppercase font-bold text-slate-400">Warm-up Pace</div>
                <div className="text-xl font-black text-slate-900 dark:text-white">{result.wpm} WPM</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-teal-500/20">
                <div className="text-[10px] uppercase font-bold text-slate-400">Accuracy</div>
                <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">{result.accuracy}%</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
            <div>
              <div className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Typing Speed
              </div>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400">
                  {result.wpm}
                </span>
                <span className="text-sm font-bold text-slate-500">WPM</span>
              </div>
            </div>

            <div>
              <div className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                Accuracy
              </div>
              <div className="mt-1 flex items-baseline justify-center gap-1">
                <span className="text-4xl sm:text-5xl font-black text-emerald-600 dark:text-emerald-400">
                  {result.accuracy}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Performance Rating or Rhythm Guidance Badge */}
        {!result.isWarmup ? (
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-extrabold ${rating.color}`}>{rating.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                  Rating
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{rating.message}</p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-900/40 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-600/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-teal-800 dark:text-teal-200">
                  Cadence Primed
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 font-semibold">
                  Ready
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Your fingers are loose and muscle memory is activated. Maintain this continuous keystroke rhythm during your full test.
              </p>
            </div>
          </div>
        )}

        {/* Speed Milestone & Trophy Status */}
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 dark:border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
              <Trophy className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Speed Milestone Tier
                </span>
                {highestUnlockedSpeedTrophy && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-200/60 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-black">
                    {highestUnlockedSpeedTrophy.title}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                {nextSpeedMilestone ? (
                  <>
                    Next Trophy: <span className="font-bold text-slate-900 dark:text-white">{nextSpeedMilestone.title} ({nextSpeedMilestone.targetValue} WPM)</span>
                    {' '}• Need +{Math.max(1, nextSpeedMilestone.targetValue - result.wpm)} WPM
                  </>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    All Speed Milestones Mastered!
                  </span>
                )}
              </p>
            </div>
          </div>

          {onViewTrophies && (
            <button
              onClick={onViewTrophies}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-xs font-bold transition-all flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>View Trophies</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Secondary Detailed Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Raw Speed</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200">{result.rawWpm} WPM</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Char / Min (CPM)</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200">{result.cpm} CPM</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Correct Chars</span>
            <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
              {result.correctCharacters} / {result.totalCharactersTyped}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Errors</span>
            <span className="text-base font-bold text-rose-600 dark:text-rose-400">{result.errors}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Consistency</span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
              {result.consistencyScore}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Vs Best</span>
            <span
              className={`text-base font-bold ${
                diffFromBest >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {diffFromBest >= 0 ? `+${diffFromBest} WPM` : `${diffFromBest} WPM`}
            </span>
          </div>
        </div>

        {/* Branding footer for screenshot image */}
        <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
          Typing Speed Test • Measured on {new Date(result.timestamp).toLocaleDateString()}
        </div>
      </div>

      {/* Newly Unlocked Trophies Showcase Banner */}
      {newlyUnlockedAchievements.length > 0 && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-500/20 border-2 border-amber-500/40 shadow-xl space-y-4 animate-bounce-short">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Trophy className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {newlyUnlockedAchievements.length === 1
                    ? '🎉 New Trophy Milestone Unlocked!'
                    : `🎉 ${newlyUnlockedAchievements.length} New Trophies Unlocked!`}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Congratulations! You smashed a key performance milestone in this test.
                </p>
              </div>
            </div>

            {onViewTrophies && (
              <button
                onClick={onViewTrophies}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1 cursor-pointer"
              >
                <span>Trophies Room</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {newlyUnlockedAchievements.map((ach) => (
              <TrophyCard key={ach.id} achievement={ach} isNew={true} />
            ))}
          </div>
        </div>
      )}

      {/* Visual Keyboard Struggle Keys Heatmap */}
      <KeyboardLayout
        singleResult={result}
        title="Test Struggle Keys Analysis"
        subtitle="Visual key breakdown for this specific typing session"
      />

      {/* Warm-up Call-to-Action to Launch Full Test */}
      {result.isWarmup && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-teal-500/10 border border-blue-500/30 dark:border-blue-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>⚡</span>
              <span>Fingers Primed & Warmed Up!</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your keystroke cadence is locked in. Ready to tackle a full-speed test to beat your personal best?
            </p>
          </div>

          <button
            onClick={onStartTest || onTryAgain}
            className="py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Full Speed Test</span>
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {result.isWarmup ? (
          <>
            <button
              onClick={onStartTest || onTryAgain}
              className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Full Test</span>
            </button>

            <button
              onClick={onStartWarmup || onTryAgain}
              className="py-3 px-3 rounded-xl border border-teal-500/40 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/40 text-teal-800 dark:text-teal-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-4 h-4 text-teal-600" />
              <span>Warm Again</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onTryAgain}
              className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <button
              onClick={onNewTest}
              className="py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Settings</span>
            </button>
          </>
        )}

        {onViewTrophies && (
          <button
            onClick={onViewTrophies}
            className="py-3 px-3 rounded-xl border border-amber-500/40 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <Trophy className="w-4 h-4 text-amber-500 fill-amber-500/20" />
            <span>Trophies</span>
          </button>
        )}

        <button
          onClick={onViewHistory}
          className="py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <History className="w-4 h-4 text-blue-500" />
          <span>History</span>
        </button>

        <button
          onClick={handleShareScreenshot}
          disabled={isExporting}
          className="col-span-2 sm:col-span-1 py-3 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-indigo-500" />
          <span>{isExporting ? 'Saving...' : 'Share'}</span>
        </button>
      </div>
    </div>
  );
};
