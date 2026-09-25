import { LeaderboardEntry, TestMode } from '../types';

const LEADERBOARD_STORAGE_KEY = 'typingTest_leaderboard';

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead_1',
    rank: 1,
    username: 'VelocityX',
    avatarSeed: 'vx',
    wpm: 138,
    rawWpm: 142,
    accuracy: 99.4,
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    mode: 'time',
    durationOrWords: '60s',
  },
  {
    id: 'lead_2',
    rank: 2,
    username: 'AuraKeys',
    avatarSeed: 'ak',
    wpm: 126,
    rawWpm: 129,
    accuracy: 98.8,
    timestamp: Date.now() - 1000 * 60 * 60 * 28,
    mode: 'time',
    durationOrWords: '60s',
  },
  {
    id: 'lead_3',
    rank: 3,
    username: 'QuantumTyper',
    avatarSeed: 'qt',
    wpm: 119,
    rawWpm: 122,
    accuracy: 99.1,
    timestamp: Date.now() - 1000 * 60 * 60 * 45,
    mode: 'words',
    durationOrWords: '50 words',
  },
  {
    id: 'lead_4',
    rank: 4,
    username: 'NeonStrike',
    avatarSeed: 'ns',
    wpm: 112,
    rawWpm: 115,
    accuracy: 97.9,
    timestamp: Date.now() - 1000 * 60 * 60 * 70,
    mode: 'time',
    durationOrWords: '30s',
  },
  {
    id: 'lead_5',
    rank: 5,
    username: 'CyberCadence',
    avatarSeed: 'cc',
    wpm: 104,
    rawWpm: 107,
    accuracy: 98.2,
    timestamp: Date.now() - 1000 * 60 * 60 * 90,
    mode: 'quote',
    durationOrWords: 'Quote',
  },
  {
    id: 'lead_6',
    rank: 6,
    username: 'PixelChop',
    avatarSeed: 'pc',
    wpm: 98,
    rawWpm: 102,
    accuracy: 96.8,
    timestamp: Date.now() - 1000 * 60 * 60 * 110,
    mode: 'words',
    durationOrWords: '25 words',
  },
  {
    id: 'lead_7',
    rank: 7,
    username: 'SwiftFingers',
    avatarSeed: 'sf',
    wpm: 93,
    rawWpm: 95,
    accuracy: 98.5,
    timestamp: Date.now() - 1000 * 60 * 60 * 130,
    mode: 'time',
    durationOrWords: '15s',
  },
  {
    id: 'lead_8',
    rank: 8,
    username: 'ShadowTypist',
    avatarSeed: 'st',
    wpm: 88,
    rawWpm: 91,
    accuracy: 97.4,
    timestamp: Date.now() - 1000 * 60 * 60 * 150,
    mode: 'time',
    durationOrWords: '60s',
  },
  {
    id: 'lead_9',
    rank: 9,
    username: 'ZenKeys',
    avatarSeed: 'zk',
    wpm: 84,
    rawWpm: 86,
    accuracy: 99.2,
    timestamp: Date.now() - 1000 * 60 * 60 * 180,
    mode: 'quote',
    durationOrWords: 'Quote',
  },
  {
    id: 'lead_10',
    rank: 10,
    username: 'ThockMaster',
    avatarSeed: 'tm',
    wpm: 79,
    rawWpm: 82,
    accuracy: 97.0,
    timestamp: Date.now() - 1000 * 60 * 60 * 200,
    mode: 'words',
    durationOrWords: '100 words',
  },
];

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(INITIAL_LEADERBOARD));
      return INITIAL_LEADERBOARD;
    }
    const entries: LeaderboardEntry[] = JSON.parse(raw);
    return entries.sort((a, b) => b.wpm - a.wpm).map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  } catch (e) {
    console.error('Failed to load leaderboard', e);
    return INITIAL_LEADERBOARD;
  }
}

export function submitLeaderboardScore(
  username: string,
  wpm: number,
  rawWpm: number,
  accuracy: number,
  mode: TestMode,
  durationOrWords: string
): { entry: LeaderboardEntry; rank: number } {
  const current = getLeaderboard();
  const cleanUsername = username.trim() || 'Anonymous Typist';

  const newEntry: LeaderboardEntry = {
    id: `user_entry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    username: cleanUsername,
    avatarSeed: cleanUsername.slice(0, 2).toUpperCase(),
    wpm,
    rawWpm,
    accuracy,
    timestamp: Date.now(),
    mode,
    durationOrWords,
    isCurrentUser: true,
  };

  const combined = [...current, newEntry];
  combined.sort((a, b) => b.wpm - a.wpm);

  // Compute rank
  const finalEntries = combined.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));

  try {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(finalEntries.slice(0, 50)));
  } catch (e) {
    console.error('Failed to save to leaderboard', e);
  }

  const assignedRank = finalEntries.find((e) => e.id === newEntry.id)?.rank || 1;
  return { entry: newEntry, rank: assignedRank };
}
