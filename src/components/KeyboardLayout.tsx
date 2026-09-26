import React, { useState, useMemo } from 'react';
import { TestResult, KeyboardActiveColor, KeyboardHeatmapPalette } from '../types';
import {
  ACTIVE_COLOR_OPTIONS,
  HEATMAP_PALETTE_OPTIONS,
} from '../utils/keyboardThemes';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Keyboard,
  Target,
  Sparkles,
  Fingerprint,
  Flame,
  Copy,
  Check,
  Activity,
  Sliders,
  TrendingDown,
  Layers,
  Info,
  Palette,
} from 'lucide-react';

interface KeyboardLayoutProps {
  history?: TestResult[];
  singleResult?: TestResult;
  title?: string;
  subtitle?: string;
  initialPalette?: KeyboardHeatmapPalette;
  activeColor?: KeyboardActiveColor;
}

// Key definition layout structure
interface KeyConfig {
  id: string;
  label: string;
  shiftLabel?: string;
  displayLabel?: string;
  width?: number; // relative key width (1 = standard key)
  finger: string;
  hand: 'left' | 'right' | 'both';
  isHomeRow?: boolean;
  hasTactileBump?: boolean;
}

// 5-Row QWERTY layout matching physical mechanical keyboards
const KEYBOARD_ROWS: KeyConfig[][] = [
  // Row 1: Numbers & Symbols
  [
    { id: '`', label: '`', shiftLabel: '~', displayLabel: '~ `', finger: 'Left Pinky', hand: 'left' },
    { id: '1', label: '1', shiftLabel: '!', displayLabel: '! 1', finger: 'Left Pinky', hand: 'left' },
    { id: '2', label: '2', shiftLabel: '@', displayLabel: '@ 2', finger: 'Left Ring', hand: 'left' },
    { id: '3', label: '3', shiftLabel: '#', displayLabel: '# 3', finger: 'Left Middle', hand: 'left' },
    { id: '4', label: '4', shiftLabel: '$', displayLabel: '$ 4', finger: 'Left Index', hand: 'left' },
    { id: '5', label: '5', shiftLabel: '%', displayLabel: '% 5', finger: 'Left Index', hand: 'left' },
    { id: '6', label: '6', shiftLabel: '^', displayLabel: '^ 6', finger: 'Right Index', hand: 'right' },
    { id: '7', label: '7', shiftLabel: '&', displayLabel: '& 7', finger: 'Right Index', hand: 'right' },
    { id: '8', label: '8', shiftLabel: '*', displayLabel: '* 8', finger: 'Right Middle', hand: 'right' },
    { id: '9', label: '9', shiftLabel: '(', displayLabel: '( 9', finger: 'Right Ring', hand: 'right' },
    { id: '0', label: '0', shiftLabel: ')', displayLabel: ') 0', finger: 'Right Pinky', hand: 'right' },
    { id: '-', label: '-', shiftLabel: '_', displayLabel: '_ -', finger: 'Right Pinky', hand: 'right' },
    { id: '=', label: '=', shiftLabel: '+', displayLabel: '+ =', finger: 'Right Pinky', hand: 'right' },
    { id: 'backspace', label: 'Backspace', displayLabel: '⌫ Back', width: 2, finger: 'Right Pinky', hand: 'right' },
  ],
  // Row 2: QWERTY
  [
    { id: 'tab', label: 'Tab', displayLabel: 'Tab ⇥', width: 1.5, finger: 'Left Pinky', hand: 'left' },
    { id: 'q', label: 'Q', finger: 'Left Pinky', hand: 'left' },
    { id: 'w', label: 'W', finger: 'Left Ring', hand: 'left' },
    { id: 'e', label: 'E', finger: 'Left Middle', hand: 'left' },
    { id: 'r', label: 'R', finger: 'Left Index', hand: 'left' },
    { id: 't', label: 'T', finger: 'Left Index', hand: 'left' },
    { id: 'y', label: 'Y', finger: 'Right Index', hand: 'right' },
    { id: 'u', label: 'U', finger: 'Right Index', hand: 'right' },
    { id: 'i', label: 'I', finger: 'Right Middle', hand: 'right' },
    { id: 'o', label: 'O', finger: 'Right Ring', hand: 'right' },
    { id: 'p', label: 'P', finger: 'Right Pinky', hand: 'right' },
    { id: '[', label: '[', shiftLabel: '{', displayLabel: '{ [', finger: 'Right Pinky', hand: 'right' },
    { id: ']', label: ']', shiftLabel: '}', displayLabel: '} ]', finger: 'Right Pinky', hand: 'right' },
    { id: '\\', label: '\\', shiftLabel: '|', displayLabel: '| \\', width: 1.5, finger: 'Right Pinky', hand: 'right' },
  ],
  // Row 3: Home Row
  [
    { id: 'caps', label: 'Caps', displayLabel: 'Caps', width: 1.75, finger: 'Left Pinky', hand: 'left' },
    { id: 'a', label: 'A', finger: 'Left Pinky', hand: 'left', isHomeRow: true },
    { id: 's', label: 'S', finger: 'Left Ring', hand: 'left', isHomeRow: true },
    { id: 'd', label: 'D', finger: 'Left Middle', hand: 'left', isHomeRow: true },
    { id: 'f', label: 'F', finger: 'Left Index', hand: 'left', isHomeRow: true, hasTactileBump: true },
    { id: 'g', label: 'G', finger: 'Left Index', hand: 'left' },
    { id: 'h', label: 'H', finger: 'Right Index', hand: 'right' },
    { id: 'j', label: 'J', finger: 'Right Index', hand: 'right', isHomeRow: true, hasTactileBump: true },
    { id: 'k', label: 'K', finger: 'Right Middle', hand: 'right', isHomeRow: true },
    { id: 'l', label: 'L', finger: 'Right Ring', hand: 'right', isHomeRow: true },
    { id: ';', label: ';', shiftLabel: ':', displayLabel: ': ;', finger: 'Right Pinky', hand: 'right', isHomeRow: true },
    { id: "'", label: "'", shiftLabel: '"', displayLabel: '" \'', finger: 'Right Pinky', hand: 'right' },
    { id: 'enter', label: 'Enter', displayLabel: 'Enter ↵', width: 2.25, finger: 'Right Pinky', hand: 'right' },
  ],
  // Row 4: ZXCVB
  [
    { id: 'shift_l', label: 'Shift', displayLabel: '⇧ Shift', width: 2.25, finger: 'Left Pinky', hand: 'left' },
    { id: 'z', label: 'Z', finger: 'Left Pinky', hand: 'left' },
    { id: 'x', label: 'X', finger: 'Left Ring', hand: 'left' },
    { id: 'c', label: 'C', finger: 'Left Middle', hand: 'left' },
    { id: 'v', label: 'V', finger: 'Left Index', hand: 'left' },
    { id: 'b', label: 'B', finger: 'Left Index', hand: 'left' },
    { id: 'n', label: 'N', finger: 'Right Index', hand: 'right' },
    { id: 'm', label: 'M', finger: 'Right Index', hand: 'right' },
    { id: ',', label: ',', shiftLabel: '<', displayLabel: '< ,', finger: 'Right Middle', hand: 'right' },
    { id: '.', label: '.', shiftLabel: '>', displayLabel: '> .', finger: 'Right Ring', hand: 'right' },
    { id: '/', label: '/', shiftLabel: '?', displayLabel: '? /', finger: 'Right Pinky', hand: 'right' },
    { id: 'shift_r', label: 'Shift', displayLabel: '⇧ Shift', width: 2.75, finger: 'Right Pinky', hand: 'right' },
  ],
  // Row 5: Space Bar & Modifiers
  [
    { id: 'ctrl_l', label: 'Ctrl', displayLabel: 'Ctrl', width: 1.5, finger: 'Left Pinky', hand: 'left' },
    { id: 'alt_l', label: 'Alt', displayLabel: 'Alt', width: 1.5, finger: 'Left Thumb', hand: 'left' },
    { id: ' ', label: ' ', displayLabel: '␣ Space Bar', width: 6.5, finger: 'Thumbs', hand: 'both', isHomeRow: true },
    { id: 'alt_r', label: 'Alt', displayLabel: 'Alt', width: 1.5, finger: 'Right Thumb', hand: 'right' },
    { id: 'ctrl_r', label: 'Ctrl', displayLabel: 'Ctrl', width: 1.5, finger: 'Right Pinky', hand: 'right' },
  ],
];

