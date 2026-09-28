import React, { useState, useEffect, useMemo } from 'react';
import { LeaderboardEntry, TestMode } from '../types';
import { getLeaderboard } from '../services/leaderboardService';
import { Button } from './ui/Button';
import {
  Trophy,
  RefreshCw,
  Search,
  Zap,
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

  const loadLeaderboardData = (simulateDelay = false) => {
    if (simulateDelay) {
      setIsLoading(true);
      setTimeout(() => {
        setEntries(getLeaderboard());
        setIsLoading(false);
        onShowToast('Global telemetry synchronized.', 'info');
      }, 350);
    } else {
      setEntries(getLeaderboard());
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboardData(false);
  }, []);

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#6C8CFF] uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C8CFF]" />
            <span>GLOBAL SPEED REGISTRY // VERIFIED TELEMETRY</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-display font-black text-[#F5F5F0] tracking-tight uppercase mt-1">
            Global Speed Rankings
          </h1>
          <p className="text-xs font-mono text-[#686B72] mt-0.5">
            Real-time verified words per minute benchmarks across worldwide typists
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
            SYNC
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onStartTest}
            leftIcon={<Zap className="w-3.5 h-3.5 fill-white" />}
          >
            BENCHMARK SPEED
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-[#090A0C] rounded-2xl border border-white/[0.08]">
        {/* Mode Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none font-mono">
          {[
            { id: 'all', label: 'ALL MODES' },
            { id: 'time', label: 'TIME' },
            { id: 'words', label: 'WORDS' },
            { id: 'quote', label: 'QUOTES' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedModeFilter(tab.id as 'all' | TestMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wider transition-all whitespace-nowrap cursor-pointer min-h-[38px] flex items-center justify-center ${
                selectedModeFilter === tab.id
                  ? 'bg-[#15181D] text-[#6C8CFF] border border-white/[0.1] shadow-xs'
                  : 'text-[#686B72] hover:text-[#F5F5F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#686B72] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search typist..."
            className="w-full pl-8 pr-3 py-2 text-xs font-mono min-h-[40px] rounded-xl bg-[#101216] border border-white/[0.08] text-[#F5F5F0] focus:outline-none focus:border-[#6C8CFF]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-xs text-[#686B72] hover:text-[#F5F5F0] cursor-pointer"
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
              <div key={i} className="h-44 rounded-3xl bg-[#090A0C] border border-white/[0.06] animate-pulse" />
            ))}
          </div>
          <div className="h-72 rounded-2xl bg-[#090A0C] border border-white/[0.06] animate-pulse" />
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#090A0C] border border-white/[0.08] space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#15181D] border border-white/[0.08] text-amber-400 mx-auto flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-display font-bold text-[#F5F5F0]">NO TYPISTS FOUND</h3>
            <p className="text-xs font-mono text-[#686B72]">
              {searchQuery
                ? `No leaderboard records match "${searchQuery}".`
                : 'No entries registered for this mode yet. Engage a test to take #1!'}
            </p>
          </div>
          <Button variant="primary" size="md" onClick={onStartTest} leftIcon={<Zap className="w-4 h-4 fill-white" />}>
            ENGAGE TEST
          </Button>
        </div>
      ) : (
        <>
          {/* Top 3 Podium Cards */}
          {top3.length > 0 && !searchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Silver (#2) */}
              {top3[1] && (
                <div className="order-2 md:order-1 p-5 rounded-3xl bg-[#090A0C] border border-white/[0.12] shadow-xl flex flex-col justify-between relative overflow-hidden font-mono">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-[#15181D] text-slate-300 font-black text-xs flex items-center justify-center border border-white/[0.1]">
                      2
                    </span>
                    <span className="text-[10px] font-bold text-[#686B72] uppercase">
                      {top3[1].durationOrWords}
                    </span>
                  </div>
                  <div className="my-4 text-center">
                    <span className="text-sm font-bold text-[#F5F5F0] block truncate">
                      {top3[1].username}
                    </span>
                    <div className="mt-1 flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-black font-mono-num text-[#F5F5F0] tabular-nums">
                        {top3[1].wpm}
                      </span>
                      <span className="text-[10px] text-[#686B72]">WPM</span>
                    </div>
                    <span className="text-xs text-emerald-400 tabular-nums mt-0.5 block">
                      {top3[1].accuracy}% PRECISION
                    </span>
                  </div>
                  <div className="text-[10px] text-center text-[#686B72]">
                    {new Date(top3[1].timestamp).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Gold (#1) */}
              {top3[0] && (
                <div className="order-1 md:order-2 p-6 rounded-3xl bg-[#090A0C] border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.12)] flex flex-col justify-between relative overflow-hidden font-mono md:-translate-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-full bg-amber-500 text-black font-black text-xs flex items-center justify-center">
                      👑 1
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      {top3[0].durationOrWords}
                    </span>
                  </div>
                  <div className="my-4 text-center">
                    <span className="text-base font-bold text-[#F5F5F0] block truncate">
                      {top3[0].username}
                    </span>
                    <div className="mt-1 flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-black font-mono-num text-amber-400 tabular-nums">
                        {top3[0].wpm}
                      </span>
                      <span className="text-xs text-amber-400">WPM</span>
                    </div>
                    <span className="text-xs text-[#A5A7AC] tabular-nums mt-0.5 block">
                      {top3[0].accuracy}% PRECISION · {top3[0].rawWpm} RAW
                    </span>
                  </div>
                  <div className="text-[10px] text-center text-[#686B72]">
                    {new Date(top3[0].timestamp).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Bronze (#3) */}
              {top3[2] && (
                <div className="order-3 p-5 rounded-3xl bg-[#090A0C] border border-amber-700/30 shadow-xl flex flex-col justify-between relative overflow-hidden font-mono">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-[#15181D] text-amber-600 font-black text-xs flex items-center justify-center border border-amber-800/40">
                      3
                    </span>
                    <span className="text-[10px] font-bold text-[#686B72] uppercase">
                      {top3[2].durationOrWords}
                    </span>
                  </div>
                  <div className="my-4 text-center">
                    <span className="text-sm font-bold text-[#F5F5F0] block truncate">
                      {top3[2].username}
                    </span>
                    <div className="mt-1 flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-black font-mono-num text-[#F5F5F0] tabular-nums">
                        {top3[2].wpm}
                      </span>
                      <span className="text-[10px] text-[#686B72]">WPM</span>
                    </div>
                    <span className="text-xs text-emerald-400 tabular-nums mt-0.5 block">
                      {top3[2].accuracy}% PRECISION
                    </span>
                  </div>
                  <div className="text-[10px] text-center text-[#686B72]">
                    {new Date(top3[2].timestamp).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="rounded-3xl bg-[#090A0C] border border-white/[0.08] shadow-2xl overflow-hidden font-mono">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[#686B72] text-[10px] uppercase tracking-widest font-bold">
                    <th className="py-3.5 px-4 text-center w-14">RANK</th>
                    <th className="py-3.5 px-4">TYPIST</th>
                    <th className="py-3.5 px-4 text-right">SPEED</th>
                    <th className="py-3.5 px-4 text-right">RAW</th>
                    <th className="py-3.5 px-4 text-right">PRECISION</th>
                    <th className="py-3.5 px-4 text-right hidden sm:table-cell">MODE</th>
                    <th className="py-3.5 px-4 text-right hidden md:table-cell">DATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredEntries.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-white/[0.03] transition-colors ${
                        item.isCurrentUser ? 'bg-[#6C8CFF]/10 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono text-xs text-[#A5A7AC] font-bold tabular-nums">
                          #{item.rank}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-[#15181D] border border-white/[0.08] text-[#F5F5F0] font-mono text-xs flex items-center justify-center shrink-0 uppercase">
                            {item.avatarSeed || item.username.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-[#F5F5F0] block">
                              {item.username}
                            </span>
                            {item.isCurrentUser && (
                              <span className="text-[10px] text-[#6C8CFF] font-mono font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="text-base sm:text-lg font-black text-[#6C8CFF] font-mono-num tabular-nums">
                          {item.wpm}
                        </span>
                        <span className="text-[10px] text-[#686B72] ml-1">WPM</span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-[#686B72] tabular-nums">
                        {item.rawWpm}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                        {item.accuracy}%
                      </td>

                      <td className="py-3.5 px-4 text-right hidden sm:table-cell">
                        <span className="px-2 py-0.5 rounded-md bg-[#101216] border border-white/[0.06] text-[#A5A7AC] text-[10px] font-mono uppercase">
                          {item.durationOrWords}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-[#686B72] text-xs hidden md:table-cell tabular-nums">
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
