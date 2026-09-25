import React, { useState, useEffect, useMemo } from 'react';
import { LeaderboardEntry, TestMode } from '../types';
import { getLeaderboard } from '../services/leaderboardService';
import { Button } from './ui/Button';
import {
  Trophy,
  RefreshCw,
  Search,
  Zap,
  Clock,
  BookOpen,
  Award,
  Sparkles,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

interface LeaderboardViewProps {
  onStartTest: () => void;
  onShowToast: (message: string, type: 'success' | 'info') => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  onStartTest,
  onShowToast,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedModeFilter, setSelectedModeFilter] = useState<'all' | TestMode>('all');
  const [sortBy, setSortBy] = useState<'wpm' | 'accuracy' | 'date'>('wpm');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load entries with smooth skeleton loader
  const loadLeaderboardData = (simulateDelay = false) => {
    if (simulateDelay) {
      setIsLoading(true);
      setTimeout(() => {
        setEntries(getLeaderboard());
        setIsLoading(false);
        onShowToast('Leaderboard rankings updated.', 'info');
      }, 350);
    } else {
      setEntries(getLeaderboard());
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData(false);
  }, []);

  // Filter and sort entries
  const filteredEntries = useMemo(() => {
    let result = [...entries];

    if (selectedModeFilter !== 'all') {
      result = result.filter((e) => e.mode === selectedModeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((e) => e.username.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'wpm') comparison = b.wpm - a.wpm;
      if (sortBy === 'accuracy') comparison = b.accuracy - a.accuracy;
      if (sortBy === 'date') comparison = b.timestamp - a.timestamp;
      return sortOrder === 'desc' ? comparison : -comparison;
    });

    return result.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  }, [entries, selectedModeFilter, searchQuery, sortBy, sortOrder]);

  const top3 = useMemo(() => {
    return filteredEntries.slice(0, 3);
  }, [filteredEntries]);

  const restEntries = useMemo(() => {
    return filteredEntries.slice(3);
  }, [filteredEntries]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Trophy className="w-4 h-4 fill-amber-500/20" />
            <span>Global Hall of Fame</span>
            <span aria-hidden="true">·</span>
            <span>Verified Typists</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Global Speed Leaderboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
            Compare your words per minute and accuracy against top typists worldwide.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLeaderboardData(true)}
            isLoading={isLoading}
            loadingText="Syncing..."
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onStartTest}
            leftIcon={<Zap className="w-3.5 h-3.5 fill-white" />}
          >
            Test Your Rank
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
        {/* Mode Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Modes' },
            { id: 'time', label: 'Time Tests' },
            { id: 'words', label: 'Word Sprints' },
            { id: 'quote', label: 'Quotes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedModeFilter(tab.id as 'all' | TestMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedModeFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search typist..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          <div className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        </div>
      ) : filteredEntries.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
            <Trophy className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Typists Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {searchQuery
                ? `No leaderboard scores match "${searchQuery}". Try a different search.`
                : 'No entries registered for this mode yet. Complete a test to become #1!'}
            </p>
          </div>
          <Button variant="primary" size="md" onClick={onStartTest} leftIcon={<Zap className="w-4 h-4 fill-white" />}>
            Start a Typing Test
          </Button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && !searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Silver (#2) */}
              {top3[1] && (
                <div className="order-2 md:order-1 p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-slate-400 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-sm flex items-center justify-center">
                      2
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {top3[1].durationOrWords}
                    </span>
                  </div>
                  <div className="my-4 text-center">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white block truncate">
                      {top3[1].username}
                    </span>
                    <div className="mt-1 flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                        {top3[1].wpm}
                      </span>
                      <span className="text-xs font-bold text-slate-500">WPM</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium tabular-nums mt-0.5 block">
                      {top3[1].accuracy}% Accuracy
                    </span>
                  </div>
                  <div className="text-[10px] text-center text-slate-400">
                    {new Date(top3[1].timestamp).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Gold (#1) */}
              {top3[0] && (
                <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-500/15 via-yellow-500/5 to-white dark:to-slate-800/90 border-2 border-amber-400 dark:border-amber-500 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500 transition-all md:-translate-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white font-black text-base flex items-center justify-center shadow-md shadow-amber-500/30">
                      👑 1
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10">
                      {top3[0].durationOrWords}
                    </span>
                  </div>
                  <div className="my-4 text-center">
                    <span className="text-base font-black text-slate-900 dark:text-white block truncate">
                      {top3[0].username}
                    </span>
                    <div className="mt-1 flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-black text-amber-500 dark:text-amber-400 tabular-nums">
                        {top3[0].wpm}
                      </span>
                      <span className="text-sm font-black text-amber-600 dark:text-amber-400">WPM</span>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold tabular-nums mt-0.5 block">
                      {top3[0].accuracy}% Accuracy · {top3[0].rawWpm} Raw
                    </span>
                  </div>
                  <div className="text-[10px] text-center text-amber-700/80 dark:text-amber-400 font-medium">
                    {new Date(top3[0].timestamp).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Bronze (#3) */}
              {top3[2] && (
                <div className="order-3 p-5 rounded-3xl bg-white dark:bg-slate-800/90 border border-amber-600/30 dark:border-amber-700/40 shadow-md flex flex-col justify-between relative overflow-hidden group hover:border-amber-600 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-full bg-amber-600/20 text-amber-800 dark:text-amber-300 font-black text-sm flex items-center justify-center">
                      3
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {top3[2].durationOrWords}
                    </span>
                  </div>
                  <div className="my-4 text-center">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white block truncate">
                      {top3[2].username}
                    </span>
                    <div className="mt-1 flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">
                        {top3[2].wpm}
                      </span>
                      <span className="text-xs font-bold text-slate-500">WPM</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium tabular-nums mt-0.5 block">
                      {top3[2].accuracy}% Accuracy
                    </span>
                  </div>
                  <div className="text-[10px] text-center text-slate-400">
                    {new Date(top3[2].timestamp).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700/80 bg-slate-50/75 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                    <th className="py-3.5 px-4 text-center w-14">Rank</th>
                    <th className="py-3.5 px-4">Typist</th>
                    <th className="py-3.5 px-4 text-right">Speed</th>
                    <th className="py-3.5 px-4 text-right">Raw</th>
                    <th className="py-3.5 px-4 text-right">Accuracy</th>
                    <th className="py-3.5 px-4 text-right hidden sm:table-cell">Mode</th>
                    <th className="py-3.5 px-4 text-right hidden md:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEntries.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors ${
                        item.isCurrentUser ? 'bg-blue-50/60 dark:bg-blue-900/20 font-semibold' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center">
                        {item.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs shadow-xs">
                            1
                          </span>
                        ) : item.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white font-bold text-xs">
                            2
                          </span>
                        ) : item.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white font-bold text-xs">
                            3
                          </span>
                        ) : (
                          <span className="font-mono text-xs text-slate-400 font-bold tabular-nums">
                            #{item.rank}
                          </span>
                        )}
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-black text-xs flex items-center justify-center shrink-0 uppercase">
                            {item.avatarSeed || item.username.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block">
                              {item.username}
                            </span>
                            {item.isCurrentUser && (
                              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* WPM */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono tabular-nums">
                          {item.wpm}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 ml-1">WPM</span>
                      </td>

                      {/* Raw WPM */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500 tabular-nums">
                        {item.rawWpm}
                      </td>

                      {/* Accuracy */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {item.accuracy}%
                      </td>

                      {/* Mode */}
                      <td className="py-3.5 px-4 text-right hidden sm:table-cell">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-[11px] font-medium uppercase tracking-tight">
                          {item.durationOrWords}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-right text-slate-400 text-xs hidden md:table-cell tabular-nums">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
