import React, { useEffect, useRef, useState } from 'react';

export type CursorMode = 'default' | 'hover' | 'type' | 'start' | 'result';

// Global listener hook for cursor coordinates across the laboratory interface
let currentCursorPos = { x: -100, y: -100 };
export function getLaboratoryCursorPos() {
  return currentCursorPos;
}

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>('default');

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Only engage custom cursor if pointer is fine (desktop/mouse)
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      currentCursorPos = { x: e.clientX, y: e.clientY };

      if (!isVisible) {
        setIsVisible(true);
        ringPos.current = { x: e.clientX, y: e.clientY };
      }

      // Check current element under cursor for semantic state
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const isStartBtn = target.closest('[data-cursor="start"]') || target.closest('#primary-start-cta');
      const isTypeArea = target.closest('[data-cursor="type"]') || target.closest('textarea') || target.closest('.typing-chamber');
      const isInteractive = target.closest('button') || target.closest('a') || target.closest('[role="button"]') || target.closest('input');

      if (isStartBtn) {
        setCursorMode('start');
      } else if (isTypeArea) {
        setCursorMode('type');
      } else if (isInteractive) {
        setCursorMode('hover');
      } else {
        setCursorMode('default');
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    // Smooth animation loop for spring trailing outer ring
    const updateRing = () => {
      const lerp = 0.18; // responsive trailing damping
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerp;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerp;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(updateRing);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    rafId.current = requestAnimationFrame(updateRing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[999999] overflow-hidden select-none" aria-hidden="true">
      {/* Precision Inner Point: 6px */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full transition-colors duration-150 will-change-transform ${
          cursorMode === 'start'
            ? 'w-2 h-2 bg-[#6C8CFF] shadow-[0_0_8px_#6C8CFF]'
            : cursorMode === 'type'
            ? 'w-1.5 h-1.5 bg-[#8A6CFF]'
            : cursorMode === 'hover'
            ? 'w-2 h-2 bg-white'
            : 'w-1.5 h-1.5 bg-[#F5F5F0]'
        }`}
      />

      {/* Precision Outer Ring: 34-48px depending on mode */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full transition-all duration-200 ease-out will-change-transform flex items-center justify-center ${
          cursorMode === 'start'
            ? 'w-12 h-12 border border-[#6C8CFF]/80 bg-[#6C8CFF]/10 shadow-[0_0_24px_rgba(108,140,255,0.25)]'
            : cursorMode === 'type'
            ? 'w-6 h-9 rounded-md border border-[#8A6CFF]/60 bg-[#8A6CFF]/5'
            : cursorMode === 'hover'
            ? 'w-11 h-11 border border-white/60 bg-white/[0.04]'
            : 'w-9 h-9 border border-white/20'
        }`}
      >
        {cursorMode === 'start' && (
          <span className="w-1 h-1 rounded-full bg-[#6C8CFF] animate-ping" />
        )}
      </div>
    </div>
  );
};
