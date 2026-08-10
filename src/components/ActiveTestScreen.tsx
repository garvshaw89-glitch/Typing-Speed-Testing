import React, { useEffect, useRef, useState, useCallback } from 'react';
import { UserPreferences, TestResult } from '../types';
import { calculateAdjustedWPM, calculateRawWPM, calculateAccuracy, calculateCPM, calculateConsistency } from '../utils/calculations';
import { soundEngine } from '../services/soundEngine';
import { generateTargetText } from '../services/textGenerator';
import { RotateCcw, X, AlertTriangle, Sparkles, Target } from 'lucide-react';

interface ActiveTestScreenProps {
  preferences: UserPreferences;
  onCompleteTest: (result: TestResult) => void;
  onCancelTest: () => void;
  onShowToast: (message: string, type: 'warning' | 'info') => void;
}

export const ActiveTestScreen: React.FC<ActiveTestScreenProps> = ({
  preferences,
  onCompleteTest,
  onCancelTest,
  onShowToast,
}) => {
  const [targetText, setTargetText] = useState<string>('');
  const [typedText, setTypedText] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(preferences.testDuration);
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [targetReachedAlert, setTargetReachedAlert] = useState<boolean>(false);
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

    const avgCharTimeMs = charTimingsRef.current.length > 0
      ? Math.round(charTimingsRef.current.reduce((a, b) => a + b, 0) / charTimingsRef.current.length)
      : 0;

    const testId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const result: TestResult = {
      testId,
      timestamp: endTime,
      duration: Math.round(elapsedSec),
      difficulty: preferences.difficultyLevel,
      textType: preferences.textType,
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

    soundEngine.playSuccessChime(false);
    onCompleteTest(result);
  }, [preferences.difficultyLevel, preferences.textType, onCompleteTest]);

  // Keep finishTestRef in sync
  const finishTestRef = useRef(finishTest);
  finishTestRef.current = finishTest;

  // Generate target text on mount
  useEffect(() => {
    const text = generateTargetText(
      preferences.difficultyLevel,
      preferences.textType,
      Math.max(120, preferences.testDuration * 3)
    );
    setTargetText(text);
    inputRef.current?.focus();
  }, [preferences.difficultyLevel, preferences.textType, preferences.testDuration]);

  // Main test timer loop
  useEffect(() => {
    if (!startTime) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - startTime) / 1000;
      setElapsedSeconds(elapsed);

      const remaining = Math.max(0, preferences.testDuration - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        finishTestRef.current(now, elapsed);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [startTime, preferences.testDuration]);

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
        soundEngine.playKeyClick();
      } else {
        soundEngine.playErrorSound();
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
  const percentElapsed = ((preferences.testDuration - timeRemaining) / preferences.testDuration) * 100;
  let progressColor = 'bg-emerald-500';
  if (percentElapsed > 66) {
    progressColor = 'bg-rose-500';
  } else if (percentElapsed > 33) {
    progressColor = 'bg-amber-500';
  }

  // Font size class mapping
  let fontClass = 'text-xl sm:text-2xl leading-relaxed';
  if (preferences.fontSize === 'small') fontClass = 'text-lg sm:text-xl leading-relaxed';
  if (preferences.fontSize === 'large') fontClass = 'text-2xl sm:text-3xl leading-loose';

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in relative cursor-text min-h-[75vh]"
    >
      {/* Timer Bar & Controls */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-md flex flex-col gap-3">
        <div className="flex items-center justify-between font-mono text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-slate-500">Time:</span>
            <span className="text-lg text-blue-600 dark:text-blue-400 font-extrabold">
              {formatTime(timeRemaining)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTypedText('');
                setStartTime(null);
                setElapsedSeconds(0);
                setTimeRemaining(preferences.testDuration);
                charTimingsRef.current = [];
                keyStatsRef.current = {};
                lastKeyTimeRef.current = null;
                hasTriggeredTargetAlertRef.current = false;
                setTargetReachedAlert(false);
                inputRef.current?.focus();
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Restart Test"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowExitConfirm(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Cancel Test (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-900 h-2.5 rounded-full overflow-hidden">
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
            <div className="text-[10px] uppercase font-bold text-slate-400">Live WPM</div>
            <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{liveWpm}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Accuracy</div>
            <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{liveAccuracy}%</div>
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Errors</div>
            <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{errorCount}</div>
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
