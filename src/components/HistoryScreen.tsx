import React, { useState, useMemo } from 'react';
import { TestResult, UserStats } from '../types';
import { exportHistoryToCSV, deleteTestResult, clearAllHistory } from '../services/storageService';
import { getAllAchievements } from '../services/achievementService';
import { KeyboardLayout } from './KeyboardLayout';
import { TrophiesView } from './TrophiesView';
import {
  Trash2,
  Download,
  TrendingUp,
  BarChart3,
  ListFilter,
  ArrowLeft,
  Trophy,
  Target,
  Award,
  Calendar,
  AlertTriangle,
  Keyboard,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface HistoryScreenProps {
  history: TestResult[];
  stats: UserStats;
  onRefreshHistory: () => void;
  onBackToHome: () => void;
  onShowToast: (message: string, type: 'success' | 'info') => void;
  initialViewMode?: ViewMode;
  onStartTest?: () => void;
}

type FilterRange = 'all' | '7days' | '30days';
type SortField = 'date' | 'wpm' | 'accuracy' | 'duration';
export type ViewMode = 'list' | 'chart' | 'keyboard' | 'trophies';

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  stats,
  onRefreshHistory,
  onBackToHome,
  onShowToast,
  initialViewMode = 'list',
  onStartTest,
}) => {
  const [filterRange, setFilterRange] = useState<FilterRange>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const achievements = useMemo(() => {
    return getAllAchievements(stats, history);
  }, [stats, history]);
  const unlockedTrophyCount = useMemo(() => {
    return achievements.filter((a) => a.isUnlocked).length;
  }, [achievements]);

  // Filter history
  const filteredHistory = history.filter((item) => {
    if (filterRange === '7days') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return item.timestamp >= sevenDaysAgo;
    }
    if (filterRange === '30days') {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return item.timestamp >= thirtyDaysAgo;
    }
    return true;
  });

  // Sort history
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'date') comparison = b.timestamp - a.timestamp;
    if (sortField === 'wpm') comparison = b.wpm - a.wpm;
    if (sortField === 'accuracy') comparison = b.accuracy - a.accuracy;
    if (sortField === 'duration') comparison = b.duration - a.duration;

    return sortOrder === 'desc' ? comparison : -comparison;
  });

  // Handle single record deletion
  const handleDeleteItem = (testId: string) => {
    deleteTestResult(testId);
    onRefreshHistory();
    onShowToast('Test record deleted.', 'info');
  };

  // Handle clear all history
  const handleClearAll = () => {
    clearAllHistory();
    onRefreshHistory();
    setShowClearConfirm(false);
    onShowToast('All test history cleared.', 'info');
  };

  // Chart calculation (data points in chronological order)
  const [chartMetric, setChartMetric] = useState<'net' | 'net_raw' | 'net_acc'>('net_raw');

  const chartData = useMemo(() => {
    return [...filteredHistory].reverse().map((d, index) => {
      const dateObj = new Date(d.timestamp);
      const dateFormatted = dateObj.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });
      const timeFormatted = dateObj.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
      });

      return {
        id: d.testId,
        testIndex: index + 1,
        label: `#${index + 1}`,
        fullLabel: `Test #${index + 1}`,
        dateTime: `${dateFormatted} ${timeFormatted}`,
        wpm: d.wpm,
        rawWpm: d.rawWpm,
        accuracy: d.accuracy,
        cpm: d.cpm,
        errors: d.errors,
        duration: d.duration,
        difficulty: d.difficulty,
        textType: d.textType,
        isPersonalBest: d.isPersonalBest,
      };
    });
  }, [filteredHistory]);

  const growthDiff = useMemo(() => {
    if (chartData.length < 2) return 0;
    return chartData[chartData.length - 1].wpm - chartData[0].wpm;
  }, [chartData]);

  const averageWpm = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, curr) => acc + curr.wpm, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Test History & Analytics
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track your typing performance improvements over time
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportHistoryToCSV()}
            disabled={history.length === 0}
            className="py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={history.length === 0}
            className="py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-semibold text-xs flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/40 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>All-time Best</span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.bestWpm} WPM</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Average Speed</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.averageWpm} WPM</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Best Accuracy</span>
            <Target className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.bestAccuracy}%</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Tests</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.totalTestsCompleted}</div>
        </div>
      </div>

      {/* View Toggle & Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Toggle List / Chart */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold">
          <button
            onClick={() => setViewMode('list')}
            className={`py-1.5 px-3 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Table List
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`py-1.5 px-3 rounded-lg transition-all ${
              viewMode === 'chart'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Trend Graph
          </button>
          <button
            onClick={() => setViewMode('keyboard')}
            className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'keyboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Key Heatmap</span>
          </button>
          <button
            onClick={() => setViewMode('trophies')}
            className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === 'trophies'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Trophies</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                viewMode === 'trophies'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
              }`}
            >
              {unlockedTrophyCount}/{achievements.length}
            </span>
          </button>
        </div>

        {/* Date Filters (hidden in trophies mode) */}
        {viewMode !== 'trophies' && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
            <ListFilter className="w-4 h-4 text-slate-400" />
            <span>Range:</span>
            {(['all', '7days', '30days'] as FilterRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setFilterRange(range)}
                className={`px-2.5 py-1 rounded-lg border transition-colors ${
                  filterRange === range
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 font-bold'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {range === 'all' ? 'All Time' : range === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Trophies & Achievements View */}
      {viewMode === 'trophies' && (
        <TrophiesView stats={stats} history={history} onStartTest={onStartTest} />
      )}

      {/* Chart View (Recharts Line Chart) */}
      {viewMode === 'chart' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
          {/* Header with Title and Mode Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>WPM Progression Over Time</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Visualizing typing speed velocity and accuracy growth across test sessions
              </p>
            </div>

            {/* Metric Mode Filter */}
            {chartData.length > 0 && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold shrink-0">
                <button
                  onClick={() => setChartMetric('net')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartMetric === 'net'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Net WPM
                </button>
                <button
                  onClick={() => setChartMetric('net_raw')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartMetric === 'net_raw'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Net vs Raw
                </button>
                <button
                  onClick={() => setChartMetric('net_acc')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    chartMetric === 'net_acc'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  WPM &amp; Accuracy
                </button>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">First Test</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                  {chartData[0]?.wpm ?? 0} WPM
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Latest Speed</span>
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                  {chartData[chartData.length - 1]?.wpm ?? 0} WPM
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Range Average</span>
                <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                  {averageWpm} WPM
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Progression</span>
                <span className={`text-base font-extrabold ${
                  growthDiff >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {growthDiff >= 0 ? `+${growthDiff}` : growthDiff} WPM
                </span>
              </div>
            </div>
          )}

          {chartData.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">No test data available for chart</p>
              <p className="text-xs text-slate-500">Take a typing test to start plotting your WPM progression line chart.</p>
            </div>
          ) : (
            <div className="w-full">
              {chartData.length === 1 && (
                <div className="mb-4 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>1 test completed ({chartData[0].wpm} WPM). Complete more tests to see a multi-point trendline.</span>
                </div>
              )}

              <div className="w-full h-80 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 15, right: chartMetric === 'net_acc' ? 25 : 15, left: 0, bottom: 15 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#94a3b8"
                      strokeOpacity={0.2}
                      vertical={false}
                    />

                    <XAxis
                      dataKey="label"
                      tickLine={false}
                      axisLine={{ stroke: '#94a3b8', strokeOpacity: 0.3 }}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                      dy={8}
                    />

                    <YAxis
                      yAxisId="wpm"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                      dx={-4}
                      unit=" wpm"
                      domain={[0, (dataMax: number) => Math.max(Math.ceil((dataMax + 10) / 10) * 10, 60)]}
                    />

                    {chartMetric === 'net_acc' && (
                      <YAxis
                        yAxisId="accuracy"
                        orientation="right"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: '#10b981', fontSize: 11, fontFamily: 'monospace' }}
                        dx={4}
                        unit="%"
                        domain={[60, 100]}
                      />
                    )}

                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const item = payload[0].payload;
                        return (
                          <div className="p-3.5 rounded-2xl bg-slate-900/95 dark:bg-slate-950/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md min-w-[210px] text-xs space-y-2 font-sans">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                              <span className="font-extrabold text-white text-sm">{item.fullLabel}</span>
                              {item.isPersonalBest && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1">
                                  <span>PB</span>
                                  <Trophy className="w-3 h-3 text-amber-400" />
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-400 font-mono">{item.dateTime}</div>

                            <div className="space-y-1 pt-1 font-mono">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                                  <span className="font-sans">Net WPM</span>
                                </span>
                                <span className="font-black text-blue-400 text-sm">{item.wpm} WPM</span>
                              </div>

                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
                                  <span className="font-sans">Raw WPM</span>
                                </span>
                                <span className="font-bold text-indigo-300">{item.rawWpm} WPM</span>
                              </div>

                              <div className="flex items-center justify-between gap-4">
                                <span className="text-slate-400 flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                                  <span className="font-sans">Accuracy</span>
                                </span>
                                <span className="font-bold text-emerald-400">{item.accuracy}%</span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between capitalize">
                              <span>{item.duration}s test</span>
                              <span>{item.difficulty} • {item.textType}</span>
                            </div>
                          </div>
                        );
                      }}
                    />

                    <Legend
                      verticalAlign="top"
                      align="right"
                      wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
                    />

                    {averageWpm > 0 && (
                      <ReferenceLine
                        yAxisId="wpm"
                        y={averageWpm}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        label={{
                          value: `Avg ${averageWpm}`,
                          fill: '#f59e0b',
                          fontSize: 10,
                          position: 'insideTopRight',
                          offset: 8,
                        }}
                      />
                    )}

                    {/* Primary Net WPM Line */}
                    <Line
                      yAxisId="wpm"
                      type="monotone"
                      dataKey="wpm"
                      name="Net WPM"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                      activeDot={{ r: 7, fill: '#1d4ed8', strokeWidth: 2, stroke: '#ffffff' }}
                    />

                    {/* Raw WPM Line */}
                    {chartMetric === 'net_raw' && (
                      <Line
                        yAxisId="wpm"
                        type="monotone"
                        dataKey="rawWpm"
                        name="Raw WPM"
                        stroke="#818cf8"
                        strokeWidth={2}
                        strokeDasharray="4 4"
                        dot={{ r: 3, fill: '#818cf8', strokeWidth: 1, stroke: '#ffffff' }}
                        activeDot={{ r: 5, fill: '#6366f1' }}
                      />
                    )}

                    {/* Accuracy Line */}
                    {chartMetric === 'net_acc' && (
                      <Line
                        yAxisId="accuracy"
                        type="monotone"
                        dataKey="accuracy"
                        name="Accuracy (%)"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#10b981', strokeWidth: 1, stroke: '#ffffff' }}
                        activeDot={{ r: 5, fill: '#059669' }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Keyboard Heatmap View */}
      {viewMode === 'keyboard' && (
        <KeyboardLayout
          history={filteredHistory}
          title="Typing Accuracy & Struggle Keys Heatmap"
          subtitle="Aggregated character accuracy analysis based on your selected test history range"
        />
      )}

      {/* List View Table */}
      {viewMode === 'list' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
          {sortedHistory.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">No test results found</p>
              <p className="text-xs text-slate-500">Take a typing test to start tracking your performance history.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Mode</th>
                    <th className="py-3 px-3">Speed (WPM)</th>
                    <th className="py-3 px-3">Accuracy</th>
                    <th className="py-3 px-3">Errors</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedHistory.map((item) => (
                    <tr
                      key={item.testId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-3 px-3 text-slate-900 dark:text-slate-200 font-medium whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{item.duration}s</td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400 capitalize">
                        {item.difficulty} • {item.textType}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-blue-600 dark:text-blue-400">
                        {item.wpm} WPM
                      </td>
                      <td className="py-3 px-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                        {item.accuracy}%
                      </td>
                      <td className="py-3 px-3 font-medium text-rose-600 dark:text-rose-400">{item.errors}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.testId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-sm w-full p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clear All History?</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              This will permanently remove all stored test records and statistics. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 font-semibold text-white text-sm transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
