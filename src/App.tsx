import React, { useState, useEffect, useCallback } from 'react';
import { AppScreen, TestResult, UserPreferences, UserStats } from './types';
import { getPreferences, savePreferences, getTestHistory, getUserStats, saveTestResult } from './services/storageService';
import { soundEngine } from './services/soundEngine';
import { Navbar } from './components/Navbar';
import { Toast, ToastMessage } from './components/Toast';
import { HomeScreen } from './components/HomeScreen';
import { PreparationScreen } from './components/PreparationScreen';
import { ActiveTestScreen } from './components/ActiveTestScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsModal } from './components/SettingsModal';
import { HelpModal } from './components/HelpModal';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [preferences, setPreferences] = useState<UserPreferences>(getPreferences());
  const [stats, setStats] = useState<UserStats>(getUserStats());
  const [history, setHistory] = useState<TestResult[]>(getTestHistory());
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);

  // Modals & Toasts
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helper
  const showToast = useCallback((message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync Preferences to Sound Engine & Theme Class on Root
  useEffect(() => {
    soundEngine.setEnabled(preferences.soundEffectsEnabled);

    const root = document.documentElement;
    if (
      preferences.theme === 'dark' ||
      (preferences.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [preferences]);

  // Handle Updating Preferences
  const handleUpdatePreferences = (updated: Partial<UserPreferences>) => {
    const newPrefs = savePreferences(updated);
    setPreferences(newPrefs);
  };

  // Toggle Light / Dark Quick Switch
  const handleToggleTheme = () => {
    const nextTheme = preferences.theme === 'dark' ? 'light' : 'dark';
    handleUpdatePreferences({ theme: nextTheme });
  };

  // Refresh Stats & History
  const refreshHistoryAndStats = useCallback(() => {
    setHistory(getTestHistory());
    setStats(getUserStats());
  }, []);

  // Handle Starting Test Flow
  const handleStartTest = () => {
    if (preferences.autoStartCountdown) {
      setScreen('prep');
    } else {
      setScreen('test');
    }
  };

  // Handle Test Completed
  const handleTestCompleted = (result: TestResult) => {
    const saveOutcome = saveTestResult(result);
    const updatedResult = { ...result, isPersonalBest: saveOutcome.isPersonalBest };
    setCurrentResult(updatedResult);
    refreshHistoryAndStats();
    setScreen('results');

    if (saveOutcome.isPersonalBest) {
      showToast('🎉 New Personal Best Speed Achieved!', 'success');
    } else {
      showToast('Test results saved to history.', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-blue-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar
        currentScreen={screen}
        onNavigate={(s) => setScreen(s)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        preferences={preferences}
        onToggleTheme={handleToggleTheme}
        stats={stats}
      />

      {/* Main Screen Views */}
      <main className="flex-1 pb-12">
        {screen === 'home' && (
          <HomeScreen
            stats={stats}
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            onStartTest={handleStartTest}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenHistory={() => setScreen('history')}
          />
        )}

        {screen === 'prep' && (
          <PreparationScreen
            preferences={preferences}
            onCountdownComplete={() => setScreen('test')}
            onCancel={() => setScreen('home')}
          />
        )}

        {screen === 'test' && (
          <ActiveTestScreen
            preferences={preferences}
            onCompleteTest={handleTestCompleted}
            onCancelTest={() => setScreen('home')}
            onShowToast={showToast}
          />
        )}

        {screen === 'results' && currentResult && (
          <ResultsScreen
            result={currentResult}
            stats={stats}
            onTryAgain={handleStartTest}
            onNewTest={() => setIsSettingsOpen(true)}
            onViewHistory={() => setScreen('history')}
            onShowToast={showToast}
          />
        )}

        {screen === 'history' && (
          <HistoryScreen
            history={history}
            stats={stats}
            onRefreshHistory={refreshHistoryAndStats}
            onBackToHome={() => setScreen('home')}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        onSave={handleUpdatePreferences}
      />

      {/* Help / Instructions Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
