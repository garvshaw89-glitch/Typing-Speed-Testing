import React, { useState, useMemo } from 'react';
import { Activity, Waves, PauseCircle, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface KeystrokeRhythmPoint {
  id: number;
  char: string;
  intervalMs: number;
  instantWpm: number;
  isPause: boolean;
  isSeverePause: boolean;
  isError: boolean;
  timestamp: number;
  rollingAvgIntervalMs: number;
}

interface TypingRhythmSparklineProps {
  points: KeystrokeRhythmPoint[];
  isTypingStarted: boolean;
  isTestActive: boolean;
  currentConsistency: number | null;
  activePauseMs: number | null;
  totalPauses: number;
  averageIntervalMs: number;
  liveWpm: number;
  reduceMotion?: boolean;
  highContrast?: boolean;
}

export const TypingRhythmSparkline: React.FC<TypingRhythmSparklineProps> = ({
  points,
  isTypingStarted,
  isTestActive,
  currentConsistency,
  activePauseMs,
  totalPauses,
  averageIntervalMs,
  liveWpm,
  reduceMotion = false,
  highContrast = false,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<KeystrokeRhythmPoint | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Consider the last 36 keystrokes for smooth rolling window
  const windowPoints = useMemo(() => {
    return points.slice(-36);
  }, [points]);

  // Graph SVG Dimensions
  const svgWidth = 520;
  const svgHeight = 60;
  const paddingLeft = 14;
  const paddingRight = 20;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const centerBaselineY = 28;

  // Compute curve coordinates
  const plottedPoints = useMemo(() => {
    if (windowPoints.length === 0) return [];

    const count = windowPoints.length;
    return windowPoints.map((pt, index) => {
      const x =
        count === 1
          ? paddingLeft + plotWidth / 2
          : paddingLeft + (index / (count - 1)) * plotWidth;

      const baseAvg = Math.max(70, pt.rollingAvgIntervalMs || averageIntervalMs || 180);
      const ratio = pt.intervalMs / baseAvg;

      let y = centerBaselineY;
      if (ratio < 1) {
        // Faster keystroke (burst) -> curves upward towards y = 10
        y = centerBaselineY - (1 - ratio) * 16;
      } else {
        // Slower keystroke (pause/hesitation) -> curves downward towards y = 52
        y = centerBaselineY + (ratio - 1) * 18;
      }

      // Clamp y within viewable range
      y = Math.max(9, Math.min(svgHeight - 8, y));

      return {
        ...pt,
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
      };
    });
  }, [windowPoints, averageIntervalMs, plotWidth, paddingLeft, centerBaselineY, svgHeight]);

  // Generate smooth SVG path string using cubic Bezier spline
  const { linePath, areaPath } = useMemo(() => {
    if (plottedPoints.length < 2) {
      return { linePath: '', areaPath: '' };
    }

    let d = `M ${plottedPoints[0].x} ${plottedPoints[0].y}`;
    for (let i = 0; i < plottedPoints.length - 1; i++) {
      const p0 = plottedPoints[i === 0 ? 0 : i - 1];
      const p1 = plottedPoints[i];
      const p2 = plottedPoints[i + 1];
      const p3 = plottedPoints[i + 2 < plottedPoints.length ? i + 2 : i + 1];

      // Catmull-Rom to Cubic Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }

    const firstPt = plottedPoints[0];
    const lastPt = plottedPoints[plottedPoints.length - 1];
    const fillD = `${d} L ${lastPt.x} ${svgHeight - 4} L ${firstPt.x} ${svgHeight - 4} Z`;

    return { linePath: d, areaPath: fillD };
  }, [plottedPoints, svgHeight]);

  // Derive rhythm stability state
  const isCurrentlyPausing = activePauseMs !== null && activePauseMs > 450;
  const isSeverelyPausing = activePauseMs !== null && activePauseMs > 900;

  const rhythmStatus = useMemo(() => {
    if (!isTypingStarted) {
      return {
        label: 'Awaiting Keystrokes',
        textColor: 'text-slate-400 dark:text-slate-500',
        dotColor: 'bg-slate-300 dark:bg-slate-600',
      };
    }
    if (isCurrentlyPausing) {
      return {
        label: isSeverelyPausing ? 'Long Pause Break' : 'Cadence Paused',
        textColor: 'text-rose-600 dark:text-rose-400 font-bold',
        dotColor: 'bg-rose-500 animate-pulse',
      };
    }
    if (currentConsistency === null || points.length < 5) {
      return {
        label: 'Calibrating Cadence',
        textColor: 'text-blue-500 dark:text-blue-400',
        dotColor: 'bg-blue-500',
      };
    }
    if (currentConsistency >= 88) {
      return {
        label: 'Harmonic Flow',
        textColor: 'text-emerald-600 dark:text-emerald-400 font-semibold',
        dotColor: 'bg-emerald-500',
      };
    }
    if (currentConsistency >= 75) {
      return {
        label: 'Steady Cadence',
        textColor: 'text-teal-600 dark:text-teal-400 font-semibold',
        dotColor: 'bg-teal-500',
      };
    }
    if (currentConsistency >= 60) {
      return {
        label: 'Variable Rhythm',
        textColor: 'text-amber-600 dark:text-amber-400 font-medium',
        dotColor: 'bg-amber-500',
      };
    }
    return {
      label: 'Frequent Pauses / Spikes',
      textColor: 'text-rose-600 dark:text-rose-400 font-medium',
      dotColor: 'bg-rose-500',
    };
  }, [isTypingStarted, isCurrentlyPausing, isSeverelyPausing, currentConsistency, points.length]);

  return (
    <section
      aria-label="Real-time typing rhythm and stability graph"
      className="p-3 sm:p-4 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all"
    >
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-wrap items-center justify-between gap-y-1.5 gap-x-3 mb-2 font-mono text-xs">
        {/* Left: Title & Status Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-bold font-sans">
            <Waves className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span className="text-xs tracking-tight">Typing Rhythm</span>
          </div>

          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>

          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs">
            <span className={`w-2 h-2 rounded-full ${rhythmStatus.dotColor} shrink-0`} />
            <span className={rhythmStatus.textColor}>{rhythmStatus.label}</span>
          </div>
        </div>

        {/* Right: Unboxed Clean Metrics */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-sans">Stability: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {currentConsistency !== null ? `${currentConsistency}%` : '—'}
            </span>
          </div>

          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>

          <div>
            <span className="text-slate-400 dark:text-slate-500 font-sans">Pauses: </span>
            <span
              className={`font-bold tabular-nums ${
                totalPauses > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {totalPauses}
            </span>
          </div>

          <span aria-hidden="true" className="text-slate-300 dark:text-slate-600 hidden xs:inline">·</span>

          <div className="hidden xs:block">
            <span className="text-slate-400 dark:text-slate-500 font-sans">Tempo: </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
              {averageIntervalMs > 0 ? `${averageIntervalMs}ms` : '—'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowExplanation((prev) => !prev)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors cursor-pointer"
            title="What is Typing Rhythm?"
            aria-label="Toggle rhythm explanation"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Explanation Banner (Collapsible) */}
      {showExplanation && (
        <div className="mb-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">How to read the rhythm graph: </span>
            A flat, steady line in the green corridor means metronomic speed and relaxed fingers.
            Downward dips and amber dots mark pauses, hesitation on difficult keys, or rhythm breaks.
            Smooth typing beats frantic bursts!
          </div>
        </div>
      )}

      {/* Real-time SVG Graph Container */}
      <div className="relative w-full h-14 sm:h-16 rounded-xl bg-slate-50/90 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/70 overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full select-none"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Area Fill Gradient */}
            <linearGradient id="rhythmAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={highContrast ? '#2563eb' : '#0d9488'}
                stopOpacity="0.25"
              />
              <stop
                offset="100%"
                stopColor={highContrast ? '#2563eb' : '#0d9488'}
                stopOpacity="0.0"
              />
            </linearGradient>

            {/* Line Stroke Gradient */}
            <linearGradient id="rhythmLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>

          {/* Harmonic Cadence Corridor (Steady Zone) */}
          <rect
            x={paddingLeft}
            y={centerBaselineY - 9}
            width={plotWidth}
            height={18}
            className="fill-emerald-500/5 dark:fill-emerald-400/5"
            rx="4"
          />

          {/* Central Target Guideline */}
          <line
            x1={paddingLeft}
            y1={centerBaselineY}
            x2={svgWidth - paddingRight}
            y2={centerBaselineY}
            strokeDasharray="3 3"
            className="stroke-slate-300 dark:stroke-slate-700/80 stroke-1"
          />

          {/* Guideline Labels (Subtle) */}
          <text
            x={paddingLeft + 4}
            y={centerBaselineY - 11}
            className="fill-slate-400 dark:fill-slate-500 text-[8px] font-mono select-none"
          >
            Burst (Fast)
          </text>
          <text
            x={paddingLeft + 4}
            y={centerBaselineY + 16}
            className="fill-slate-400 dark:fill-slate-500 text-[8px] font-mono select-none"
          >
            Pause / Hesitation
          </text>

          {/* Resting State (Before user types or first keystroke) */}
          {(!isTypingStarted || plottedPoints.length < 2) && (
            <path
              d={`M ${paddingLeft} ${centerBaselineY} Q ${svgWidth * 0.25} ${centerBaselineY - 2}, ${svgWidth * 0.5} ${centerBaselineY} T ${svgWidth - paddingRight} ${centerBaselineY}`}
              className="stroke-slate-300 dark:stroke-slate-600 stroke-1.5 fill-none stroke-dasharray-[4_4]"
            />
          )}

          {/* Active Area Gradient */}
          {areaPath && (
            <path d={areaPath} fill="url(#rhythmAreaGradient)" className="transition-opacity duration-150" />
          )}

          {/* Active Rhythm Sparkline Curve */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="url(#rhythmLineGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={reduceMotion ? '' : 'transition-all duration-75'}
            />
          )}

          {/* Active Pause Visual Extender: When user stops typing mid-test */}
          {isCurrentlyPausing && plottedPoints.length > 0 && (
            <g className="animate-pulse">
              <line
                x1={plottedPoints[plottedPoints.length - 1].x}
                y1={plottedPoints[plottedPoints.length - 1].y}
                x2={Math.min(svgWidth - paddingRight, plottedPoints[plottedPoints.length - 1].x + 16)}
                y2={svgHeight - 10}
                className="stroke-rose-500 dark:stroke-rose-400 stroke-2 stroke-dasharray-[2_2]"
              />
              <circle
                cx={Math.min(svgWidth - paddingRight, plottedPoints[plottedPoints.length - 1].x + 16)}
                cy={svgHeight - 10}
                r="4"
                className="fill-rose-500"
              />
            </g>
          )}

          {/* Keystroke Data Points and Pause Markers */}
          {plottedPoints.map((pt) => {
            const isHovered = hoveredPoint?.id === pt.id;

            if (pt.isPause) {
              return (
                <g
                  key={pt.id}
                  className="cursor-pointer"
                  onMouseEnter={(e) => {
                    setHoveredPoint(pt);
                    setHoverPos({ x: pt.x, y: pt.y });
                  }}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {/* Subtle outer halo on severe pauses */}
                  {pt.isSeverePause && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="7"
                      className="fill-rose-500/20 stroke-rose-500/50 stroke-1 animate-pulse"
                    />
                  )}
                  {/* Main pause dot marker */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? '5' : '3.5'}
                    className={`${
                      pt.isSeverePause
                        ? 'fill-rose-500 stroke-rose-200 dark:stroke-rose-900'
                        : 'fill-amber-500 stroke-amber-200 dark:stroke-amber-900'
                    } stroke-1.5 transition-transform`}
                  />
                </g>
              );
            }

            // Normal point: subtle hover hitbox
            return (
              <circle
                key={pt.id}
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? '4' : '2'}
                className={`${
                  isHovered
                    ? 'fill-blue-500 stroke-white dark:stroke-slate-900 stroke-1.5'
                    : 'fill-transparent hover:fill-teal-500/60'
                } transition-all cursor-pointer`}
                onMouseEnter={() => {
                  setHoveredPoint(pt);
                  setHoverPos({ x: pt.x, y: pt.y });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Current Leading Edge Pulsing Dot */}
          {plottedPoints.length > 0 && !isCurrentlyPausing && (
            <g>
              <circle
                cx={plottedPoints[plottedPoints.length - 1].x}
                cy={plottedPoints[plottedPoints.length - 1].y}
                r="4.5"
                className="fill-teal-500 dark:fill-teal-400 stroke-white dark:stroke-slate-900 stroke-1.5"
              />
              <circle
                cx={plottedPoints[plottedPoints.length - 1].x}
                cy={plottedPoints[plottedPoints.length - 1].y}
                r="7"
                className="fill-transparent stroke-teal-400/50 dark:stroke-teal-300/50 stroke-1 animate-ping-once"
              />
            </g>
          )}
        </svg>

        {/* Resting Prompt Text */}
        {(!isTypingStarted || plottedPoints.length < 2) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[11px] sm:text-xs font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <span>★</span>
              <span>Smooth, metronomic cadence creates a steady wave · Start typing</span>
            </span>
          </div>
        )}

        {/* Live Active Pause Pill Overlay */}
        {isCurrentlyPausing && (
          <div className="absolute bottom-1 right-2 pointer-events-none flex items-center gap-1 py-0.5 px-2 rounded-md bg-rose-500/90 text-white font-mono text-[10px] font-bold shadow-xs animate-fade-in">
            <PauseCircle className="w-3 h-3 animate-spin" />
            <span>Pause Break: {(activePauseMs / 1000).toFixed(1)}s</span>
          </div>
        )}

        {/* Interactive Hover Tooltip */}
        {hoveredPoint && hoverPos && (
          <div
            className="absolute z-20 pointer-events-none py-1 px-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-mono shadow-lg transition-transform transform -translate-x-1/2 -translate-y-full mb-1 flex items-center gap-1.5 whitespace-nowrap"
            style={{
              left: `${(hoverPos.x / svgWidth) * 100}%`,
              top: `${Math.max(16, (hoverPos.y / svgHeight) * 100)}%`,
            }}
          >
            <span className="font-bold underline decoration-blue-400">
              '{hoveredPoint.char === ' ' ? 'Space' : hoveredPoint.char}'
            </span>
            <span>·</span>
            <span>{hoveredPoint.intervalMs}ms</span>
            <span>·</span>
            <span>{hoveredPoint.instantWpm} WPM</span>
            {hoveredPoint.isPause && (
              <span className="font-bold text-amber-300 dark:text-amber-600">
                ({hoveredPoint.isSeverePause ? 'Long Pause' : 'Hesitation'})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sub-legend / Quick Guidance */}
      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full inline-block" />
            <span>Flow Zone</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block" />
            <span>Pause / Hesitation (&gt;400ms)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full inline-block" />
            <span>Severe Break (&gt;750ms)</span>
          </span>
        </div>

        <span className="hidden sm:inline text-slate-400/80">
          Last 35 keystrokes
        </span>
      </div>
    </section>
  );
};
