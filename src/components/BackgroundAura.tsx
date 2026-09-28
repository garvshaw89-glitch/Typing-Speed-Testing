import React from 'react';

interface BackgroundAuraProps {
  reduceMotion?: boolean;
  currentWpm?: number;
  inTestMode?: boolean;
}

export const BackgroundAura: React.FC<BackgroundAuraProps> = ({
  reduceMotion = false,
  currentWpm = 0,
  inTestMode = false,
}) => {
  // Compute subtle ambient glow energy based on WPM
  const energyFactor = Math.min(1, Math.max(0, currentWpm / 120));

  if (reduceMotion) {
    return (
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#050505] transition-colors"
        aria-hidden="true"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-[#6C8CFF]/[0.03] to-transparent blur-3xl" />
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#050505] transition-all duration-700"
      aria-hidden="true"
    >
      {/* Precision architectural hairline grid */}
      <div className="absolute inset-0 opacity-[0.025] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] [background-size:64px_64px]" />

      {/* Subtle radial focus illumination in center/upper viewport */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[550px] rounded-full blur-[140px] pointer-events-none transition-all duration-1000 ease-out"
        style={{
          background: inTestMode
            ? `radial-gradient(circle, rgba(108,140,255,${0.04 + energyFactor * 0.05}) 0%, rgba(138,108,255,${0.02 + energyFactor * 0.03}) 45%, transparent 75%)`
            : 'radial-gradient(circle, rgba(108,140,255,0.05) 0%, rgba(138,108,255,0.02) 40%, transparent 70%)',
        }}
      />

      {/* Secondary restrained subtle edge glow */}
      <div className="absolute -top-40 -left-20 w-[500px] h-[500px] rounded-full bg-[#6C8CFF]/[0.025] blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] rounded-full bg-[#8A6CFF]/[0.02] blur-[180px] pointer-events-none" />

      {/* Noise grain overlay for cinematic tactile surface texture */}
      <div className="absolute inset-0 opacity-[0.015] bg-[radial-gradient(#fff_1px,transparent_0)] [background-size:3px_3px] mix-blend-screen" />
    </div>
  );
};
