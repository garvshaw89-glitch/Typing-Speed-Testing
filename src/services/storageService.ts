import { TestResult, UserPreferences, UserStats } from '../types';

const PREFS_KEY = 'typingTest_preferences';
const HISTORY_KEY = 'typingTest_history';

export const DEFAULT_PREFERENCES: UserPreferences = {
  testDuration: 60,
  difficultyLevel: 'medium',
  textType: 'words',
  theme: 'system',
  fontSize: 'medium',
  soundEffectsEnabled: true,
  highContrastMode: false,
  largeCursor: false,
  reduceMotion: false,
  showLiveStats: true,
  autoStartCountdown: true,
  targetWpm: 60,
  lastUpdated: Date.now(),
};

/**
 * Retrieves user preferences from localStorage with fallback defaults.
 */
export function getPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (e) {
    console.error('Failed to parse preferences from localStorage', e);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Saves user preferences to localStorage.
 */
export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getPreferences();
  const updated: UserPreferences = {
    ...current,
    ...prefs,
    lastUpdated: Date.now(),
  };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save preferences to localStorage', e);
  }
  return updated;
}

/**
 * Reset preferences to defaults.
 */
export function resetPreferencesToDefault(): UserPreferences {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(DEFAULT_PREFERENCES));
  } catch (e) {
    console.error('Failed to reset preferences', e);
  }
  return DEFAULT_PREFERENCES;
}

/**
 * Saves a new test result into localStorage and updates history index.
 */
export function saveTestResult(result: TestResult): { saved: boolean; isPersonalBest: boolean } {
  try {
    const history = getTestHistory();

    // Check if this is a personal best
    const previousBest = history.reduce((max, r) => (r.wpm > max ? r.wpm : max), 0);
    const isPersonalBest = result.wpm > previousBest && result.wpm > 0;

    const resultWithPB = { ...result, isPersonalBest };

    // Save individual test item
    localStorage.setItem(`typingTest_${result.testId}`, JSON.stringify(resultWithPB));

    // Save item in history index
    const updatedHistory = [resultWithPB, ...history];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));

    return { saved: true, isPersonalBest };
  } catch (e) {
    console.error('Failed to save test result', e);
    return { saved: false, isPersonalBest: false };
  }
}

/**
 * Retrieves all test history records.
 */
export function getTestHistory(): TestResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const history: TestResult[] = JSON.parse(raw);
    return Array.isArray(history) ? history : [];
  } catch (e) {
    console.error('Failed to fetch test history', e);
    return [];
  }
}

/**
 * Retrieves a single test result by testId.
 */
export function getTestResultById(testId: string): TestResult | null {
  try {
    const raw = localStorage.getItem(`typingTest_${testId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to fetch test result ${testId}`, e);
    return null;
  }
}

/**
 * Deletes a single test record by testId.
 */
export function deleteTestResult(testId: string): boolean {
  try {
    localStorage.removeItem(`typingTest_${testId}`);
    const history = getTestHistory().filter((r) => r.testId !== testId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return true;
  } catch (e) {
    console.error('Failed to delete test result', e);
    return false;
  }
}

/**
 * Clears all test history.
 */
export function clearAllHistory(): boolean {
  try {
    const history = getTestHistory();
    history.forEach((r) => localStorage.removeItem(`typingTest_${r.testId}`));
    localStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear history', e);
    return false;
  }
}

/**
 * Computes aggregate user statistics from test history.
 */
export function getUserStats(): UserStats {
  const history = getTestHistory();
  if (history.length === 0) {
    return {
      totalTestsCompleted: 0,
      bestWpm: 0,
      bestAccuracy: 0,
      averageWpm: 0,
      currentStreakDays: 0,
      lastTestTimestamp: 0,
    };
  }

  const bestWpm = Math.max(...history.map((r) => r.wpm));
  const bestAccuracy = Math.max(...history.map((r) => r.accuracy));
  const totalWpm = history.reduce((sum, r) => sum + r.wpm, 0);
  const averageWpm = Math.round(totalWpm / history.length);

  // Calculate streak in days
  const streakDays = calculateStreakDays(history);
  const lastTest = history[0] ? history[0].timestamp : 0;

  return {
    totalTestsCompleted: history.length,
    bestWpm,
    bestAccuracy,
    averageWpm,
    currentStreakDays: streakDays,
    lastTestTimestamp: lastTest,
  };
}

/**
 * Calculates current consecutive active day streak.
 */
function calculateStreakDays(history: TestResult[]): number {
  if (history.length === 0) return 0;

  // Extract unique sorted dates (YYYY-MM-DD)
  const dateStrings = Array.from(
    new Set(
      history.map((r) => {
        const d = new Date(r.timestamp);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      })
    )
  ).sort().reverse();

  if (dateStrings.length === 0) return 0;

  const todayStr = getYYYYMMDD(new Date());
  const yesterdayStr = getYYYYMMDD(new Date(Date.now() - 86400000));

  // If latest test was neither today nor yesterday, streak is broken
  const latestDate = dateStrings[0];
  if (latestDate !== todayStr && latestDate !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let checkDate = new Date(latestDate === todayStr ? Date.now() : Date.now() - 86400000);

  while (true) {
    const formatted = getYYYYMMDD(checkDate);
    if (dateStrings.includes(formatted)) {
      streak++;
      checkDate = new Date(checkDate.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

function getYYYYMMDD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Generates and downloads a CSV export of test history.
 */
export function exportHistoryToCSV() {
  const history = getTestHistory();
  if (history.length === 0) return;

  const headers = ['Test ID', 'Date & Time', 'Duration (s)', 'Difficulty', 'Text Type', 'WPM', 'Raw WPM', 'CPM', 'Accuracy (%)', 'Errors'];
  const rows = history.map((r) => [
    r.testId,
    new Date(r.timestamp).toLocaleString(),
    r.duration,
    r.difficulty,
    r.textType,
    r.wpm,
    r.rawWpm,
    r.cpm,
    r.accuracy,
    r.errors,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `typing_test_history_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
