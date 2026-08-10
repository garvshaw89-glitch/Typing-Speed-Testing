import React, { useEffect, useRef, useState } from 'react';
import { TestResult, UserStats } from '../types';
import { getPerformanceRating } from '../utils/calculations';
import { KeyboardLayout } from './KeyboardLayout';
import { Trophy, RotateCcw, Share2, History, ArrowLeft, Award, Zap, CheckCircle, AlertOctagon, Keyboard } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toPng } from 'html-to-image';

interface ResultsScreenProps {
  result: TestResult;
  stats: UserStats;
  onTryAgain: () => void;
  onNewTest: () => void;
  onViewHistory: () => void;
  onShowToast: (message: string, type: 'success' | 'error') => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  result,
  stats,
  onTryAgain,
  onNewTest,
  onViewHistory,
  onShowToast,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const rating = getPerformanceRating(result.wpm);
  const diffFromBest = stats.bestWpm > 0 ? result.wpm - stats.bestWpm : 0;

  // Trigger confetti if personal best!
  useEffect(() => {
    if (result.isPersonalBest) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore confetti error if unavailable
      }
    }
  }, [result.isPersonalBest]);

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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Test Complete!
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {result.duration}s Test • {result.difficulty} • {result.textType}
          </p>
        </div>

        {/* Primary Scores Grid */}
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

        {/* Performance Rating Badge */}
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

      {/* Visual Keyboard Struggle Keys Heatmap */}
      <KeyboardLayout
        singleResult={result}
        title="Test Struggle Keys Analysis"
        subtitle="Visual key breakdown for this specific typing session"
      />

      {/* Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onTryAgain}
          className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again</span>
        </button>

        <button
          onClick={onNewTest}
          className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>New Settings</span>
        </button>

        <button
          onClick={onViewHistory}
          className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <History className="w-4 h-4 text-blue-500" />
          <span>History</span>
        </button>

        <button
          onClick={handleShareScreenshot}
          disabled={isExporting}
          className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Share2 className="w-4 h-4 text-indigo-500" />
          <span>{isExporting ? 'Exporting...' : 'Share Image'}</span>
        </button>
      </div>
    </div>
  );
};
