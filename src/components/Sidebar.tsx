import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Timer,
  Sparkles,
  Settings,
  Zap,
  Moon,
  Sun,
  Compass,
  Palette,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsBrainDumpOpen,
    setIsScheduleGeneratorOpen,
    setIsSettingsOpen,
    setIsCheckInOpen,
    setIsOnboardingOpen,
    theme,
    toggleTheme,
    profile,
    tasks,
  } = useApp();

  const activeTaskCount = tasks.filter(t => !t.completed).length;

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Compass size={20} />
        </div>
        <div className="brand-text">
          <h1>Student Life OS</h1>
          <span className="brand-badge">Life Balance</span>
        </div>
      </div>

      {/* Quick Action 1: Brain Dump */}
      <button
        className="sidebar-action-btn"
        onClick={() => setIsBrainDumpOpen(true)}
        title="Dump thoughts and let AI extract tasks (Ctrl+K)"
      >
        <Sparkles size={16} />
        <span>Brain Dump</span>
      </button>

      {/* Quick Action 2: Daily Check-in */}
      <button
        className="sidebar-checkin-btn"
        onClick={() => setIsCheckInOpen(true)}
        title="Evening reflection on academics, body, and life"
      >
        <Moon size={15} color="var(--color-secondary)" />
        <span>🌙 Daily Check-in</span>
      </button>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare size={18} />
          <span>Tasks & Pillars</span>
          {activeTaskCount > 0 && (
            <span className="nav-badge-count">{activeTaskCount}</span>
          )}
        </button>

        <button
          className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <Calendar size={18} />
          <span>Schedule & Blocks</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'focus' ? 'active' : ''}`}
          onClick={() => setActiveTab('focus')}
        >
          <Timer size={18} />
          <span>Focus Mode</span>
        </button>

        <button
          className="nav-item"
          onClick={() => setIsScheduleGeneratorOpen(true)}
          style={{ marginTop: '12px', color: 'var(--color-secondary)' }}
        >
          <Zap size={18} />
          <span>AI Scheduler</span>
        </button>
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <button
            className="sidebar-checkin-btn"
            style={{ margin: 0, flex: 1, fontSize: '0.76rem', padding: '8px' }}
            onClick={() => setIsOnboardingOpen(true)}
            title="4-Layer Profile & Desires"
          >
            <span>🎯 Life Setup</span>
          </button>

          {/* Theme Cycle Toggle: Light → Dark → Funky */}
          <button
            className="icon-button"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.15)' }}
            onClick={toggleTheme}
            title={
              theme === 'light' ? 'Switch to Dark Mode' :
              theme === 'dark' ? 'Switch to Funky Mode' :
              'Switch to Light Mode'
            }
          >
            {theme === 'light' && <Moon size={16} />}
            {theme === 'dark' && <Sun size={16} color="#F3C969" />}
            {theme === 'funky' && <Palette size={16} color="#FF4ECD" />}
          </button>
          
          {/* Settings */}
          <button
            className="icon-button"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.15)' }}
            onClick={() => setIsSettingsOpen(true)}
            title="Settings & Tone Personality"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* User Profile Pill */}
        <div
          className="user-profile-pill"
          onClick={() => setIsOnboardingOpen(true)}
          style={{ cursor: 'pointer' }}
        >
          <div className="user-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <div className="user-name">{profile.name}</div>
            <div className="user-major">
              {profile.tone === 'unhinged' ? '💀 Unhinged Mode' : profile.branch ? profile.branch.split(' ')[0] : 'Student'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
