import React, { useMemo, useState, useEffect } from 'react';
import {
  Keyboard,
  Fingerprint,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  Anchor,
  Compass,
} from 'lucide-react';
import { KeyboardActiveColor, KeyboardHeatmapPalette } from '../types';
import {
  ACTIVE_COLOR_OPTIONS,
  HEATMAP_PALETTE_OPTIONS,
  calculateErgonomicTrajectory,
} from '../utils/keyboardThemes';

export type FingerType =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'
  | 'thumb';

export interface VisualKeyConfig {
  id: string;
  char: string;
  shiftChar?: string;
  displayLabel?: string;
  width?: number; // 1 = standard unit
  finger: FingerType;
  fingerLabel: string;
  isHomeRow?: boolean;
  hasTactileBump?: boolean;
}

export interface LiveKeystrokeEvent {
  key: string;
  targetKey: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface KeySessionStats {
  total: number;
  errors: number;
}

interface LiveVisualKeyboardProps {
  /** The character the user is expected to type next */
  nextTargetChar: string;
  /** The most recent keystroke event */
  lastKeystroke: LiveKeystrokeEvent | null;
  /** Real-time key stats map (key -> { total, errors }) */
  keyStats: Record<string, KeySessionStats>;
  /** Error history or count */
  errorCount: number;
  /** Total keys typed */
  totalTyped: number;
  /** Whether the typing test is actively running */
  isActive: boolean;
  /** Preference to reduce motion */
  reduceMotion?: boolean;
  /** High contrast mode */
  highContrast?: boolean;
  /** Initial mode */
  initialMode?: 'fingers' | 'heatmap';
  /** Allow collapsing keyboard */
  collapsible?: boolean;
  /** Whether to show the home row touch-typing guide */
  showHomeRowGuide?: boolean;
  /** Customizable active key accent color */
  activeColor?: KeyboardActiveColor;
  /** Customizable heatmap intensity color palette */
  heatmapPalette?: KeyboardHeatmapPalette;
  /** Callback on home row guide toggle */
  onToggleHomeRowGuide?: (enabled: boolean) => void;
}

// Finger styling definitions
export const FINGER_CONFIG: Record<
  FingerType,
  {
    name: string;
    hand: 'left' | 'right' | 'both';
    borderClass: string;
    bgSubtleClass: string;
    badgeBg: string;
    textColor: string;
    accentColor: string;
  }
> = {
  'left-pinky': {
    name: 'Left Pinky',
    hand: 'left',
    borderClass: 'border-purple-400/50 dark:border-purple-500/40',
    bgSubtleClass: 'bg-purple-500/10 dark:bg-purple-900/20',
    badgeBg: 'bg-purple-600 text-white',
    textColor: 'text-purple-600 dark:text-purple-300',
    accentColor: '#a855f7',
  },
  'left-ring': {
    name: 'Left Ring',
    hand: 'left',
    borderClass: 'border-blue-400/50 dark:border-blue-500/40',
    bgSubtleClass: 'bg-blue-500/10 dark:bg-blue-900/20',
    badgeBg: 'bg-blue-600 text-white',
    textColor: 'text-blue-600 dark:text-blue-300',
    accentColor: '#3b82f6',
  },
  'left-middle': {
    name: 'Left Middle',
    hand: 'left',
    borderClass: 'border-cyan-400/50 dark:border-cyan-500/40',
    bgSubtleClass: 'bg-cyan-500/10 dark:bg-cyan-900/20',
    badgeBg: 'bg-cyan-600 text-white',
    textColor: 'text-cyan-600 dark:text-cyan-300',
    accentColor: '#06b6d4',
  },
  'left-index': {
    name: 'Left Index',
    hand: 'left',
    borderClass: 'border-emerald-400/50 dark:border-emerald-500/40',
    bgSubtleClass: 'bg-emerald-500/10 dark:bg-emerald-900/20',
    badgeBg: 'bg-emerald-600 text-white',
    textColor: 'text-emerald-600 dark:text-emerald-300',
    accentColor: '#10b981',
  },
  'right-index': {
    name: 'Right Index',
    hand: 'right',
    borderClass: 'border-amber-400/50 dark:border-amber-500/40',
    bgSubtleClass: 'bg-amber-500/10 dark:bg-amber-900/20',
    badgeBg: 'bg-amber-600 text-white',
    textColor: 'text-amber-600 dark:text-amber-300',
    accentColor: '#f59e0b',
  },
  'right-middle': {
    name: 'Right Middle',
    hand: 'right',
    borderClass: 'border-orange-400/50 dark:border-orange-500/40',
    bgSubtleClass: 'bg-orange-500/10 dark:bg-orange-900/20',
    badgeBg: 'bg-orange-600 text-white',
    textColor: 'text-orange-600 dark:text-orange-300',
    accentColor: '#f97316',
  },
  'right-ring': {
    name: 'Right Ring',
    hand: 'right',
    borderClass: 'border-fuchsia-400/50 dark:border-fuchsia-500/40',
    bgSubtleClass: 'bg-fuchsia-500/10 dark:bg-fuchsia-900/20',
    badgeBg: 'bg-fuchsia-600 text-white',
    textColor: 'text-fuchsia-600 dark:text-fuchsia-300',
    accentColor: '#d946ef',
  },
  'right-pinky': {
    name: 'Right Pinky',
    hand: 'right',
    borderClass: 'border-rose-400/50 dark:border-rose-500/40',
    bgSubtleClass: 'bg-rose-500/10 dark:bg-rose-900/20',
    badgeBg: 'bg-rose-600 text-white',
    textColor: 'text-rose-600 dark:text-rose-300',
    accentColor: '#f43f5e',
  },
  thumb: {
    name: 'Thumbs',
    hand: 'both',
    borderClass: 'border-indigo-400/50 dark:border-indigo-500/40',
    bgSubtleClass: 'bg-indigo-500/10 dark:bg-indigo-900/20',
    badgeBg: 'bg-indigo-600 text-white',
    textColor: 'text-indigo-600 dark:text-indigo-300',
    accentColor: '#6366f1',
  },
};

// Keyboard Layout Definition (standard QWERTY with finger mappings)
export const LIVE_KEYBOARD_ROWS: VisualKeyConfig[][] = [
  // Row 1: Numbers & Symbols
  [
    { id: '`', char: '`', shiftChar: '~', displayLabel: '~ `', finger: 'left-pinky', fingerLabel: 'Left Pinky' },
    { id: '1', char: '1', shiftChar: '!', displayLabel: '! 1', finger: 'left-pinky', fingerLabel: 'Left Pinky' },
    { id: '2', char: '2', shiftChar: '@', displayLabel: '@ 2', finger: 'left-ring', fingerLabel: 'Left Ring' },
    { id: '3', char: '3', shiftChar: '#', displayLabel: '# 3', finger: 'left-middle', fingerLabel: 'Left Middle' },
    { id: '4', char: '4', shiftChar: '$', displayLabel: '$ 4', finger: 'left-index', fingerLabel: 'Left Index' },
    { id: '5', char: '5', shiftChar: '%', displayLabel: '% 5', finger: 'left-index', fingerLabel: 'Left Index' },
    { id: '6', char: '6', shiftChar: '^', displayLabel: '^ 6', finger: 'right-index', fingerLabel: 'Right Index' },
    { id: '7', char: '7', shiftChar: '&', displayLabel: '& 7', finger: 'right-index', fingerLabel: 'Right Index' },
    { id: '8', char: '8', shiftChar: '*', displayLabel: '* 8', finger: 'right-middle', fingerLabel: 'Right Middle' },
    { id: '9', char: '9', shiftChar: '(', displayLabel: '( 9', finger: 'right-ring', fingerLabel: 'Right Ring' },
    { id: '0', char: '0', shiftChar: ')', displayLabel: ') 0', finger: 'right-pinky', fingerLabel: 'Right Pinky' },
    { id: '-', char: '-', shiftChar: '_', displayLabel: '_ -', finger: 'right-pinky', fingerLabel: 'Right Pinky' },
    { id: '=', char: '=', shiftChar: '+', displayLabel: '+ =', finger: 'right-pinky', fingerLabel: 'Right Pinky' },
    { id: 'backspace', char: 'backspace', displayLabel: '⌫ Back', width: 1.85, finger: 'right-pinky', fingerLabel: 'Right Pinky' },
  ],
  // Row 2: QWERTY
  [
    { id: 'tab', char: 'tab', displayLabel: 'Tab ⇥', width: 1.4, finger: 'left-pinky', fingerLabel: 'Left Pinky' },
    { id: 'q', char: 'q', shiftChar: 'Q', displayLabel: 'Q', finger: 'left-pinky', fingerLabel: 'Left Pinky' },
    { id: 'w', char: 'w', shiftChar: 'W', displayLabel: 'W', finger: 'left-ring', fingerLabel: 'Left Ring' },
    { id: 'e', char: 'e', shiftChar: 'E', displayLabel: 'E', finger: 'left-middle', fingerLabel: 'Left Middle' },
    { id: 'r', char: 'r', shiftChar: 'R', displayLabel: 'R', finger: 'left-index', fingerLabel: 'Left Index' },
    { id: 't', char: 't', shiftChar: 'T', displayLabel: 'T', finger: 'left-index', fingerLabel: 'Left Index' },
    { id: 'y', char: 'y', shiftChar: 'Y', displayLabel: 'Y', finger: 'right-index', fingerLabel: 'Right Index' },
    { id: 'u', char: 'u', shiftChar: 'U', displayLabel: 'U', finger: 'right-index', fingerLabel: 'Right Index' },
    { id: 'i', char: 'i', shiftChar: 'I', displayLabel: 'I', finger: 'right-middle', fingerLabel: 'Right Middle' },
    { id: 'o', char: 'o', shiftChar: 'O', displayLabel: 'O', finger: 'right-ring', fingerLabel: 'Right Ring' },
    { id: 'p', char: 'p', shiftChar: 'P', displayLabel: 'P', finger: 'right-pinky', fingerLabel: 'Right Pinky' },
    { id: '[', char: '[', shiftChar: '{', displayLabel: '{ [', finger: 'right-pinky', fingerLabel: 'Right Pinky' },
    { id: ']', char: ']', shiftChar: '}', displayLabel: '} ]', finger: 'right-pinky', fingerLabel: 'Right Pinky' },
    { id: '\\', char: '\\', shiftChar: '|', displayLabel: '| \\', width: 1.4, finger: 'right-pinky', fingerLabel: 'Right Pinky' },
  ],
  // Row 3: Home Row
  [
    { id: 'caps', char: 'caps', displayLabel: 'Caps', width: 1.65, finger: 'left-pinky', fingerLabel: 'Left Pinky' },
    { id: 'a', char: 'a', shiftChar: 'A', displayLabel: 'A', finger: 'left-pinky', fingerLabel: 'Left Pinky', isHomeRow: true },
    { id: 's', char: 's', shiftChar: 'S', displayLabel: 'S', finger: 'left-ring', fingerLabel: 'Left Ring', isHomeRow: true },
    { id: 'd', char: 'd', shiftChar: 'D', displayLabel: 'D', finger: 'left-middle', fingerLabel: 'Left Middle', isHomeRow: true },
    { id: 'f', char: 'f', shiftChar: 'F', displayLabel: 'F', finger: 'left-index', fingerLabel: 'Left Index', isHomeRow: true, hasTactileBump: true },
    { id: 'g', char: 'g', shiftChar: 'G', displayLabel: 'G', finger: 'left-index', fingerLabel: 'Left Index' },
    { id: 'h', char: 'h', shiftChar: 'H', displayLabel: 'H', finger: 'right-index', fingerLabel: 'Right Index' },
    { id: 'j', char: 'j', shiftChar: 'J', displayLabel: 'J', finger: 'right-index', fingerLabel: 'Right Index', isHomeRow: true, hasTactileBump: true },
    { id: 'k', char: 'k', shiftChar: 'K', displayLabel: 'K', finger: 'right-middle', fingerLabel: 'Right Middle', isHomeRow: true },
    { id: 'l', char: 'l', shiftChar: 'L', displayLabel: 'L', finger: 'right-ring', fingerLabel: 'Right Ring', isHomeRow: true },
    { id: ';', char: ';', shiftChar: ':', displayLabel: ': ;', finger: 'right-pinky', fingerLabel: 'Right Pinky', isHomeRow: true },
    { id: "'", char: "'", shiftChar: '"', displayLabel: '" \'', finger: 'right-pinky', fingerLabel: 'Right Pinky' },
    { id: 'enter', char: 'enter', displayLabel: 'Enter ↵', width: 2.1, finger: 'right-pinky', fingerLabel: 'Right Pinky' },
  ],
  // Row 4: ZXCVB
  [
    { id: 'shift_l', char: 'shift', displayLabel: '⇧ Shift', width: 2.1, finger: 'left-pinky', fingerLabel: 'Left Pinky' },
    { id: 'z', char: 'z', shiftChar: 'Z', displayLabel: 'Z', finger: 'left-pinky', fingerLabel: 'Left Pinky' },
    { id: 'x', char: 'x', shiftChar: 'X', displayLabel: 'X', finger: 'left-ring', fingerLabel: 'Left Ring' },
    { id: 'c', char: 'c', shiftChar: 'C', displayLabel: 'C', finger: 'left-middle', fingerLabel: 'Left Middle' },
    { id: 'v', char: 'v', shiftChar: 'V', displayLabel: 'V', finger: 'left-index', fingerLabel: 'Left Index' },
    { id: 'b', char: 'b', shiftChar: 'B', displayLabel: 'B', finger: 'left-index', fingerLabel: 'Left Index' },
    { id: 'n', char: 'n', shiftChar: 'N', displayLabel: 'N', finger: 'right-index', fingerLabel: 'Right Index' },
    { id: 'm', char: 'm', shiftChar: 'M', displayLabel: 'M', finger: 'right-index', fingerLabel: 'Right Index' },
    { id: ',', char: ',', shiftChar: '<', displayLabel: '< ,', finger: 'right-middle', fingerLabel: 'Right Middle' },
    { id: '.', char: '.', shiftChar: '>', displayLabel: '> .', finger: 'right-ring', fingerLabel: 'Right Ring' },
    { id: '/', char: '/', shiftChar: '?', displayLabel: '? /', finger: 'right-pinky', fingerLabel: 'Right Pinky' },
    { id: 'shift_r', char: 'shift', displayLabel: '⇧ Shift', width: 2.65, finger: 'right-pinky', fingerLabel: 'Right Pinky' },
  ],
  // Row 5: Space Bar
  [
    { id: 'ctrl_l', char: 'ctrl', displayLabel: 'Ctrl', width: 1.4, finger: 'left-pinky', fingerLabel: 'Left Pinky' },
    { id: 'alt_l', char: 'alt', displayLabel: 'Alt', width: 1.3, finger: 'thumb', fingerLabel: 'Left Thumb' },
    { id: ' ', char: ' ', displayLabel: '␣ Space Bar', width: 6.8, finger: 'thumb', fingerLabel: 'Thumbs', isHomeRow: true },
    { id: 'alt_r', char: 'alt', displayLabel: 'Alt', width: 1.3, finger: 'thumb', fingerLabel: 'Right Thumb' },
    { id: 'ctrl_r', char: 'ctrl', displayLabel: 'Ctrl', width: 1.4, finger: 'right-pinky', fingerLabel: 'Right Pinky' },
  ],
];

// Helper to look up key config by character
function findKeyConfigForChar(char: string): { config: VisualKeyConfig | null; needsShift: boolean } {
  if (!char) return { config: null, needsShift: false };

  // Check direct character match
  for (const row of LIVE_KEYBOARD_ROWS) {
    for (const key of row) {
      if (key.char === char) {
        return { config: key, needsShift: false };
      }
      if (key.shiftChar === char) {
        return { config: key, needsShift: true };
      }
      if (key.char.toLowerCase() === char.toLowerCase()) {
        const isUpper = char !== char.toLowerCase();
        return { config: key, needsShift: isUpper };
      }
    }
  }

  // Handle special characters
  if (char === '\n') {
    const enterKey = LIVE_KEYBOARD_ROWS[2].find((k) => k.id === 'enter') || null;
    return { config: enterKey, needsShift: false };
  }

  return { config: null, needsShift: false };
}

// Adjacent keys mapping for error pattern diagnosis
const ADJACENT_KEYS_MAP: Record<string, string[]> = {
  q: ['w', 'a', '1', '2'],
  w: ['q', 'e', 'a', 's', '2', '3'],
  e: ['w', 'r', 's', 'd', '3', '4'],
  r: ['e', 't', 'd', 'f', '4', '5'],
  t: ['r', 'y', 'f', 'g', '5', '6'],
  y: ['t', 'u', 'g', 'h', '6', '7'],
  u: ['y', 'i', 'h', 'j', '7', '8'],
  i: ['u', 'o', 'j', 'k', '8', '9'],
  o: ['i', 'p', 'k', 'l', '9', '0'],
  p: ['o', '[', 'l', ';', '0', '-'],
  a: ['q', 'w', 's', 'z'],
  s: ['w', 'e', 'a', 'd', 'z', 'x'],
  d: ['e', 'r', 's', 'f', 'x', 'c'],
  f: ['r', 't', 'd', 'g', 'c', 'v'],
  g: ['t', 'y', 'f', 'h', 'v', 'b'],
  h: ['y', 'u', 'g', 'j', 'b', 'n'],
  j: ['u', 'i', 'h', 'k', 'n', 'm'],
  k: ['i', 'o', 'j', 'l', 'm', ','],
  l: ['o', 'p', 'k', ';', ',', '.'],
  ';': ['p', '[', 'l', "'", '.', '/'],
  z: ['a', 's', 'x'],
  x: ['z', 's', 'd', 'c'],
  c: ['x', 'd', 'f', 'v'],
  v: ['c', 'f', 'g', 'b'],
  b: ['v', 'g', 'h', 'n'],
  n: ['b', 'h', 'j', 'm'],
  m: ['n', 'j', 'k', ','],
};

// Mirror keys across left/right hands
const MIRROR_KEYS_MAP: Record<string, string> = {
  q: 'p',
  w: 'o',
  e: 'i',
  r: 'u',
  t: 'y',
  a: ';',
  s: 'l',
  d: 'k',
  f: 'j',
  g: 'h',
  z: '/',
  x: '.',
  c: ',',
  v: 'm',
  b: 'n',
  p: 'q',
  o: 'w',
  i: 'e',
  u: 'r',
  y: 't',
  ';': 'a',
  l: 's',
  k: 'd',
  j: 'f',
  h: 'g',
  '/': 'z',
  '.': 'x',
  ',': 'c',
  m: 'v',
  n: 'b',
};

export const LiveVisualKeyboard: React.FC<LiveVisualKeyboardProps> = ({
  nextTargetChar,
  lastKeystroke,
  keyStats,
  errorCount,
  totalTyped,
  isActive,
  reduceMotion = false,
  highContrast = false,
  initialMode = 'fingers',
  collapsible = true,
  showHomeRowGuide = true,
  activeColor = 'blue',
  heatmapPalette = 'thermal',
  onToggleHomeRowGuide,
}) => {
  const [mode, setMode] = useState<'fingers' | 'heatmap'>(initialMode);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [showFingerStats, setShowFingerStats] = useState<boolean>(false);
  const [isHomeRowGuideActive, setIsHomeRowGuideActive] = useState<boolean>(showHomeRowGuide);

  // Sync prop changes
  useEffect(() => {
    if (showHomeRowGuide !== undefined) {
      setIsHomeRowGuideActive(showHomeRowGuide);
    }
  }, [showHomeRowGuide]);

  // Color Theme Configurations
  const activeColorConfig = ACTIVE_COLOR_OPTIONS[activeColor] || ACTIVE_COLOR_OPTIONS.blue;
  const heatmapPaletteConfig = HEATMAP_PALETTE_OPTIONS[heatmapPalette] || HEATMAP_PALETTE_OPTIONS.thermal;

  // Look up expected target key info
  const targetKeyInfo = useMemo(() => {
    return findKeyConfigForChar(nextTargetChar);
  }, [nextTargetChar]);

  const targetConfig = targetKeyInfo.config;
  const needsShift = targetKeyInfo.needsShift;

  // Ergonomic Trajectory from Home Row Anchor
  const ergonomicTrajectory = useMemo(() => {
    if (!targetConfig || !isHomeRowGuideActive) return null;
    return calculateErgonomicTrajectory(targetConfig.id, targetConfig.finger);
  }, [targetConfig, isHomeRowGuideActive]);

  // Determine which shift key to recommend (opposite hand rule for optimal ergonomics)
  const recommendedShiftKeyId = useMemo(() => {
    if (!needsShift || !targetConfig) return null;
    const isLeftHandKey = FINGER_CONFIG[targetConfig.finger].hand === 'left';
    return isLeftHandKey ? 'shift_r' : 'shift_l';
  }, [needsShift, targetConfig]);

  // Real-time finger accuracy calculations
  const fingerAccuracyStats = useMemo(() => {
    const stats: Record<FingerType, { total: number; errors: number }> = {
      'left-pinky': { total: 0, errors: 0 },
      'left-ring': { total: 0, errors: 0 },
      'left-middle': { total: 0, errors: 0 },
      'left-index': { total: 0, errors: 0 },
      'right-index': { total: 0, errors: 0 },
      'right-middle': { total: 0, errors: 0 },
      'right-ring': { total: 0, errors: 0 },
      'right-pinky': { total: 0, errors: 0 },
      thumb: { total: 0, errors: 0 },
    };

    // Aggregate stats by finger
    (Object.entries(keyStats) as [string, KeySessionStats][]).forEach(([char, data]) => {
      const { config } = findKeyConfigForChar(char);
      if (config) {
        stats[config.finger].total += data.total;
        stats[config.finger].errors += data.errors;
      }
    });

    return (Object.keys(FINGER_CONFIG) as FingerType[]).map((finger) => {
      const cfg = FINGER_CONFIG[finger];
      const data = stats[finger];
      const accuracy =
        data.total > 0 ? Math.round(((data.total - data.errors) / data.total) * 100) : 100;

      return {
        finger,
        name: cfg.name,
        hand: cfg.hand,
        total: data.total,
        errors: data.errors,
        accuracy,
        accentColor: cfg.accentColor,
      };
    });
  }, [keyStats]);

  // Aggregate hand stats
  const handStats = useMemo(() => {
    let leftTotal = 0;
    let leftErrors = 0;
    let rightTotal = 0;
    let rightErrors = 0;

    fingerAccuracyStats.forEach((f) => {
      if (f.hand === 'left') {
        leftTotal += f.total;
        leftErrors += f.errors;
      } else if (f.hand === 'right') {
        rightTotal += f.total;
        rightErrors += f.errors;
      }
    });

    const leftAcc = leftTotal > 0 ? Math.round(((leftTotal - leftErrors) / leftTotal) * 100) : 100;
    const rightAcc =
      rightTotal > 0 ? Math.round(((rightTotal - rightErrors) / rightTotal) * 100) : 100;

    return { leftTotal, leftErrors, leftAcc, rightTotal, rightErrors, rightAcc };
  }, [fingerAccuracyStats]);

  // Real-time Error Pattern Diagnosis
  const latestErrorPattern = useMemo(() => {
    if (!lastKeystroke || lastKeystroke.isCorrect) return null;

    const typedChar = lastKeystroke.key.toLowerCase();
    const expectedChar = lastKeystroke.targetKey.toLowerCase();

    if (!typedChar || !expectedChar) return null;

    // Check adjacent slip
    const adjacentList = ADJACENT_KEYS_MAP[expectedChar] || [];
    if (adjacentList.includes(typedChar)) {
      const { config: expConfig } = findKeyConfigForChar(expectedChar);
      const { config: typConfig } = findKeyConfigForChar(typedChar);
      return {
        type: 'adjacent',
        title: 'Adjacent Key Slip',
        description: `Pressed '${typedChar.toUpperCase()}' instead of '${expectedChar.toUpperCase()}'. ${
          expConfig && typConfig && expConfig.finger !== typConfig.finger
            ? `Your ${typConfig.fingerLabel} crossed into ${expConfig.fingerLabel}'s lane.`
            : 'Finger struck slightly off-center.'
        }`,
        tip: 'Center your hand on home row (F and J bumps) to steady reach.',
      };
    }

    // Check mirror finger confusion
    if (MIRROR_KEYS_MAP[expectedChar] === typedChar) {
      return {
        type: 'mirror',
        title: 'Mirror Hand Slip',
        description: `Pressed '${typedChar.toUpperCase()}' with opposite hand instead of '${expectedChar.toUpperCase()}'.`,
        tip: 'Both hands use identical finger motions here; double-check the active side.',
      };
    }

    // Check pinky reach slip
    const pinkyKeys = ['p', 'q', 'z', '[', ']', ';', "'", '-', '=', '/', '0'];
    if (pinkyKeys.includes(expectedChar)) {
      return {
        type: 'pinky',
        title: 'Pinky Reach Slip',
        description: `Struggled reaching outer key '${expectedChar.toUpperCase()}'.`,
        tip: 'Pivot lightly at your wrist rather than overextending your pinky finger.',
      };
    }

    return {
      type: 'general',
      title: 'Keystroke Deviation',
      description: `Target was '${expectedChar.toUpperCase()}', pressed '${typedChar.toUpperCase()}'.`,
      tip: 'Slow down cadence slightly to reinforce muscle memory.',
    };
  }, [lastKeystroke]);

  // Keys with recorded errors in current test
  const errorKeyIds = useMemo(() => {
    const errorMap: Record<string, number> = {};
    (Object.entries(keyStats) as [string, KeySessionStats][]).forEach(([char, data]) => {
      if (data.errors > 0) {
        const { config } = findKeyConfigForChar(char);
        if (config) {
          errorMap[config.id] = (errorMap[config.id] || 0) + data.errors;
        }
      }
    });
    return errorMap;
  }, [keyStats]);

  // Find lowest accuracy finger with at least 3 attempts
  const weakestFinger = useMemo(() => {
    const activeFingers = fingerAccuracyStats.filter((f) => f.total >= 3);
    if (activeFingers.length === 0) return null;
    return activeFingers.reduce((worst, cur) => (cur.accuracy < worst.accuracy ? cur : worst));
  }, [fingerAccuracyStats]);

  const toggleHomeRow = () => {
    const nextVal = !isHomeRowGuideActive;
    setIsHomeRowGuideActive(nextVal);
    if (onToggleHomeRowGuide) onToggleHomeRowGuide(nextVal);
  };

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden transition-all duration-200">
      {/* Visual Keyboard Top Bar: Live Guidance & Controls */}
      <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-50/80 dark:bg-slate-850/80 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Active Finger Beacon & Next Key Guidance */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold shrink-0 transition-colors"
            style={{
              borderColor: `${activeColorConfig.hex}55`,
              backgroundColor: `${activeColorConfig.hex}18`,
              color: activeColorConfig.hex,
            }}
          >
            <Keyboard className="w-4 h-4" />
            <span className="hidden sm:inline">Visual Guide</span>
          </div>

          {targetConfig ? (
            <div className="flex items-center gap-2 text-xs truncate">
              <span className="text-slate-500 dark:text-slate-400 hidden xs:inline">Next key:</span>
              <span
                className="px-2 py-0.5 rounded-md font-mono font-black text-xs bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 shadow-sm shrink-0"
                style={{
                  boxShadow: `0 0 8px ${activeColorConfig.hex}40`,
                }}
              >
                {targetConfig.char === ' '
                  ? 'SPACE'
                  : needsShift
                  ? targetConfig.shiftChar || targetConfig.char.toUpperCase()
                  : targetConfig.displayLabel || targetConfig.char.toUpperCase()}
              </span>
              <span className="text-slate-400 dark:text-slate-500">→</span>
              <span
                className={`px-2 py-0.5 rounded-full font-bold text-[11px] truncate flex items-center gap-1 ${
                  FINGER_CONFIG[targetConfig.finger].badgeBg
                }`}
              >
                <Fingerprint className="w-3 h-3 shrink-0" />
                <span className="truncate">{targetConfig.fingerLabel}</span>
              </span>

              {needsShift && (
                <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  ⇧ Hold {recommendedShiftKeyId === 'shift_r' ? 'Right' : 'Left'} Shift
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">
              Ready to type...
            </span>
          )}
        </div>

        {/* Right: Mode Switcher, Home Row Toggle & Expand/Collapse */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          {/* Home Row Overlay Toggle Button */}
          <button
            onClick={toggleHomeRow}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isHomeRowGuideActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Toggle Home Row touch-typing ergonomic rest guide"
          >
            <Anchor className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Home Row</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-200/70 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[11px] font-bold">
            <button
              onClick={() => setMode('fingers')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                mode === 'fingers'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Show finger placement color zones"
            >
              Fingers
            </button>
            <button
              onClick={() => setMode('heatmap')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                mode === 'heatmap'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Show live accuracy and error heatmap"
            >
              Heatmap
            </button>
          </div>

          {/* Toggle Finger Stats breakdown */}
          <button
            onClick={() => setShowFingerStats(!showFingerStats)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showFingerStats
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent'
            }`}
            title="Toggle finger accuracy breakdown"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Collapsible Toggle */}
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand visual keyboard' : 'Minimize visual keyboard'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Body (Collapsed vs Expanded) */}
      {!isCollapsed && (
        <div className="p-3 sm:p-4 space-y-3">
          {/* Home Row Ergonomic Trajectory Guide Banner */}
          {isHomeRowGuideActive && ergonomicTrajectory && (
            <div className="p-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 flex flex-wrap items-center justify-between gap-2.5 text-xs animate-slide-up font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1">
                  <Anchor className="w-3 h-3" />
                  <span>HOME ROW ANCHOR</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 dark:text-white px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-750 border border-slate-300 dark:border-slate-700">
                    [{ergonomicTrajectory.anchorLabel}]
                  </span>
                  <span className="text-blue-500 font-bold">
                    ──{ergonomicTrajectory.directionIcon}──&gt;
                  </span>
                  <span
                    className="font-black px-2 py-0.5 rounded text-white shadow-xs"
                    style={{ backgroundColor: activeColorConfig.hex }}
                  >
                    [{targetConfig?.char === ' ' ? 'SPACE' : (needsShift ? targetConfig?.shiftChar || targetConfig?.char.toUpperCase() : targetConfig?.displayLabel || targetConfig?.char.toUpperCase())}]
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-sans text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>
                  <strong>{ergonomicTrajectory.fingerName}:</strong> {ergonomicTrajectory.reachDescription}
                </span>
              </div>
            </div>
          )}

          {/* Real-Time Error Pattern Alert (when user slips) */}
          {latestErrorPattern && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 dark:bg-rose-950/30 border border-rose-500/30 flex items-start justify-between gap-3 text-xs animate-slide-up">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <span>{latestErrorPattern.title}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-600 dark:text-rose-400 font-mono">
                      Real-Time Diagnostic
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                    {latestErrorPattern.description}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400 font-medium mt-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Tip: {latestErrorPattern.tip}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Visual Keyboard Surface */}
          <div className="overflow-x-auto pb-1 select-none scrollbar-thin">
            <div className="min-w-[620px] max-w-full p-2.5 sm:p-3 rounded-xl bg-slate-950 border border-slate-800/80 shadow-inner space-y-1.5 font-mono">
              {LIVE_KEYBOARD_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5">
                  {row.map((keyConfig) => {
                    const keyCharLower = keyConfig.char.toLowerCase();
                    const keyId = keyConfig.id;

                    // Is this the key being pressed right now?
                    const isRecentlyPressed =
                      lastKeystroke &&
                      (lastKeystroke.key.toLowerCase() === keyCharLower ||
                        (keyConfig.shiftChar &&
                          lastKeystroke.key === keyConfig.shiftChar) ||
                        (keyId === ' ' && lastKeystroke.key === ' '));

                    const wasErrorOnThisKey =
                      isRecentlyPressed && !lastKeystroke.isCorrect;
                    const wasSuccessOnThisKey =
                      isRecentlyPressed && lastKeystroke.isCorrect;

                    // Is this the next expected target key?
                    const isTargetKey = targetConfig?.id === keyId;
                    const isRecommendedShift =
                      needsShift && recommendedShiftKeyId === keyId;

                    // Home row guide states
                    const isHomeRowRestKey = Boolean(keyConfig.isHomeRow);
                    const isTargetAnchorKey =
                      isHomeRowGuideActive &&
                      ergonomicTrajectory &&
                      ergonomicTrajectory.anchorKeyId === keyId &&
                      !isTargetKey;

                    // Session stats for this key
                    const keyStatsData = keyStats[keyCharLower] || { total: 0, errors: 0 };
                    const hasErrorsOnKey = (errorKeyIds[keyId] || 0) > 0;
                    const keyErrorCount = errorKeyIds[keyId] || 0;

                    // Finger styling
                    const fingerCfg = FINGER_CONFIG[keyConfig.finger];

                    // Compute dynamic classes
                    let keyBg = 'bg-slate-850 text-slate-200 border-slate-750';
                    let ringStyle = '';
                    let animationClass = '';

                    if (mode === 'fingers') {
                      // Color-coded by finger placement zone
                      keyBg = `${fingerCfg.bgSubtleClass} ${fingerCfg.borderClass} ${fingerCfg.textColor}`;
                    } else if (mode === 'heatmap') {
                      // Color-coded by live accuracy using selected heatmap palette
                      if (keyStatsData.total > 0) {
                        const errorRate = (keyStatsData.errors / keyStatsData.total) * 100;
                        if (errorRate >= 20) {
                          keyBg = `${heatmapPaletteConfig.criticalClass} ${heatmapPaletteConfig.criticalGlow}`;
                        } else if (errorRate >= 8) {
                          keyBg = heatmapPaletteConfig.moderateClass;
                        } else {
                          keyBg = heatmapPaletteConfig.optimalClass;
                        }
                      } else {
                        keyBg = heatmapPaletteConfig.untestedClass;
                      }
                    }

                    // Home Row Rest Outline (when enabled)
                    if (isHomeRowGuideActive && isHomeRowRestKey && !isTargetKey && !isRecentlyPressed) {
                      keyBg += ' border-dashed border-slate-600/90';
                    }

                    // Keypress active state override
                    if (wasSuccessOnThisKey) {
                      keyBg = `${activeColorConfig.successBg} ${activeColorConfig.successBorder} ${activeColorConfig.successGlow}`;
                      animationClass = reduceMotion ? '' : 'animate-key-success';
                    } else if (wasErrorOnThisKey) {
                      keyBg =
                        'bg-rose-600 text-white border-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.6)]';
                      animationClass = reduceMotion ? '' : 'animate-key-error';
                    } else if (isTargetKey) {
                      // Pulse next target key with configured active accent color
                      keyBg = `${activeColorConfig.targetBg} ${activeColorConfig.targetBorder} ${activeColorConfig.targetGlow}`;
                      ringStyle = `${activeColorConfig.targetRing} z-10`;
                      animationClass = reduceMotion ? '' : 'animate-key-beacon';
                    } else if (isTargetAnchorKey) {
                      // Home row anchor key indicator
                      keyBg = `${activeColorConfig.anchorBg} ${activeColorConfig.anchorBorder} ${activeColorConfig.anchorGlow}`;
                      ringStyle = 'z-10';
                    } else if (isRecommendedShift) {
                      // Highlight shift key when uppercase needed
                      keyBg =
                        'bg-amber-600/25 text-amber-200 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]';
                      ringStyle = 'ring-1.5 ring-amber-400/80 z-10';
                      animationClass = reduceMotion ? '' : 'animate-key-beacon';
                    }

                    const widthStyle = keyConfig.width
                      ? { flex: `${keyConfig.width} 1 0%` }
                      : { flex: '1 1 0%' };

                    return (
                      <div
                        key={keyConfig.id}
                        style={widthStyle}
                        className={`h-10 sm:h-11 min-w-[28px] rounded-lg border flex flex-col items-center justify-between p-1 text-[11px] sm:text-xs font-semibold relative transition-all duration-150 select-none shadow-xs ${keyBg} ${ringStyle} ${animationClass}`}
                        title={`${keyConfig.displayLabel || keyConfig.char.toUpperCase()} (${keyConfig.fingerLabel})${
                          isHomeRowRestKey ? ' [Home Row Rest]' : ''
                        }${
                          keyStatsData.total > 0
                            ? ` - ${keyStatsData.total} typed, ${keyStatsData.errors} errors`
                            : ''
                        }`}
                      >
                        {/* Upper display (shift symbol / secondary) */}
                        <div className="flex items-center justify-between w-full px-0.5">
                          <span className="text-[9px] opacity-75 font-mono truncate">
                            {keyConfig.displayLabel || keyConfig.char.toUpperCase()}
                          </span>

                          {/* Home Row Anchor Badge */}
                          {isTargetAnchorKey && (
                            <span
                              className="px-1 py-0.2 rounded-full font-bold text-[8px] leading-none animate-pulse"
                              style={{ backgroundColor: activeColorConfig.hex, color: '#fff' }}
                              title="Rest Anchor for this finger"
                            >
                              ⚓
                            </span>
                          )}

                          {/* Error count badge on key */}
                          {!isTargetAnchorKey && hasErrorsOnKey && (
                            <span
                              className="px-1 py-0.2 rounded-full bg-rose-600 text-white font-mono text-[8px] font-bold leading-none shadow-xs"
                              title={`${keyErrorCount} mistake(s) during this test`}
                            >
                              ✕{keyErrorCount}
                            </span>
                          )}
                        </div>

                        {/* Tactile Homing Bump Indicator for F & J */}
                        {keyConfig.hasTactileBump && (
                          <div className="w-2.5 h-0.5 rounded-full bg-slate-400/80 dark:bg-slate-300/80 shadow-xs mb-0.5" />
                        )}

                        {/* Home Row Rest Marker Dot when enabled */}
                        {isHomeRowGuideActive && isHomeRowRestKey && !keyConfig.hasTactileBump && !isTargetKey && (
                          <div className="w-1 h-1 rounded-full bg-slate-500/50 mb-0.5" />
                        )}

                        {/* Target Key Finger Indicator Dot */}
                        {isTargetKey && (
                          <div
                            className="w-1.5 h-1.5 rounded-full animate-ping absolute bottom-1"
                            style={{ backgroundColor: activeColorConfig.hex }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Finger Placement Legend & Accuracy Breakdown */}
          {showFingerStats ? (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5 animate-slide-up">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-850 dark:text-slate-200 flex items-center gap-1.5">
                  <Fingerprint className="w-4 h-4 text-blue-500" />
                  <span>Real-Time Finger Placement Accuracy</span>
                </span>

                <div className="flex items-center gap-3 text-[11px] font-mono font-bold">
                  <span className="text-slate-600 dark:text-slate-300">
                    Left Hand: <span className="text-blue-600 dark:text-blue-400">{handStats.leftAcc}%</span> ({handStats.leftTotal})
                  </span>
                  <span className="text-slate-400 dark:text-slate-500">|</span>
                  <span className="text-slate-600 dark:text-slate-300">
                    Right Hand: <span className="text-emerald-600 dark:text-emerald-400">{handStats.rightAcc}%</span> ({handStats.rightTotal})
                  </span>
                </div>
              </div>

              {/* Individual Finger Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 text-xs">
                {fingerAccuracyStats.map((item) => {
                  const cfg = FINGER_CONFIG[item.finger];
                  const hasAttempts = item.total > 0;
                  const isStruggling = hasAttempts && item.accuracy < 85;

                  return (
                    <div
                      key={item.finger}
                      className={`p-2 rounded-lg border transition-all ${
                        isStruggling
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300/80 dark:border-rose-900/60'
                          : 'bg-white dark:bg-slate-855 border-slate-200 dark:border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: cfg.accentColor }}
                          />
                          <span className="truncate">{item.name}</span>
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            !hasAttempts
                              ? 'text-slate-400'
                              : item.accuracy >= 92
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : item.accuracy >= 80
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {hasAttempts ? `${item.accuracy}%` : '—'}
                        </span>
                      </div>

                      {/* Mini Progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-750 mt-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${hasAttempts ? item.accuracy : 0}%`,
                            backgroundColor: cfg.accentColor,
                          }}
                        />
                      </div>

                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 flex justify-between font-mono">
                        <span>{item.total} typed</span>
                        {item.errors > 0 && (
                          <span className="text-rose-500 font-bold">{item.errors} err</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Weakest Finger Coaching Note */}
              {weakestFinger && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Focus Target: Your <strong>{weakestFinger.name}</strong> currently has the most errors ({weakestFinger.errors} missed, {weakestFinger.accuracy}% acc). Practice maintaining relaxed rest posture on Home Row.
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Compact Finger Zone & Home Row Guide Footer */
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 px-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Finger Zones:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <span>Pinky</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Ring</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <span>Middle</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>L.Index</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span>R.Index</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span>Thumbs</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleHomeRow}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Anchor className="w-3 h-3" />
                  <span>{isHomeRowGuideActive ? 'Hide Home Row' : 'Show Home Row'}</span>
                </button>
                <button
                  onClick={() => setShowFingerStats(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Finger Accuracy</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
