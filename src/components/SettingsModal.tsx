import React, { useState } from 'react';
import { UserPreferences, DifficultyLevel, TextType, ThemeMode, FontSizeOption } from '../types';
import { resetPreferencesToDefault } from '../services/storageService';
import { X, RotateCcw, Check, Sliders, Volume2, Eye, Sun, Type, Target } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSave: (prefs: Partial<UserPreferences>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSave,
}) => {
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences);
  const [customDurationInput, setCustomDurationInput] = useState<string>(
    localPrefs.testDuration.toString()
  );
  const [targetWpmInput, setTargetWpmInput] = useState<string>(
    (localPrefs.targetWpm ?? 60).toString()
  );

  if (!isOpen) return null;

  const handleCustomDurationChange = (val: string) => {
    setCustomDurationInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 10 && num <= 600) {
      setLocalPrefs({ ...localPrefs, testDuration: num });
    }
  };

  const handleResetDefaults = () => {
    const defaults = resetPreferencesToDefault();
    setLocalPrefs(defaults);
    setCustomDurationInput(defaults.testDuration.toString());
  };

  const handleSaveAndClose = () => {
    onSave(localPrefs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Settings & Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6 text-sm">
          {/* Test Duration */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">Test Duration</label>
            <div className="grid grid-cols-5 gap-2">
              {[15, 30, 60, 120].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setLocalPrefs({ ...localPrefs, testDuration: d });
                    setCustomDurationInput(d.toString());
                  }}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    localPrefs.testDuration === d
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {d}s
                </button>
              ))}

              {/* Custom Input */}
              <div className="relative">
                <input
                  type="number"
                  min="10"
                  max="600"
                  value={customDurationInput}
                  onChange={(e) => handleCustomDurationChange(e.target.value)}
                  placeholder="Custom"
                  className="w-full h-full py-2 px-2 text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">Preset duration or custom time between 10s and 600s.</p>
          </div>

          {/* Target WPM Goal */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-500" />
                <span>Target WPM Goal</span>
              </label>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {(localPrefs.targetWpm ?? 0) > 0 ? `${localPrefs.targetWpm} WPM Goal` : 'Disabled'}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {[0, 40, 60, 80, 100].map((wpm) => (
                <button
                  key={wpm}
                  onClick={() => {
                    setLocalPrefs({ ...localPrefs, targetWpm: wpm });
                    setTargetWpmInput(wpm.toString());
                  }}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    (localPrefs.targetWpm ?? 0) === wpm
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {wpm === 0 ? 'Off' : `${wpm}`}
                </button>
              ))}

              {/* Custom Target WPM Input */}
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={targetWpmInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTargetWpmInput(val);
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num >= 0 && num <= 300) {
                      setLocalPrefs({ ...localPrefs, targetWpm: num });
                    }
                  }}
                  placeholder="Custom"
                  className="w-full h-full py-2 px-1 text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Triggers a subtle UI alert on the active typing test screen when you reach your WPM target.
            </p>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setLocalPrefs({ ...localPrefs, difficultyLevel: diff })}
                  className={`py-2 px-3 text-xs font-bold capitalize rounded-xl border transition-all ${
                    localPrefs.difficultyLevel === diff
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">Content Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'words', label: 'Words' },
                { id: 'sentences', label: 'Sentences' },
                { id: 'code', label: 'Code Snippets' },
                { id: 'paragraph', label: 'Paragraphs' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setLocalPrefs({ ...localPrefs, textType: item.id as TextType })}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                    localPrefs.textType === item.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme & Display */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Theme & Appearance</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 block mb-1">Theme</span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  {(['light', 'dark', 'system'] as ThemeMode[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setLocalPrefs({ ...localPrefs, theme: t })}
                      className={`py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                        localPrefs.theme === t
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 block mb-1">Font Size</span>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                  {(['small', 'medium', 'large'] as FontSizeOption[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setLocalPrefs({ ...localPrefs, fontSize: s })}
                      className={`py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                        localPrefs.fontSize === s
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Audio & Toggles */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-500" />
              <span>Audio & Live Feedback</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">Sound Effects</span>
                  <span className="text-xs text-slate-500">Play key click and error audio feedback</span>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.soundEffectsEnabled}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, soundEffectsEnabled: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">Show Live Stats</span>
                  <span className="text-xs text-slate-500">Display real-time WPM and accuracy during test</span>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.showLiveStats}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, showLiveStats: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Accessibility Options */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-500" />
              <span>Accessibility Settings</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                <span className="font-semibold text-slate-800 dark:text-slate-200">High Contrast Mode</span>
                <input
                  type="checkbox"
                  checked={localPrefs.highContrastMode}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, highContrastMode: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Reduce Motion</span>
                <input
                  type="checkbox"
                  checked={localPrefs.reduceMotion}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, reduceMotion: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleResetDefaults}
            className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveAndClose}
            className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
