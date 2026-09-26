import { KeyboardActiveColor, KeyboardHeatmapPalette } from '../types';

export interface ActiveColorConfig {
  id: KeyboardActiveColor;
  name: string;
  hex: string;
  badgeBg: string;
  targetGlow: string;
  targetBorder: string;
  targetBg: string;
  targetRing: string;
  successBg: string;
  successBorder: string;
  successGlow: string;
  anchorBorder: string;
  anchorGlow: string;
  anchorBg: string;
  anchorBadgeBg: string;
}

export const ACTIVE_COLOR_OPTIONS: Record<KeyboardActiveColor, ActiveColorConfig> = {
  blue: {
    id: 'blue',
    name: 'Electric Blue',
    hex: '#3b82f6',
    badgeBg: 'bg-blue-600 text-white',
    targetGlow: 'shadow-[0_0_14px_rgba(59,130,246,0.65)]',
    targetBorder: 'border-blue-400',
    targetBg: 'bg-blue-600/30 text-blue-200',
    targetRing: 'ring-2 ring-blue-400/90',
    successBg: 'bg-emerald-600 text-white',
    successBorder: 'border-emerald-400',
    successGlow: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    anchorBorder: 'border-blue-400 ring-2 ring-blue-500/70',
    anchorGlow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    anchorBg: 'bg-blue-950/40 text-blue-200',
    anchorBadgeBg: 'bg-blue-500/20 text-blue-300 border-blue-400/50',
  },
  emerald: {
    id: 'emerald',
    name: 'Cyber Emerald',
    hex: '#10b981',
    badgeBg: 'bg-emerald-600 text-white',
    targetGlow: 'shadow-[0_0_14px_rgba(16,185,129,0.65)]',
    targetBorder: 'border-emerald-400',
    targetBg: 'bg-emerald-600/30 text-emerald-200',
    targetRing: 'ring-2 ring-emerald-400/90',
    successBg: 'bg-teal-600 text-white',
    successBorder: 'border-teal-400',
    successGlow: 'shadow-[0_0_12px_rgba(20,184,166,0.5)]',
    anchorBorder: 'border-emerald-400 ring-2 ring-emerald-500/70',
    anchorGlow: 'shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    anchorBg: 'bg-emerald-950/40 text-emerald-200',
    anchorBadgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
  },
  purple: {
    id: 'purple',
    name: 'Neon Purple',
    hex: '#a855f7',
    badgeBg: 'bg-purple-600 text-white',
    targetGlow: 'shadow-[0_0_14px_rgba(168,85,247,0.65)]',
    targetBorder: 'border-purple-400',
    targetBg: 'bg-purple-600/30 text-purple-200',
    targetRing: 'ring-2 ring-purple-400/90',
    successBg: 'bg-violet-600 text-white',
    successBorder: 'border-violet-400',
    successGlow: 'shadow-[0_0_12px_rgba(139,92,246,0.5)]',
    anchorBorder: 'border-purple-400 ring-2 ring-purple-500/70',
    anchorGlow: 'shadow-[0_0_10px_rgba(168,85,247,0.5)]',
    anchorBg: 'bg-purple-950/40 text-purple-200',
    anchorBadgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/50',
  },
  cyan: {
    id: 'cyan',
    name: 'Hyper Cyan',
    hex: '#06b6d4',
    badgeBg: 'bg-cyan-600 text-white',
    targetGlow: 'shadow-[0_0_14px_rgba(6,182,212,0.65)]',
    targetBorder: 'border-cyan-400',
    targetBg: 'bg-cyan-600/30 text-cyan-200',
    targetRing: 'ring-2 ring-cyan-400/90',
    successBg: 'bg-sky-600 text-white',
    successBorder: 'border-sky-400',
    successGlow: 'shadow-[0_0_12px_rgba(14,165,233,0.5)]',
    anchorBorder: 'border-cyan-400 ring-2 ring-cyan-500/70',
    anchorGlow: 'shadow-[0_0_10px_rgba(6,182,212,0.5)]',
    anchorBg: 'bg-cyan-950/40 text-cyan-200',
    anchorBadgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
  },
  amber: {
    id: 'amber',
    name: 'Warm Amber',
    hex: '#f59e0b',
    badgeBg: 'bg-amber-600 text-white',
    targetGlow: 'shadow-[0_0_14px_rgba(245,158,11,0.65)]',
    targetBorder: 'border-amber-400',
    targetBg: 'bg-amber-600/30 text-amber-200',
    targetRing: 'ring-2 ring-amber-400/90',
    successBg: 'bg-yellow-600 text-white',
    successBorder: 'border-yellow-400',
    successGlow: 'shadow-[0_0_12px_rgba(234,179,8,0.5)]',
    anchorBorder: 'border-amber-400 ring-2 ring-amber-500/70',
    anchorGlow: 'shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    anchorBg: 'bg-amber-950/40 text-amber-200',
    anchorBadgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
  },
  rose: {
    id: 'rose',
    name: 'Vivid Rose',
    hex: '#f43f5e',
    badgeBg: 'bg-rose-600 text-white',
    targetGlow: 'shadow-[0_0_14px_rgba(244,63,94,0.65)]',
    targetBorder: 'border-rose-400',
    targetBg: 'bg-rose-600/30 text-rose-200',
    targetRing: 'ring-2 ring-rose-400/90',
    successBg: 'bg-pink-600 text-white',
    successBorder: 'border-pink-400',
    successGlow: 'shadow-[0_0_12px_rgba(236,72,153,0.5)]',
    anchorBorder: 'border-rose-400 ring-2 ring-rose-500/70',
    anchorGlow: 'shadow-[0_0_10px_rgba(244,63,94,0.5)]',
    anchorBg: 'bg-rose-950/40 text-rose-200',
    anchorBadgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/50',
  },
};

