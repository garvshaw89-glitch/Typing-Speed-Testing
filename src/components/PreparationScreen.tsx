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
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center animate-fade-in my-auto select-none">
      <div className="max-w-md w-full p-8 sm:p-10 rounded-3xl bg-[#090A0C] border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.8)] space-y-6 relative backdrop-blur-xl">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-10 h-10 rounded-xl text-[#686B72] hover:text-[#F5F5F0] hover:bg-white/[0.04] transition-colors flex items-center justify-center cursor-pointer"
          title="Abort calibration (Esc)"
          aria-label="Cancel countdown"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#15181D] border border-white/[0.06] text-[10px] font-mono tracking-widest text-[#6C8CFF] uppercase">
            <span>CALIBRATION SEQUENCE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#F5F5F0] uppercase tracking-tight">
            {isWarmupMode ? 'Cadence Warm-up' : 'Initialize Flow'}
          </h2>
          <p className="text-xs font-mono text-[#A5A7AC]">
            {isWarmupMode
              ? '30s · Settle fingers on home row and breathe'
              : `${preferences.testDuration}s · ${preferences.difficultyLevel.toUpperCase()} · ${preferences.textType.toUpperCase()}`}
          </p>
        </div>

        {/* Big Countdown Number */}
        <div className="py-8 min-h-[160px] flex items-center justify-center">
          {isGo ? (
            <span className="text-7xl sm:text-9xl font-mono font-black text-emerald-400 drop-shadow-[0_0_35px_rgba(52,211,153,0.4)] tracking-tighter animate-pop-in">
              ENGAGE
            </span>
          ) : (
            <span
              key={count}
              className="text-7xl sm:text-9xl font-mono font-black text-[#6C8CFF] drop-shadow-[0_0_35px_rgba(108,140,255,0.4)] tracking-tighter animate-ping-once"
            >
              {count}
            </span>
          )}
        </div>

        <p className="text-[11px] font-mono text-[#686B72]">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[#15181D] border border-white/[0.08] text-[#A5A7AC]">ESC</kbd> to disengage
        </p>
      </div>
    </div>
  );
};
