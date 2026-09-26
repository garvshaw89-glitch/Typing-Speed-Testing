import React, { useState } from 'react';
import {
  UserPreferences,
  DifficultyLevel,
  TextType,
  ThemeMode,
  FontSizeOption,
  SoundPack,
} from '../types';
import { resetPreferencesToDefault } from '../services/storageService';
import { soundEngine } from '../services/soundEngine';
import {
  X,
  RotateCcw,
  Check,
  Sliders,
  Volume2,
  Volume1,
  VolumeX,
  Play,
  Eye,
  Sun,
  Type,
  Target,
  Sparkles,
} from 'lucide-react';

interface SoundPackOption {
  id: SoundPack;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
  badgeColor: string;
}

const SOUND_PACK_OPTIONS: SoundPackOption[] = [
  {
    id: 'mechanical',
    name: 'Mechanical',
    subtitle: 'Tactile Clicky Switch',
    description: 'Crisp snap with tactile leaf click and solid bottom-out housing acoustics (Cherry MX Blue style).',
    badge: 'Popular',
    badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    subtitle: 'Vintage Cast-Iron Clack',
    description: 'Authentic manual typewriter hammer strikes, chassis resonance, carriage advance, and margin bell.',
    badge: 'Retro',
    badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'soft',
    name: 'Soft',
    subtitle: 'Muted Laptop Chiclet',
    description: 'Gentle, low-profile cushioned keystrokes. Quiet, smooth, and non-distracting for focused work.',
    badge: 'Subtle',
    badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'thock',
    name: 'Thock',
    subtitle: 'Custom Lubed Linear',
    description: 'Deep, creamy, acoustic-damped marbly thud beloved by mechanical keyboard enthusiasts.',
    badge: 'Enthusiast',
    badgeColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  {
    id: 'bubble',
    name: 'Bubble Pop',
    subtitle: 'Playful Harmonic Drops',
    description: 'Bubbly, light harmonic pops that bring uplifting tactile delight and bounce to every word.',
    badge: 'Playful',
    badgeColor: 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  },
];

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
    setTargetWpmInput((defaults.targetWpm ?? 60).toString());
    soundEngine.setSoundPack(defaults.soundPack || 'mechanical');
    soundEngine.setVolume(defaults.soundVolume ?? 0.8);
  };

  const handleSaveAndClose = () => {
    onSave(localPrefs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 animate-fade-in">
      <div className="max-w-xl w-full max-h-[85vh] sm:max-h-[90vh] overflow-y-auto p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">Settings & Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 min-h-[44px] min-w-[44px] rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center cursor-pointer"
            aria-label="Close Settings Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6 text-sm">
          {/* Test Duration */}
          <div className="space-y-2">
            <label className="font-bold text-slate-800 dark:text-slate-200 block">Test Duration</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {[15, 30, 60, 120].map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setLocalPrefs({ ...localPrefs, testDuration: d });
                    setCustomDurationInput(d.toString());
                  }}
                  className={`py-2.5 text-xs font-bold rounded-xl border transition-all min-h-[44px] cursor-pointer ${
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
                  className="w-full h-full py-2 px-2 text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
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

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[0, 40, 60, 80, 100].map((wpm) => (
                <button
                  key={wpm}
                  onClick={() => {
                    setLocalPrefs({ ...localPrefs, targetWpm: wpm });
                    setTargetWpmInput(wpm.toString());
                  }}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all min-h-[44px] cursor-pointer ${
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
                  className="w-full h-full py-2 px-1 text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
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
          <div className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-500" />
                <span>Audio & Sound Engine</span>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                Web Audio Synthesizer
              </span>
            </div>

            <div className="space-y-3">
              {/* Master Sound Effects Toggle */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block">Sound Effects</span>
                    {localPrefs.soundEffectsEnabled && (
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                        Active
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">Play real-time acoustic feedback for keystrokes, spacebars & errors</span>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.soundEffectsEnabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    setLocalPrefs({ ...localPrefs, soundEffectsEnabled: enabled });
                    soundEngine.setEnabled(enabled);
                    if (enabled) {
                      soundEngine.previewSoundPack(localPrefs.soundPack || 'mechanical');
                    }
                  }}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              {/* Sound Pack Selection & Volume Controls (when sound is enabled) */}
              {localPrefs.soundEffectsEnabled && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 space-y-3.5 animate-fade-in">
                  {/* Volume Slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        {(localPrefs.soundVolume ?? 0.8) === 0 ? (
                          <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                        ) : (localPrefs.soundVolume ?? 0.8) < 0.5 ? (
                          <Volume1 className="w-3.5 h-3.5 text-indigo-500" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                        )}
                        <span>Volume Level</span>
                      </span>
                      <span className="font-mono font-bold text-slate-600 dark:text-slate-400">
                        {Math.round((localPrefs.soundVolume ?? 0.8) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={localPrefs.soundVolume ?? 0.8}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setLocalPrefs({ ...localPrefs, soundVolume: val });
                        soundEngine.setVolume(val);
                      }}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>

                  {/* Typing Sound Packs Header */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Typing Sound Pack</span>
                      </label>
                      <span className="text-[11px] text-slate-500">Tap to select & test</span>
                    </div>

                    {/* Sound Pack Cards Grid */}
                    <div className="grid grid-cols-1 gap-2">
                      {SOUND_PACK_OPTIONS.map((pack) => {
                        const isSelected = (localPrefs.soundPack || 'mechanical') === pack.id;
                        return (
                          <div
                            key={pack.id}
                            onClick={() => {
                              setLocalPrefs({ ...localPrefs, soundPack: pack.id });
                              soundEngine.setSoundPack(pack.id);
                              soundEngine.previewSoundPack(pack.id);
                            }}
                            className={`p-2.5 sm:p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-white dark:bg-slate-800 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
                                : 'bg-white/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/70 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div
                                className={`w-4 h-4 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`font-bold text-xs sm:text-sm ${
                                      isSelected
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-slate-900 dark:text-white'
                                    }`}
                                  >
                                    {pack.name}
                                  </span>
                                  <span className="text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                                    • {pack.subtitle}
                                  </span>
                                  <span
                                    className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${pack.badgeColor}`}
                                  >
                                    {pack.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                  {pack.description}
                                </p>
                              </div>
                            </div>

                            {/* Dedicated Preview Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                soundEngine.previewSoundPack(pack.id);
                              }}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50 dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                              title={`Preview ${pack.name} sound`}
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span className="hidden sm:inline">Listen</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Show Live Stats */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">Show Live Stats</span>
                  <span className="text-xs text-slate-500">Display real-time WPM and accuracy during test</span>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.showLiveStats}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, showLiveStats: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              {/* Show Typing Rhythm Graph */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">Typing Rhythm Graph</span>
                  <span className="text-xs text-slate-500">Subtle real-time sparkline below typing area showing stability and cadence pauses</span>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.showRhythmGraph ?? true}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, showRhythmGraph: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                />
              </label>

              {/* Show Real-Time Visual Keyboard */}
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">Real-Time Visual Keyboard</span>
                  <span className="text-xs text-slate-500">Interactive keyboard displaying live keystroke highlights, finger placement guides, and error diagnostics</span>
                </div>
                <input
                  type="checkbox"
                  checked={localPrefs.showVisualKeyboard ?? true}
                  onChange={(e) => setLocalPrefs({ ...localPrefs, showVisualKeyboard: e.target.checked })}
                  className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
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
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleResetDefaults}
            className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors min-h-[44px] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSaveAndClose}
            className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[44px]"
          >
            <Check className="w-4 h-4" />
            <span>Save & Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
