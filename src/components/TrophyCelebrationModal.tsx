import React from 'react';
import { Achievement } from '../types';
import { TrophyCard } from './TrophyCard';
import { Trophy, X, ArrowRight, Sparkles } from 'lucide-react';

interface TrophyCelebrationModalProps {
  unlockedAchievements: Achievement[];
  onClose: () => void;
  onViewAllTrophies: () => void;
}

export const TrophyCelebrationModal: React.FC<TrophyCelebrationModalProps> = ({
  unlockedAchievements,
  onClose,
  onViewAllTrophies,
}) => {
  if (unlockedAchievements.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-2xl p-5 sm:p-8 space-y-5 sm:space-y-6 overflow-hidden max-h-[85vh] overflow-y-auto">
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-gradient-to-b from-amber-400/30 via-yellow-500/10 to-transparent blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20 cursor-pointer flex items-center justify-center"
          title="Close celebration"
          aria-label="Close celebration"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebratory Header */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-white shadow-lg shadow-amber-500/30 mx-auto animate-bounce">
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8 fill-white" />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-xs tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Milestone Shattered!</span>
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {unlockedAchievements.length === 1
                ? 'New Trophy Unlocked!'
                : `${unlockedAchievements.length} New Trophies Unlocked!`}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Congratulations! Your typing velocity and technique just unlocked a visual badge.
            </p>
          </div>
        </div>

        {/* Unlocked Trophies Showcase List */}
        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1 relative z-10">
          {unlockedAchievements.map((achievement) => (
            <TrophyCard key={achievement.id} achievement={achievement} isNew={true} />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-2 relative z-10">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm transition-all cursor-pointer min-h-[44px]"
          >
            Awesome, Continue!
          </button>
          <button
            onClick={() => {
              onClose();
              onViewAllTrophies();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
          >
            <span>View All Trophies</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
