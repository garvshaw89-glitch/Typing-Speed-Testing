import React, { useState, useMemo } from 'react';
import { TestResult } from '../types';
import { AlertCircle, CheckCircle2, HelpCircle, Keyboard, Target, Sparkles, Fingerprint } from 'lucide-react';

interface KeyboardLayoutProps {
  history?: TestResult[];
  singleResult?: TestResult;
  title?: string;
  subtitle?: string;
}

// Key definition layout structure
interface KeyConfig {
  id: string;
  label: string;
  displayLabel?: string;
  width?: number; // relative key width (1 = standard key)
  fingerHint?: string;
}

// Keyboard row definitions (QWERTY layout)
const KEYBOARD_ROWS: KeyConfig[][] = [
  // Row 1: Numbers & symbols
  [
    { id: '`', label: '`', displayLabel: '` ~', fingerHint: 'Left Pinky' },
    { id: '1', label: '1', displayLabel: '1 !', fingerHint: 'Left Pinky' },
    { id: '2', label: '2', displayLabel: '2 @', fingerHint: 'Left Ring' },
    { id: '3', label: '3', displayLabel: '3 #', fingerHint: 'Left Middle' },
    { id: '4', label: '4', displayLabel: '4 $', fingerHint: 'Left Index' },
    { id: '5', label: '5', displayLabel: '5 %', fingerHint: 'Left Index' },
    { id: '6', label: '6', displayLabel: '6 ^', fingerHint: 'Right Index' },
    { id: '7', label: '7', displayLabel: '7 &', fingerHint: 'Right Index' },
    { id: '8', label: '8', displayLabel: '8 *', fingerHint: 'Right Middle' },
    { id: '9', label: '9', displayLabel: '9 (', fingerHint: 'Right Ring' },
    { id: '0', label: '0', displayLabel: '0 )', fingerHint: 'Right Pinky' },
    { id: '-', label: '-', displayLabel: '- _', fingerHint: 'Right Pinky' },
    { id: '=', label: '=', displayLabel: '= +', fingerHint: 'Right Pinky' },
    { id: 'backspace', label: 'Backspace', displayLabel: '⌫', width: 2, fingerHint: 'Right Pinky' },
  ],
  // Row 2: QWERTY
  [
    { id: 'tab', label: 'Tab', displayLabel: 'Tab ⇥', width: 1.5, fingerHint: 'Left Pinky' },
    { id: 'q', label: 'Q', fingerHint: 'Left Pinky' },
    { id: 'w', label: 'W', fingerHint: 'Left Ring' },
    { id: 'e', label: 'E', fingerHint: 'Left Middle' },
    { id: 'r', label: 'R', fingerHint: 'Left Index' },
    { id: 't', label: 'T', fingerHint: 'Left Index' },
    { id: 'y', label: 'Y', fingerHint: 'Right Index' },
    { id: 'u', label: 'U', fingerHint: 'Right Index' },
    { id: 'i', label: 'I', fingerHint: 'Right Middle' },
    { id: 'o', label: 'O', fingerHint: 'Right Ring' },
    { id: 'p', label: 'P', fingerHint: 'Right Pinky' },
    { id: '[', label: '[', displayLabel: '[ {', fingerHint: 'Right Pinky' },
    { id: ']', label: ']', displayLabel: '] }', fingerHint: 'Right Pinky' },
    { id: '\\', label: '\\', displayLabel: '\\ |', width: 1.5, fingerHint: 'Right Pinky' },
  ],
  // Row 3: Home Row
  [
    { id: 'caps', label: 'Caps', displayLabel: 'Caps', width: 1.75, fingerHint: 'Left Pinky' },
    { id: 'a', label: 'A', fingerHint: 'Left Pinky (Home)' },
    { id: 's', label: 'S', fingerHint: 'Left Ring (Home)' },
    { id: 'd', label: 'D', fingerHint: 'Left Middle (Home)' },
    { id: 'f', label: 'F', fingerHint: 'Left Index (Home Bump)' },
    { id: 'g', label: 'G', fingerHint: 'Left Index' },
    { id: 'h', label: 'H', fingerHint: 'Right Index' },
    { id: 'j', label: 'J', fingerHint: 'Right Index (Home Bump)' },
    { id: 'k', label: 'K', fingerHint: 'Right Middle (Home)' },
    { id: 'l', label: 'L', fingerHint: 'Right Ring (Home)' },
    { id: ';', label: ';', displayLabel: '; :', fingerHint: 'Right Pinky (Home)' },
    { id: "'", label: "'", displayLabel: "' \"", fingerHint: 'Right Pinky' },
    { id: 'enter', label: 'Enter', displayLabel: 'Enter ↵', width: 2.25, fingerHint: 'Right Pinky' },
  ],
  // Row 4: ZXCVB
  [
    { id: 'shift_l', label: 'Shift', displayLabel: '⇧ Shift', width: 2.25, fingerHint: 'Left Pinky' },
    { id: 'z', label: 'Z', fingerHint: 'Left Pinky' },
    { id: 'x', label: 'X', fingerHint: 'Left Ring' },
    { id: 'c', label: 'C', fingerHint: 'Left Middle' },
    { id: 'v', label: 'V', fingerHint: 'Left Index' },
    { id: 'b', label: 'B', fingerHint: 'Left Index' },
    { id: 'n', label: 'N', fingerHint: 'Right Index' },
    { id: 'm', label: 'M', fingerHint: 'Right Index' },
    { id: ',', label: ',', displayLabel: ', <', fingerHint: 'Right Middle' },
    { id: '.', label: '.', displayLabel: '. >', fingerHint: 'Right Ring' },
    { id: '/', label: '/', displayLabel: '/ ?', fingerHint: 'Right Pinky' },
    { id: 'shift_r', label: 'Shift', displayLabel: '⇧ Shift', width: 2.75, fingerHint: 'Right Pinky' },
  ],
  // Row 5: Space
  [
    { id: 'ctrl_l', label: 'Ctrl', displayLabel: 'Ctrl', width: 1.5, fingerHint: 'Left Pinky' },
    { id: 'alt_l', label: 'Alt', displayLabel: 'Alt', width: 1.5, fingerHint: 'Left Thumb' },
    { id: ' ', label: ' ', displayLabel: 'Space Bar', width: 6.5, fingerHint: 'Left/Right Thumb' },
    { id: 'alt_r', label: 'Alt', displayLabel: 'Alt', width: 1.5, fingerHint: 'Right Thumb' },
    { id: 'ctrl_r', label: 'Ctrl', displayLabel: 'Ctrl', width: 1.5, fingerHint: 'Right Pinky' },
  ],
];

