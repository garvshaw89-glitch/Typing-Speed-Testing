import React from 'react';
import { X, HelpCircle, Keyboard, Award, Info, Zap } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#050505]/85 backdrop-blur-md flex items-center justify-center p-2.5 sm:p-4 animate-fade-in select-none">
      <div className="max-w-xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-8 rounded-3xl bg-[#090A0C] border border-white/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.85)] space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-[#6C8CFF]" />
            <h2 className="text-lg sm:text-xl font-display font-bold text-[#F5F5F0] tracking-tight uppercase">
              Operating Manual &amp; Telemetry
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl text-[#686B72] hover:text-[#F5F5F0] hover:bg-white/[0.04] transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close Help Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-[#A5A7AC]">
          {/* How to take test */}
          <div className="space-y-2">
            <h3 className="font-display font-bold text-[#F5F5F0] text-sm uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#6C8CFF]" />
              How to Engage the Instrument
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-xs sm:text-sm font-mono leading-relaxed">
              <li>Select your duration (15s, 30s, 60s, 120s) and difficulty level on the configuration matrix.</li>
              <li>Press <strong>START TEST</strong> or hit <kbd className="px-1 py-0.5 rounded bg-[#15181D] border border-white/[0.1] text-xs">Enter</kbd> on the keyboard architecture visual.</li>
              <li>When the countdown clears, begin typing the glowing target text.</li>
              <li>Accurate keystrokes illuminate bright white; deviations display an elegant ruby underline.</li>
              <li>Use <kbd className="px-1 py-0.5 rounded bg-[#15181D] border border-white/[0.1] text-xs">Backspace</kbd> to correct deviations anytime.</li>
            </ol>
          </div>

          {/* Formulas */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#101216] border border-white/[0.06]">
            <h3 className="font-mono font-bold text-[#F5F5F0] text-xs uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-[#6C8CFF]" />
              TELEMETRY FORMULAS
            </h3>
            <div className="space-y-1 text-xs font-mono text-[#A5A7AC]">
              <p>• <strong>WPM (Words Per Minute)</strong> = (Correct Characters / 5) / (Time in Minutes)</p>
              <p>• <strong>Accuracy (%)</strong> = (Correct Characters / Total Typed Characters) × 100</p>
              <p>• <strong>CPM (Characters Per Minute)</strong> = Total Typed Characters / (Time in Minutes)</p>
              <p>• <strong>Rhythm Stability (%)</strong> = Inter-keystroke timing standard deviation normalized</p>
            </div>
          </div>

          {/* Rating Scale */}
          <div className="space-y-2">
            <h3 className="font-display font-bold text-[#F5F5F0] text-sm uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Performance Calibration Tiers
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#101216] border border-white/[0.06]">
                <span className="font-bold text-amber-400 block">0 - 20 WPM</span>
                <span className="text-[#686B72]">Novice</span>
              </div>
              <div className="p-3 rounded-xl bg-[#101216] border border-white/[0.06]">
                <span className="font-bold text-blue-400 block">21 - 40 WPM</span>
                <span className="text-[#686B72]">Developing</span>
              </div>
              <div className="p-3 rounded-xl bg-[#101216] border border-white/[0.06]">
                <span className="font-bold text-emerald-400 block">41 - 60 WPM</span>
                <span className="text-[#686B72]">Proficient</span>
              </div>
              <div className="p-3 rounded-xl bg-[#101216] border border-white/[0.06]">
                <span className="font-bold text-[#6C8CFF] block">61 - 80 WPM</span>
                <span className="text-[#686B72]">Advanced</span>
              </div>
              <div className="p-3 rounded-xl bg-[#101216] border border-white/[0.06]">
                <span className="font-bold text-[#8A6CFF] block">81 - 100 WPM</span>
                <span className="text-[#686B72]">Mastery</span>
              </div>
              <div className="p-3 rounded-xl bg-[#101216] border border-white/[0.06]">
                <span className="font-bold text-purple-400 block">100+ WPM</span>
                <span className="text-[#686B72]">Grandmaster</span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-2">
            <h3 className="font-display font-bold text-[#F5F5F0] text-sm uppercase tracking-wider flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-[#6C8CFF]" />
              Precision Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#101216] border border-white/[0.06] flex items-center justify-between">
                <span>Restart Current Trial</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#15181D] border border-white/[0.1] text-[11px] text-[#F5F5F0]">
                  Tab + Enter
                </kbd>
              </div>
              <div className="p-2.5 rounded-xl bg-[#101216] border border-white/[0.06] flex items-center justify-between">
                <span>Abort / Cancel Test</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#15181D] border border-white/[0.1] text-[11px] text-[#F5F5F0]">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
