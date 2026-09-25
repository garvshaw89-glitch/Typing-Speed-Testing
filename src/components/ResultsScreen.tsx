import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Achievement, TestResult, UserStats } from '../types';
import { getPerformanceRating, getRhythmRating } from '../utils/calculations';
import { getAllAchievements } from '../services/achievementService';
import { submitLeaderboardScore } from '../services/leaderboardService';
import { KeyboardLayout } from './KeyboardLayout';
import { TrophyCard } from './TrophyCard';
import { Button } from './ui/Button';
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
  Copy,
  Check,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ResultsScreenProps {
  result: TestResult;
  stats: UserStats;
  newlyUnlockedAchievements?: Achievement[];
  onTryAgain: () => void;
  onNewTest: () => void;
  onViewHistory: () => void;
  onViewTrophies?: () => void;
  onViewLeaderboard?: () => void;
  onStartTest?: () => void;
  onStartWarmup?: () => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

// Hook for smooth count-up number animation
function useCountUp(target: number, durationMs = 600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
      // easeOutExpo curve
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(startValue + (target - startValue) * eased));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    requestAnimationFrame(step);
  }, [target, durationMs]);

  return value;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  stats,
  newlyUnlockedAchievements = [],
  onTryAgain,
  onNewTest,
  onViewHistory,
  onViewTrophies,
  onViewLeaderboard,
  onStartTest,
  onStartWarmup,
  onShowToast,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [isSubmittingScore, setIsSubmittingScore] = useState<boolean>(false);
  const [submittedRank, setSubmittedRank] = useState<number | null>(null);
  const [playerNickname, setPlayerNickname] = useState<string>('SpeedTypist');

  // Animated numbers
  const animatedWpm = useCountUp(result.wpm, 700);
  const animatedAccuracy = useCountUp(Math.round(result.accuracy), 700);
  const animatedChars = useCountUp(result.totalCharactersTyped, 600);
  const animatedErrors = useCountUp(result.errors, 500);

  const rating = getPerformanceRating(result.wpm);
  const rhythmRating = getRhythmRating(result.consistencyScore);
  const diffFromBest = stats.bestWpm > 0 ? result.wpm - stats.bestWpm : 0;

  // Retrieve achievements
  const allAchievements = useMemo(() => {
    return getAllAchievements(stats, []);
  }, [stats]);

  const highestUnlockedSpeedTrophy = useMemo(() => {
    return allAchievements
      .filter((a) => a.category === 'speed' && a.isUnlocked)
      .sort((a, b) => b.targetValue - a.targetValue)[0];
  }, [allAchievements]);

  const nextSpeedMilestone = useMemo(() => {
    return allAchievements
      .filter((a) => a.category === 'speed' && !a.isUnlocked)
      .sort((a, b) => a.targetValue - b.targetValue)[0];
  }, [allAchievements]);

  // Confetti on mount for personal best or trophies
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
        // Safe fallback
      }
    }
  }, [result.isPersonalBest, newlyUnlockedAchievements.length]);

  // Copy result text to clipboard
  const handleCopyResult = async () => {
    const text = `⚡ Typing Speed Test: ${result.wpm} WPM | ${result.accuracy}% Accuracy | ${result.duration}s | Rating: ${rating.title}`;
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      onShowToast('Result copied to clipboard!', 'success');
      setTimeout(() => setHasCopied(false), 2500);
    } catch {
      onShowToast('Failed to copy to clipboard', 'error');
    }
  };

  // Export card as high-res PNG
  const handleShareScreenshot = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement('a');
      link.download = `typing-test-${result.wpm}wpm-${new Date().toISOString().slice(0, 10)}.png`;
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

  // Submit score to global leaderboard
  const handleSubmitScore = () => {
    setIsSubmittingScore(true);
    setTimeout(() => {
      const mode = result.mode || 'time';
      const durationOrWords =
        mode === 'words' ? `${result.targetWords || 50} words` : `${result.duration}s`;
      const res = submitLeaderboardScore(
        playerNickname,
        result.wpm,
        result.rawWpm,
        result.accuracy,
        mode,
        durationOrWords
      );
      setSubmittedRank(res.rank);
      setIsSubmittingScore(false);
      onShowToast(`Score submitted! You are ranked #${res.rank} globally!`, 'success');
    }, 400);
  };

  // Progression graph data points
  const progressionData = useMemo(() => {
    if (result.wpmProgression && result.wpmProgression.length > 2) {
      return result.wpmProgression;
    }
    // Fallback simulation if test ended very fast
    const pts = [];
    const dur = Math.max(2, result.duration);
    for (let i = 1; i <= dur; i++) {
      pts.push({
        second: i,
        wpm: Math.round(result.wpm * (0.8 + 0.2 * (i / dur))),
        rawWpm: Math.round(result.rawWpm * (0.85 + 0.15 * (i / dur))),
        errors: Math.round(result.errors * (i / dur)),
      });
    }
    return pts;
  }, [result.wpmProgression, result.duration, result.wpm, result.rawWpm, result.errors]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Result Card Container (captured for screenshot) */}
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
                <span>Warm-up Complete</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Fingers Primed &amp; Ready!
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                30s Low-Pressure Cadence Session · Rhythm Focused
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Test Complete!
              </h2>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {result.duration}s · {result.difficulty} · {result.textType}
                {result.mode && ` · ${result.mode} mode`}
              </p>
            </>
          )}
        </div>

        {/* Primary Animated Scores Display */}
        {result.isWarmup ? (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/10 to-teal-500/15 border border-teal-500/30 dark:border-teal-500/40 text-center space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                Cadence Rhythm
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${rhythmRating.bg} ${rhythmRating.color} ${rhythmRating.borderColor}`}
              >
                {rhythmRating.badge}
              </span>
            </div>

            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl sm:text-6xl font-black text-teal-600 dark:text-teal-400 tabular-nums font-mono">
                {animatedAccuracy}%
              </span>
              <span className="text-sm font-bold text-slate-500">Rhythm Cadence</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
              {rhythmRating.description}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 text-center font-mono">
            {/* Main WPM */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Speed
              </div>
              <div className="mt-1 flex items-baseline justify-center gap-0.5">
                <span className="text-3xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                  {animatedWpm}
                </span>
                <span className="text-xs font-bold text-slate-400">WPM</span>
              </div>
            </div>

            {/* Accuracy */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Accuracy
              </div>
              <div className="mt-1 flex items-baseline justify-center">
                <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {result.accuracy}%
                </span>
              </div>
            </div>

            {/* Errors */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Errors
              </div>
              <div className="mt-1 flex items-baseline justify-center">
                <span className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
                  {animatedErrors}
                </span>
              </div>
            </div>

            {/* Characters */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Characters
              </div>
              <div className="mt-1 flex items-baseline justify-center">
                <span className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-200 tabular-nums">
                  {animatedChars}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Real-time WPM Progression Chart */}
        {!result.isWarmup && progressionData.length > 2 && (
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                <span>Speed Progression Curve (WPM over Time)</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px] tabular-nums">
                Peak: {Math.max(...progressionData.map((p) => p.wpm))} WPM
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressionData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="second" tickFormatter={(s) => `${s}s`} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: number) => [`${val} WPM`, 'Speed']}
                    labelFormatter={(s) => `Second ${s}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="wpm"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#wpmGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Rating or Rhythm Guidance Badge */}
        {!result.isWarmup ? (
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-base font-black ${rating.color}`}>{rating.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold">
                  Performance Tier
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
                <span className="text-base font-extrabold text-teal-800 dark:text-teal-200">Cadence Primed</span>
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
                    Next Trophy:{' '}
                    <span className="font-bold text-slate-900 dark:text-white">
                      {nextSpeedMilestone.title} ({nextSpeedMilestone.targetValue} WPM)
                    </span>{' '}
                    • Need +{Math.max(1, nextSpeedMilestone.targetValue - result.wpm)} WPM
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

        {/* Secondary Detailed Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Raw Speed</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {result.rawWpm} WPM
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Characters / Min</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {result.cpm} CPM
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Consistency</span>
            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {result.consistencyScore}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">Vs Best</span>
            <span
              className={`text-base font-bold tabular-nums ${
                diffFromBest >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {diffFromBest >= 0 ? `+${diffFromBest} WPM` : `${diffFromBest} WPM`}
            </span>
          </div>
        </div>

        {/* Leaderboard Submission Widget */}
        {!result.isWarmup && (
          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Submit to Speed Leaderboard</span>
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {submittedRank
                  ? `✓ You are officially ranked #${submittedRank} globally!`
                  : 'Register your WPM on the public leaderboard.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!submittedRank ? (
                <>
                  <input
                    type="text"
                    value={playerNickname}
                    onChange={(e) => setPlayerNickname(e.target.value)}
                    placeholder="Your nickname"
                    className="px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-32"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSubmitScore}
                    isLoading={isSubmittingScore}
                    loadingText="Submitting..."
                    leftIcon={<UserCheck className="w-3.5 h-3.5 text-blue-500" />}
                  >
                    Submit
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-black border border-amber-500/30">
                    Rank #{submittedRank}
                  </span>
                  {onViewLeaderboard && (
                    <Button variant="ghost" size="xs" onClick={onViewLeaderboard}>
                      View Board →
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Branding Footer for export */}
        <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
          Typing Speed Test • {new Date(result.timestamp).toLocaleDateString()}
        </div>
      </div>

      {/* Newly Unlocked Trophies Banner */}
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
              <Button variant="outline" size="xs" onClick={onViewTrophies} rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                Trophies Room
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {newlyUnlockedAchievements.map((ach) => (
              <TrophyCard key={ach.id} achievement={ach} isNew={true} />
            ))}
          </div>
        </div>
      )}

      {/* Visual Keyboard Heatmap */}
      <KeyboardLayout
        singleResult={result}
        title="Session Keystroke Accuracy"
        subtitle="Visual key breakdown for this specific typing session"
      />

      {/* Action Buttons with Universal Button States */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {result.isWarmup ? (
          <>
            <Button
              variant="primary"
              size="md"
              onClick={onStartTest || onTryAgain}
              leftIcon={<Play className="w-4 h-4 fill-white" />}
            >
              Full Test
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={onStartWarmup || onTryAgain}
              leftIcon={<RotateCcw className="w-4 h-4 text-teal-600" />}
            >
              Warm Again
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="primary"
              size="md"
              onClick={onTryAgain}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Try Again
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={onNewTest}
              leftIcon={<Zap className="w-4 h-4 text-amber-500" />}
            >
              Configure
            </Button>
          </>
        )}

        {/* Copy Result */}
        <Button
          variant="outline"
          size="md"
          onClick={handleCopyResult}
          isSuccess={hasCopied}
          successText="Copied!"
          leftIcon={<Copy className="w-4 h-4 text-blue-500" />}
        >
          Copy
        </Button>

        {/* Download Image Card */}
        <Button
          variant="outline"
          size="md"
          onClick={handleShareScreenshot}
          isLoading={isExporting}
          loadingText="Generating..."
          leftIcon={<Share2 className="w-4 h-4 text-indigo-500" />}
        >
          Image Card
        </Button>

        {/* History */}
        <Button
          variant="outline"
          size="md"
          onClick={onViewHistory}
          className="col-span-2 sm:col-span-1"
          leftIcon={<History className="w-4 h-4 text-emerald-500" />}
        >
          History
        </Button>
      </div>
    </div>
  );
};
