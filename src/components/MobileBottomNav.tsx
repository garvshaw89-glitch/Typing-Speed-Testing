import React from 'react';
import { Play, Trophy, History, Award, Settings } from 'lucide-react';
import { AppScreen } from '../types';

interface MobileBottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  onOpenTrophies: () => void;
  onOpenSettings: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentScreen,
  onNavigate,
  onOpenTrophies,
  onOpenSettings,
}) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe shadow-lg"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 items-center h-14 max-w-md mx-auto px-2">
        {/* Tab 1: Practice / Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentScreen === 'home' || currentScreen === 'prep' || currentScreen === 'test'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Play className={`w-4 h-4 ${currentScreen === 'home' || currentScreen === 'test' ? 'fill-current' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Practice</span>
        </button>

        {/* Tab 2: Leaderboard */}
        <button
          onClick={() => onNavigate('leaderboard')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentScreen === 'leaderboard'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Trophy className={`w-4 h-4 ${currentScreen === 'leaderboard' ? 'fill-current' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight">Ranks</span>
        </button>

        {/* Tab 3: History */}
        <button
          onClick={() => onNavigate('history')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentScreen === 'history'
              ? 'text-blue-600 dark:text-blue-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">History</span>
        </button>

        {/* Tab 4: Trophies */}
        <button
          onClick={onOpenTrophies}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] mt-0.5 tracking-tight">Trophies</span>
        </button>

        {/* Tab 5: Settings */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Settings</span>
        </button>
      </div>
    </nav>
  );
};
