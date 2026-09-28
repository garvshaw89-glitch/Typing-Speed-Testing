import React, { useState, useEffect } from 'react';
import { Settings, HelpCircle, Sun, Moon, Flame, Trophy, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { UserPreferences, UserStats, AppScreen } from '../types';

interface NavbarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenTrophies?: () => void;
  onStartTest?: () => void;
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
  onStartTest,
  preferences,
  onToggleTheme,
  stats,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTestActive = currentScreen === 'test' || currentScreen === 'prep';

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 pt-safe ${
        isTestActive
          ? 'opacity-40 hover:opacity-100 transition-opacity'
          : ''
      } ${
        isScrolled
          ? 'bg-[#050505]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
          : 'bg-[#050505]/60 backdrop-blur-md border-b border-white/[0.04]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Luxury Wordmark & Brand Philosophy */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer shrink-0"
        >
          <div className="flex items-center font-display tracking-tighter text-xl sm:text-2xl font-black text-[#F5F5F0]">
            <span>TYPE</span>
            <span className="text-[#6C8CFF] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">/</span>
          </div>

          <div className="hidden lg:flex flex-col border-l border-white/[0.1] pl-3">
            <span className="text-[10px] font-mono tracking-widest text-[#686B72] uppercase font-semibold">
              PRECISION DIGITAL INSTRUMENT
            </span>
          </div>
        </button>

        {/* Zone 2: Editorial Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-[#101216] rounded-xl border border-white/[0.06]">
          {[
            { id: 'home', label: 'TEST' },
            { id: 'leaderboard', label: 'LEADERBOARD' },
            { id: 'history', label: 'STATS & HEATMAP' },
          ].map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id as AppScreen)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wider transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#15181D] text-[#F5F5F0] shadow-sm border border-white/[0.08]'
                    : 'text-[#A5A7AC] hover:text-[#F5F5F0] hover:bg-white/[0.03]'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {onOpenTrophies && (
            <button
              onClick={onOpenTrophies}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wider text-[#A5A7AC] hover:text-[#F5F5F0] hover:bg-white/[0.03] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>TROPHIES</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Telemetry, Settings, & Quick Launch */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Streak Indicator */}
          {stats.currentStreakDays > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#101216] border border-white/[0.08] text-xs font-mono text-[#A5A7AC]">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span className="text-[#F5F5F0] font-semibold">{stats.currentStreakDays}D</span>
              <span className="text-[#686B72]">STREAK</span>
            </div>
          )}

          {/* Audio pack quick indicator */}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-xl bg-[#101216] border border-white/[0.08] text-[#A5A7AC] hover:text-[#F5F5F0] hover:border-white/[0.18] transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title={preferences.soundEffectsEnabled ? `Sound Active: ${preferences.soundPack}` : 'Sound Muted'}
            aria-label="Sound Settings"
          >
            {preferences.soundEffectsEnabled ? (
              <Volume2 className="w-4 h-4 text-[#6C8CFF]" />
            ) : (
              <VolumeX className="w-4 h-4 text-[#686B72]" />
            )}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-xl bg-[#101216] border border-white/[0.08] text-[#A5A7AC] hover:text-[#F5F5F0] hover:border-white/[0.18] transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Audio, Heatmap & Laboratory Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Help Modal Button */}
          <button
            onClick={onOpenHelp}
            className="w-10 h-10 rounded-xl bg-[#101216] border border-white/[0.08] text-[#A5A7AC] hover:text-[#F5F5F0] hover:border-white/[0.18] transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Keystroke Instructions & Diagnostics"
            aria-label="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Quick Start CTA on non-test screens */}
          {currentScreen !== 'test' && currentScreen !== 'prep' && onStartTest && (
            <button
              onClick={onStartTest}
              data-cursor="start"
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6C8CFF] hover:bg-[#5A7BFF] text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-[0_4px_16px_rgba(108,140,255,0.25)] hover:shadow-[0_6px_22px_rgba(108,140,255,0.4)] cursor-pointer group"
            >
              <span>START TEST</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