export interface HeatmapPaletteConfig {
  id: KeyboardHeatmapPalette;
  name: string;
  description: string;
  criticalClass: string;
  criticalGlow: string;
  moderateClass: string;
  optimalClass: string;
  untestedClass: string;
  gradientStops: [string, string, string]; // [optimal, moderate, critical]
}

export const HEATMAP_PALETTE_OPTIONS: Record<KeyboardHeatmapPalette, HeatmapPaletteConfig> = {
  thermal: {
    id: 'thermal',
    name: 'Classic Thermal',
    description: 'Emerald to Warm Amber to Crimson Red',
    criticalClass: 'bg-rose-950/80 border-rose-500 text-rose-100',
    criticalGlow: 'shadow-[0_0_12px_rgba(244,63,94,0.45)]',
    moderateClass: 'bg-amber-950/70 border-amber-500 text-amber-100',
    optimalClass: 'bg-emerald-950/60 border-emerald-500/70 text-emerald-200',
    untestedClass: 'bg-slate-900 border-slate-800 text-slate-400',
    gradientStops: ['#10b981', '#f59e0b', '#ef4444'],
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'Laser Cyan to Synth Violet to Hot Pink',
    criticalClass: 'bg-pink-950/80 border-pink-400 text-pink-100',
    criticalGlow: 'shadow-[0_0_14px_rgba(244,63,94,0.6)]',
    moderateClass: 'bg-purple-950/70 border-purple-400 text-purple-100',
    optimalClass: 'bg-cyan-950/60 border-cyan-400/80 text-cyan-200',
    untestedClass: 'bg-slate-900 border-slate-800 text-slate-400',
    gradientStops: ['#06b6d4', '#a855f7', '#ec4899'],
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix Terminal',
    description: 'Dark Forest to Phosphor Green to Acid Lime',
    criticalClass: 'bg-lime-950/80 border-lime-400 text-lime-100',
    criticalGlow: 'shadow-[0_0_14px_rgba(132,204,22,0.6)]',
    moderateClass: 'bg-emerald-950/70 border-emerald-500 text-emerald-100',
    optimalClass: 'bg-green-950/60 border-green-600/70 text-green-200',
    untestedClass: 'bg-slate-900 border-slate-800 text-slate-500',
    gradientStops: ['#15803d', '#10b981', '#84cc16'],
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Blaze',
    description: 'Golden Sunrise to Flame Orange to Vermilion',
    criticalClass: 'bg-red-950/80 border-red-500 text-red-100',
    criticalGlow: 'shadow-[0_0_12px_rgba(239,68,68,0.5)]',
    moderateClass: 'bg-orange-950/70 border-orange-500 text-orange-100',
    optimalClass: 'bg-amber-950/60 border-amber-500/70 text-amber-200',
    untestedClass: 'bg-slate-900 border-slate-800 text-slate-400',
    gradientStops: ['#f59e0b', '#f97316', '#dc2626'],
  },
  ocean: {
    id: 'ocean',
    name: 'Deep Ocean',
    description: 'Aquamarine to Cobalt Blue to Deep Ultra Violet',
    criticalClass: 'bg-violet-950/80 border-violet-500 text-violet-100',
    criticalGlow: 'shadow-[0_0_12px_rgba(139,92,246,0.5)]',
    moderateClass: 'bg-blue-950/70 border-blue-500 text-blue-100',
    optimalClass: 'bg-teal-950/60 border-teal-500/70 text-teal-200',
    untestedClass: 'bg-slate-900 border-slate-800 text-slate-400',
    gradientStops: ['#14b8a6', '#3b82f6', '#8b5cf6'],
  },
};