export const KeyboardLayout: React.FC<KeyboardLayoutProps> = ({
  history = [],
  singleResult,
  title = 'Visual Keyboard Heatmap',
  subtitle = 'Identify keys you struggle with most to target your typing practice',
}) => {
  const [activeScope, setActiveScope] = useState<'all' | 'latest'>(
    singleResult ? 'latest' : 'all'
  );
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);

  // Combine and aggregate key statistics
  const aggregatedStats = useMemo(() => {
    const statsMap: Record<string, { total: number; errors: number }> = {};

    const resultsToProcess =
      activeScope === 'latest' && singleResult
        ? [singleResult]
        : history.length > 0
        ? history
        : singleResult
        ? [singleResult]
        : [];

    resultsToProcess.forEach((res) => {
      if (res.keyStats) {
        (Object.entries(res.keyStats) as [string, { total: number; errors: number }][]).forEach(([char, data]) => {
          const keyLower = char.toLowerCase();
          if (!statsMap[keyLower]) {
            statsMap[keyLower] = { total: 0, errors: 0 };
          }
          statsMap[keyLower].total += data.total;
          statsMap[keyLower].errors += data.errors;
        });
      }
    });

    return statsMap;
  }, [history, singleResult, activeScope]);

  // Rank keys to find struggle keys vs mastered keys
  const { struggleKeys, masteredKeys, totalKeysTypedCount } = useMemo(() => {
    const list: { key: string; total: number; errors: number; errorRate: number; accuracy: number }[] = [];
    let totalAttempts = 0;

    (Object.entries(aggregatedStats) as [string, { total: number; errors: number }][]).forEach(([key, data]) => {
      totalAttempts += data.total;
      if (data.total > 0) {
        const errorRate = (data.errors / data.total) * 100;
        const accuracy = ((data.total - data.errors) / data.total) * 100;
        list.push({ key, total: data.total, errors: data.errors, errorRate, accuracy });
      }
    });

    // Struggle keys: higher error rate first (min 1 attempt)
    const struggle = [...list]
      .filter((k) => k.errors > 0)
      .sort((a, b) => b.errorRate - a.errorRate || b.errors - a.errors)
      .slice(0, 5);

    // Mastered keys: highest accuracy and highest volume
    const mastered = [...list]
      .filter((k) => k.accuracy >= 90)
      .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total)
      .slice(0, 5);

    return { struggleKeys: struggle, masteredKeys: mastered, totalKeysTypedCount: totalAttempts };
  }, [aggregatedStats]);

  // Selected key data for inspector
  const activeKeyInfo = useMemo(() => {
    if (!selectedKeyId) return null;
    const keyLower = selectedKeyId.toLowerCase();
    const data = aggregatedStats[keyLower] || { total: 0, errors: 0 };
    const errorRate = data.total > 0 ? (data.errors / data.total) * 100 : 0;
    const accuracy = data.total > 0 ? Math.round(((data.total - data.errors) / data.total) * 100) : 100;

    // Find finger hint
    let finger = 'Standard Placement';
    for (const row of KEYBOARD_ROWS) {
      const match = row.find((k) => k.id.toLowerCase() === keyLower);
      if (match?.fingerHint) {
        finger = match.fingerHint;
        break;
      }
    }

    let statusLabel = 'Not Yet Typed';
    let statusBg = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

    if (data.total > 0) {
      if (errorRate >= 20) {
        statusLabel = '⚡ Struggle Key (Needs Practice)';
        statusBg = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
      } else if (errorRate >= 8) {
        statusLabel = '⚠️ Moderate Errors';
        statusBg = 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
      } else {
        statusLabel = '✅ Mastered Key';
        statusBg = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
      }
    }

    return {
      id: selectedKeyId,
      total: data.total,
      errors: data.errors,
      errorRate: Math.round(errorRate),
      accuracy,
      finger,
      statusLabel,
      statusBg,
    };
  }, [selectedKeyId, aggregatedStats]);

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Scope Selector Toggle */}
        {singleResult && history.length > 0 && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold shrink-0">
            <button
              onClick={() => setActiveScope('latest')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeScope === 'latest'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Latest Test
            </button>
            <button
              onClick={() => setActiveScope('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeScope === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All History ({history.length})
            </button>
          </div>
        )}
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
        <span className="font-extrabold text-slate-700 dark:text-slate-300">Heatmap Legend:</span>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-rose-500/30 border border-rose-500 ring-1 ring-rose-500/50" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Struggle Key (&ge;20% errors)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-amber-500/30 border border-amber-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Moderate Mistakes (8-19%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500/20 border border-emerald-500" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">High Accuracy (&lt;8%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600" />
            <span className="text-slate-400 font-medium">Untested</span>
          </div>
        </div>
      </div>

      {/* Visual Keyboard Container (Responsive Scroll on Mobile) */}
      <div className="overflow-x-auto pb-2 select-none">
        <div className="min-w-[680px] p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-2xl space-y-2 font-mono">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5">
              {row.map((keyConfig) => {
                const keyLower = keyConfig.id.toLowerCase();
                const keyData = aggregatedStats[keyLower] || { total: 0, errors: 0 };

                let styleClass =
                  'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750';
                let indicatorDot = null;

                if (keyData.total > 0) {
                  const errorRate = (keyData.errors / keyData.total) * 100;

                  if (errorRate >= 20) {
                    styleClass =
                      'bg-rose-900/60 border-rose-500 text-rose-100 font-extrabold shadow-lg shadow-rose-950/50 ring-2 ring-rose-500/60 animate-pulse';
                    indicatorDot = <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />;
                  } else if (errorRate >= 8) {
                    styleClass =
                      'bg-amber-900/50 border-amber-500 text-amber-100 font-bold';
                    indicatorDot = <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />;
                  } else {
                    styleClass =
                      'bg-emerald-950/60 border-emerald-500/80 text-emerald-200 font-medium';
                    indicatorDot = <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 opacity-80" />;
                  }
                }

                const isSelected = selectedKeyId?.toLowerCase() === keyLower;
                const widthStyle = keyConfig.width ? { flex: `${keyConfig.width} 1 0%` } : { flex: '1 1 0%' };

                return (
                  <button
                    key={keyConfig.id}
                    onClick={() => setSelectedKeyId(keyConfig.id)}
                    style={widthStyle}
                    className={`h-12 min-w-[36px] rounded-xl border flex flex-col items-center justify-between p-1.5 text-xs transition-all cursor-pointer relative group ${styleClass} ${
                      isSelected
                        ? 'ring-2 ring-blue-400 scale-105 z-10 border-blue-400 shadow-blue-500/30'
                        : ''
                    }`}
                    title={`Key ${keyConfig.label}: ${keyData.total} typed, ${keyData.errors} errors`}
                  >
                    <div className="flex items-center justify-between w-full px-0.5">
                      <span className="text-[10px] opacity-75 font-semibold">
                        {keyConfig.displayLabel || keyConfig.label}
                      </span>
                      {indicatorDot}
                    </div>

                    {keyData.total > 0 && (
                      <span className="text-[9px] font-mono tracking-tighter opacity-90">
                        {Math.round(((keyData.total - keyData.errors) / keyData.total) * 100)}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Key Details Inspector */}
      {activeKeyInfo ? (
        <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-mono font-black text-xl flex items-center justify-center shadow-md">
                {activeKeyInfo.id.toUpperCase() === ' ' ? 'SPACE' : activeKeyInfo.id.toUpperCase()}
              </div>
              <div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${activeKeyInfo.statusBg}`}>
                  {activeKeyInfo.statusLabel}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 font-medium">
                  <Fingerprint className="w-3.5 h-3.5 text-blue-500" />
                  <span>Finger: {activeKeyInfo.finger}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedKeyId(null)}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-semibold underline"
            >
              Close Inspector
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 font-mono text-center text-xs">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Typed Count</span>
              <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                {activeKeyInfo.total}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Errors Made</span>
              <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                {activeKeyInfo.errors}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Accuracy</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {activeKeyInfo.accuracy}%
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 text-center text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-2 italic">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Click any key on the visual keyboard above to view finger placement & accuracy stats.</span>
        </div>
      )}

      {/* Struggle Keys vs Mastered Keys Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Top Struggle Keys */}
        <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-rose-800 dark:text-rose-300">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Top Struggle Keys
            </span>
            <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400">
              {struggleKeys.length} Identified
            </span>
          </div>

          {struggleKeys.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
              No struggle keys detected yet! Complete more tests to track key accuracy.
            </p>
          ) : (
            <div className="space-y-2">
              {struggleKeys.map((item) => (
                <div
                  key={item.key}
                  onClick={() => setSelectedKeyId(item.key)}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-rose-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-sm">
                      {item.key === ' ' ? 'SPC' : item.key.toUpperCase()}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                        Key &apos;{item.key}&apos;
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {item.errors} error{item.errors === 1 ? '' : 's'} / {item.total} typed
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-extrabold text-rose-600 dark:text-rose-400 block">
                      {Math.round(item.errorRate)}% error
                    </span>
                    <span className="text-[10px] text-slate-400">{Math.round(item.accuracy)}% acc</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mastered Keys */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Most Accurate Keys
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              {masteredKeys.length} Mastered
            </span>
          </div>

          {masteredKeys.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
              Keep typing to build accuracy stats for individual keys.
            </p>
          ) : (
            <div className="space-y-2">
              {masteredKeys.map((item) => (
                <div
                  key={item.key}
                  onClick={() => setSelectedKeyId(item.key)}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-xs cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-mono font-black flex items-center justify-center text-sm shadow-sm">
                      {item.key === ' ' ? 'SPC' : item.key.toUpperCase()}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">
                        Key &apos;{item.key}&apos;
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {item.total} attempt{item.total === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block">
                      {Math.round(item.accuracy)}% accuracy
                    </span>
                    <span className="text-[10px] text-slate-400">{item.errors} error</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
