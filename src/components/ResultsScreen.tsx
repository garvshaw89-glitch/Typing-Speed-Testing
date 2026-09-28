import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Achievement, TestResult, UserStats, UserPreferences } from '../types';
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
  ChevronRight,
  Target,
  Activity,
  Play,
  Copy,
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
  preferences?: UserPreferences;
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

function useCountUp(target: number, durationMs = 600) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
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
  preferences,
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

  const animatedWpm = useCountUp(result.wpm, 700);
  const animatedAccuracy = useCountUp(Math.round(result.accuracy), 700);
  const animatedChars = useCountUp(result.totalCharactersTyped, 600);
  const animatedErrors = useCountUp(result.errors, 500);

  const rating = getPerformanceRating(result.wpm);
  const rhythmRating = getRhythmRating(result.consistencyScore);
  const diffFromBest = stats.bestWpm > 0 ? result.wpm - stats.bestWpm : 0;

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

  useEffect(() => {
    if (result.isPersonalBest || newlyUnlockedAchievements.length > 0) {
      try {
        confetti({
          particleCount: newlyUnlockedAchievements.length > 0 ? 100 : 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6C8CFF', '#8A6CFF', '#34D399', '#FBBF24'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [result.isPersonalBest, newlyUnlockedAchievements.length]);

  const handleCopyResult = async () => {
    const text = `⚡ TYPE/ Result: ${result.wpm} WPM | ${result.accuracy}% Precision | ${result.duration}s | Rating: ${rating.title}`;
    try {
      await navigator.clipboard.writeText(text);
      setHasCopied(true);
      onShowToast('Result telemetry copied to clipboard!', 'success');
      setTimeout(() => setHasCopied(false), 2500);
    } catch {
      onShowToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleShareScreenshot = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, quality: 0.95 });
      const link = document.createElement('a');
      link.download = `type-flow-${result.wpm}wpm-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = dataUrl;
      link.click();
      onShowToast('Laboratory certificate downloaded!', 'success');
    } catch (e) {
      console.error('Failed to export image', e);
      onShowToast('Failed to generate image certification.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

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

  const progressionData = useMemo(() => {
    if (result.wpmProgression && result.wpmProgression.length > 2) {
      return result.wpmProgression;
    }
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
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in select-none">
      {/* Precision Instrument Certificate Container */}
      <div
        ref={cardRef}
        className="p-6 sm:p-10 rounded-3xl bg-[#090A0C] border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-8 relative overflow-hidden backdrop-blur-2xl"
      >
        {/* Personal Best Ribbon */}
        {result.isPersonalBest && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs uppercase tracking-widest animate-pulse">
            <Trophy className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>NEW PERSONAL RECORD</span>
          </div>
        )}

        {/* Certificate Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#15181D] border border-white/[0.06] text-[10px] font-mono tracking-widest text-[#686B72] uppercase">
            <span>CALIBRATION PROTOCOL COMPLETED</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-display font-black text-[#F5F5F0] tracking-tight uppercase">
            {result.isWarmup ? 'Cadence Primed' : 'Telemetry Summary'}
          </h2>
          <p className="text-xs font-mono text-[#A5A7AC]">
            {result.duration}S DURATION · {result.difficulty.toUpperCase()} · {result.textType.toUpperCase()}
            {result.mode && ` · ${result.mode.toUpperCase()} MODE`}
          </p>
        </div>

        {/* Editorial Performance Readout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 rounded-2xl bg-[#101216] border border-white/[0.06] text-center font-mono">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#686B72] tracking-widest">
              SPEED
            </div>
            <div className="text-3xl sm:text-5xl font-black font-mono-num text-[#6C8CFF] tabular-nums">
              {animatedWpm}
            </div>
            <div className="text-[10px] text-[#A5A7AC]">WORDS/MIN</div>
          </div>

          <div className="space-y-1 sm:border-l sm:border-white/[0.06] sm:pl-4">
            <div className="text-[10px] uppercase font-bold text-[#686B72] tracking-widest">
              PRECISION
            </div>
            <div className="text-3xl sm:text-5xl font-black font-mono-num text-emerald-400 tabular-nums">
              {result.accuracy}%
            </div>
            <div className="text-[10px] text-[#A5A7AC]">ACCURACY</div>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/[0.06] pt-3 sm:pt-0 sm:pl-4">
            <div className="text-[10px] uppercase font-bold text-[#686B72] tracking-widest">
              DEVIATIONS
            </div>
            <div className="text-3xl sm:text-5xl font-black font-mono-num text-[#FF6B6B] tabular-nums">
              {animatedErrors}
            </div>
            <div className="text-[10px] text-[#A5A7AC]">ERRORS</div>
          </div>

          <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/[0.06] pt-3 sm:pt-0 sm:pl-4">
            <div className="text-[10px] uppercase font-bold text-[#686B72] tracking-widest">
              OUTPUT
            </div>
            <div className="text-3xl sm:text-5xl font-black font-mono-num text-[#F5F5F0] tabular-nums">
              {animatedChars}
            </div>
            <div className="text-[10px] text-[#A5A7AC]">CHARACTERS</div>
          </div>
        </div>

        {/* Real-time WPM Progression Curve */}
        {!result.isWarmup && progressionData.length > 2 && (
          <div className="p-5 rounded-2xl bg-[#101216] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#F5F5F0] font-semibold flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-[#6C8CFF]" />
                <span>SPEED PROGRESSION CURVE</span>
              </span>
              <span className="text-[#686B72] text-[11px] tabular-nums">
                PEAK: {Math.max(...progressionData.map((p) => p.wpm))} WPM
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressionData} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="laboratoryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C8CFF" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6C8CFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.06} stroke="#ffffff" />
                  <XAxis dataKey="second" tickFormatter={(s) => `${s}s`} tick={{ fontSize: 10, fill: '#686B72' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#686B72' }} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101216',
                      borderRadius: '12px',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                    formatter={(val: number) => [`${val} WPM`, 'Speed']}
                    labelFormatter={(s) => `Second ${s}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="wpm"
                    stroke="#6C8CFF"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#laboratoryGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Rating Banner */}
        <div className="p-4 rounded-2xl bg-[#101216] border border-white/[0.06] flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#15181D] border border-white/[0.08] text-[#6C8CFF] flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-display font-bold text-[#F5F5F0]">{rating.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#6C8CFF]/10 text-[#6C8CFF] border border-[#6C8CFF]/20">
                CALIBRATED TIER
              </span>
            </div>
            <p className="text-xs font-mono text-[#A5A7AC] mt-0.5">{rating.message}</p>
          </div>
        </div>

        {/* Secondary Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#101216] border border-white/[0.06]">
            <span className="text-[#686B72] block">RAW WPM</span>
            <span className="text-base font-bold text-[#F5F5F0] tabular-nums">{result.rawWpm}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#101216] border border-white/[0.06]">
            <span className="text-[#686B72] block">CPM</span>
            <span className="text-base font-bold text-[#F5F5F0] tabular-nums">{result.cpm}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#101216] border border-white/[0.06]">
            <span className="text-[#686B72] block">CADENCE STABILITY</span>
            <span className="text-base font-bold text-[#6C8CFF] tabular-nums">{result.consistencyScore}%</span>
          </div>

          <div className="p-3 rounded-xl bg-[#101216] border border-white/[0.06]">
            <span className="text-[#686B72] block">PAUSES</span>
            <span className="text-base font-bold text-[#A5A7AC] tabular-nums">{result.pauseCount ?? 0}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#101216] border border-white/[0.06] col-span-2 sm:col-span-1">
            <span className="text-[#686B72] block">VS RECORD</span>
            <span className={`text-base font-bold tabular-nums ${diffFromBest >= 0 ? 'text-emerald-400' : 'text-[#A5A7AC]'}`}>
              {diffFromBest >= 0 ? `+${diffFromBest} WPM` : `${diffFromBest} WPM`}
            </span>
          </div>
        </div>

        {/* Global Leaderboard Submission */}
        {!result.isWarmup && (
          <div className="p-4 rounded-2xl bg-[#101216] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-xs font-mono font-bold text-[#F5F5F0] flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>SUBMIT TO GLOBAL LEADERBOARD</span>
              </span>
              <p className="text-[11px] font-mono text-[#686B72]">
                {submittedRank
                  ? `Officially recorded at rank #${submittedRank}!`
                  : 'Register verified speed into global telemetry.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {!submittedRank ? (
                <>
                  <input
                    type="text"
                    value={playerNickname}
                    onChange={(e) => setPlayerNickname(e.target.value)}
                    placeholder="Nickname"
                    className="px-3 py-2 text-xs font-mono rounded-xl bg-[#090A0C] border border-white/[0.1] text-[#F5F5F0] focus:outline-none focus:border-[#6C8CFF] w-36"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmitScore}
                    isLoading={isSubmittingScore}
                    loadingText="Submitting..."
                    leftIcon={<UserCheck className="w-3.5 h-3.5 text-white" />}
                  >
                    Submit
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-mono font-bold border border-amber-500/20">
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

        <div className="pt-2 text-center text-[10px] font-mono text-[#686B72] border-t border-white/[0.05]">
          TYPE/ INSTRUMENT LABORATORY • {new Date(result.timestamp).toLocaleDateString()}
        </div>
      </div>

      {/* Newly Unlocked Trophies Banner */}
      {newlyUnlockedAchievements.length > 0 && (
        <div className="p-6 rounded-3xl bg-[#090A0C] border border-amber-500/30 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5 fill-black" />
              </div>
              <div>
                <h3 className="text-base font-display font-bold text-[#F5F5F0]">
                  {newlyUnlockedAchievements.length === 1
                    ? 'Trophy Milestone Achieved'
                    : `${newlyUnlockedAchievements.length} Trophies Unlocked`}
                </h3>
                <p className="text-xs font-mono text-[#A5A7AC]">
                  Precision benchmark attained during this test.
                </p>
              </div>
            </div>

            {onViewTrophies && (
              <Button variant="outline" size="xs" onClick={onViewTrophies} rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                Showcase
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
        title="Session Keystroke Telemetry"
        subtitle="Per-key accuracy matrix and confusion patterns"
        initialPalette={preferences?.keyboardHeatmapPalette}
        activeColor={preferences?.keyboardActiveColor}
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
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
              leftIcon={<RotateCcw className="w-4 h-4 text-[#8A6CFF]" />}
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
              leftIcon={<Zap className="w-4 h-4 text-amber-400" />}
            >
              Configure
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size="md"
          onClick={handleCopyResult}
          isSuccess={hasCopied}
          successText="Copied!"
          leftIcon={<Copy className="w-4 h-4 text-[#6C8CFF]" />}
        >
          Copy
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={handleShareScreenshot}
          isLoading={isExporting}
          loadingText="Generating..."
          leftIcon={<Share2 className="w-4 h-4 text-[#8A6CFF]" />}
        >
          Image Card
        </Button>

        <Button
          variant="outline"
          size="md"
          onClick={onViewHistory}
          className="col-span-2 sm:col-span-1"
          leftIcon={<History className="w-4 h-4 text-emerald-400" />}
        >
          History
        </Button>
      </div>
    </div>
  );
};
