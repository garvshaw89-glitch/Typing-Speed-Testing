import React, { useState, useMemo } from 'react';
import { TestResult, UserStats, UserPreferences } from '../types';
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
  preferences?: UserPreferences;
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
  preferences,
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
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in select-none">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl border border-white/[0.08] bg-[#101216] text-[#A5A7AC] hover:text-[#F5F5F0] hover:border-white/[0.2] transition-colors cursor-pointer"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-4xl font-display font-bold text-[#F5F5F0] tracking-tight uppercase">
              Telemetry &amp; History
            </h1>
            <p className="text-xs font-mono text-[#686B72]">
              Historical records and keystroke confusion matrix analytics
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportHistoryToCSV()}
            disabled={history.length === 0}
            className="py-2.5 px-3.5 rounded-xl border border-white/[0.08] bg-[#101216] text-[#A5A7AC] hover:text-[#F5F5F0] hover:border-white/[0.2] font-mono text-xs font-semibold flex items-center gap-2 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#6C8CFF]" />
            <span>EXPORT CSV</span>
          </button>

          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={history.length === 0}
            className="py-2.5 px-3.5 rounded-xl border border-rose-950/60 bg-rose-950/20 text-rose-300 font-mono text-xs font-semibold flex items-center gap-2 hover:bg-rose-950/40 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR LOGS</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#090A0C] border border-white/[0.08] shadow-sm font-mono">
          <div className="flex items-center justify-between text-xs font-semibold text-[#686B72]">
            <span>ALL-TIME BEST</span>
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black font-mono-num text-[#F5F5F0]">{stats.bestWpm} WPM</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090A0C] border border-white/[0.08] shadow-sm font-mono">
          <div className="flex items-center justify-between text-xs font-semibold text-[#686B72]">
            <span>AVERAGE SPEED</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#6C8CFF]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black font-mono-num text-[#F5F5F0]">{stats.averageWpm} WPM</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090A0C] border border-white/[0.08] shadow-sm font-mono">
          <div className="flex items-center justify-between text-xs font-semibold text-[#686B72]">
            <span>BEST ACCURACY</span>
            <Target className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black font-mono-num text-[#F5F5F0]">{stats.bestAccuracy}%</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090A0C] border border-white/[0.08] shadow-sm font-mono">
          <div className="flex items-center justify-between text-xs font-semibold text-[#686B72]">
            <span>TOTAL TRIALS</span>
            <Award className="w-3.5 h-3.5 text-[#8A6CFF]" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black font-mono-num text-[#F5F5F0]">{stats.totalTestsCompleted}</div>
        </div>
      </div>

      {/* View Toggle & Filters */}
      <div className="p-4 rounded-2xl bg-[#090A0C] border border-white/[0.08] shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Toggle List / Chart / Heatmap / Trophies */}
        <div className="flex items-center gap-1.5 p-1 bg-[#101216] rounded-xl border border-white/[0.06] text-xs font-mono">
          <button
            onClick={() => setViewMode('list')}
            className={`py-2 px-3.5 rounded-lg font-bold tracking-wider transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-[#15181D] text-[#F5F5F0] border border-white/[0.1] shadow-xs'
                : 'text-[#A5A7AC] hover:text-[#F5F5F0]'
            }`}
          >
            TABLE LIST
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`py-2 px-3.5 rounded-lg font-bold tracking-wider transition-all cursor-pointer ${
              viewMode === 'chart'
                ? 'bg-[#15181D] text-[#6C8CFF] border border-white/[0.1] shadow-xs'
                : 'text-[#A5A7AC] hover:text-[#F5F5F0]'
            }`}
          >
            TREND GRAPH
          </button>
          <button
            onClick={() => setViewMode('keyboard')}
            className={`py-2 px-3.5 rounded-lg font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'keyboard'
                ? 'bg-[#15181D] text-[#6C8CFF] border border-white/[0.1] shadow-xs'
                : 'text-[#A5A7AC] hover:text-[#F5F5F0]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>KEY HEATMAP</span>
          </button>
          <button
            onClick={() => setViewMode('trophies')}
            className={`py-2 px-3.5 rounded-lg font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'trophies'
                ? 'bg-[#15181D] text-amber-400 border border-white/[0.1] shadow-xs'
                : 'text-[#A5A7AC] hover:text-[#F5F5F0]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>TROPHIES</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                viewMode === 'trophies'
                  ? 'bg-amber-400/20 text-amber-300'
                  : 'bg-amber-500/10 text-amber-400'
              }`}
            >
              {unlockedTrophyCount}/{achievements.length}
            </span>
          </button>
        </div>

        {/* Date Filters */}
        {viewMode !== 'trophies' && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#A5A7AC]">
            <ListFilter className="w-3.5 h-3.5 text-[#686B72]" />
            <span>RANGE:</span>
            {(['all', '7days', '30days'] as FilterRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setFilterRange(range)}
                className={`px-3 py-1 rounded-lg transition-colors uppercase cursor-pointer ${
                  filterRange === range
                    ? 'bg-[#15181D] text-[#6C8CFF] border border-white/[0.1] font-bold'
                    : 'text-[#686B72] hover:text-[#F5F5F0]'
                }`}
              >
                {range === 'all' ? 'All Time' : range === '7days' ? '7 Days' : '30 Days'}
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
        <div className="p-6 sm:p-8 rounded-3xl bg-[#090A0C] border border-white/[0.08] shadow-2xl space-y-6">
          {/* Header with Title and Mode Toggles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold text-[#F5F5F0] flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#6C8CFF]" />
                <span>WPM PROGRESSION OVER TIME</span>
              </h3>
              <p className="text-xs font-mono text-[#686B72] mt-0.5">
                Visualizing typing speed velocity and accuracy growth across test sessions
              </p>
            </div>

            {/* Metric Mode Filter */}
            {chartData.length > 0 && (
              <div className="flex items-center gap-1 p-1 bg-[#101216] rounded-xl border border-white/[0.06] text-xs font-mono shrink-0">
                <button
                  onClick={() => setChartMetric('net')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartMetric === 'net'
                      ? 'bg-[#15181D] text-[#6C8CFF] border border-white/[0.1] font-bold'
                      : 'text-[#686B72] hover:text-[#F5F5F0]'
                  }`}
                >
                  NET WPM
                </button>
                <button
                  onClick={() => setChartMetric('net_raw')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartMetric === 'net_raw'
                      ? 'bg-[#15181D] text-[#6C8CFF] border border-white/[0.1] font-bold'
                      : 'text-[#686B72] hover:text-[#F5F5F0]'
                  }`}
                >
                  NET + RAW
                </button>
                <button
                  onClick={() => setChartMetric('net_acc')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    chartMetric === 'net_acc'
                      ? 'bg-[#15181D] text-[#6C8CFF] border border-white/[0.1] font-bold'
                      : 'text-[#686B72] hover:text-[#F5F5F0]'
                  }`}
                >
                  NET + ACC
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
          initialPalette={preferences?.keyboardHeatmapPalette}
          activeColor={preferences?.keyboardActiveColor}
        />
      )}

      {/* List View Table */}
      {viewMode === 'list' && (
        <div className="p-6 rounded-3xl bg-[#090A0C] border border-white/[0.08] shadow-2xl overflow-hidden font-mono">
          {sortedHistory.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Calendar className="w-10 h-10 text-[#686B72] mx-auto" />
              <p className="text-base font-bold text-[#F5F5F0]">NO TEST RECORDS RECORDED</p>
              <p className="text-xs text-[#686B72]">Engage a typing speed trial to log performance telemetry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[#686B72] font-bold uppercase tracking-widest text-[10px]">
                    <th className="py-3.5 px-3">DATE</th>
                    <th className="py-3.5 px-3 hidden sm:table-cell">DURATION</th>
                    <th className="py-3.5 px-3 hidden md:table-cell">MODE</th>
                    <th className="py-3.5 px-3">SPEED</th>
                    <th className="py-3.5 px-3">ACCURACY</th>
                    <th className="py-3.5 px-3 hidden sm:table-cell">ERRORS</th>
                    <th className="py-3.5 px-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {sortedHistory.map((item) => (
                    <tr
                      key={item.testId}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-3.5 px-3 text-[#F5F5F0] font-medium whitespace-nowrap text-xs">
                        {new Date(item.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-3 text-[#A5A7AC] hidden sm:table-cell font-mono-num tabular-nums">
                        {item.duration}S
                      </td>
                      <td className="py-3.5 px-3 text-[#A5A7AC] uppercase hidden md:table-cell text-xs">
                        {item.difficulty} · {item.textType}
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-[#6C8CFF] font-mono-num tabular-nums whitespace-nowrap">
                        {item.wpm} <span className="text-[10px] font-normal text-[#686B72]">WPM</span>
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-emerald-400 font-mono-num tabular-nums whitespace-nowrap">
                        {item.accuracy}%
                      </td>
                      <td className="py-3.5 px-3 font-medium text-[#FF6B6B] hidden sm:table-cell font-mono-num tabular-nums">
                        {item.errors}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setViewMode('keyboard')}
                            className="w-9 h-9 inline-flex items-center justify-center rounded-xl text-[#686B72] hover:text-[#6C8CFF] hover:bg-white/[0.04] transition-colors cursor-pointer"
                            title="Inspect Key Heatmap"
                            aria-label="Inspect Key Heatmap"
                          >
                            <Keyboard className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.testId)}
                            className="w-9 h-9 inline-flex items-center justify-center rounded-xl text-[#686B72] hover:text-[#FF6B6B] hover:bg-rose-950/20 transition-colors cursor-pointer"
                            title="Delete Record"
                            aria-label="Delete test record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
        <div className="fixed inset-0 z-50 bg-[#050505]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-[#101216] border border-white/[0.12] shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-lg font-display font-bold text-[#F5F5F0]">Purge Historical Telemetry?</h3>
            </div>
            <p className="text-sm font-mono text-[#A5A7AC] leading-relaxed">
              This will permanently delete all stored test records, confusion matrices, and speed progression curves.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/[0.1] font-mono text-xs font-semibold text-[#A5A7AC] hover:text-[#F5F5F0] hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={handleClearAll}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800/60 font-mono text-xs font-bold text-rose-200 transition-colors cursor-pointer"
              >
                PURGE ALL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
