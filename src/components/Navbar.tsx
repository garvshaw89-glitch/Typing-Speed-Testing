import React from 'react';
import { History, Settings, HelpCircle, Sun, Moon, Flame, Trophy } from 'lucide-react';
import { UserPreferences, UserStats, AppScreen } from '../types';

interface NavbarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenTrophies?: () => void;
  preferences: UserPreferences;
  onToggleTheme: () => void;
  stats: UserStats;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentScreen,
  onNavigate,
  onOpenSettings,
  onOpenHelp,
  onOpenTrophies,
  preferences,
  onToggleTheme,
  stats,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors pt-safe">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Single Wordmark / Brand element */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 sm:gap-3 text-left focus:outline-none group cursor-pointer shrink-0 min-h-[44px]"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-xs group-hover:scale-105 transition-transform bg-[#0b112c] flex items-center justify-center border border-slate-700/50">
            <img src="/favicon.svg" alt="Typing Speed Test Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 dark:text-white truncate max-w-[170px] sm:max-w-none">
            Typing Speed Test
          </span>
        </button>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentScreen === 'home' || currentScreen === 'test' || currentScreen === 'prep'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Practice
          </button>

          <button
            onClick={() => onNavigate('leaderboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentScreen === 'leaderboard'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Leaderboard
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentScreen === 'history'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            History
          </button>

          {onOpenTrophies && (
            <button
              onClick={onOpenTrophies}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer flex items-center gap-1"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Trophies</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Controls (with min 44px touch targets) */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Active Streak Badge */}
          {stats.currentStreakDays > 0 && (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{stats.currentStreakDays}d Streak</span>
            </div>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 sm:w-11 sm:h-11 min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Audio & Test Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="w-10 h-10 sm:w-11 sm:h-11 min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Shortcuts & Instructions"
            aria-label="Instructions"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 sm:w-11 sm:h-11 min-h-[44px] min-w-[44px] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title={`Toggle Theme (${preferences.theme})`}
            aria-label="Toggle Color Theme"
          >
            {preferences.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