// Home Row Rest Anchors for Touch Typing
export interface HomeRowAnchor {
  keyId: string;
  label: string;
  fingerName: string;
  hand: 'left' | 'right' | 'both';
}

export const HOME_ROW_ANCHORS: Record<string, HomeRowAnchor> = {
  'left-pinky': { keyId: 'a', label: 'A', fingerName: 'Left Pinky', hand: 'left' },
  'left-ring': { keyId: 's', label: 'S', fingerName: 'Left Ring', hand: 'left' },
  'left-middle': { keyId: 'd', label: 'D', fingerName: 'Left Middle', hand: 'left' },
  'left-index': { keyId: 'f', label: 'F', fingerName: 'Left Index', hand: 'left' },
  'right-index': { keyId: 'j', label: 'J', fingerName: 'Right Index', hand: 'right' },
  'right-middle': { keyId: 'k', label: 'K', fingerName: 'Right Middle', hand: 'right' },
  'right-ring': { keyId: 'l', label: 'L', fingerName: 'Right Ring', hand: 'right' },
  'right-pinky': { keyId: ';', label: ';', fingerName: 'Right Pinky', hand: 'right' },
  thumb: { keyId: ' ', label: 'SPACE', fingerName: 'Thumbs', hand: 'both' },
};

/**
 * Calculates ergonomic touch typing reach trajectory from home row anchor to target key.
 */
