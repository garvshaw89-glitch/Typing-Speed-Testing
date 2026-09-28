import React, { useState, useEffect, useRef } from 'react';

interface KeyConfig {
  key: string;
  display?: string;
  width?: string;
  sub?: string;
}

const KEYBOARD_ROWS: KeyConfig[][] = [
  [
    { key: '`', sub: '~' },
    { key: '1', sub: '!' },
    { key: '2', sub: '@' },
    { key: '3', sub: '#' },
    { key: '4', sub: '$' },
    { key: '5', sub: '%' },
    { key: '6', sub: '^' },
    { key: '7', sub: '&' },
    { key: '8', sub: '*' },
    { key: '9', sub: '(' },
    { key: '0', sub: ')' },
    { key: '-', sub: '_' },
    { key: '=', sub: '+' },
    { key: 'Backspace', display: 'DELETE', width: 'w-16 sm:w-20' },
  ],
  [
    { key: 'Tab', display: 'TAB', width: 'w-12 sm:w-16' },
    { key: 'q' },
    { key: 'w' },
    { key: 'e' },
    { key: 'r' },
    { key: 't' },
    { key: 'y' },
    { key: 'u' },
    { key: 'i' },
    { key: 'o' },
    { key: 'p' },
    { key: '[', sub: '{' },
    { key: ']', sub: '}' },
    { key: '\\', sub: '|', width: 'w-10 sm:w-14' },
  ],
  [
    { key: 'CapsLock', display: 'CAPS', width: 'w-14 sm:w-18' },
    { key: 'a' },
    { key: 's' },
    { key: 'd' },
    { key: 'f' },
    { key: 'g' },
    { key: 'h' },
    { key: 'j' },
    { key: 'k' },
    { key: 'l' },
    { key: ';', sub: ':' },
    { key: "'", sub: '"' },
    { key: 'Enter', display: 'RETURN', width: 'w-16 sm:w-22' },
  ],
  [
    { key: 'Shift', display: 'SHIFT', width: 'w-18 sm:w-24' },
    { key: 'z' },
    { key: 'x' },
    { key: 'c' },
    { key: 'v' },
    { key: 'b' },
    { key: 'n' },
    { key: 'm' },
    { key: ',', sub: '<' },
    { key: '.', sub: '>' },
    { key: '/', sub: '?' },
    { key: 'ShiftRight', display: 'SHIFT', width: 'w-18 sm:w-24' },
  ],
  [
    { key: 'Control', display: 'CTRL', width: 'w-12 sm:w-14' },
    { key: 'Alt', display: 'OPT', width: 'w-12 sm:w-14' },
    { key: 'Meta', display: 'CMD', width: 'w-12 sm:w-16' },
    { key: ' ', display: 'PRECISION SPACE', width: 'flex-1 max-w-[340px]' },
    { key: 'MetaRight', display: 'CMD', width: 'w-12 sm:w-16' },
    { key: 'AltRight', display: 'OPT', width: 'w-12 sm:w-14' },
  ],
];

interface HeroKeyboardVisualProps {
  onQuickStart?: () => void;
}

