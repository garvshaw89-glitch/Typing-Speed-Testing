import React, { useEffect, useState } from 'react';

interface KeystrokePulseVisualizerProps {
  lastChar?: string;
  isCorrect?: boolean;
  charIntervalMs?: number;
  isActive: boolean;
}

interface PulseParticle {
  id: number;
  char: string;
  isCorrect: boolean;
  x: number; // 0 to 100%
}

export const KeystrokePulseVisualizer: React.FC<KeystrokePulseVisualizerProps> = ({
  lastChar,
  isCorrect = true,
  charIntervalMs,
  isActive,
}) => {
  const [pulses, setPulses] = useState<PulseParticle[]>([]);

  useEffect(() => {
    if (!lastChar || !isActive) return;

    const id = Date.now() + Math.random();
    const newPulse: PulseParticle = {
      id,
      char: lastChar === ' ' ? '␣' : lastChar,
      isCorrect,
      x: 50 + (Math.random() * 20 - 10), // centered subtle dispersion
    };

    setPulses((prev) => [...prev.slice(-6), newPulse]);

    const timeout = setTimeout(() => {
      setPulses((prev) => prev.filter((p) => p.id !== id));
    }, 600);

    return () => clearTimeout(timeout);
  }, [lastChar, isCorrect, isActive]);

  return (
    <div className="w-full select-none py-1 relative">
      {/* Precision horizontal beam */}
      <div className="relative h-px w-full bg-white/[0.08] overflow-hidden flex items-center justify-center">
        {/* Subtle center marker */}
        <div className="w-8 h-px bg-[#6C8CFF]/60 shadow-[0_0_8px_#6C8CFF]" />

        {/* Traveling light pulses */}
        {pulses.map((p) => (
          <div
            key={p.id}
            className={`absolute top-1/2 -translate-y-1/2 h-1 rounded-full transition-all duration-500 ease-out pointer-events-none ${
              p.isCorrect
                ? 'w-6 bg-[#6C8CFF] shadow-[0_0_10px_#6C8CFF]'
                : 'w-6 bg-[#FF6B6B] shadow-[0_0_10px_#FF6B6B]'
            }`}
            style={{
              left: `${p.x}%`,
              opacity: 0.8,
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>

      {/* Floating dissolving glyphs */}
      <div className="relative h-4 w-full pointer-events-none">
        {pulses.map((p) => (
          <span
            key={`glyph-${p.id}`}
            className={`absolute -top-3 font-mono text-[11px] font-bold transition-all duration-500 ease-out ${
              p.isCorrect ? 'text-[#6C8CFF]' : 'text-[#FF6B6B]'
            }`}
            style={{
              left: `${p.x}%`,
              transform: 'translate(-50%, -10px)',
              opacity: 0.85,
            }}
          >
            {p.char}
          </span>
        ))}
      </div>

      {/* Technical cadence readout */}
      <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-widest text-[#686B72]">
        <span className="flex items-center gap-1.5">
          <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-[#6C8CFF] animate-pulse' : 'bg-[#686B72]'}`} />
          <span>SIGNAL CADENCE</span>
        </span>
        {charIntervalMs !== undefined && charIntervalMs > 0 && (
          <span className="text-[#A5A7AC] tabular-nums font-semibold">
            {charIntervalMs}MS INTERVAL
          </span>
        )}
      </div>
    </div>
  );
};