export function calculateErgonomicTrajectory(
  targetKeyId: string,
  finger: string
): {
  anchorKeyId: string;
  anchorLabel: string;
  fingerName: string;
  isHomeRowRest: boolean;
  reachDescription: string;
  directionIcon: string;
} {
  const anchor = HOME_ROW_ANCHORS[finger] || {
    keyId: 'f',
    label: 'F',
    fingerName: 'Index',
    hand: 'left' as const,
  };

  const lowerTarget = targetKeyId.toLowerCase();
  const lowerAnchor = anchor.keyId.toLowerCase();

  if (lowerTarget === lowerAnchor) {
    return {
      anchorKeyId: anchor.keyId,
      anchorLabel: anchor.label,
      fingerName: anchor.fingerName,
      isHomeRowRest: true,
      reachDescription: `Direct rest position strike — zero hand displacement`,
      directionIcon: '⚓',
    };
  }

  // Row categorizations
  const row0 = ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace'];
  const row1 = ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'];
  const row2 = ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'];
  const row3 = ['shift_l', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shift_r'];
  const row4 = ['ctrl_l', 'alt_l', ' ', 'alt_r', 'ctrl_r'];

  if (row2.includes(lowerTarget)) {
    if (lowerTarget === 'g') {
      return {
        anchorKeyId: 'f',
        anchorLabel: 'F',
        fingerName: 'Left Index',
        isHomeRowRest: false,
        reachDescription: 'Inward lateral reach (+1 column to center)',
        directionIcon: '→',
      };
    }
    if (lowerTarget === 'h') {
      return {
        anchorKeyId: 'j',
        anchorLabel: 'J',
        fingerName: 'Right Index',
        isHomeRowRest: false,
        reachDescription: 'Inward lateral reach (+1 column to center)',
        directionIcon: '←',
      };
    }
    if (lowerTarget === "'") {
      return {
        anchorKeyId: ';',
        anchorLabel: ';',
        fingerName: 'Right Pinky',
        isHomeRowRest: false,
        reachDescription: 'Outward reach (+1 column right)',
        directionIcon: '→',
      };
    }
    return {
      anchorKeyId: anchor.keyId,
      anchorLabel: anchor.label,
      fingerName: anchor.fingerName,
      isHomeRowRest: false,
      reachDescription: `Lateral adjustment on Home Row from [${anchor.label}]`,
      directionIcon: '↔',
    };
  }

  if (row1.includes(lowerTarget)) {
    if (['t', 'y'].includes(lowerTarget)) {
      return {
        anchorKeyId: anchor.keyId,
        anchorLabel: anchor.label,
        fingerName: anchor.fingerName,
        isHomeRowRest: false,
        reachDescription: `Diagonal reach: Up 1 row & inward to center from [${anchor.label}]`,
        directionIcon: '↗',
      };
    }
    return {
      anchorKeyId: anchor.keyId,
      anchorLabel: anchor.label,
      fingerName: anchor.fingerName,
      isHomeRowRest: false,
      reachDescription: `Upward strike: Reach 1 row up from [${anchor.label}]`,
      directionIcon: '↑',
    };
  }

  if (row0.includes(lowerTarget)) {
    return {
      anchorKeyId: anchor.keyId,
      anchorLabel: anchor.label,
      fingerName: anchor.fingerName,
      isHomeRowRest: false,
      reachDescription: `Extended reach: Reach 2 rows up to numbers from [${anchor.label}]`,
      directionIcon: '⇈',
    };
  }

  if (row3.includes(lowerTarget)) {
    if (['b', 'n'].includes(lowerTarget)) {
      return {
        anchorKeyId: anchor.keyId,
        anchorLabel: anchor.label,
        fingerName: anchor.fingerName,
        isHomeRowRest: false,
        reachDescription: `Diagonal curl: Down 1 row & inward to center from [${anchor.label}]`,
        directionIcon: '↘',
      };
    }
    return {
      anchorKeyId: anchor.keyId,
      anchorLabel: anchor.label,
      fingerName: anchor.fingerName,
      isHomeRowRest: false,
      reachDescription: `Downward curl: 1 row down from [${anchor.label}]`,
      directionIcon: '↓',
    };
  }

  if (row4.includes(lowerTarget)) {
    return {
      anchorKeyId: ' ',
      anchorLabel: 'SPACE',
      fingerName: 'Thumbs',
      isHomeRowRest: false,
      reachDescription: `Thumb base strike on Spacebar`,
      directionIcon: '␣',
    };
  }

  return {
    anchorKeyId: anchor.keyId,
    anchorLabel: anchor.label,
    fingerName: anchor.fingerName,
    isHomeRowRest: false,
    reachDescription: `Return finger to [${anchor.label}] after strike`,
    directionIcon: '•',
  };
}
