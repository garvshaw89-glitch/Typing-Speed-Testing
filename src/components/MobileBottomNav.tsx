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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090A0C]/95 backdrop-blur-xl border-t border-white/[0.08] pb-safe shadow-[0_-10px_25px_rgba(0,0,0,0.6)]"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 items-center h-14 max-w-md mx-auto px-2 font-mono">
        {/* Tab 1: Practice / Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentScreen === 'home' || currentScreen === 'prep' || currentScreen === 'test'
              ? 'text-[#6C8CFF] font-bold'
              : 'text-[#686B72] hover:text-[#F5F5F0]'
          }`}
        >
          <Play className={`w-4 h-4 ${currentScreen === 'home' || currentScreen === 'test' ? 'fill-current' : ''}`} />
          <span className="text-[9px] mt-0.5 tracking-wider uppercase">TEST</span>
        </button>

        {/* Tab 2: Leaderboard */}
        <button
          onClick={() => onNavigate('leaderboard')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentScreen === 'leaderboard'
              ? 'text-[#6C8CFF] font-bold'
              : 'text-[#686B72] hover:text-[#F5F5F0]'
          }`}
        >
          <Trophy className={`w-4 h-4 ${currentScreen === 'leaderboard' ? 'fill-current' : ''}`} />
          <span className="text-[9px] mt-0.5 tracking-wider uppercase">RANKS</span>
        </button>

        {/* Tab 3: History */}
        <button
          onClick={() => onNavigate('history')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentScreen === 'history'
              ? 'text-[#6C8CFF] font-bold'
              : 'text-[#686B72] hover:text-[#F5F5F0]'
          }`}
        >
          <History className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 tracking-wider uppercase">LOGS</span>
        </button>

        {/* Tab 4: Trophies */}
        <button
          onClick={onOpenTrophies}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-[#686B72] hover:text-amber-400 transition-colors cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-[9px] mt-0.5 tracking-wider uppercase">TROPHIES</span>
        </button>

        {/* Tab 5: Settings */}
        <button
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-[#686B72] hover:text-[#F5F5F0] transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 tracking-wider uppercase">CONFIG</span>
        </button>
      </div>
    </nav>
  );
};
