import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { UserPreferences, TestResult } from '../types';
import {
  calculateAdjustedWPM,
  calculateRawWPM,
  calculateAccuracy,
  calculateCPM,
  calculateConsistency,
  getRhythmRating,
} from '../utils/calculations';
import { soundEngine } from '../services/soundEngine';
import { generateTargetText, generateWarmupText } from '../services/textGenerator';
import {
  RotateCcw,
  X,
  AlertTriangle,
  Sparkles,
  Target,
  Check,
  Clock,
  Activity,
  Volume2,
  VolumeX,
  Waves,
  HeartPulse,
} from 'lucide-react';

interface ActiveTestScreenProps {
  preferences: UserPreferences;
  isWarmupMode?: boolean;
  onCompleteTest: (result: TestResult) => void;
  onCancelTest: () => void;
  onShowToast: (message: string, type: 'warning' | 'info') => void;
}

export const ActiveTestScreen: React.FC<ActiveTestScreenProps> = ({
  preferences,
  isWarmupMode = false,
  onCompleteTest,
  onCancelTest,
  onShowToast,
}) => {
  const effectiveDuration = isWarmupMode ? 30 : preferences.testDuration;
  const [targetText, setTargetText] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(effectiveDuration);
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [targetReachedAlert, setTargetReachedAlert] = useState<boolean>(false);
  const [metronomeAudio, setMetronomeAudio] = useState<boolean>(false);
  const hasTriggeredTargetAlertRef = useRef<boolean>(false);

  // Timing tracking per character for consistency calculation
  const charTimingsRef = useRef<number[]>([]);
  const lastKeyTimeRef = useRef<number | null>(null);

  // Keep refs for mutable values to prevent closure bugs during async timers
  const typedTextRef = useRef<string>(typedText);
  typedTextRef.current = typedText;

  const targetTextRef = useRef<string>(targetText);
  targetTextRef.current = targetText;

  // Key accuracy stats tracking
  const keyStatsRef = useRef<Record<string, { total: number; errors: number }>>({});

  // Focus and container refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  // Stats calculation
  const totalTyped = typedText.length;
  let correctCount = 0;
  let errorCount = 0;

  for (let i = 0; i < totalTyped; i++) {
    if (typedText[i] === targetText[i]) {
      correctCount++;
    } else {
      errorCount++;
    }
  }

  const liveWpm = calculateAdjustedWPM(correctCount, Math.max(1, elapsedSeconds));
  const liveAccuracy = calculateAccuracy(correctCount, totalTyped);

  // Live Rhythm / Consistency calculation based on recent keystrokes
  const liveRhythmConsistency = useMemo(() => {
    if (charTimingsRef.current.length < 3) return null;
    return calculateConsistency(charTimingsRef.current.slice(-12));
  }, [typedText.length]);

  const liveRhythm = liveRhythmConsistency !== null ? getRhythmRating(liveRhythmConsistency) : null;

  // Metronome cadence audio tick loop
  useEffect(() => {
    if (!startTime || !metronomeAudio) return;

    // 60 BPM cadence = 1 tick every 1000ms
    const interval = setInterval(() => {
      soundEngine.playMetronomeTick(false);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, metronomeAudio]);

  // Finish test callback reading from refs to avoid stale closure state
  const finishTest = useCallback((endTime: number, totalElapsed: number, textToEvaluate?: string) => {
    const textToScore = textToEvaluate !== undefined ? textToEvaluate : typedTextRef.current;
    const currentTarget = targetTextRef.current;
    const finalTotalTyped = textToScore.length;

    let finalCorrect = 0;
    let finalIncorrect = 0;

    for (let i = 0; i < finalTotalTyped; i++) {
      if (textToScore[i] === currentTarget[i]) {
        finalCorrect++;
      } else {
        finalIncorrect++;
      }
    }

    const elapsedSec = Math.max(1, totalElapsed);
    const finalWpm = calculateAdjustedWPM(finalCorrect, elapsedSec);
    const finalRawWpm = calculateRawWPM(finalTotalTyped, elapsedSec);
    const finalCpm = calculateCPM(finalTotalTyped, elapsedSec);
    const finalAccuracy = calculateAccuracy(finalCorrect, finalTotalTyped);
    const consistency = calculateConsistency(charTimingsRef.current);
    const rhythmRating = getRhythmRating(consistency);

    const avgCharTimeMs = charTimingsRef.current.length > 0
      ? Math.round(charTimingsRef.current.reduce((a, b) => a + b, 0) / charTimingsRef.current.length)
      : 0;

    const testId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const result: TestResult = {
      testId,
      timestamp: endTime,
      duration: Math.round(elapsedSec),
      difficulty: isWarmupMode ? 'easy' : preferences.difficultyLevel,
      textType: isWarmupMode ? 'paragraph' : preferences.textType,
      isWarmup: isWarmupMode,
      rhythmRating: rhythmRating.label,
      totalCharactersTyped: finalTotalTyped,
      correctCharacters: finalCorrect,
      incorrectCharacters: finalIncorrect,
      totalWords: Math.round(finalTotalTyped / 5),
      correctWords: Math.round(finalCorrect / 5),
      wpm: finalWpm,
      rawWpm: finalRawWpm,
      cpm: finalCpm,
      accuracy: finalAccuracy,
      errors: finalIncorrect,
      averageCharTimeMs: avgCharTimeMs,
      consistencyScore: consistency,
      isPersonalBest: false,
      keyStats: keyStatsRef.current,
    };

    if (isWarmupMode) {
      soundEngine.playWarmupCompletionChime();
    } else {
      soundEngine.playSuccessChime(false);
    }
    onCompleteTest(result);
  }, [isWarmupMode, preferences.difficultyLevel, preferences.textType, onCompleteTest]);

  // Keep finishTestRef in sync
  const finishTestRef = useRef(finishTest);
  finishTestRef.current = finishTest;

  // Generate target text on mount
  useEffect(() => {
    let text = '';
    if (isWarmupMode) {
      text = generateWarmupText();
    } else {
      text = generateTargetText(
        preferences.difficultyLevel,
        preferences.textType,
        Math.max(120, preferences.testDuration * 3)
      );
    }
    setTargetText(text);
    inputRef.current?.focus();
  }, [isWarmupMode, preferences.difficultyLevel, preferences.textType, preferences.testDuration]);

  // Main test timer loop
  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      setElapsedSeconds(elapsed);

      const remaining = Math.max(0, effectiveDuration - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        finishTestRef.current(now, elapsed);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [startTime, effectiveDuration]);

  // Keep active character scrolled into view smoothly
  useEffect(() => {
    if (currentCharRef.current) {
      currentCharRef.current.scrollIntoView({
        behavior: preferences.reduceMotion ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [typedText, preferences.reduceMotion]);

  // Handle typing input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const now = Date.now();

    const effectiveStartTime = startTime || now;

    // First keypress starts timer
    if (!startTime) {
      setStartTime(now);
    } else if (lastKeyTimeRef.current) {
      const diff = now - lastKeyTimeRef.current;
      charTimingsRef.current.push(diff);
    }
    lastKeyTimeRef.current = now;

    // Check if correct or error for sound effect & track key stats
    const newCharIndex = value.length - 1;
    if (value.length > typedText.length && newCharIndex >= 0) {
      const typedChar = value[newCharIndex];
      const targetChar = targetText[newCharIndex];

      if (targetChar) {
        const keyKey = targetChar.toLowerCase();
        if (!keyStatsRef.current[keyKey]) {
          keyStatsRef.current[keyKey] = { total: 0, errors: 0 };
        }
        keyStatsRef.current[keyKey].total += 1;
        if (typedChar !== targetChar) {
          keyStatsRef.current[keyKey].errors += 1;
        }
      }

      if (typedChar === targetChar) {
        if (isWarmupMode) {
          soundEngine.playWarmupKeyClick();
        } else {
          soundEngine.playKeyClick();
        }
      } else {
        if (isWarmupMode) {
          // Soft mellow click in warm-up rather than buzzer
          soundEngine.playWarmupKeyClick();
        } else {
          soundEngine.playErrorSound();
        }
      }
    }

    setTypedText(value);

    // Auto-finish if user types the complete target text before time expires
    if (value.length >= targetText.length && targetText.length > 0) {
      const elapsed = Math.max(0.1, (now - effectiveStartTime) / 1000);
      finishTest(now, elapsed, value);
    }
  };

  // Prevent paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    onShowToast('Copy & paste is disabled during the test!', 'warning');
  };

  // Global Keydown (Esc to confirm exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowExitConfirm(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Timer bar color logic
  const percentElapsed = ((effectiveDuration - timeRemaining) / effectiveDuration) * 100;
  let progressColor = isWarmupMode ? 'bg-teal-500' : 'bg-emerald-500';
  if (!isWarmupMode) {
    if (percentElapsed > 66) {
      progressColor = 'bg-rose-500';
    } else if (percentElapsed > 33) {
      progressColor = 'bg-amber-500';
    }
  }

  // Passage completion progress calculation
  const targetLength = targetText.length;
  const passageProgressPercent = targetLength > 0
    ? Math.min(100, Math.round((typedText.length / targetLength) * 100))
    : 0;
  const passageProgressFraction = targetLength > 0
    ? Math.min(1, typedText.length / targetLength)
    : 0;
  const circleRadius = 19;
  const circleCircumference = 2 * Math.PI * circleRadius; // ~119.38
  const strokeDashoffset = circleCircumference - (passageProgressFraction * circleCircumference);

  // Font size class mapping
  let fontClass = 'text-xl sm:text-2xl leading-relaxed';
  if (preferences.fontSize === 'small') fontClass = 'text-lg sm:text-xl leading-relaxed';
  if (preferences.fontSize === 'large') fontClass = 'text-2xl sm:text-3xl leading-loose';

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in relative cursor-text min-h-[75vh]"
    >
      {/* Warm-up Mode Active Guidance & Rhythm Header */}
      {isWarmupMode && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/15 border border-teal-500/30 dark:border-teal-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-teal-800 dark:text-teal-300">
                  🌿 Warm-up Mode (30s)
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-200/60 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200">
                  Low Pressure • Rhythm Cadence
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Focus on steady, even keystrokes rather than speed. Loosen your wrists and let words flow.
              </p>
            </div>
          </div>

          {/* Cadence Rhythm Indicator & Metronome Audio Toggle */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {liveRhythm ? (
              <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${liveRhythm.bg} ${liveRhythm.borderColor} ${liveRhythm.color} flex items-center gap-1.5 shadow-2xs`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{liveRhythm.badge} ({liveRhythmConsistency}%)</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/60 dark:bg-slate-800/60 border border-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center gap-1.5">
                <Waves className="w-3.5 h-3.5 animate-pulse" />
                <span>Finding Cadence...</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMetronomeAudio((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                metronomeAudio
                  ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                  : 'bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Toggle soft metronome audio ticks for cadence pacing"
            >
              {metronomeAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Metronome</span>
            </button>
          </div>
        </div>
      )}

      {/* Timer Bar & Controls with Circular Passage Progress */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md flex flex-col gap-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4 font-mono text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200">
          {/* Left: Time Remaining */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-xl ${
              isWarmupMode
                ? 'bg-teal-50 dark:bg-teal-950/50 border border-teal-100 dark:border-teal-900/50 text-teal-600 dark:text-teal-400'
                : 'bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400'
            } shrink-0`}>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold block font-sans">
                {isWarmupMode ? 'Warm-up' : 'Time'}
              </span>
              <span className={`text-base sm:text-xl font-extrabold font-mono leading-tight ${
                isWarmupMode ? 'text-teal-600 dark:text-teal-400' : 'text-blue-600 dark:text-blue-400'
              }`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          {/* Center: Circular Progress Indicator for Passage Completion */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 px-3 sm:px-4 py-1.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
            role="progressbar"
            aria-valuenow={passageProgressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Passage completion progress"
            title={`Passage Completion: ${passageProgressPercent}% (${typedText.length} of ${targetLength} characters)`}
          >
            {/* Circular Progress Ring */}
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
              <svg className="w-11 h-11 sm:w-12 sm:h-12 -rotate-90 transform" viewBox="0 0 48 48">
                <defs>
                  <linearGradient id="passageProgressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isWarmupMode ? '#2dd4bf' : '#38bdf8'} />
                    <stop offset="50%" stopColor={isWarmupMode ? '#0d9488' : '#2563eb'} />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                {/* Background Track */}
                <circle
                  cx="24"
                  cy="24"
                  r={circleRadius}
                  strokeWidth="4"
                  className="stroke-slate-200 dark:stroke-slate-700/60"
                  fill="transparent"
                />
                {/* Dynamic Progress Fill */}
                <circle
                  cx="24"
                  cy="24"
                  r={circleRadius}
                  strokeWidth="4"
                  stroke={passageProgressPercent === 100 ? '#10b981' : 'url(#passageProgressGrad)'}
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={circleCircumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-150 ease-out"
                />
              </svg>

              {/* Center Value */}
              <div className="absolute inset-0 flex items-center justify-center font-mono">
                {passageProgressPercent === 100 ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                ) : (
                  <span className="text-[10px] sm:text-xs font-black text-slate-800 dark:text-slate-100 tracking-tighter">
                    {passageProgressPercent}%
                  </span>
                )}
              </div>
            </div>

            {/* Label & Detailed Counts */}
            <div className="text-left font-sans">
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Passage
                </span>
                {passageProgressPercent === 100 && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                )}
              </div>
              <div className="text-xs sm:text-sm font-mono font-extrabold text-slate-700 dark:text-slate-200 leading-tight">
                {typedText.length}
                <span className="text-slate-400 font-normal text-[10px] sm:text-xs">/{targetLength}</span>
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => {
                setTypedText('');
                setStartTime(null);
                setElapsedSeconds(0);
                setTimeRemaining(effectiveDuration);
                charTimingsRef.current = [];
                keyStatsRef.current = {};
                lastKeyTimeRef.current = null;
                hasTriggeredTargetAlertRef.current = false;
                setTargetReachedAlert(false);
                if (isWarmupMode) {
                  setTargetText(generateWarmupText());
                }
                inputRef.current?.focus();
              }}
              className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Restart Test"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Cancel Test (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Countdown Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${progressColor}`}
            style={{ width: `${Math.min(100, percentElapsed)}%` }}
          />
        </div>
      </div>

      {/* Target WPM Goal Reached Subtle Alert Banner */}
      {targetReachedAlert && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/80 dark:border-emerald-400 shadow-md flex items-center justify-between text-emerald-900 dark:text-emerald-100 animate-fade-in transition-all">
          <div className="flex items-center gap-2.5 font-sans">
            <span className="p-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="font-extrabold text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400 inline" />
                Target WPM Goal Reached!
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium block sm:inline sm:ml-2">
                Speed hit {liveWpm} WPM (Target: {preferences.targetWpm} WPM)
              </span>
            </div>
          </div>
          <button
            onClick={() => setTargetReachedAlert(false)}
            className="p-1.5 rounded-xl hover:bg-emerald-200/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition-colors"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Target Text Display Container */}
      <div
        ref={textContainerRef}
        onClick={() => inputRef.current?.focus()}
        className={`relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/90 border-2 ${
          preferences.highContrastMode
            ? 'border-blue-600 dark:border-blue-400'
            : 'border-slate-200 dark:border-slate-700'
        } shadow-xl max-h-[300px] overflow-y-auto select-none font-mono cursor-text ${fontClass}`}
      >
        {/* Hidden input field capturing keystrokes on desktop & touch devices */}
        <textarea
          ref={inputRef}
          value={typedText}
          onChange={handleInputChange}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer resize-none font-mono text-transparent bg-transparent focus:outline-none"
          autoFocus
          inputMode="text"
          enterKeyHint="done"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
        />

        {!startTime && (
          <div className="mb-4 text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 animate-pulse flex items-center gap-1.5">
            <span>★</span>
            <span>{isFocused ? 'Start typing to begin timer...' : 'Tap here to focus & start typing...'}</span>
          </div>
        )}

        <div className="break-words whitespace-pre-wrap tracking-wide relative z-0">
          {targetText.split('').map((char, index) => {
            let styleClass = 'text-slate-400 dark:text-slate-500'; // untyped
            const isCurrent = index === typedText.length;

            if (index < typedText.length) {
              if (typedText[index] === char) {
                styleClass = 'text-emerald-600 dark:text-emerald-400 font-semibold';
              } else {
                styleClass = 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 rounded px-0.5 font-bold';
              }
            }

            return (
              <span
                key={index}
                ref={isCurrent ? currentCharRef : null}
                className={`relative transition-colors ${styleClass} ${
                  isCurrent
                    ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500 rounded px-0.5 animate-pulse'
                    : ''
                }`}
              >
                {char}
              </span>
            );
          })}
        </div>
      </div>

      {/* Tap to focus button for mobile devices when blurred */}
      {!isFocused && (
        <button
          onClick={() => inputRef.current?.focus()}
          className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer animate-pulse transition-all"
        >
          <span>📱 Tap here to open virtual keyboard & start test</span>
        </button>
      )}

      {/* Live Stats Bar */}
      {preferences.showLiveStats && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-4 gap-2 text-center font-mono">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {isWarmupMode ? 'Cadence' : 'Live WPM'}
            </div>
            <div className={`text-xl font-extrabold ${
              isWarmupMode ? 'text-teal-600 dark:text-teal-400' : 'text-blue-600 dark:text-blue-400'
            }`}>
              {isWarmupMode
                ? (liveRhythmConsistency !== null ? `${liveRhythmConsistency}%` : '100%')
                : liveWpm}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {isWarmupMode ? 'Live Pace' : 'Accuracy'}
            </div>
            <div className={`text-xl font-extrabold ${
              isWarmupMode ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {isWarmupMode ? `${liveWpm} WPM` : `${liveAccuracy}%`}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {isWarmupMode ? 'Accuracy' : 'Errors'}
            </div>
            <div className={`text-xl font-extrabold ${
              isWarmupMode ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              {isWarmupMode ? `${liveAccuracy}%` : errorCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Typed</div>
            <div className="text-xl font-extrabold text-slate-800 dark:text-slate-200">{totalTyped}</div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Test?</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your test progress will not be saved. Are you sure you want to exit?
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors"
              >
                Resume
              </button>
              <button
                onClick={onCancelTest}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold text-white text-sm transition-colors"
              >
                Exit Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
