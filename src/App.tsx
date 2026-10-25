import React, { useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { CalendarView } from './components/CalendarView';
import { FocusMode } from './components/FocusMode';
import { BrainDumpModal } from './components/BrainDumpModal';
import { ScheduleGeneratorModal } from './components/ScheduleGeneratorModal';
import { SettingsModal } from './components/SettingsModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { FreeTimeAdvisorModal } from './components/FreeTimeAdvisorModal';
import { OnboardingModal } from './components/OnboardingModal';
import './styles/main.css';
import './styles/components.css';

export const App: React.FC = () => {
  const {
    activeTab,
    isBrainDumpOpen,
    setIsBrainDumpOpen,
    isScheduleGeneratorOpen,
    setIsScheduleGeneratorOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    isCheckInOpen,
    setIsCheckInOpen,
    isFreeTimeAdvisorOpen,
    setIsFreeTimeAdvisorOpen,
    isOnboardingOpen,
    setIsOnboardingOpen,
    exitFocusMode,
  } = useApp();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsBrainDumpOpen(true);
      } else if (e.key === 'Escape') {
        if (isBrainDumpOpen) setIsBrainDumpOpen(false);
        if (isScheduleGeneratorOpen) setIsScheduleGeneratorOpen(false);
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isCheckInOpen) setIsCheckInOpen(false);
        if (isFreeTimeAdvisorOpen) setIsFreeTimeAdvisorOpen(false);
        if (isOnboardingOpen) setIsOnboardingOpen(false);
        if (activeTab === 'focus') exitFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isBrainDumpOpen,
    isScheduleGeneratorOpen,
    isSettingsOpen,
    isCheckInOpen,
    isFreeTimeAdvisorOpen,
    isOnboardingOpen,
    activeTab,
    setIsBrainDumpOpen,
    setIsScheduleGeneratorOpen,
    setIsSettingsOpen,
    setIsCheckInOpen,
    setIsFreeTimeAdvisorOpen,
    setIsOnboardingOpen,
    exitFocusMode,
  ]);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      {activeTab !== 'focus' && <Sidebar />}

      {/* Main Content Area */}
      <main className="main-content" style={{ marginLeft: activeTab === 'focus' ? '0' : undefined }}>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'tasks' && <TaskManager />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'focus' && <FocusMode />}
      </main>

      {/* Global Modals */}
      <BrainDumpModal />
      <ScheduleGeneratorModal />
      <SettingsModal />
      <DailyCheckInModal />
      <FreeTimeAdvisorModal />
      <OnboardingModal />
    </div>
  );
};
