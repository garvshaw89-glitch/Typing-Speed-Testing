import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { UserPreferences, TestResult, WpmProgressionPoint } from '../types';
import {
  calculateAdjustedWPM,
  calculateRawWPM,
  calculateAccuracy,
  calculateCPM,
  calculateConsistency,
  getRhythmRating,
} from '../utils/calculations';
import { soundEngine } from '../services/soundEngine';
import { generateTargetText, generateWarmupText, getRandomQuote } from '../services/textGenerator';
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
  Eye,
  EyeOff,
  Quote,
} from 'lucide-react';
import { Button } from './ui/Button';

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
  // Determine test mode and effective duration / word target
  const mode = isWarmupMode ? 'warmup' : preferences.testMode;
  const isTimeMode = mode === 'time' || isWarmupMode || mode === 'custom';
  const isWordMode = mode === 'words';
  const isQuoteMode = mode === 'quote';

  const effectiveDuration = useMemo(() => {
    if (isWarmupMode) return 30;
    if (mode === 'custom') return preferences.customDuration || 60;
    return preferences.testDuration || 60;
  }, [isWarmupMode, mode, preferences.customDuration, preferences.testDuration]);

  const targetWordCount = useMemo(() => {
    if (isWordMode) return preferences.wordCount || 50;
    return 100;
  }, [isWordMode, preferences.wordCount]);

  // Target text & quote metadata
  const [targetText, setTargetText] = useState<string>('');
  const [quoteMetadata, setQuoteMetadata] = useState<{ author?: string; source?: string }>({});
  const [typedText, setTypedText] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(effectiveDuration);
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [zenMode, setZenMode] = useState<boolean>(preferences.zenMode || false);
  const [targetReachedAlert, setTargetReachedAlert] = useState<boolean>(false);
  const [metronomeAudio, setMetronomeAudio] = useState<boolean>(false);
  const [hasErrorOnLastKeystroke, setHasErrorOnLastKeystroke] = useState<boolean>(false);

  // Real-time tracking
  const charTimingsRef = useRef<number[]>([]);
  const lastKeyTimeRef = useRef<number | null>(null);
  const progressionRef = useRef<WpmProgressionPoint[]>([]);
  const lastProgressionSecRef = useRef<number>(0);
  const hasTriggeredTargetAlertRef = useRef<boolean>(false);
  const keyStatsRef = useRef<Record<string, { total: number; errors: number }>>({});

  // Mutable refs to prevent closure bugs
  const typedTextRef = useRef<string>(typedText);
  typedTextRef.current = typedText;

  const targetTextRef = useRef<string>(targetText);
  targetTextRef.current = targetText;

  // DOM Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  // Real-time stats calculations
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

  // Smooth real-time WPM: In the first 2 seconds, stabilize values to prevent extreme spikes
  const effectiveElapsed = Math.max(1, elapsedSeconds);
  const rawLiveWpm = calculateAdjustedWPM(correctCount, effectiveElapsed);
  const liveWpm = elapsedSeconds < 1.5 && totalTyped < 8
    ? Math.min(rawLiveWpm, 65)
    : rawLiveWpm;

  const liveAccuracy = calculateAccuracy(correctCount, totalTyped);

  // Live rhythm calculation based on recent keystroke timings
  const liveRhythmConsistency = useMemo(() => {
    if (charTimingsRef.current.length < 3) return null;
    return calculateConsistency(charTimingsRef.current.slice(-12));
  }, [typedText.length]);

  const liveRhythm = liveRhythmConsistency !== null ? getRhythmRating(liveRhythmConsistency) : null;

  // Metronome tick loop (when enabled)
  useEffect(() => {
    if (!startTime || !metronomeAudio) return;
    const interval = setInterval(() => {
      soundEngine.playMetronomeTick(false);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, metronomeAudio]);

  // Finish test callback
  const finishTest = useCallback(
    (endTime: number, totalElapsed: number, textToEvaluate?: string) => {
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

      const avgCharTimeMs =
        charTimingsRef.current.length > 0
          ? Math.round(
              charTimingsRef.current.reduce((a, b) => a + b, 0) / charTimingsRef.current.length
            )
          : 0;

      const testId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const result: TestResult = {
        testId,
        timestamp: endTime,
        duration: Math.round(elapsedSec),
        difficulty: isWarmupMode ? 'easy' : preferences.difficultyLevel,
        textType: isWarmupMode ? 'paragraph' : preferences.textType,
        mode,
        targetWords: isWordMode ? targetWordCount : undefined,
        isWarmup: isWarmupMode,
        rhythmRating: rhythmRating.label,
        quoteAuthor: quoteMetadata.author,
        quoteSource: quoteMetadata.source,
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
        wpmProgression: progressionRef.current,
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
    },
    [
      isWarmupMode,
      mode,
      preferences.difficultyLevel,
      preferences.textType,
      isWordMode,
      targetWordCount,
      quoteMetadata.author,
      quoteMetadata.source,
      onCompleteTest,
    ]
  );

  const finishTestRef = useRef(finishTest);
  finishTestRef.current = finishTest;

  // Initialize target text based on mode
  const initTargetText = useCallback(() => {
    if (isWarmupMode) {
      setTargetText(generateWarmupText());
      setQuoteMetadata({});
    } else if (mode === 'quote') {
      const q = getRandomQuote();
      setTargetText(q.text);
      setQuoteMetadata({ author: q.author, source: q.source });
    } else if (mode === 'words') {
      const text = generateTargetText(
        preferences.difficultyLevel,
        'words',
        targetWordCount,
        preferences.includePunctuation,
        preferences.includeNumbers
      );
      setTargetText(text);
      setQuoteMetadata({});
    } else {
      const wordCountToGenerate = Math.max(120, effectiveDuration * 3);
      const text = generateTargetText(
        preferences.difficultyLevel,
        preferences.textType,
        wordCountToGenerate,
        preferences.includePunctuation,
        preferences.includeNumbers
      );
      setTargetText(text);
      setQuoteMetadata({});
    }
  }, [
    isWarmupMode,
    mode,
    preferences.difficultyLevel,
    preferences.textType,
    preferences.includePunctuation,
    preferences.includeNumbers,
    targetWordCount,
    effectiveDuration,
  ]);

  useEffect(() => {
    initTargetText();
    inputRef.current?.focus();
  }, [initTargetText]);

  // Main test timer loop
  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      setElapsedSeconds(elapsed);

      // Record progression data point every second
      const currentSecFloor = Math.floor(elapsed);
      if (currentSecFloor > lastProgressionSecRef.current) {
        lastProgressionSecRef.current = currentSecFloor;
        const currentTyped = typedTextRef.current.length;
        let cCount = 0;
        let eCount = 0;
        const cTarget = targetTextRef.current;
        for (let i = 0; i < currentTyped; i++) {
          if (typedTextRef.current[i] === cTarget[i]) cCount++;
          else eCount++;
        }
        const instantWpm = calculateAdjustedWPM(cCount, elapsed);
        const instantRawWpm = calculateRawWPM(currentTyped, elapsed);
        progressionRef.current.push({
          second: currentSecFloor,
          wpm: instantWpm,
          rawWpm: instantRawWpm,
          errors: eCount,
        });
      }

      // Check target WPM achievement
      if (
        preferences.targetWpm &&
        preferences.targetWpm > 0 &&
        liveWpm >= preferences.targetWpm &&
        !hasTriggeredTargetAlertRef.current &&
        elapsed > 3
      ) {
        hasTriggeredTargetAlertRef.current = true;
        setTargetReachedAlert(true);
      }

      if (isTimeMode) {
        const remaining = Math.max(0, effectiveDuration - elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          clearInterval(timer);
          finishTestRef.current(now, elapsed);
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [startTime, isTimeMode, effectiveDuration, liveWpm, preferences.targetWpm]);

  // Keep active character smoothly centered
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

    if (!startTime) {
      setStartTime(now);
    } else if (lastKeyTimeRef.current) {
      const diff = now - lastKeyTimeRef.current;
      charTimingsRef.current.push(diff);
    }
    lastKeyTimeRef.current = now;

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
        setHasErrorOnLastKeystroke(false);
        if (isWarmupMode) {
          soundEngine.playWarmupKeyClick();
        } else {
          soundEngine.playKeyClick(typedChar);
        }
      } else {
        setHasErrorOnLastKeystroke(true);
        if (isWarmupMode) {
          soundEngine.playWarmupKeyClick();
        } else {
          soundEngine.playErrorSound();
        }
      }
    } else if (value.length < typedText.length) {
      soundEngine.playBackspaceSound();
      setHasErrorOnLastKeystroke(false);
    }

    setTypedText(value);

    // Auto-finish if complete target text typed
    if (value.length >= targetText.length && targetText.length > 0) {
      const elapsed = Math.max(0.1, (now - effectiveStartTime) / 1000);
      finishTest(now, elapsed, value);
    }
  };

  // Keyboard shortcut listener: Esc to confirm exit, Tab+Enter to restart
  useEffect(() => {
    let tabPressed = false;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowExitConfirm((prev) => !prev);
      }
      if (e.key === 'Tab') {
        tabPressed = true;
      }
      if (e.key === 'Enter' && tabPressed) {
        e.preventDefault();
        handleRestart();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        tabPressed = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleRestart = () => {
    setTypedText('');
    setStartTime(null);
    setElapsedSeconds(0);
    setTimeRemaining(effectiveDuration);
    charTimingsRef.current = [];
    progressionRef.current = [];
    keyStatsRef.current = {};
    lastKeyTimeRef.current = null;
    lastProgressionSecRef.current = 0;
    hasTriggeredTargetAlertRef.current = false;
    setTargetReachedAlert(false);
    setHasErrorOnLastKeystroke(false);
    initTargetText();
    inputRef.current?.focus();
  };

  // Format time MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Progress calculations
  const targetLength = targetText.length;
  const progressPercent = targetLength > 0 ? Math.min(100, Math.round((typedText.length / targetLength) * 100)) : 0;
  const timePercentElapsed = isTimeMode ? ((effectiveDuration - timeRemaining) / effectiveDuration) * 100 : progressPercent;

  // Urgent warning when time <= 5 seconds
  const isTimeUrgent = isTimeMode && timeRemaining <= 5 && timeRemaining > 0 && startTime !== null;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in relative cursor-text min-h-[75vh] ${
        zenMode ? 'max-w-3xl' : ''
      }`}
    >
      {/* Warm-up Mode Active Guidance & Rhythm Header */}
      {isWarmupMode && !zenMode && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-500/15 via-emerald-500/10 to-teal-500/15 border border-teal-500/30 dark:border-teal-500/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
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
                  Low Pressure · Rhythm Cadence
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Focus on steady, even keystrokes rather than speed. Loosen your wrists and let words flow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {liveRhythm ? (
              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${liveRhythm.bg} ${liveRhythm.borderColor} ${liveRhythm.color} flex items-center gap-1.5`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{liveRhythm.badge}</span>
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
              title="Toggle soft metronome tick"
            >
              {metronomeAudio ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>Metronome</span>
            </button>
          </div>
        </div>
      )}

      {/* Quote Banner when Quote Mode active */}
      {isQuoteMode && quoteMetadata.author && !zenMode && (
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="font-bold">{quoteMetadata.author}</span>
            {quoteMetadata.source && (
              <>
                <span aria-hidden="true">·</span>
                <span className="italic text-indigo-600 dark:text-indigo-300">{quoteMetadata.source}</span>
              </>
            )}
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Quote Mode</span>
        </div>
      )}

      {/* Top Header Controls & Progress Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700/80 shadow-md space-y-3">
        <div className="flex items-center justify-between gap-4 font-mono">
          {/* Time or Word Metric */}
          <div className="flex items-center gap-3">
            <div
              className={`p-2 sm:p-2.5 rounded-xl ${
                isTimeUrgent
                  ? 'bg-rose-500 text-white animate-pulse'
                  : isWarmupMode
                  ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400'
                  : 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
              } shrink-0`}
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-bold block font-sans">
                {isTimeMode ? 'Time Left' : isWordMode ? 'Word Target' : 'Progress'}
              </span>
              <span
                className={`text-lg sm:text-2xl font-black font-mono leading-tight tabular-nums ${
                  isTimeUrgent
                    ? 'text-rose-600 dark:text-rose-400'
                    : isWarmupMode
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                {isTimeMode ? formatTime(timeRemaining) : `${progressPercent}%`}
              </span>
            </div>
          </div>

          {/* Quick Live Stats Pill in Header */}
          {!zenMode && (
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Live WPM</span>
                <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">{liveWpm}</span>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Accuracy</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {liveAccuracy}%
                </span>
              </div>
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Errors</span>
                <span className="text-lg font-black text-rose-600 dark:text-rose-400 tabular-nums">{errorCount}</span>
              </div>
            </div>
          )}

          {/* Controls: Zen mode, Restart, Exit */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setZenMode((z) => !z)}
              className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={zenMode ? 'Disable Zen Mode' : 'Enable Zen Distraction-Free Mode'}
            >
              {zenMode ? <Eye className="w-4 h-4 text-blue-500" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={handleRestart}
              className="p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Restart Test (Tab+Enter)"
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

        {/* Dynamic Countdown / Passage Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-100 ${
              isTimeUrgent
                ? 'bg-rose-500 animate-pulse'
                : isWarmupMode
                ? 'bg-teal-500'
                : timePercentElapsed > 66
                ? 'bg-rose-500'
                : timePercentElapsed > 33
                ? 'bg-amber-500'
                : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(100, isTimeMode ? timePercentElapsed : progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Target WPM Alert Notification */}
      {targetReachedAlert && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-500/15 border border-emerald-500/80 dark:border-emerald-400 shadow-md flex items-center justify-between text-emerald-900 dark:text-emerald-100 animate-fade-in transition-all">
          <div className="flex items-center gap-2.5 font-sans">
            <span className="p-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <span className="font-extrabold text-xs sm:text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400 inline" />
                Target Speed Reached!
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium block sm:inline sm:ml-2">
                Currently running at {liveWpm} WPM (Target: {preferences.targetWpm} WPM)
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

      {/* Typing Text Area with Animated Caret & Error Detection */}
      <div
        ref={textContainerRef}
        onClick={() => inputRef.current?.focus()}
        className={`relative p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800/90 border-2 transition-all ${
          hasErrorOnLastKeystroke
            ? 'border-rose-400/80 dark:border-rose-500/80 shadow-rose-500/10'
            : preferences.highContrastMode
            ? 'border-blue-600 dark:border-blue-400'
            : 'border-slate-200 dark:border-slate-700'
        } shadow-xl max-h-[320px] overflow-y-auto select-none font-mono cursor-text text-xl sm:text-2xl leading-relaxed`}
      >
        {/* Hidden input field capturing keystrokes */}
        <textarea
          ref={inputRef}
          value={typedText}
          onChange={handleInputChange}
          onPaste={(e) => {
            e.preventDefault();
            onShowToast('Copy & paste is disabled during the test!', 'warning');
          }}
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
            <span>{isFocused ? 'Start typing to begin...' : 'Tap here to focus & start typing...'}</span>
          </div>
        )}

        <div className="break-words whitespace-pre-wrap tracking-wide relative z-0">
          {targetText.split('').map((char, index) => {
            const isCurrent = index === typedText.length;
            let charStyle = 'text-slate-400 dark:text-slate-500';

            if (index < typedText.length) {
              if (typedText[index] === char) {
                charStyle = 'text-emerald-600 dark:text-emerald-400 font-semibold';
              } else {
                charStyle =
                  'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/80 rounded px-0.5 font-bold';
              }
            }

            return (
              <span
                key={index}
                ref={isCurrent ? currentCharRef : null}
                className={`relative transition-colors ${charStyle} ${
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

      {/* Tap to focus button for mobile devices */}
      {!isFocused && (
        <button
          onClick={() => inputRef.current?.focus()}
          className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer animate-pulse transition-all"
        >
          <span>📱 Tap here to open virtual keyboard & continue test</span>
        </button>
      )}

      {/* Full Live Stats Bar (when not in Zen Mode) */}
      {!zenMode && preferences.showLiveStats && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-sm grid grid-cols-4 gap-2 text-center font-mono">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">
              {isWarmupMode ? 'Cadence' : 'Live WPM'}
            </div>
            <div
              className={`text-xl font-black ${
                isWarmupMode ? 'text-teal-600 dark:text-teal-400' : 'text-blue-600 dark:text-blue-400'
              } tabular-nums`}
            >
              {isWarmupMode
                ? liveRhythmConsistency !== null
                  ? `${liveRhythmConsistency}%`
                  : '100%'
                : liveWpm}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Accuracy</div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {liveAccuracy}%
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Errors</div>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
              {errorCount}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Typed</div>
            <div className="text-xl font-black text-slate-800 dark:text-slate-200 tabular-nums">
              {totalTyped}
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-amber-500">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Test?</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your test progress will not be recorded in your history. Are you sure you want to exit?
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" size="sm" fullWidth onClick={() => setShowExitConfirm(false)}>
                Resume
              </Button>
              <Button variant="danger" size="sm" fullWidth onClick={onCancelTest}>
                Exit Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