export const HeroKeyboardVisual: React.FC<HeroKeyboardVisualProps> = ({ onQuickStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [activePhysicalKey, setActivePhysicalKey] = useState<string | null>(null);
  const [lastKeystrokeStats, setLastKeystrokeStats] = useState<{ key: string; time: number } | null>(null);

  // Listen to physical keystrokes on the hero screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input/modal
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const norm = e.key.toLowerCase();
      setActivePhysicalKey(norm);
      setLastKeystrokeStats({ key: e.key.toUpperCase(), time: Date.now() });

      // If user presses Enter or Space while idling, optional quick start trigger
      if (e.key === 'Enter' && onQuickStart) {
        onQuickStart();
      }

      setTimeout(() => {
        setActivePhysicalKey(null);
      }, 180);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onQuickStart]);

  // Handle local proximity mouse tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 select-none relative">
      {/* Precision Instrument Kicker */}
      <div className="flex items-center justify-between px-2 mb-3 text-[11px] font-mono text-[#686B72] uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6C8CFF] animate-ping" />
          <span>OPTICAL ARCHITECTURE // MATRIX 01</span>
        </div>
        <div>
          {lastKeystrokeStats ? (
            <span className="text-[#6C8CFF] font-semibold">
              INPUT REGISTERED: &quot;{lastKeystrokeStats.key}&quot;
            </span>
          ) : (
            <span>PROXIMITY FIELD ACTIVE</span>
          )}
        </div>
      </div>

      {/* Main Keyboard Chassis */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#090A0C]/90 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.06)] relative overflow-hidden backdrop-blur-xl"
      >
        {/* Subtle grid mesh background */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        {/* Directional light sweep subtle effect */}
        {mousePos && (
          <div
            className="absolute rounded-full pointer-events-none transition-opacity duration-300"
            style={{
              left: `${mousePos.x}px`,
              top: `${mousePos.y}px`,
              width: '260px',
              height: '260px',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(108,140,255,0.09) 0%, rgba(138,108,255,0.02) 40%, transparent 70%)',
            }}
          />
        )}

        {/* Keyboard Key Rows */}
        <div className="space-y-1.5 sm:space-y-2 relative z-10">
          {KEYBOARD_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5">
              {row.map((k, colIndex) => {
                const normKey = k.key.toLowerCase();
                const isPhysicallyPressed =
                  activePhysicalKey === normKey ||
                  (k.key === ' ' && activePhysicalKey === ' ') ||
                  (k.key === 'Backspace' && activePhysicalKey === 'backspace') ||
                  (k.key === 'Enter' && activePhysicalKey === 'enter');

                return (
                  <KeyCap
                    key={`${rowIndex}-${colIndex}`}
                    config={k}
                    mousePos={mousePos}
                    containerRef={containerRef}
                    isPressed={isPhysicallyPressed}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Subtle bottom chassis reflection */}
        <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-[#686B72]">
          <span className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span>SWITCH LATENCY: 0.12ms</span>
          </span>
          <span className="hidden sm:inline">TYPE ANY PHYSICAL KEY TO TEST CHASSIS RESPONSE</span>
          <span>CALIBRATED FOR SPEED</span>
        </div>
      </div>
    </div>
  );
};

interface KeyCapProps {
  config: KeyConfig;
  mousePos: { x: number; y: number } | null;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isPressed: boolean;
}

const KeyCap: React.FC<KeyCapProps> = ({ config, mousePos, containerRef, isPressed }) => {
  const capRef = useRef<HTMLDivElement>(null);
  const [proximity, setProximity] = useState(0);

  useEffect(() => {
    if (!mousePos || !capRef.current || !containerRef.current) {
      setProximity(0);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const capRect = capRef.current.getBoundingClientRect();

    // Center of this key relative to container
    const keyCenterX = capRect.left - containerRect.left + capRect.width / 2;
    const keyCenterY = capRect.top - containerRect.top + capRect.height / 2;

    const dx = mousePos.x - keyCenterX;
    const dy = mousePos.y - keyCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const radius = 100; // reaction radius in px
    if (dist < radius) {
      setProximity(1 - dist / radius);
    } else {
      setProximity(0);
    }
  }, [mousePos, containerRef]);

  // Derived styles from proximity and physical press
  const widthClass = config.width || 'w-7 sm:w-11';
  const label = config.display || config.key.toUpperCase();

  const translateY = isPressed ? 2 : -proximity * 3;
  const scale = isPressed ? 0.96 : 1 + proximity * 0.04;
  const borderOpacity = isPressed ? 0.9 : 0.08 + proximity * 0.5;
  const bg = isPressed
    ? 'rgba(108, 140, 255, 0.25)'
    : proximity > 0
    ? `rgba(21, 24, 29, ${0.9 + proximity * 0.1})`
    : '#101216';

  const glowBox = isPressed
    ? '0 0 16px rgba(108, 140, 255, 0.6)'
    : proximity > 0
    ? `0 0 ${proximity * 14}px rgba(108, 140, 255, ${proximity * 0.28})`
    : 'none';

  return (
    <div
      ref={capRef}
      style={{
        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
        backgroundColor: bg,
        borderColor: isPressed ? '#6C8CFF' : `rgba(255, 255, 255, ${borderOpacity})`,
        boxShadow: glowBox,
      }}
      className={`h-8 sm:h-11 ${widthClass} rounded-md sm:rounded-lg border transition-all duration-100 ease-out flex flex-col items-center justify-center relative cursor-default shrink-0`}
    >
      {/* Top subtle highlight line */}
      <div className="absolute top-0 inset-x-1 h-px bg-white/[0.08] pointer-events-none" />

      {config.sub && (
        <span className="text-[8px] sm:text-[9px] font-mono text-[#686B72] leading-none mb-0.5">
          {config.sub}
        </span>
      )}
      <span
        className={`font-mono text-[10px] sm:text-xs font-semibold leading-none ${
          isPressed
            ? 'text-white'
            : proximity > 0.3
            ? 'text-[#F5F5F0]'
            : 'text-[#A5A7AC]'
        }`}
      >
        {label}
      </span>
    </div>
  );
};
