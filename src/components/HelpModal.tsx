import React from 'react';
import { X, HelpCircle, Keyboard, Award, Info, Zap } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Instructions & FAQ</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300">
          {/* How to take test */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              How to Take the Typing Test
            </h3>
            <ol className="list-decimal list-inside space-y-1.5 pl-1 text-xs sm:text-sm">
              <li>Select your preferred test duration (15s, 30s, 60s, or custom) and difficulty level.</li>
              <li>Click <strong>Start Test</strong>. A 3-second countdown will prepare you.</li>
              <li>When "GO!" appears, begin typing the highlighted target text.</li>
              <li>Correctly pressed characters turn <span className="text-emerald-600 font-bold">green</span>; mistakes turn <span className="text-rose-600 font-bold">red</span>.</li>
              <li>You can press <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-900 border text-xs">Backspace</kbd> to fix errors anytime.</li>
            </ol>
          </div>

          {/* Formulas */}
          <div className="space-y-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              Scoring Formulas
            </h3>
            <div className="space-y-1 text-xs font-mono">
              <p>• <strong>WPM (Words Per Minute)</strong> = (Correct Characters / 5) / (Time in Minutes)</p>
              <p>• <strong>Accuracy (%)</strong> = (Correct Characters / Total Typed Characters) × 100</p>
              <p>• <strong>CPM (Chars Per Minute)</strong> = Total Typed Characters / (Time in Minutes)</p>
            </div>
          </div>

          {/* Rating Scale */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Performance Rating Scale
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border">
                <span className="font-bold text-amber-500 block">0 - 20 WPM</span>
                <span className="text-slate-500">Beginner</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border">
                <span className="font-bold text-blue-500 block">21 - 40 WPM</span>
                <span className="text-slate-500">Below Average</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border">
                <span className="font-bold text-emerald-500 block">41 - 60 WPM</span>
                <span className="text-slate-500">Average</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border">
                <span className="font-bold text-teal-500 block">61 - 80 WPM</span>
                <span className="text-slate-500">Good</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border">
                <span className="font-bold text-indigo-500 block">81 - 100 WPM</span>
                <span className="text-slate-500">Excellent</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border">
                <span className="font-bold text-purple-500 block">100+ WPM</span>
                <span className="text-slate-500">Exceptional</span>
              </div>
            </div>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-teal-500" />
              Keyboard Shortcuts
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 flex justify-between items-center">
                <span>Cancel / Exit Test</span>
                <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border">Esc</kbd>
              </div>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 flex justify-between items-center">
                <span>Restart Test</span>
                <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border">Tab + Enter</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 text-right">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
