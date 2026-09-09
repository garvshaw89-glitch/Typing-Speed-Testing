import React, { useEffect, useState } from 'react';
import { UserPreferences } from '../types';
import { soundEngine } from '../services/soundEngine';
import { X } from 'lucide-react';

interface PreparationScreenProps {
  preferences: UserPreferences;
  isWarmupMode?: boolean;
  onCountdownComplete: () => void;
  onCancel: () => void;
}

export const PreparationScreen: React.FC<PreparationScreenProps> = ({
  preferences,
  isWarmupMode = false,
  onCountdownComplete,
  onCancel,
}) => {
  const [count, setCount] = useState<number>(3);
  const [isGo, setIsGo] = useState<boolean>(false);

  useEffect(() => {
    // Escape key listener to cancel
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    soundEngine.playCountdownBeep(false);

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          setIsGo(true);
          soundEngine.playCountdownBeep(true);
          setTimeout(() => {
            onCountdownComplete();
          }, 600);
          return 0;
        }
        const next = prev - 1;
        soundEngine.playCountdownBeep(false);
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel, onCountdownComplete]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center animate-fade-in">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6 relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          title="Cancel countdown (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            {isWarmupMode ? '🌿 Warm-up Session' : 'Get Ready To Type!'}
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isWarmupMode
              ? '30s • Relax your hands and focus on steady rhythm'
              : `${preferences.testDuration}s • ${preferences.difficultyLevel} • ${preferences.textType}`}
          </p>
        </div>

        {/* Big Countdown Number */}
        <div className="py-8 min-h-[160px] flex items-center justify-center">
          {isGo ? (
            <span className="text-7xl sm:text-8xl font-black text-emerald-500 animate-bounce tracking-tight">
              GO!
            </span>
          ) : (
            <span
              key={count}
              className="text-7xl sm:text-8xl font-black text-blue-600 dark:text-blue-400 animate-ping-once tracking-tight"
            >
              {count}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-400 dark:text-slate-500 italic">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border text-slate-700 dark:text-slate-300">Esc</kbd> anytime to cancel
        </p>
      </div>
    </div>
  );
};
