import React from 'react';

interface BackgroundAuraProps {
  reduceMotion?: boolean;
}

export const BackgroundAura: React.FC<BackgroundAuraProps> = ({ reduceMotion = false }) => {
  if (reduceMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-blue-500/5 via-indigo-500/5 to-transparent blur-3xl opacity-70" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors"
      aria-hidden="true"
    >
      {/* Subtle background radial glow 1 */}
      <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-[120px] will-change-transform transform-gpu animate-pulse" />

      {/* Subtle background radial glow 2 */}
      <div className="absolute top-1/3 -right-24 w-[450px] h-[450px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/10 blur-[130px] will-change-transform transform-gpu" />

      {/* Subtle background radial glow 3 */}
      <div className="absolute -bottom-32 left-1/3 w-[550px] h-[550px] rounded-full bg-cyan-500/5 dark:bg-teal-500/10 blur-[140px] will-change-transform transform-gpu" />

      {/* Subtle grid mesh overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:24px_24px]"
      />
    </div>
  );
};
