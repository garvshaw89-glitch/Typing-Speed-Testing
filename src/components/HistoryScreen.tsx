import React, { useState } from 'react';
import { TestResult, UserStats } from '../types';
import { exportHistoryToCSV, deleteTestResult, clearAllHistory } from '../services/storageService';
import { KeyboardLayout } from './KeyboardLayout';
import { Trash2, Download, TrendingUp, BarChart3, ListFilter, ArrowLeft, Trophy, Target, Award, Calendar, AlertTriangle, Keyboard } from 'lucide-react';

interface HistoryScreenProps {
  history: TestResult[];
  stats: UserStats;
  onRefreshHistory: () => void;
  onBackToHome: () => void;
  onShowToast: (message: string, type: 'success' | 'info') => void;
}

type FilterRange = 'all' | '7days' | '30days';
type SortField = 'date' | 'wpm' | 'accuracy' | 'duration';
type ViewMode = 'list' | 'chart' | 'keyboard';

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  history,
  stats,
  onRefreshHistory,
  onBackToHome,
  onShowToast,
}) => {
  const [filterRange, setFilterRange] = useState<FilterRange>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

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
  const chartData = [...filteredHistory].reverse();
  const maxWpm = Math.max(...chartData.map((d) => d.wpm), 100);

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
        </div>

        {/* Date Filters */}
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
      </div>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              WPM Progression Trend
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              {chartData.length} data point{chartData.length === 1 ? '' : 's'}
            </span>
          </div>

          {chartData.length < 2 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Complete at least 2 tests to display a progression trend line graph.
            </div>
          ) : (
            <div className="w-full h-64 relative pt-4 pb-8">
              {/* SVG Trend Line Graph */}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Horizontal Grid lines */}
                {[0, 25, 50, 75, 100].map((val) => {
                  const y = 100 - (val / 100) * 100;
                  return (
                    <g key={val}>
                      <line
                        x1="0"
                        y1={y}
                        x2="100"
                        y2={y}
                        className="stroke-slate-100 dark:stroke-slate-700/50"
                        strokeDasharray="2"
                        strokeWidth="0.5"
                      />
                      <text
                        x="0"
                        y={Math.max(4, y - 2)}
                        className="fill-slate-400 text-[3.5px] font-mono"
                      >
                        {val} WPM
                      </text>
                    </g>
                  );
                })}

                {/* Trend Polyline */}
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartData
                    .map((d, index) => {
                      const x = (index / (chartData.length - 1)) * 100;
                      const y = 100 - (Math.min(d.wpm, maxWpm) / maxWpm) * 100;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Data Points */}
                {chartData.map((d, index) => {
                  const x = (index / (chartData.length - 1)) * 100;
                  const y = 100 - (Math.min(d.wpm, maxWpm) / maxWpm) * 100;
                  return (
                    <g key={d.testId} className="group">
                      <circle
                        cx={x}
                        cy={y}
                        r="2.5"
                        className="fill-blue-600 stroke-white dark:stroke-slate-800 stroke-[0.8] cursor-pointer"
                      />
                    </g>
                  );
                })}
              </svg>
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
