export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type TextType = 'words' | 'sentences' | 'code' | 'paragraph';
export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSizeOption = 'small' | 'medium' | 'large';
export type SoundPack = 'mechanical' | 'typewriter' | 'soft' | 'thock' | 'bubble';

export type TestMode = 'time' | 'words' | 'quote' | 'custom' | 'warmup';
export type WordCountOption = 10 | 25 | 50 | 100;

export type TrophyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'master';
export type AchievementCategory = 'speed' | 'accuracy' | 'endurance' | 'streak';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: TrophyTier;
  targetValue: number;
  unit?: string;
  iconName: 'trophy' | 'award' | 'zap' | 'flame' | 'target' | 'crown' | 'sparkles' | 'shield' | 'check';
  isUnlocked: boolean;
  unlockedAt?: number;
  currentValue: number;
  progress: number; // 0 - 100
  badgeColor: string;
  badgeGradient: string;
  rewardText: string;
}

export type KeyboardActiveColor = 'blue' | 'emerald' | 'purple' | 'amber' | 'cyan' | 'rose';
export type KeyboardHeatmapPalette = 'thermal' | 'cyberpunk' | 'matrix' | 'sunset' | 'ocean';

export interface UserPreferences {
  testDuration: number; // in seconds (e.g. 15, 30, 60, 120, or custom)
  testMode: TestMode;
  wordCount: WordCountOption;
  customDuration: number;
  customWordCount: number;
  difficultyLevel: DifficultyLevel;
  textType: TextType;
  includePunctuation: boolean;
  includeNumbers: boolean;
  zenMode: boolean;
  username: string;
  theme: ThemeMode;
  fontSize: FontSizeOption;
  soundEffectsEnabled: boolean;
  soundPack?: SoundPack;
  soundVolume?: number;
  highContrastMode: boolean;
  largeCursor: boolean;
  reduceMotion: boolean;
  showLiveStats: boolean;
  showRhythmGraph?: boolean;
  showVisualKeyboard?: boolean;
  visualKeyboardMode?: 'fingers' | 'heatmap';
  showFingerGuides?: boolean;
  showHomeRowGuide?: boolean;
  keyboardActiveColor?: KeyboardActiveColor;
  keyboardHeatmapPalette?: KeyboardHeatmapPalette;
  autoStartCountdown: boolean;
  targetWpm?: number;
  lastUpdated: number;
}

export interface CharacterTiming {
  char: string;
  expected: string;
  timestamp: number;
  timeTakenMs: number;
  isCorrect: boolean;
}

export interface WpmProgressionPoint {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TestResult {
  testId: string;
  timestamp: number; // Unix epoch ms
  duration: number;  // in seconds
  difficulty: DifficultyLevel;
  textType: TextType;
  mode?: TestMode;
  targetWords?: number;
  isWarmup?: boolean;
  rhythmRating?: string;

  // Quotes metadata
  quoteAuthor?: string;
  quoteSource?: string;

  // Typing metrics
  totalCharactersTyped: number;
  correctCharacters: number;
  incorrectCharacters: number;
  totalWords: number;
  correctWords: number;

  // Calculated scores
  wpm: number;          // Adjusted WPM
  rawWpm: number;       // Unpenalized WPM
  cpm: number;          // Characters per minute
  accuracy: number;     // Percentage (0 - 100)
  errors: number;

  // Progression curve
  wpmProgression?: WpmProgressionPoint[];

  // Analysis
  averageCharTimeMs: number;
  consistencyScore: number; // 0 - 100
  pauseCount?: number;
  isPersonalBest: boolean;
  notes?: string;
  keyStats?: Record<string, { total: number; errors: number; mistakesAgainst?: Record<string, number> }>;
}

export interface KeyHeatmapRecord {
  key: string;
  total: number;
  errors: number;
  errorRate: number; // 0 - 100
  accuracy: number;  // 0 - 100
  finger: string;
  hand: 'left' | 'right' | 'both';
  severity: 'untested' | 'mastered' | 'optimal' | 'moderate' | 'struggle' | 'critical';
  mistakesAgainst?: Record<string, number>;
}

export interface UserStats {
  totalTestsCompleted: number;
  bestWpm: number;
  bestAccuracy: number;
  averageWpm: number;
  currentStreakDays: number;
  lastTestTimestamp: number;
}

export interface LeaderboardEntry {
  id: string;
  rank?: number;
  username: string;
  avatarSeed?: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  timestamp: number;
  mode: TestMode;
  durationOrWords: string;
  isCurrentUser?: boolean;
}

export type AppScreen = 'home' | 'prep' | 'test' | 'results' | 'history' | 'leaderboard';
