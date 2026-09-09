import React from 'react';
import { Achievement } from '../types';
import {
  Trophy,
  Award,
  Zap,
  Flame,
  Target,
  Crown,
  Sparkles,
  Shield,
  Check,
  Lock,
  Calendar,
} from 'lucide-react';

interface TrophyCardProps {
  achievement: Achievement;
  isNew?: boolean;
}

export const TrophyCard: React.FC<TrophyCardProps> = ({ achievement, isNew = false }) => {
  const {
    title,
    description,
    tier,
    category,
    targetValue,
    unit,
    iconName,
    isUnlocked,
    unlockedAt,
    currentValue,
    progress,
    rewardText,
  } = achievement;

  // Icon renderer
  const renderIcon = (className: string) => {
    switch (iconName) {
      case 'trophy':
        return <Trophy className={className} />;
      case 'award':
        return <Award className={className} />;
      case 'zap':
        return <Zap className={className} />;
      case 'flame':
        return <Flame className={className} />;
      case 'target':
        return <Target className={className} />;
      case 'crown':
        return <Crown className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'shield':
        return <Shield className={className} />;
      case 'check':
        return <Check className={className} />;
      default:
        return <Trophy className={className} />;
    }
  };

  // Tier aesthetic styling
  const tierConfig: Record<
    Achievement['tier'],
    {
      label: string;
      ribbonClass: string;
      haloClass: string;
      glowShadow: string;
      badgeGradient: string;
      iconColor: string;
      borderClass: string;
    }
  > = {
    bronze: {
      label: 'Bronze Tier',
      ribbonClass: 'bg-amber-800/15 text-amber-800 dark:text-amber-400 border-amber-800/30',
      haloClass: 'from-amber-700/30 via-amber-600/10 to-transparent',
      glowShadow: 'shadow-amber-900/10',
      badgeGradient: 'from-amber-600 to-amber-800',
      iconColor: 'text-amber-700 dark:text-amber-400',
      borderClass: 'border-amber-700/30 dark:border-amber-700/40',
    },
    silver: {
      label: 'Silver Tier',
      ribbonClass: 'bg-slate-400/15 text-slate-700 dark:text-slate-300 border-slate-400/30',
      haloClass: 'from-slate-400/30 via-slate-300/10 to-transparent',
      glowShadow: 'shadow-slate-500/10',
      badgeGradient: 'from-slate-400 to-slate-600',
      iconColor: 'text-slate-600 dark:text-slate-300',
      borderClass: 'border-slate-400/30 dark:border-slate-600/40',
    },
    gold: {
      label: 'Gold Tier',
      ribbonClass: 'bg-yellow-500/15 text-amber-700 dark:text-yellow-400 border-yellow-500/30',
      haloClass: 'from-amber-400/35 via-yellow-500/15 to-transparent',
      glowShadow: 'shadow-yellow-500/15',
      badgeGradient: 'from-yellow-400 via-amber-500 to-amber-600',
      iconColor: 'text-amber-600 dark:text-yellow-400',
      borderClass: 'border-yellow-500/40 dark:border-yellow-500/50',
    },
    platinum: {
      label: 'Platinum Tier',
      ribbonClass: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
      haloClass: 'from-cyan-400/30 via-sky-500/15 to-transparent',
      glowShadow: 'shadow-cyan-500/15',
      badgeGradient: 'from-cyan-400 via-teal-500 to-sky-600',
      iconColor: 'text-cyan-600 dark:text-cyan-300',
      borderClass: 'border-cyan-500/40 dark:border-cyan-500/50',
    },
    diamond: {
      label: 'Diamond Tier',
      ribbonClass: 'bg-blue-600/15 text-blue-700 dark:text-sky-300 border-blue-500/40',
      haloClass: 'from-blue-500/35 via-indigo-500/20 to-transparent',
      glowShadow: 'shadow-blue-500/20',
      badgeGradient: 'from-sky-400 via-blue-600 to-indigo-600',
      iconColor: 'text-blue-600 dark:text-sky-300',
      borderClass: 'border-blue-500/40 dark:border-blue-500/50',
    },
    master: {
      label: 'Master Tier',
      ribbonClass: 'bg-purple-600/15 text-purple-700 dark:text-purple-300 border-purple-500/40',
      haloClass: 'from-purple-500/35 via-fuchsia-500/20 to-transparent',
      glowShadow: 'shadow-purple-500/20',
      badgeGradient: 'from-purple-500 via-fuchsia-600 to-rose-600',
      iconColor: 'text-purple-600 dark:text-purple-300',
      borderClass: 'border-purple-500/40 dark:border-purple-500/50',
    },
  };

  const currentTier = tierConfig[tier];

  return (
    <div
      className={`relative rounded-3xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isUnlocked
          ? `bg-white dark:bg-slate-800/90 border ${currentTier.borderClass} shadow-lg ${currentTier.glowShadow} hover:-translate-y-0.5 hover:shadow-xl`
          : 'bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 opacity-80 hover:opacity-95'
      }`}
    >
      {/* Background ambient radial halo when unlocked */}
      {isUnlocked && (
        <div
          className={`absolute -top-12 -right-12 w-44 h-44 rounded-full bg-gradient-to-br ${currentTier.haloClass} blur-2xl pointer-events-none`}
        />
      )}

      {/* Top Bar: Tier Chip & Unlock Badge */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border tracking-wide uppercase ${currentTier.ribbonClass}`}
          >
            {currentTier.label}
          </span>
          {isNew && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-emerald-500 text-white animate-pulse">
              NEW!
            </span>
          )}
        </div>

        {isUnlocked ? (
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Unlocked</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-300/40 dark:border-slate-700/50">
            <Lock className="w-3 h-3" />
            <span>Locked</span>
          </div>
        )}
      </div>

      {/* Center 3D Visual Trophy / Medal Emblem */}
      <div className="my-5 flex items-center gap-4 relative z-10">
        <div className="relative shrink-0">
          {/* Outer Ring */}
          <div
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center p-0.5 shadow-md transition-transform duration-200 ${
              isUnlocked
                ? `bg-gradient-to-tr ${currentTier.badgeGradient} shadow-lg scale-100 hover:scale-105`
                : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            {/* Inner Medal Inset */}
            <div
              className={`w-full h-full rounded-[14px] flex items-center justify-center ${
                isUnlocked
                  ? 'bg-white dark:bg-slate-900 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {isUnlocked ? (
                renderIcon(`w-8 h-8 sm:w-9 sm:h-9 ${currentTier.iconColor}`)
              ) : (
                <Lock className="w-7 h-7 text-slate-400 dark:text-slate-500" />
              )}
            </div>
          </div>

          {/* Sparkle badge for unlocked high tiers */}
          {isUnlocked && (tier === 'diamond' || tier === 'master' || tier === 'gold') && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
          )}
        </div>

        {/* Title, Description, and Goal */}
        <div className="space-y-1">
          <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            {title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
            {description}
          </p>
          <div className="pt-0.5 flex items-center gap-2 text-xs font-mono font-bold">
            <span className="text-slate-400">Target:</span>
            <span className={isUnlocked ? currentTier.iconColor : 'text-slate-600 dark:text-slate-400'}>
              {targetValue} {unit}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer: Progress Bar or Unlock Timestamp */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 relative z-10 text-xs">
        {isUnlocked ? (
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-medium">
            <span className="flex items-center gap-1.5 font-sans">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{rewardText}</span>
            </span>
            {unlockedAt && (
              <span className="flex items-center gap-1 text-slate-400 font-mono">
                <Calendar className="w-3 h-3" />
                <span>{new Date(unlockedAt).toLocaleDateString()}</span>
              </span>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-500 dark:text-slate-400">Progress</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {currentValue} / {targetValue} {unit} ({progress}%)
              </span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progress > 75 ? 'bg-amber-500' : progress > 40 ? 'bg-blue-500' : 'bg-slate-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(3, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
