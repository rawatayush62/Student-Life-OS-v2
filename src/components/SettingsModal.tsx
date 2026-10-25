import React, { useState } from 'react';
import {
  Settings,
  Key,
  User,
  Sparkles,
  RotateCcw,
  Check,
  ShieldCheck,
  Target,
  Moon,
  Sun,
  Smile,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppTone, AppTheme } from '../types';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, profile, updateProfile, resetToDefaults, setIsOnboardingOpen, theme, setTheme } = useApp();

  const [name, setName] = useState(profile.name);
  const [branch, setBranch] = useState(profile.branch);
  const [careerGoal, setCareerGoal] = useState(profile.careerGoal);
  const [tone, setTone] = useState<AppTone>(profile.tone || 'friendly');
  const [geminiApiKey, setGeminiApiKey] = useState(profile.geminiApiKey);
  const [preferredFocusDuration, setPreferredFocusDuration] = useState(profile.preferredFocusDuration);
  const [dailyStudyGoalMinutes, setDailyStudyGoalMinutes] = useState(profile.dailyStudyGoalMinutes);
  const [showSavedToast, setShowSavedToast] = useState(false);

  if (!isSettingsOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      branch,
      careerGoal,
      tone,
      geminiApiKey,
      preferredFocusDuration,
      dailyStudyGoalMinutes,
    });
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      setIsSettingsOpen(false);
    }, 800);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all tasks, schedule, and sessions to initial seed data?')) {
      resetToDefaults();
      setIsSettingsOpen(false);
    }
  };

  const toneList: { key: AppTone; emoji: string; title: string; desc: string }[] = [
    { key: 'professional', emoji: '🧑‍💼', title: 'Professional', desc: '"Completed 80% of weekly goals."' },
    { key: 'friendly', emoji: '🙂', title: 'Friendly', desc: '"Nice work! You\'re almost there."' },
    { key: 'unhinged', emoji: '💀', title: 'Unhinged', desc: '"Bro actually finished it before the deadline."' },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-modal-enter" style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary)',
                color: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Settings size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Settings & Preferences
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Manage your personality tone, theme, and student profile
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={() => setIsSettingsOpen(false)}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {/* Tone Personality Selection */}
            <div>
              <h4 style={{ fontSize: '0.84rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                <Smile size={15} />
                <span>AI Communication Personality</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {toneList.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTone(item.key)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${tone === item.key ? 'var(--color-secondary)' : 'var(--border-subtle)'}`,
                      background: tone === item.key ? 'var(--color-secondary-subtle)' : 'var(--bg-app)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span style={{ fontSize: '1.6rem' }}>{item.emoji}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {item.title}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.2 }}>
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Appearance: Theme Picker */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.84rem', fontWeight: 800, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                <Sun size={15} />
                <span>App Theme</span>
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {([
                  { key: 'light' as AppTheme, emoji: '☀️', title: 'Light', desc: 'Off-white & Electric Purple', preview: '#FFFDF7', accent: '#7C3AED' },
                  { key: 'dark' as AppTheme, emoji: '🌙', title: 'Dark', desc: 'Near Black & Bright Purple', preview: '#0F0F12', accent: '#A78BFA' },
                  { key: 'funky' as AppTheme, emoji: '🪩', title: 'Funky', desc: 'Deep Space Neon', preview: '#0B0914', accent: '#FF3CAC' },
                ]).map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setTheme(item.key)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${theme === item.key ? item.accent : 'var(--border-subtle)'}`,
                      background: theme === item.key ? `${item.accent}18` : 'var(--bg-app)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '22px',
                      borderRadius: '6px',
                      background: item.preview,
                      border: `2px solid ${item.accent}`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        position: 'absolute',
                        right: 3,
                        top: 3,
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: item.accent,
                      }} />
                    </div>
                    <span style={{ fontSize: '1.2rem' }}>{item.emoji}</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--color-primary)' }}>{item.title}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.2 }}>{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Student Profile */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.84rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                <User size={15} />
                <span>Student Profile</span>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                    Course / Branch
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    placeholder="e.g. Computer Science"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  Career Goal
                </label>
                <input
                  type="text"
                  value={careerGoal}
                  onChange={e => setCareerGoal(e.target.value)}
                  placeholder="e.g. Software Engineer, ML Researcher"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
              </div>
            </div>

            {/* Study Targets */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '0.84rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                <Target size={15} />
                <span>Study Targets</span>
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Focus Session Length
                    </label>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {preferredFocusDuration} min
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="90"
                    step="5"
                    value={preferredFocusDuration}
                    onChange={e => setPreferredFocusDuration(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>20m Sprints</span>
                    <span>45m Standard</span>
                    <span>90m Deep Flow</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                      Daily Study Target
                    </label>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                      {Math.floor(dailyStudyGoalMinutes / 60)}h {dailyStudyGoalMinutes % 60 > 0 ? `${dailyStudyGoalMinutes % 60}m` : ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="480"
                    step="30"
                    value={dailyStudyGoalMinutes}
                    onChange={e => setDailyStudyGoalMinutes(parseInt(e.target.value, 10))}
                    style={{ width: '100%', accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
                  />
                </div>
              </div>
            </div>

            {/* AI Engine */}
            <div
              style={{
                padding: '16px',
                background: 'var(--bg-app)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <h4 style={{ fontSize: '0.84rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                <Sparkles size={15} />
                <span>Gemini AI Integration (Optional)</span>
              </h4>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Student Life OS includes a built-in <strong>Smart NLP Engine</strong> that works 100% offline. Optionally provide a Gemini API Key for deeper AI reasoning in Brain Dump.
              </p>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                  <Key size={12} />
                  <span>Gemini API Key</span>
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={geminiApiKey}
                  onChange={e => setGeminiApiKey(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.75rem', color: 'var(--pillar-move)' }}>
                <ShieldCheck size={13} />
                <span>Offline NLP engine is always active as the fallback</span>
              </div>
            </div>

            {/* Life Setup Button */}
            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
              onClick={() => {
                setIsSettingsOpen(false);
                setIsOnboardingOpen(true);
              }}
            >
              <Sparkles size={15} />
              <span>Re-run Life Setup Wizard (4-Layer Personalization)</span>
            </button>

            {/* Reset Data */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>Reset Application State</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Restore default sample data and clear localStorage</div>
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ color: 'var(--color-important)', borderColor: 'rgba(231, 111, 81, 0.3)' }}
                onClick={handleResetData}
              >
                <RotateCcw size={14} />
                <span>Reset Data</span>
              </button>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={() => setIsSettingsOpen(false)}>
              Close
            </button>
            <button type="submit" className="btn-primary">
              {showSavedToast ? <Check size={16} /> : null}
              <span>{showSavedToast ? '✓ Saved!' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
