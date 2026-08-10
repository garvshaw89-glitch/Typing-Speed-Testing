import { TestResult } from '../types';

/**
 * Calculates raw WPM based on total characters typed and elapsed seconds.
 */
export function calculateRawWPM(totalChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round((totalChars / 5) / minutes);
}

/**
 * Calculates adjusted WPM (penalizing incorrect characters).
 */
export function calculateAdjustedWPM(correctChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.max(0, Math.round((correctChars / 5) / minutes));
}

/**
 * Calculates accuracy percentage rounded to 2 decimal places.
 */
export function calculateAccuracy(correctChars: number, totalChars: number): number {
  if (totalChars <= 0) return 100;
  const acc = (correctChars / totalChars) * 100;
  return Math.min(100, Math.max(0, Number(acc.toFixed(2))));
}

/**
 * Calculates Characters Per Minute (CPM).
 */
export function calculateCPM(totalChars: number, elapsedSeconds: number): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round(totalChars / minutes);
}

/**
 * Calculates consistency score (0 - 100) based on character timing standard deviation.
 */
export function calculateConsistency(timeDiffsMs: number[]): number {
  if (timeDiffsMs.length < 2) return 100;

  // Filter out outlier pauses (e.g. initial delays > 2000ms)
  const validDiffs = timeDiffsMs.filter(t => t > 10 && t < 2000);
  if (validDiffs.length < 2) return 100;

  const mean = validDiffs.reduce((a, b) => a + b, 0) / validDiffs.length;
  if (mean === 0) return 100;

  const variance = validDiffs.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validDiffs.length;
  const stdDev = Math.sqrt(variance);

  const cv = (stdDev / mean) * 100;
  const consistency = Math.max(0, Math.min(100, Math.round(100 - cv)));
  return consistency;
}

export interface PerformanceRating {
  title: string;
  message: string;
  color: string;
}

export function getPerformanceRating(wpm: number): PerformanceRating {
  if (wpm <= 20) {
    return { title: 'Beginner', message: 'Keep practicing! Focus on finger placement.', color: 'text-amber-500' };
  } else if (wpm <= 40) {
    return { title: 'Below Average', message: "You're building muscle memory. Keep going!", color: 'text-blue-500' };
  } else if (wpm <= 60) {
    return { title: 'Average', message: 'Good job! You type at standard conversational speed.', color: 'text-emerald-500' };
  } else if (wpm <= 80) {
    return { title: 'Good', message: "That's excellent! Fast enough for professional work.", color: 'text-teal-500' };
  } else if (wpm <= 100) {
    return { title: 'Excellent', message: 'Outstanding! You belong to the top tier of typists.', color: 'text-indigo-500' };
  } else {
    return { title: 'Exceptional', message: "You're a typing master! Phenomenal speed and flow.", color: 'text-purple-500' };
  }
}
