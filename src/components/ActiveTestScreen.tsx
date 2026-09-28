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
  Clock,
  Activity,
  Volume2,
  VolumeX,
  Waves,
  Eye,
  EyeOff,
  Quote,
  Keyboard,
} from 'lucide-react';
import { Button } from './ui/Button';
import { TypingRhythmSparkline, KeystrokeRhythmPoint } from './TypingRhythmSparkline';
import { LiveVisualKeyboard, LiveKeystrokeEvent } from './LiveVisualKeyboard';
import { KeystrokePulseVisualizer } from './KeystrokePulseVisualizer';

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
  const [rhythmPoints, setRhythmPoints] = useState<KeystrokeRhythmPoint[]>([]);
  const rhythmPointsRef = useRef<KeystrokeRhythmPoint[]>([]);
  const [activePauseMs, setActivePauseMs] = useState<number | null>(null);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(
    preferences.showVisualKeyboard !== false
  );
  const [lastKeystroke, setLastKeystroke] = useState<LiveKeystrokeEvent | null>(null);
  const [liveKeyStats, setLiveKeyStats] = useState<Record<string, { total: number; errors: number }>>({});
  const [lastCharInterval, setLastCharInterval] = useState<number>(0);

  // Real-time tracking
  const charTimingsRef = useRef<number[]>([]);
  const lastKeyTimeRef = useRef<number | null>(null);
  const progressionRef = useRef<WpmProgressionPoint[]>([]);
  const lastProgressionSecRef = useRef<number>(0);
  const hasTriggeredTargetAlertRef = useRef<boolean>(false);
  const keyStatsRef = useRef<
    Record<string, { total: number; errors: number; mistakesAgainst?: Record<string, number> }>
  >({});

  const typedTextRef = useRef<string>(typedText);
  typedTextRef.current = typedText;

  const targetTextRef = useRef<string>(targetText);
  targetTextRef.current = targetText;

  // DOM Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);

  // Real-time calculations
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

  const effectiveElapsed = Math.max(1, elapsedSeconds);
  const rawLiveWpm = calculateAdjustedWPM(correctCount, effectiveElapsed);
  const liveWpm = elapsedSeconds < 1.5 && totalTyped < 8
    ? Math.min(rawLiveWpm, 65)
    : rawLiveWpm;

  const liveAccuracy = calculateAccuracy(correctCount, totalTyped);

  const liveRhythmConsistency = useMemo(() => {
    if (charTimingsRef.current.length < 3) return null;
    return calculateConsistency(charTimingsRef.current.slice(-12));
  }, [typedText.length]);

  const liveRhythm = liveRhythmConsistency !== null ? getRhythmRating(liveRhythmConsistency) : null;

  // Metronome tick
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

      const finalElapsed = Math.max(1, Math.round(totalElapsed));
      const finalWpm = calculateAdjustedWPM(finalCorrect, finalElapsed);
      const finalRawWpm = calculateRawWPM(finalTotalTyped, finalElapsed);
      const finalAccuracy = calculateAccuracy(finalCorrect, finalTotalTyped);
      const finalCpm = calculateCPM(finalCorrect, finalElapsed);

      const timings = charTimingsRef.current;
      const avgCharTimeMs =
        timings.length > 0 ? Math.round(timings.reduce((a, b) => a + b, 0) / timings.length) : 0;
      const consistency = calculateConsistency(timings);
      const rating = getRhythmRating(consistency);

      const result: TestResult = {
        testId: `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
        duration: finalElapsed,
        difficulty: preferences.difficultyLevel,
        textType: preferences.textType,
        mode: mode as any,
        targetWords: isWordMode ? targetWordCount : undefined,
        isWarmup: isWarmupMode,
        rhythmRating: rating?.badge || 'Steady',
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
        pauseCount: rhythmPointsRef.current.filter((p) => p.isPause).length,
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

  // Initialize text
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

  // Main timer
  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      setElapsedSeconds(elapsed);

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

      if (lastKeyTimeRef.current) {
        const pauseSinceLastKey = now - lastKeyTimeRef.current;
        if (pauseSinceLastKey > 450) {
          setActivePauseMs(pauseSinceLastKey);
        } else {
          setActivePauseMs(null);
        }
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

  // Smooth scroll active caret
  useEffect(() => {
    if (currentCharRef.current) {
      currentCharRef.current.scrollIntoView({
        behavior: preferences.reduceMotion ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [typedText, preferences.reduceMotion]);

  // Handle typing keystrokes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const now = Date.now();

    const newCharIndex = value.length - 1;
    const typedChar = newCharIndex >= 0 ? value[newCharIndex] : '';
    const targetChar = newCharIndex >= 0 ? targetText[newCharIndex] : '';

    if (!startTime) {
      setStartTime(now);
    } else if (lastKeyTimeRef.current) {
      const diff = now - lastKeyTimeRef.current;
      charTimingsRef.current.push(diff);
      setLastCharInterval(diff);

      const recentDiffs = charTimingsRef.current.slice(-15);
      const rollingAvg =
        recentDiffs.reduce((a, b) => a + b, 0) / Math.max(1, recentDiffs.length);

      const isPause = diff > 400 || (recentDiffs.length >= 3 && diff > rollingAvg * 2.2 && diff > 300);
      const isSeverePause = diff > 750;
      const instantWpm = Math.min(240, Math.max(8, Math.round((60000 / Math.max(40, diff)) / 5)));

      const rhythmPt: KeystrokeRhythmPoint = {
        id: rhythmPointsRef.current.length + 1,
        char: typedChar,
        intervalMs: diff,
        instantWpm,
        isPause,
        isSeverePause,
        isError: typedChar !== targetChar,
        timestamp: now,
        rollingAvgIntervalMs: Math.round(rollingAvg),
      };

      rhythmPointsRef.current.push(rhythmPt);
      setRhythmPoints([...rhythmPointsRef.current]);
    }
    lastKeyTimeRef.current = now;
    setActivePauseMs(null);

    if (value.length > typedText.length && newCharIndex >= 0) {
      const isCorrect = typedChar === targetChar;

      setLastKeystroke({
        key: typedChar,
        targetKey: targetChar,
        isCorrect,
        timestamp: now,
      });

      if (targetChar) {
        const keyKey = targetChar.toLowerCase();
        if (!keyStatsRef.current[keyKey]) {
          keyStatsRef.current[keyKey] = { total: 0, errors: 0, mistakesAgainst: {} };
        }
        keyStatsRef.current[keyKey].total += 1;
        if (!isCorrect) {
          keyStatsRef.current[keyKey].errors += 1;
          if (!keyStatsRef.current[keyKey].mistakesAgainst) {
            keyStatsRef.current[keyKey].mistakesAgainst = {};
          }
          const mistypedChar = typedChar.toLowerCase() || 'other';
          keyStatsRef.current[keyKey].mistakesAgainst![mistypedChar] =
            (keyStatsRef.current[keyKey].mistakesAgainst![mistypedChar] || 0) + 1;
        }
        setLiveKeyStats({ ...keyStatsRef.current });
      }

      if (isCorrect) {
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
      soundEngine.playKeyClick('Backspace');
      setHasErrorOnLastKeystroke(false);
    }

    setTypedText(value);

    // Finish condition for Words or Quote mode
    if ((isWordMode || isQuoteMode) && value.length >= targetText.length && targetText.length > 0) {
      const totalElapsed = (now - (startTime || now)) / 1000;
      finishTest(now, totalElapsed, value);
    }
  };

  const handleRestart = () => {
    setTypedText('');
    setStartTime(null);
    setElapsedSeconds(0);
    setTimeRemaining(effectiveDuration);
    charTimingsRef.current = [];
    progressionRef.current = [];
    keyStatsRef.current = {};
    setLiveKeyStats({});
    setLastKeystroke(null);
    lastKeyTimeRef.current = null;
    rhythmPointsRef.current = [];
    setRhythmPoints([]);
    setActivePauseMs(null);
    lastProgressionSecRef.current = 0;
    hasTriggeredTargetAlertRef.current = false;
    setTargetReachedAlert(false);
    setHasErrorOnLastKeystroke(false);
    initTargetText();
    inputRef.current?.focus();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const targetLength = targetText.length;
  const progressPercent = targetLength > 0 ? Math.min(100, Math.round((typedText.length / targetLength) * 100)) : 0;
  const timePercentElapsed = isTimeMode ? ((effectiveDuration - timeRemaining) / effectiveDuration) * 100 : progressPercent;
  const isTimeUrgent = isTimeMode && timeRemaining <= 5 && timeRemaining > 0 && startTime !== null;

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      data-cursor="type"
      className={`max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 animate-fade-in relative cursor-text min-h-[80vh] ${
        zenMode ? 'max-w-3xl' : ''
      }`}
    >
      {/* 11 & 12 — EDITORIAL PERFORMANCE STRIP (Precision Laboratory Instrument Readings) */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#090A0C]/90 border border-white/[0.08] shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Main Metric Reading: WPM */}
          <div className="flex items-center gap-6 sm:gap-8">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#686B72] uppercase font-bold block">
                WPM // WORDS/MIN
              </span>
              <span className="text-2xl sm:text-4xl font-black font-mono-num text-[#F5F5F0] tabular-nums">
                {liveWpm}
              </span>
            </div>

            <div className="h-8 w-px bg-white/[0.08]" />

            {/* Accuracy Metric */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#686B72] uppercase font-bold block">
                PRECISION // ACC
              </span>
              <span className="text-2xl sm:text-4xl font-black font-mono-num text-emerald-400 tabular-nums">
                {liveAccuracy}%
              </span>
            </div>

            <div className="h-8 w-px bg-white/[0.08]" />

            {/* Time or Words Countdown */}
            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#686B72] uppercase font-bold block">
                {isTimeMode ? 'TIME REMAINING' : 'PROGRESS'}
              </span>
              <span
                className={`text-2xl sm:text-4xl font-black font-mono-num tabular-nums ${
                  isTimeUrgent ? 'text-[#FF6B6B] animate-pulse' : 'text-[#6C8CFF]'
                }`}
              >
                {isTimeMode ? formatTime(timeRemaining) : `${progressPercent}%`}
              </span>
            </div>

            {/* Cadence or Errors if space allows */}
            <div className="hidden lg:flex items-center gap-8">
              <div className="h-8 w-px bg-white/[0.08]" />
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#686B72] uppercase font-bold block">
                  ERRORS
                </span>
                <span className="text-2xl sm:text-4xl font-black font-mono-num text-[#FF6B6B] tabular-nums">
                  {errorCount}
                </span>
              </div>
            </div>
          </div>

          {/* Instrument Controls: Metronome, Zen Mode, Keyboard Toggle, Restart, Quit */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setMetronomeAudio((prev) => !prev)}
              className={`w-10 h-10 rounded-xl border transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                metronomeAudio
                  ? 'bg-[#15181D] text-[#6C8CFF] border-[#6C8CFF]/50 shadow-[0_0_12px_rgba(108,140,255,0.2)]'
                  : 'bg-[#101216] border-white/[0.08] text-[#A5A7AC] hover:text-[#F5F5F0]'
              }`}
              title="Toggle Metronome Audio"
              aria-label="Metronome"
            >
              {metronomeAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowKeyboard((k) => !k)}
              className={`w-10 h-10 rounded-xl border transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                showKeyboard
                  ? 'bg-[#15181D] text-[#6C8CFF] border-[#6C8CFF]/50 shadow-[0_0_12px_rgba(108,140,255,0.2)]'
                  : 'bg-[#101216] border-white/[0.08] text-[#A5A7AC] hover:text-[#F5F5F0]'
              }`}
              title={showKeyboard ? 'Hide Visual Keyboard' : 'Show Visual Keyboard'}
              aria-label="Toggle Keyboard"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            <button
              onClick={() => setZenMode((z) => !z)}
              className={`w-10 h-10 rounded-xl border transition-colors flex items-center justify-center cursor-pointer shrink-0 ${
                zenMode
                  ? 'bg-[#15181D] text-[#6C8CFF] border-[#6C8CFF]/50'
                  : 'bg-[#101216] border-white/[0.08] text-[#A5A7AC] hover:text-[#F5F5F0]'
              }`}
              title={zenMode ? 'Exit Focus Zen Mode' : 'Enter Focus Zen Mode'}
              aria-label="Toggle Zen Mode"
            >
              {zenMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            <button
              onClick={handleRestart}
              className="w-10 h-10 rounded-xl bg-[#101216] border border-white/[0.08] text-[#A5A7AC] hover:text-[#F5F5F0] hover:border-white/[0.2] transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title="Restart Test (Tab+Enter)"
              aria-label="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowExitConfirm(true)}
              className="w-10 h-10 rounded-xl bg-[#101216] border border-white/[0.08] text-[#A5A7AC] hover:text-[#FF6B6B] hover:border-rose-900/50 transition-colors flex items-center justify-center cursor-pointer shrink-0"
              title="Abort Test (Esc)"
              aria-label="Abort Test"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Architectural Progress Laser */}
        <div className="w-full bg-[#101216] h-1 rounded-full overflow-hidden mt-4">
          <div
            className={`h-full transition-all duration-150 ${
              isTimeUrgent
                ? 'bg-[#FF6B6B] shadow-[0_0_10px_#FF6B6B]'
                : 'bg-[#6C8CFF] shadow-[0_0_10px_#6C8CFF]'
            }`}
            style={{ width: `${Math.min(100, isTimeMode ? timePercentElapsed : progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Quote Attribution Pill in Quote Mode */}
      {isQuoteMode && quoteMetadata.author && !zenMode && (
        <div className="px-4 py-2.5 rounded-2xl bg-[#090A0C] border border-white/[0.08] flex items-center justify-between text-xs font-mono text-[#A5A7AC]">
          <div className="flex items-center gap-2">
            <Quote className="w-3.5 h-3.5 text-[#6C8CFF]" />
            <span className="font-bold text-[#F5F5F0]">{quoteMetadata.author}</span>
            {quoteMetadata.source && (
              <>
                <span className="text-[#686B72]">·</span>
                <span className="italic text-[#A5A7AC]">{quoteMetadata.source}</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-[#6C8CFF] uppercase tracking-wider">LITERATURE MATRIX</span>
        </div>
      )}

      {/* 09 & 10 — THE IMMERSIVE TYPING CHAMBER (Cinematic negative space & typography) */}
      <div
        ref={textContainerRef}
        onClick={() => inputRef.current?.focus()}
        className={`relative p-6 sm:p-12 rounded-3xl bg-[#090A0C]/90 border transition-all duration-300 ${
          hasErrorOnLastKeystroke
            ? 'border-rose-500/50 shadow-[0_0_30px_rgba(255,107,107,0.12)]'
            : 'border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.8)]'
        } max-h-[300px] sm:max-h-[380px] overflow-y-auto select-none font-mono cursor-text text-xl sm:text-3xl leading-[1.8] tracking-wide break-words backdrop-blur-2xl typing-chamber`}
      >
        {/* Hidden textarea capturing keystrokes */}
        <textarea
          ref={inputRef}
          value={typedText}
          onChange={handleInputChange}
          onPaste={(e) => {
            e.preventDefault();
            onShowToast('Direct clipboard insertion is prohibited in calibration mode.', 'warning');
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer resize-none font-mono text-base text-transparent bg-transparent focus:outline-none"
          autoFocus
          inputMode="text"
          enterKeyHint="done"
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="off"
        />

        {!startTime && (
          <div className="mb-4 text-xs font-mono text-[#6C8CFF] uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C8CFF] animate-ping" />
            <span>{isFocused ? 'BEGIN TYPING TO ENGAGE TELEMETRY' : 'CLICK TO FOCUS & COMMENCE'}</span>
          </div>
        )}

        <div className="break-words whitespace-pre-wrap relative z-0">
          {targetText.split('').map((char, index) => {
            const isCurrent = index === typedText.length;
            let charStyle = 'text-[#686B72]'; // Upcoming muted

            if (index < typedText.length) {
              if (typedText[index] === char) {
                // Correct character: bright #F5F5F0
                charStyle = 'text-[#F5F5F0]';
              } else {
                // Incorrect character: subtle red #FF6B6B with elegant underline, not aggressive box
                charStyle = 'text-[#FF6B6B] border-b-2 border-[#FF6B6B]/80 font-bold';
              }
            }

            return (
              <span
                key={index}
                ref={isCurrent ? currentCharRef : null}
                className={`relative transition-colors duration-75 ${charStyle} ${
                  isCurrent
                    ? 'text-[#6C8CFF] bg-[#6C8CFF]/15 border-b-2 border-[#6C8CFF] rounded-xs shadow-[0_0_12px_rgba(108,140,255,0.4)] animate-caret'
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
          className="w-full py-3.5 px-4 rounded-2xl bg-[#15181D] border border-[#6C8CFF]/40 text-[#6C8CFF] font-mono text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer transition-all animate-pulse"
        >
          <span>TOUCH HERE TO RESTORE KEYBOARD FOCUS</span>
        </button>
      )}

      {/* 14 — KEYSTROKE PULSE VISUALIZER (Thought → Keystroke → Response) */}
      <KeystrokePulseVisualizer
        lastChar={lastKeystroke?.key}
        isCorrect={lastKeystroke?.isCorrect}
        charIntervalMs={lastCharInterval}
        isActive={Boolean(startTime && (!isTimeMode || timeRemaining > 0))}
      />

      {/* 15 — TYPING RHYTHM OSCILLOSCOPE SPARKLINE */}
      {preferences.showRhythmGraph !== false && (
        <TypingRhythmSparkline
          points={rhythmPoints}
          isTypingStarted={Boolean(startTime && typedText.length > 0)}
          isTestActive={Boolean(startTime && (!isTimeMode || timeRemaining > 0))}
          currentConsistency={liveRhythmConsistency}
          activePauseMs={activePauseMs}
          totalPauses={rhythmPoints.filter((p) => p.isPause).length}
          averageIntervalMs={
            charTimingsRef.current.length > 0
              ? Math.round(
                  charTimingsRef.current.reduce((a, b) => a + b, 0) /
                    charTimingsRef.current.length
                )
              : 0
          }
          liveWpm={liveWpm}
          reduceMotion={preferences.reduceMotion}
          highContrast={preferences.highContrastMode}
        />
      )}

      {/* REAL-TIME VISUAL KEYBOARD */}
      {showKeyboard && !zenMode && (
        <LiveVisualKeyboard
          nextTargetChar={targetText[typedText.length] || ''}
          lastKeystroke={lastKeystroke}
          keyStats={liveKeyStats}
          errorCount={errorCount}
          totalTyped={totalTyped}
          isActive={Boolean(startTime && (!isTimeMode || timeRemaining > 0))}
          reduceMotion={preferences.reduceMotion}
          highContrast={preferences.highContrastMode}
          initialMode={preferences.visualKeyboardMode || 'fingers'}
          showHomeRowGuide={preferences.showHomeRowGuide ?? true}
          activeColor={preferences.keyboardActiveColor || 'blue'}
          heatmapPalette={preferences.keyboardHeatmapPalette || 'thermal'}
          collapsible={true}
        />
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-[#050505]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#101216] border border-white/[0.12] shadow-2xl space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-lg font-display font-bold text-[#F5F5F0]">Abort Speed Trial?</h3>
            </div>
            <p className="text-sm font-mono text-[#A5A7AC] leading-relaxed">
              Keystroke telemetry for this trial will be discarded. Are you certain you want to disengage?
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Button variant="outline" size="sm" fullWidth onClick={() => setShowExitConfirm(false)}>
                Resume Trial
              </Button>
              <Button variant="danger" size="sm" fullWidth onClick={onCancelTest}>
                Abort
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
