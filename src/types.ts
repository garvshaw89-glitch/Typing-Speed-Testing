export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type TextType = 'words' | 'sentences' | 'code' | 'paragraph';
export type ThemeMode = 'light' | 'dark' | 'system';
export type FontSizeOption = 'small' | 'medium' | 'large';

export interface UserPreferences {
  testDuration: number; // in seconds (e.g. 15, 30, 60, 120, or custom)
  difficultyLevel: DifficultyLevel;
  textType: TextType;
  theme: ThemeMode;
  fontSize: FontSizeOption;
  soundEffectsEnabled: boolean;
  highContrastMode: boolean;
  largeCursor: boolean;
  reduceMotion: boolean;
  showLiveStats: boolean;
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

export interface TestResult {
  testId: string;
  timestamp: number; // Unix epoch ms
  duration: number;  // in seconds
  difficulty: DifficultyLevel;
  textType: TextType;

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

  // Analysis
  averageCharTimeMs: number;
  consistencyScore: number; // 0 - 100
  isPersonalBest: boolean;
  notes?: string;
  keyStats?: Record<string, { total: number; errors: number }>;
}

export interface UserStats {
  totalTestsCompleted: number;
  bestWpm: number;
  bestAccuracy: number;
  averageWpm: number;
  currentStreakDays: number;
  lastTestTimestamp: number;
}

export type AppScreen = 'home' | 'prep' | 'test' | 'results' | 'history';