// Helper to find key config for any character
const KEY_MAP: Record<string, KeyConfig> = {};
KEYBOARD_ROWS.forEach((row) => {
  row.forEach((key) => {
    KEY_MAP[key.id.toLowerCase()] = key;
    KEY_MAP[key.label.toLowerCase()] = key;
    if (key.shiftLabel) {
      KEY_MAP[key.shiftLabel.toLowerCase()] = key;
    }
  });
});

export type HeatmapMetricMode = 'errorRate' | 'errorCount' | 'volume' | 'biomechanics';
export type HeatmapScope = 'all' | '30days' | '7days' | 'latest';

export const KeyboardLayout: React.FC<KeyboardLayoutProps> = ({
  history = [],
  singleResult,
  title = 'Keystroke Heatmap & Weak Key Telemetry',
  subtitle = 'Identify precision bottlenecks, misstrike confusion patterns, and finger biomechanics',
  initialPalette = 'thermal',
  activeColor = 'blue',
}) => {
  // Filters & State
  const [activeScope, setActiveScope] = useState<HeatmapScope>(
    singleResult && history.length === 0 ? 'latest' : 'all'
  );
  const [metricMode, setMetricMode] = useState<HeatmapMetricMode>('errorRate');
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [copiedKeyInfo, setCopiedKeyInfo] = useState<boolean>(false);
  const [currentPalette, setCurrentPalette] = useState<KeyboardHeatmapPalette>(initialPalette);

  const paletteConfig = HEATMAP_PALETTE_OPTIONS[currentPalette] || HEATMAP_PALETTE_OPTIONS.thermal;
  const activeColorConfig = ACTIVE_COLOR_OPTIONS[activeColor] || ACTIVE_COLOR_OPTIONS.blue;

  // Filter history based on selected scope
  const filteredResults = useMemo(() => {
    if (activeScope === 'latest') {
      if (singleResult) return [singleResult];
      return history.length > 0 ? [history[0]] : [];
    }

    const now = Date.now();
    if (activeScope === '7days') {
      const cut = now - 7 * 86400000;
      return history.filter((r) => r.timestamp >= cut);
    }
    if (activeScope === '30days') {
      const cut = now - 30 * 86400000;
      return history.filter((r) => r.timestamp >= cut);
    }

    // Default 'all'
    if (history.length > 0) return history;
    if (singleResult) return [singleResult];
    return [];
  }, [history, singleResult, activeScope]);

  // Aggregate Key Statistics across filtered sessions
  const aggregatedStats = useMemo(() => {
    const map: Record<
      string,
      { total: number; errors: number; mistakesAgainst: Record<string, number> }
    > = {};

    filteredResults.forEach((res) => {
      if (res.keyStats) {
        (Object.entries(res.keyStats) as [string, { total: number; errors: number; mistakesAgainst?: Record<string, number> }][]).forEach(([rawChar, data]) => {
          const char = rawChar.toLowerCase();
          if (!map[char]) {
            map[char] = { total: 0, errors: 0, mistakesAgainst: {} };
          }
          map[char].total += data.total;
          map[char].errors += data.errors;

          if (data.mistakesAgainst) {
            (Object.entries(data.mistakesAgainst) as [string, number][]).forEach(([mKey, count]) => {
              map[char].mistakesAgainst[mKey] = (map[char].mistakesAgainst[mKey] || 0) + count;
            });
          }
        });
      }
    });

    return map;
  }, [filteredResults]);

  // Total keystroke volume and error tally
  const globalSummary = useMemo(() => {
    let totalKeystrokes = 0;
    let totalErrors = 0;
    let testedKeyCount = 0;

    (
      Object.values(aggregatedStats) as {
        total: number;
        errors: number;
        mistakesAgainst: Record<string, number>;
      }[]
    ).forEach((item) => {
      totalKeystrokes += item.total;
      totalErrors += item.errors;
      if (item.total > 0) testedKeyCount++;
    });

    const overallAccuracy =
      totalKeystrokes > 0
        ? Math.round(((totalKeystrokes - totalErrors) / totalKeystrokes) * 1000) / 10
        : 100;

    return { totalKeystrokes, totalErrors, overallAccuracy, testedKeyCount };
  }, [aggregatedStats]);

  // Ranked Key List for Weakest vs Mastered Analysis
  const { struggleKeys, masteredKeys, maxKeyErrors, maxKeyTotal } = useMemo(() => {
    const list: {
      key: string;
      config: KeyConfig;
      total: number;
      errors: number;
      errorRate: number;
      accuracy: number;
      mistakesAgainst: Record<string, number>;
    }[] = [];

    let maxErr = 0;
    let maxTot = 0;

    (
      Object.entries(aggregatedStats) as [
        string,
        { total: number; errors: number; mistakesAgainst: Record<string, number> }
      ][]
    ).forEach(([char, data]) => {
      if (data.total > 0) {
        const config = KEY_MAP[char] || {
          id: char,
          label: char.toUpperCase(),
          finger: 'Unassigned',
          hand: 'left' as const,
        };
        const errorRate = (data.errors / data.total) * 100;
        const accuracy = ((data.total - data.errors) / data.total) * 100;

        if (data.errors > maxErr) maxErr = data.errors;
        if (data.total > maxTot) maxTot = data.total;

        list.push({
          key: char,
          config,
          total: data.total,
          errors: data.errors,
          errorRate,
          accuracy,
          mistakesAgainst: data.mistakesAgainst,
        });
      }
    });

    // Struggle keys: Ranked by error rate (min 2 attempts or >1 error), then error count
    const struggle = [...list]
      .filter((k) => k.errors > 0)
      .sort((a, b) => b.errorRate - a.errorRate || b.errors - a.errors)
      .slice(0, 5);

    // Mastered keys: Highest accuracy with solid volume (min 5 attempts)
    const mastered = [...list]
      .filter((k) => k.accuracy >= 92 && k.total >= 4)
      .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total)
      .slice(0, 5);

    return {
      struggleKeys: struggle,
      masteredKeys: mastered,
      maxKeyErrors: Math.max(1, maxErr),
      maxKeyTotal: Math.max(1, maxTot),
    };
  }, [aggregatedStats]);

  // Hand & Biomechanical Finger Load Breakdown
  const biomechanicalBreakdown = useMemo(() => {
    const fingers: Record<
      string,
      { name: string; hand: 'left' | 'right' | 'both'; total: number; errors: number; color: string }
    > = {
      'Left Pinky': { name: 'Left Pinky', hand: 'left', total: 0, errors: 0, color: '#a855f7' },
      'Left Ring': { name: 'Left Ring', hand: 'left', total: 0, errors: 0, color: '#3b82f6' },
      'Left Middle': { name: 'Left Middle', hand: 'left', total: 0, errors: 0, color: '#06b6d4' },
      'Left Index': { name: 'Left Index', hand: 'left', total: 0, errors: 0, color: '#10b981' },
      'Right Index': { name: 'Right Index', hand: 'right', total: 0, errors: 0, color: '#f59e0b' },
      'Right Middle': { name: 'Right Middle', hand: 'right', total: 0, errors: 0, color: '#f97316' },
      'Right Ring': { name: 'Right Ring', hand: 'right', total: 0, errors: 0, color: '#d946ef' },
      'Right Pinky': { name: 'Right Pinky', hand: 'right', total: 0, errors: 0, color: '#f43f5e' },
      Thumbs: { name: 'Thumbs', hand: 'both', total: 0, errors: 0, color: '#6366f1' },
    };

    let leftTotal = 0;
    let leftErrors = 0;
    let rightTotal = 0;
    let rightErrors = 0;

    (
      Object.entries(aggregatedStats) as [
        string,
        { total: number; errors: number; mistakesAgainst: Record<string, number> }
      ][]
    ).forEach(([char, data]) => {
      const cfg = KEY_MAP[char];
      if (cfg && fingers[cfg.finger]) {
        fingers[cfg.finger].total += data.total;
        fingers[cfg.finger].errors += data.errors;

        if (cfg.hand === 'left') {
          leftTotal += data.total;
          leftErrors += data.errors;
        } else if (cfg.hand === 'right') {
          rightTotal += data.total;
          rightErrors += data.errors;
        }
      }
    });

    const fingerList = Object.values(fingers).map((f) => ({
      ...f,
      accuracy: f.total > 0 ? Math.round(((f.total - f.errors) / f.total) * 100) : 100,
    }));

    const leftAcc = leftTotal > 0 ? Math.round(((leftTotal - leftErrors) / leftTotal) * 100) : 100;
    const rightAcc =
      rightTotal > 0 ? Math.round(((rightTotal - rightErrors) / rightTotal) * 100) : 100;

    // Worst performing finger with at least 3 attempts
    const activeFingers = fingerList.filter((f) => f.total >= 3);
    const weakestFinger =
      activeFingers.length > 0
        ? activeFingers.reduce((worst, cur) => (cur.accuracy < worst.accuracy ? cur : worst))
        : null;

    return { fingerList, leftTotal, leftErrors, leftAcc, rightTotal, rightErrors, rightAcc, weakestFinger };
  }, [aggregatedStats]);

  // Selected Key Detailed Telemetry Info
  const activeKeyDetails = useMemo(() => {
    const keyId = selectedKeyId || (struggleKeys.length > 0 ? struggleKeys[0].key : 'e');
    const keyLower = keyId.toLowerCase();
    const cfg = KEY_MAP[keyLower] || {
      id: keyLower,
      label: keyId.toUpperCase(),
      finger: 'Left Middle',
      hand: 'left' as const,
    };
    const data = aggregatedStats[keyLower] || { total: 0, errors: 0, mistakesAgainst: {} };

    const errorRate = data.total > 0 ? Math.round((data.errors / data.total) * 1000) / 10 : 0;
    const accuracy = data.total > 0 ? Math.round(((data.total - data.errors) / data.total) * 1000) / 10 : 100;

    // Most common mistakes breakdown
    const mistakePairs = (
      Object.entries(data.mistakesAgainst || {}) as [string, number][]
    )
      .sort((a, b) => b[1] - a[1])
      .map(([mistakeChar, count]) => ({
        char: mistakeChar === ' ' ? 'SPACE' : mistakeChar.toUpperCase(),
        count,
        percent: data.errors > 0 ? Math.round((count / data.errors) * 100) : 0,
      }));

    // Ergonomic Diagnostic Note
    let diagnosis = 'Balanced keystroke accuracy.';
    let coachingTip = 'Maintain smooth, metronomic cadence.';

    if (data.total === 0) {
      diagnosis = 'No telemetry recorded for this key in the current filter range.';
      coachingTip = 'Run a practice test to capture key metrics.';
    } else if (errorRate >= 25) {
      diagnosis = `Critical precision bottleneck (${errorRate}% error rate). Frequent misstrikes detected.`;
      coachingTip = `Anchor your index fingers on the home row bumps (F and J). Avoid overreaching with your ${cfg.finger}.`;
    } else if (errorRate >= 10) {
      diagnosis = `Moderate finger drift (${errorRate}% errors). Struck off-center under speed pressure.`;
      coachingTip = 'Focus on relaxing your wrist to avoid hitting adjacent lane boundaries.';
    } else if (accuracy >= 95) {
      diagnosis = 'Mastered Key: Exceptional placement accuracy and muscle memory.';
      coachingTip = 'Keep this consistency when ramping up typing speed.';
    }

    return {
      keyId,
      cfg,
      data,
      errorRate,
      accuracy,
      mistakePairs,
      diagnosis,
      coachingTip,
    };
  }, [selectedKeyId, struggleKeys, aggregatedStats]);

  // Copy telemetry summary to clipboard
  const handleCopyTelemetry = () => {
    const summaryText = `Typing Speed Telemetry - Weak Key Heatmap
Scope: ${activeScope} | Total Keystrokes: ${globalSummary.totalKeystrokes} | Errors: ${globalSummary.totalErrors} | Accuracy: ${globalSummary.overallAccuracy}%
Weakest Keys:
${struggleKeys.map((k, i) => `#${i + 1} Key '${k.key.toUpperCase()}': ${k.errors} errors / ${k.total} typed (${Math.round(k.errorRate)}% error) [${k.config.finger}]`).join('\n')}
Biomechanical Stress: Left Hand ${biomechanicalBreakdown.leftAcc}% | Right Hand ${biomechanicalBreakdown.rightAcc}%`;

    navigator.clipboard.writeText(summaryText);
    setCopiedKeyInfo(true);
    setTimeout(() => setCopiedKeyInfo(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
      {/* Header & Controls Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {globalSummary.totalKeystrokes.toLocaleString()} Keystrokes Analyzed
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Segmented Controls for Scope & Metric Mode */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Scope Filter */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 text-xs font-bold shrink-0">
            {singleResult && (
              <button
                onClick={() => setActiveScope('latest')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeScope === 'latest'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Latest Test
              </button>
            )}
            <button
              onClick={() => setActiveScope('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeScope === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setActiveScope('30days')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeScope === '30days'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setActiveScope('7days')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeScope === '7days'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Days
            </button>
          </div>

          {/* Metric View Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 text-xs font-bold shrink-0">
            <button
              onClick={() => setMetricMode('errorRate')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricMode === 'errorRate'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Color-code by error rate percentage"
            >
              Error Rate %
            </button>
            <button
              onClick={() => setMetricMode('errorCount')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricMode === 'errorCount'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Color-code by raw error count"
            >
              Error Volume
            </button>
            <button
              onClick={() => setMetricMode('biomechanics')}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                metricMode === 'biomechanics'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Color-code by finger placement zones"
            >
              Finger Map
            </button>
          </div>
        </div>
      </div>

      {/* Metric Quick Stats Bar (Unboxed Metadata) */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400 py-1">
        <div className="flex flex-wrap items-center gap-2">
          <span>Filter: <strong className="text-slate-900 dark:text-white font-mono uppercase">{activeScope}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Tested Keys: <strong className="text-slate-900 dark:text-white font-mono">{globalSummary.testedKeyCount} / 47</strong></span>
          <span aria-hidden="true">·</span>
          <span>Accuracy: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{globalSummary.overallAccuracy}%</strong></span>
          <span aria-hidden="true">·</span>
          <span>Total Typos: <strong className="text-rose-600 dark:text-rose-400 font-mono">{globalSummary.totalErrors}</strong></span>
        </div>

        <button
          onClick={handleCopyTelemetry}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer"
        >
          {copiedKeyInfo ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedKeyInfo ? 'Copied Telemetry!' : 'Export Key Report'}</span>
        </button>
      </div>

      {/* Scientific Thermal Heatmap Legend with Palette Switcher */}
      <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Thermal Spectrum:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-md border"
                style={{ backgroundColor: paletteConfig.gradientStops[2], borderColor: paletteConfig.gradientStops[2] }}
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Critical (&ge;25% err)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-md border"
                style={{ backgroundColor: paletteConfig.gradientStops[1], borderColor: paletteConfig.gradientStops[1] }}
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Moderate (10-24%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-md border"
                style={{ backgroundColor: paletteConfig.gradientStops[0], borderColor: paletteConfig.gradientStops[0] }}
              />
              <span className="text-slate-700 dark:text-slate-300 font-medium">Optimal (&lt;10%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-800 border border-slate-700" />
              <span className="text-slate-400 font-medium">Untested</span>
            </div>
          </div>
        </div>

        {/* Heatmap Palette Switcher Chips */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 text-[11px] font-bold">
          <Palette className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          {(Object.keys(HEATMAP_PALETTE_OPTIONS) as KeyboardHeatmapPalette[]).map((pKey) => {
            const pCfg = HEATMAP_PALETTE_OPTIONS[pKey];
            const isSelected = currentPalette === pKey;
            return (
              <button
                key={pKey}
                onClick={() => setCurrentPalette(pKey)}
                className={`px-2 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={`Switch Heatmap to ${pCfg.name} (${pCfg.description})`}
              >
                <span className="flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pCfg.gradientStops[0] }} />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pCfg.gradientStops[1] }} />
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pCfg.gradientStops[2] }} />
                </span>
                <span className="hidden sm:inline">{pCfg.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sculpted Mechanical Keyboard Surface */}
      <div className="overflow-x-auto pb-2 select-none scrollbar-thin">
        <div className="min-w-[690px] max-w-full p-4 sm:p-5 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-2xl space-y-2 font-mono">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5">
              {row.map((keyConfig) => {
                const keyLower = keyConfig.id.toLowerCase();
                const keyData = aggregatedStats[keyLower] || { total: 0, errors: 0, mistakesAgainst: {} };
                const isSelected = (selectedKeyId || activeKeyDetails.keyId)?.toLowerCase() === keyLower;

                // Color calculation based on active metric mode
                let keyBg = 'bg-slate-900 border-slate-800 text-slate-400';
                let indicatorBadge = null;
                let ringStyle = '';

                if (metricMode === 'biomechanics') {
                  // Finger zones
                  if (keyConfig.finger.includes('Pinky')) {
                    keyBg = 'bg-purple-950/40 border-purple-500/40 text-purple-300';
                  } else if (keyConfig.finger.includes('Ring')) {
                    keyBg = 'bg-blue-950/40 border-blue-500/40 text-blue-300';
                  } else if (keyConfig.finger.includes('Middle')) {
                    keyBg = 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300';
                  } else if (keyConfig.finger.includes('Index')) {
                    keyBg = keyConfig.hand === 'left'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-300';
                  } else {
                    keyBg = 'bg-indigo-950/40 border-indigo-500/40 text-indigo-300';
                  }
                } else if (keyData.total > 0) {
                  const errorRate = (keyData.errors / keyData.total) * 100;

                  if (metricMode === 'errorRate') {
                    if (errorRate >= 25) {
                      keyBg = `${paletteConfig.criticalClass} ${paletteConfig.criticalGlow} font-extrabold animate-pulse`;
                      indicatorBadge = (
                        <span className="text-[9px] font-bold tabular-nums">
                          {Math.round(errorRate)}%
                        </span>
                      );
                    } else if (errorRate >= 10) {
                      keyBg = `${paletteConfig.moderateClass} font-bold`;
                      indicatorBadge = (
                        <span className="text-[9px] font-semibold tabular-nums">
                          {Math.round(errorRate)}%
                        </span>
                      );
                    } else {
                      keyBg = paletteConfig.optimalClass;
                      indicatorBadge = (
                        <span className="text-[9px] opacity-75 tabular-nums">
                          {Math.round(errorRate)}%
                        </span>
                      );
                    }
                  } else if (metricMode === 'errorCount') {
                    // Absolute error count
                    if (keyData.errors >= 4) {
                      keyBg = `${paletteConfig.criticalClass} ${paletteConfig.criticalGlow} font-extrabold`;
                      indicatorBadge = (
                        <span className="text-[9px] font-bold tabular-nums">
                          ✕{keyData.errors}
                        </span>
                      );
                    } else if (keyData.errors > 0) {
                      keyBg = `${paletteConfig.moderateClass} font-bold`;
                      indicatorBadge = (
                        <span className="text-[9px] tabular-nums">
                          ✕{keyData.errors}
                        </span>
                      );
                    } else {
                      keyBg = paletteConfig.optimalClass;
                      indicatorBadge = <span className="text-[9px] opacity-70">✓</span>;
                    }
                  }
                }

                if (isSelected) {
                  ringStyle = `ring-2 ${activeColorConfig.targetBorder} ${activeColorConfig.targetGlow} scale-105 z-20 shadow-lg`;
                }

                const widthStyle = keyConfig.width
                  ? { flex: `${keyConfig.width} 1 0%` }
                  : { flex: '1 1 0%' };

                return (
                  <button
                    key={keyConfig.id}
                    onClick={() => setSelectedKeyId(keyConfig.id)}
                    style={widthStyle}
                    className={`h-12 min-w-[34px] rounded-xl border flex flex-col items-center justify-between p-1.5 text-xs transition-all duration-150 cursor-pointer relative group ${keyBg} ${ringStyle}`}
                    title={`Key '${keyConfig.label}': ${keyData.total} typed, ${keyData.errors} errors (${keyConfig.finger})`}
                  >
                    <div className="flex items-center justify-between w-full px-0.5">
                      <span className="text-[10px] font-bold opacity-90 truncate">
                        {keyConfig.displayLabel || keyConfig.label}
                      </span>
                      {indicatorBadge}
                    </div>

                    {/* Homing tactile bump for F & J */}
                    {keyConfig.hasTactileBump && (
                      <div className="w-2.5 h-0.5 rounded-full bg-slate-400/80 mb-0.5" />
                    )}

                    {/* Bottom metric */}
                    {keyData.total > 0 && metricMode !== 'errorRate' && (
                      <span className="text-[8px] opacity-60 font-mono tracking-tighter">
                        {keyData.total} typed
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Deep-Dive Key Telemetry Inspector */}
      {activeKeyDetails && (
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-slate-850/80 border border-blue-200/80 dark:border-slate-750 space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/60 dark:border-slate-750 pb-3.5">
            <div className="flex items-center gap-3.5">
              {/* 3D Keycap Visual */}
              <div className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-blue-500 text-white font-mono font-black text-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                {activeKeyDetails.cfg.id === ' ' ? 'SPC' : activeKeyDetails.cfg.label}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Key &apos;{activeKeyDetails.cfg.label}&apos; Telemetry
                  </h4>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                      activeKeyDetails.data.total === 0
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        : activeKeyDetails.errorRate >= 25
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                        : activeKeyDetails.errorRate >= 10
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    }`}
                  >
                    {activeKeyDetails.data.total === 0
                      ? 'Untested'
                      : activeKeyDetails.errorRate >= 25
                      ? 'Critical Weak Key'
                      : activeKeyDetails.errorRate >= 10
                      ? 'Moderate Errors'
                      : 'Mastered Key'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5 font-medium">
                  <Fingerprint className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    Assigned: <strong>{activeKeyDetails.cfg.finger}</strong> ({activeKeyDetails.cfg.hand === 'left' ? 'Left Hand' : activeKeyDetails.cfg.hand === 'right' ? 'Right Hand' : 'Both Hands'})
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                {activeKeyDetails.diagnosis}
              </span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center text-xs">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block font-sans">Total Typed</span>
              <span className="text-lg font-black text-slate-800 dark:text-slate-200 tabular-nums">
                {activeKeyDetails.data.total.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block font-sans">Errors Made</span>
              <span className="text-lg font-black text-rose-600 dark:text-rose-400 tabular-nums">
                {activeKeyDetails.data.errors}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block font-sans">Accuracy</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                {activeKeyDetails.accuracy}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase block font-sans">Error Rate</span>
              <span
                className={`text-lg font-black tabular-nums ${
                  activeKeyDetails.errorRate >= 20 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {activeKeyDetails.errorRate}%
              </span>
            </div>
          </div>

          {/* Misstrike Confusion Analysis (What keys were accidentally pressed) */}
          {activeKeyDetails.mistakePairs.length > 0 ? (
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-500" />
                <span>Misstrike Confusion Patterns (Keys Typed In Error):</span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {activeKeyDetails.mistakePairs.map((pair) => (
                  <div
                    key={pair.char}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-mono"
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Typed &apos;{pair.char}&apos;
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 font-black">
                      {pair.count}x ({pair.percent}%)
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium pt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Coaching Tip: {activeKeyDetails.coachingTip}</span>
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Clean precision record on this key! {activeKeyDetails.coachingTip}</span>
            </div>
          )}
        </div>
      )}

      {/* Weakest Keys vs Biomechanical Radar Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
        {/* Top Weakest Keys Ranked List */}
        <div className="p-4 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-rose-900 dark:text-rose-300">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Top Precision Bottlenecks (Weakest Keys)</span>
            </span>
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400">
              {struggleKeys.length} Identified
            </span>
          </div>

          {struggleKeys.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic py-3 text-center">
              No precision bottlenecks detected! Complete more tests to track weakest keys.
            </p>
          ) : (
            <div className="space-y-2">
              {struggleKeys.map((item, idx) => (
                <div
                  key={item.key}
                  onClick={() => setSelectedKeyId(item.key)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                    selectedKeyId === item.key
                      ? 'bg-rose-100/90 dark:bg-rose-900/40 border-rose-400 ring-1 ring-rose-400'
                      : 'bg-white dark:bg-slate-850 border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-900/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-rose-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                      {item.key === ' ' ? 'SPC' : item.key.toUpperCase()}
                    </span>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span>#{idx + 1} Key &apos;{item.key}&apos;</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                          · {item.config.finger}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.errors} error{item.errors === 1 ? '' : 's'} across {item.total} attempts
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-extrabold text-rose-600 dark:text-rose-400 block text-sm">
                      {Math.round(item.errorRate)}% err
                    </span>
                    <span className="text-[10px] text-slate-400">{Math.round(item.accuracy)}% acc</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Biomechanical Hand & Finger Fatigue Breakdown */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-blue-500" />
              <span>Biomechanical Finger Load Breakdown</span>
            </span>

            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-blue-600 dark:text-blue-400">Left: {biomechanicalBreakdown.leftAcc}%</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400">Right: {biomechanicalBreakdown.rightAcc}%</span>
            </div>
          </div>

          {/* Finger Accuracy Bars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {biomechanicalBreakdown.fingerList.slice(0, 6).map((f) => (
              <div
                key={f.name}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {f.name}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      f.total === 0
                        ? 'text-slate-400'
                        : f.accuracy >= 90
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : f.accuracy >= 80
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {f.total > 0 ? `${f.accuracy}%` : '—'}
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${f.total > 0 ? f.accuracy : 0}%`,
                      backgroundColor: f.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Weakest Finger Coaching Banner */}
          {biomechanicalBreakdown.weakestFinger ? (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                Weakest Biomechanical Finger: <strong>{biomechanicalBreakdown.weakestFinger.name}</strong> ({biomechanicalBreakdown.weakestFinger.accuracy}% acc, {biomechanicalBreakdown.weakestFinger.errors} typos). Keep your knuckles relaxed to improve accuracy.
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Even biomechanical balance across all finger placement zones.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
