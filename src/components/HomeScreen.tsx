import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Trophy,
  Target,
  Award,
  Flame,
  Zap,
  BookOpen,
  AlignLeft,
  Quote,
  Sparkles,
  ChevronRight,
  Activity,
  Sliders,
  Shield,
  Layers,
} from 'lucide-react';
import { UserPreferences, UserStats, DifficultyLevel, TextType, TestMode, WordCountOption } from '../types';
import { getAllAchievements } from '../services/achievementService';
import { HeroKeyboardVisual } from './HeroKeyboardVisual';

interface HomeScreenProps {
  stats: UserStats;
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onStartTest: () => void;
  onStartWarmup: () => void;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenTrophies?: () => void;
  onOpenLeaderboard?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  preferences,
  onUpdatePreferences,
  onStartTest,
  onStartWarmup,
  onOpenSettings,
  onOpenHistory,
  onOpenTrophies,
  onOpenLeaderboard,
}) => {
  const [isStarting, setIsStarting] = useState(false);
  const durations = [15, 30, 60, 120];
  const wordCounts: WordCountOption[] = [10, 25, 50, 100];

  const allAchievements = useMemo(() => {
    return getAllAchievements(stats, []);
  }, [stats]);

  const unlockedTrophyCount = useMemo(() => {
    return allAchievements.filter((a) => a.isUnlocked).length;
  }, [allAchievements]);

  const nextSpeedMilestone = useMemo(() => {
    return allAchievements
      .filter((a) => a.category === 'speed' && !a.isUnlocked)
      .sort((a, b) => a.targetValue - b.targetValue)[0];
  }, [allAchievements]);

  const handleLaunchTest = () => {
    setIsStarting(true);
    setTimeout(() => {
      onStartTest();
    }, 150);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-16 space-y-16 sm:space-y-24 animate-fade-in overflow-x-hidden selection:bg-[#6C8CFF]/30">
      {/* 04 — HERO SECTION (Apple-level Product Presentation & High Editorial Typography) */}
      <section className="text-center space-y-6 pt-4 sm:pt-8 max-w-3xl mx-auto">
        {/* Subtle Architectural Discipline Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101216] border border-white/[0.08] text-[#A5A7AC] text-[11px] font-mono tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6C8CFF] shadow-[0_0_8px_#6C8CFF]" />
          <span>DIGITAL TYPING LABORATORY</span>
        </div>

        {/* Cinematic Headline: TYPE WITH PRECISION */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-black text-[#F5F5F0] tracking-tighter leading-[0.92] uppercase">
          Type
          <br />
          With
          <br />
          <span className="text-[#6C8CFF] drop-shadow-[0_10px_35px_rgba(108,140,255,0.25)]">
            Precision.
          </span>
        </h1>

        {/* Restrained Subtitle */}
        <p className="text-base sm:text-xl text-[#A5A7AC] max-w-xl mx-auto font-normal leading-relaxed pt-2">
          Measure your typing speed. Track your accuracy.
          <br className="hidden sm:inline" />
          Master your flow with instrument-grade telemetry.
        </p>

        {/* Primary and Secondary Hero Actions with Negative Space */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            id="primary-start-cta"
            data-cursor="start"
            onClick={handleLaunchTest}
            disabled={isStarting}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#6C8CFF] hover:bg-[#5A7BFF] active:bg-[#4E6FEB] text-white font-mono font-bold tracking-wider uppercase text-sm sm:text-base flex items-center justify-center gap-3 shadow-[0_12px_32px_rgba(108,140,255,0.3)] hover:shadow-[0_16px_40px_rgba(108,140,255,0.45)] transition-all duration-200 cursor-pointer group"
          >
            <span>{isStarting ? 'INITIALIZING...' : 'START TEST'}</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <button
            onClick={onStartWarmup}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#101216] hover:bg-[#15181D] text-[#A5A7AC] hover:text-[#F5F5F0] border border-white/[0.08] hover:border-white/[0.18] font-mono text-xs sm:text-sm font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Activity className="w-4 h-4 text-[#8A6CFF]" />
            <span>EXPLORE CADENCE (30S)</span>
          </button>
        </div>
      </section>

      {/* 05 & 06 — CENTRAL INTERACTIVE KEYBOARD ARCHITECTURE */}
      <section className="relative">
        <HeroKeyboardVisual onQuickStart={handleLaunchTest} />
      </section>

      {/* 11 & 12 — EDITORIAL PERFORMANCE STRIP (Precision Laboratory Readings) */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#090A0C] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.06] text-xs font-mono text-[#686B72] uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>TELEMETRY OVERVIEW</span>
          </span>
          <span>CALIBRATED LOG</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Best WPM */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[#686B72] text-[11px] font-mono uppercase tracking-wider">
              <span>WPM</span>
              <Trophy className="w-3.5 h-3.5 text-[#6C8CFF]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl font-black font-mono-num text-[#F5F5F0]">
                {stats.bestWpm > 0 ? stats.bestWpm : '--'}
              </span>
              <span className="text-[10px] font-mono text-[#686B72] uppercase">WORDS/MIN</span>
            </div>
            <div className="text-[11px] font-mono text-[#A5A7AC]">Peak Recorded Speed</div>
          </div>

          {/* Best Accuracy */}
          <div className="space-y-1 md:border-l md:border-white/[0.06] md:pl-8">
            <div className="flex items-center justify-between text-[#686B72] text-[11px] font-mono uppercase tracking-wider">
              <span>ACCURACY</span>
              <Target className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl font-black font-mono-num text-[#F5F5F0]">
                {stats.bestAccuracy > 0 ? `${stats.bestAccuracy}%` : '--'}
              </span>
              <span className="text-[10px] font-mono text-[#686B72] uppercase">PRECISION</span>
            </div>
            <div className="text-[11px] font-mono text-[#A5A7AC]">Keystroke Fidelity</div>
          </div>

          {/* Total Tests */}
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-8">
            <div className="flex items-center justify-between text-[#686B72] text-[11px] font-mono uppercase tracking-wider">
              <span>SESSIONS</span>
              <Award className="w-3.5 h-3.5 text-[#8A6CFF]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl font-black font-mono-num text-[#F5F5F0]">
                {stats.totalTestsCompleted}
              </span>
              <span className="text-[10px] font-mono text-[#686B72] uppercase">COMPLETED</span>
            </div>
            <div className="text-[11px] font-mono text-[#A5A7AC]">Laboratory Trials</div>
          </div>

          {/* Daily Streak */}
          <div className="space-y-1 border-t md:border-t-0 md:border-l border-white/[0.06] pt-4 md:pt-0 md:pl-8">
            <div className="flex items-center justify-between text-[#686B72] text-[11px] font-mono uppercase tracking-wider">
              <span>CADENCE</span>
              <Flame className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl font-black font-mono-num text-[#F5F5F0]">
                {stats.currentStreakDays}
              </span>
              <span className="text-[10px] font-mono text-[#686B72] uppercase">DAYS</span>
            </div>
            <div className="text-[11px] font-mono text-[#A5A7AC]">Daily Flow Habit</div>
          </div>
        </div>
      </section>

      {/* 16 — TEST CONTROLS & CONFIGURATION MATRIX */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#101216] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-[#F5F5F0] tracking-tight">
              Test Configuration
            </h2>
            <p className="text-xs font-mono text-[#686B72] mt-0.5">
              Customize the testing matrix before engaging the speed instrument.
            </p>
          </div>
          <button
            onClick={onOpenSettings}
            className="text-xs font-mono text-[#6C8CFF] hover:underline cursor-pointer"
          >
            ALL SETTINGS →
          </button>
        </div>

        {/* Test Mode Selector: TIME / WORDS / QUOTE / CUSTOM */}
        <div className="space-y-2">
          <label className="text-[11px] font-mono uppercase tracking-wider text-[#686B72] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#6C8CFF]" />
              <span>TEST MODE</span>
            </span>
            <span className="text-[10px] font-mono text-[#686B72]">
              {preferences.testMode === 'time' && 'Timed countdown duration'}
              {preferences.testMode === 'words' && 'Fixed word volume challenge'}
              {preferences.testMode === 'quote' && 'Literature & scientific quotes'}
              {preferences.testMode === 'custom' && 'Configurable duration & words'}
            </span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-[#090A0C] rounded-2xl border border-white/[0.06]">
            {[
              { id: 'time', label: 'TIME', icon: Zap },
              { id: 'words', label: 'WORDS', icon: AlignLeft },
              { id: 'quote', label: 'QUOTE', icon: Quote },
              { id: 'custom', label: 'CUSTOM', icon: Sliders },
            ].map((mode) => {
              const Icon = mode.icon;
              const isSelected = preferences.testMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => onUpdatePreferences({ testMode: mode.id as TestMode })}
                  className={`py-3 px-3 rounded-xl text-xs font-mono font-bold tracking-wider transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer touch-manipulation ${
                    isSelected
                      ? 'bg-[#15181D] text-[#F5F5F0] border border-white/[0.12] shadow-sm'
                      : 'text-[#A5A7AC] hover:text-[#F5F5F0] hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#6C8CFF]' : ''}`} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sub-options for Duration/Words, Difficulty, Content Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
          {/* Duration or Words */}
          {preferences.testMode === 'time' && (
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#686B72] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#6C8CFF]" />
                <span>DURATION</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#090A0C] rounded-xl border border-white/[0.06]">
                {durations.map((d) => (
                  <button
                    key={d}
                    onClick={() => onUpdatePreferences({ testDuration: d })}
                    className={`py-2.5 text-xs font-mono font-bold rounded-lg transition-all min-h-[42px] cursor-pointer ${
                      preferences.testDuration === d
                        ? 'bg-[#15181D] text-[#6C8CFF] border border-white/[0.1]'
                        : 'text-[#A5A7AC] hover:text-[#F5F5F0]'
                    }`}
                  >
                    {d}S
                  </button>
                ))}
              </div>
            </div>
          )}

          {preferences.testMode === 'words' && (
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#686B72] flex items-center gap-1.5">
                <AlignLeft className="w-3.5 h-3.5 text-[#6C8CFF]" />
                <span>WORD TARGET</span>
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#090A0C] rounded-xl border border-white/[0.06]">
                {wordCounts.map((wc) => (
                  <button
                    key={wc}
                    onClick={() => onUpdatePreferences({ wordCount: wc })}
                    className={`py-2.5 text-xs font-mono font-bold rounded-lg transition-all min-h-[42px] cursor-pointer ${
                      preferences.wordCount === wc
                        ? 'bg-[#15181D] text-[#6C8CFF] border border-white/[0.1]'
                        : 'text-[#A5A7AC] hover:text-[#F5F5F0]'
                    }`}
                  >
                    {wc}W
                  </button>
                ))}
              </div>
            </div>
          )}

          {preferences.testMode === 'quote' && (
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#686B72] flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-[#6C8CFF]" />
                <span>QUOTE CORPUS</span>
              </label>
              <div className="p-3 bg-[#090A0C] rounded-xl border border-white/[0.06] text-xs font-mono text-[#F5F5F0] flex items-center justify-between min-h-[44px]">
                <span>Literary &amp; Scientific</span>
                <span className="text-[10px] font-mono text-[#6C8CFF] border border-[#6C8CFF]/30 px-2 py-0.5 rounded-full">
                  CURATED
                </span>
              </div>
            </div>
          )}

          {preferences.testMode === 'custom' && (
            <div className="space-y-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#686B72] flex items-center justify-between">
                <span>CUSTOM DURATION</span>
                <span className="text-[#6C8CFF] font-mono font-bold">{preferences.customDuration}S</span>
              </label>
              <input
                type="range"
                min={10}
                max={180}
                step={5}
                value={preferences.customDuration}
                onChange={(e) => onUpdatePreferences({ customDuration: Number(e.target.value) })}
                className="w-full accent-[#6C8CFF] cursor-pointer min-h-[36px]"
              />
            </div>
          )}

          {/* Difficulty Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#686B72] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#8A6CFF]" />
              <span>DIFFICULTY</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#090A0C] rounded-xl border border-white/[0.06]">
              {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => onUpdatePreferences({ difficultyLevel: diff })}
                  className={`py-2.5 text-xs font-mono font-bold uppercase rounded-lg transition-all min-h-[42px] cursor-pointer ${
                    preferences.difficultyLevel === diff
                      ? 'bg-[#15181D] text-[#6C8CFF] border border-white/[0.1]'
                      : 'text-[#A5A7AC] hover:text-[#F5F5F0]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Content Style Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#686B72] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>CONTENT STYLE</span>
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#090A0C] rounded-xl border border-white/[0.06]">
              {[
                { id: 'words', label: 'WORDS' },
                { id: 'sentences', label: 'SENT' },
                { id: 'code', label: 'CODE' },
                { id: 'paragraph', label: 'PARA' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdatePreferences({ textType: item.id as TextType })}
                  className={`py-2.5 text-xs font-mono font-bold rounded-lg transition-all min-h-[42px] cursor-pointer ${
                    preferences.textType === item.id
                      ? 'bg-[#15181D] text-[#6C8CFF] border border-white/[0.1]'
                      : 'text-[#A5A7AC] hover:text-[#F5F5F0]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Launch Primary Test Button with Magnetic Feel */}
        <div className="pt-2">
          <button
            onClick={handleLaunchTest}
            disabled={isStarting}
            data-cursor="start"
            className="w-full py-4 px-6 rounded-2xl bg-[#6C8CFF] hover:bg-[#5A7BFF] active:bg-[#4E6FEB] text-white font-mono font-bold tracking-wider uppercase text-sm sm:text-base shadow-[0_12px_32px_rgba(108,140,255,0.3)] hover:shadow-[0_16px_40px_rgba(108,140,255,0.45)] transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>
              ENGAGE TEST (
              {preferences.testMode === 'time'
                ? `${preferences.testDuration}S · ${preferences.difficultyLevel.toUpperCase()}`
                : preferences.testMode === 'words'
                ? `${preferences.wordCount} WORDS · ${preferences.difficultyLevel.toUpperCase()}`
                : preferences.testMode === 'quote'
                ? 'QUOTE MODE'
                : `${preferences.customDuration}S · CUSTOM`}
              )
            </span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1.5" />
          </button>
        </div>
      </section>

      {/* TROPHIES & MILESTONES SHOWCASE STRIP */}
      <section className="p-6 rounded-3xl bg-[#090A0C] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#15181D] border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-[#F5F5F0] text-base">
                Speed Trophies &amp; Milestones
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                {unlockedTrophyCount} / {allAchievements.length} UNLOCKED
              </span>
            </div>
            <p className="text-xs font-mono text-[#A5A7AC] mt-1">
              {nextSpeedMilestone ? (
                <span>
                  Next Objective: <strong className="text-[#F5F5F0]">{nextSpeedMilestone.title} ({nextSpeedMilestone.targetValue} WPM)</strong>
                  {stats.bestWpm > 0 && ` • Need +${Math.max(1, nextSpeedMilestone.targetValue - stats.bestWpm)} WPM`}
                </span>
              ) : (
                <span>All speed tiers unlocked! Perfect mastery achieved.</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="px-4 py-2.5 rounded-xl bg-[#15181D] hover:bg-[#1C2027] text-[#A5A7AC] hover:text-[#F5F5F0] border border-white/[0.08] text-xs font-mono tracking-wider transition-colors cursor-pointer"
            >
              LEADERBOARD
            </button>
          )}
          {onOpenTrophies && (
            <button
              onClick={onOpenTrophies}
              className="px-4 py-2.5 rounded-xl bg-[#15181D] hover:bg-[#1C2027] text-[#F5F5F0] border border-white/[0.12] text-xs font-mono tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>TROPHY ROOM</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#6C8CFF]" />
            </button>
          )}
        </div>
      </section>

      {/* FOOTER METADATA DISCIPLINE */}
      <footer className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#686B72]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#F5F5F0]">TYPE/</span>
          <span>·</span>
          <span>PRECISION IN EVERY KEYSTROKE</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={onOpenSettings} className="hover:text-[#F5F5F0] transition-colors cursor-pointer">
            AUDIO PACKS
          </button>
          <span>·</span>
          <button onClick={onOpenHistory} className="hover:text-[#F5F5F0] transition-colors cursor-pointer">
            KEY HEATMAP
          </button>
          <span>·</span>
          <button onClick={onStartWarmup} className="hover:text-[#F5F5F0] transition-colors cursor-pointer">
            WARM-UP
          </button>
        </div>
      </footer>
    </div>
  );
};
