import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Check, Compass, Heart, Award, Smile } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppTone } from '../types';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, setIsOnboardingOpen, profile, updateProfile } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Layer 1
  const [name, setName] = useState(profile.name || 'Ayush');
  const [ageOrYear, setAgeOrYear] = useState(profile.ageOrYear || '3rd Year Undergraduate');
  const [branch, setBranch] = useState(profile.branch || 'Computer Science & Engineering');
  const [careerGoal, setCareerGoal] = useState(profile.careerGoal || 'Software Engineer / Distributed Systems');
  const [typicalSchedule, setTypicalSchedule] = useState(profile.typicalSchedule || 'Classes 9 AM – 3:30 PM, evenings free');
  const [majorCommitments, setMajorCommitments] = useState(profile.majorCommitments || 'Coursework, Tech Club Core, Coding Practice');

  // Layer 2: Lifestyle Desires
  const lifestyleOptions = [
    { key: 'fitness', label: '🏋️ Fitness & Movement' },
    { key: 'hobbies', label: '🎸 Creative Hobbies' },
    { key: 'socializing', label: '👥 Socializing & Friends' },
    { key: 'travel', label: '✈️ Exploration & Outings' },
    { key: 'learning', label: '📚 Deep Learning' },
    { key: 'entertainment', label: '🎮 Entertainment & Games' },
    { key: 'rest', label: '😴 Rest & Recovery' },
    { key: 'career', label: '💻 Career Development' },
  ];
  const [lifestyleDesires, setLifestyleDesires] = useState<string[]>(profile.lifestyleDesires || ['fitness', 'socializing', 'hobbies', 'rest']);

  // Layer 3: Preferences
  const preferenceOptions = [
    { key: 'calm', label: '🧘 Calm & Relaxing' },
    { key: 'active', label: '🏃 Active & Dynamic' },
    { key: 'social', label: '👥 Social & Group' },
    { key: 'productive', label: '🧠 Productive & Goal-focused' },
    { key: 'creative', label: '🎨 Creative & Expressive' },
    { key: 'spontaneous', label: '🎲 Spontaneous & Fun' },
  ];
  const [suggestionPreferences, setSuggestionPreferences] = useState<string[]>(profile.suggestionPreferences || ['calm', 'social', 'productive']);

  // Layer 4: Tone
  const [tone, setTone] = useState<AppTone>(profile.tone || 'friendly');

  const toneOptions: { key: AppTone; emoji: string; label: string; preview: string }[] = [
    {
      key: 'professional',
      emoji: '🧑‍💼',
      label: 'Professional',
      preview: '"You have completed 80% of your weekly goals."',
    },
    {
      key: 'friendly',
      emoji: '🙂',
      label: 'Friendly',
      preview: '"Nice work. You\'re almost there!"',
    },
    {
      key: 'unhinged',
      emoji: '💀',
      label: 'Unhinged',
      preview: '"Bro actually finished the assignment before the deadline."',
    },
  ];

  if (!isOnboardingOpen) return null;

  const stepLabels = ['Essential Info', 'Lifestyle Desires', 'Suggestion Style', 'Personality Tone'];

  const toggleLifestyle = (key: string) => {
    if (lifestyleDesires.includes(key)) {
      setLifestyleDesires(lifestyleDesires.filter(k => k !== key));
    } else {
      setLifestyleDesires([...lifestyleDesires, key]);
    }
  };

  const togglePreference = (key: string) => {
    if (suggestionPreferences.includes(key)) {
      setSuggestionPreferences(suggestionPreferences.filter(k => k !== key));
    } else {
      setSuggestionPreferences([...suggestionPreferences, key]);
    }
  };

  const handleFinish = () => {
    updateProfile({
      name,
      ageOrYear,
      branch,
      careerGoal,
      typicalSchedule,
      majorCommitments,
      lifestyleDesires,
      suggestionPreferences,
      tone,
      isOnboarded: true,
    });

    setIsOnboardingOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-modal-enter" style={{ maxWidth: '680px' }}>
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
                fontWeight: 800,
              }}
            >
              <Compass size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Personalize Your Student Life OS
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Step {step} of 4 — {stepLabels[step - 1]}
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={() => setIsOnboardingOpen(false)}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* STEP 1: Essential */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Layer 1 — Core Profile
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Year / Level *
                  </label>
                  <input
                    type="text"
                    value={ageOrYear}
                    onChange={e => setAgeOrYear(e.target.value)}
                    placeholder="e.g. 3rd Year Undergraduate"
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Course / Branch
                  </label>
                  <input
                    type="text"
                    value={branch}
                    onChange={e => setBranch(e.target.value)}
                    placeholder="e.g. Computer Science"
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                    Career Goal
                  </label>
                  <input
                    type="text"
                    value={careerGoal}
                    onChange={e => setCareerGoal(e.target.value)}
                    placeholder="e.g. Software Engineer, Researcher"
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, marginBottom: '4px' }}>
                  Typical Daily Schedule & Free Windows
                </label>
                <input
                  type="text"
                  value={typicalSchedule}
                  onChange={e => setTypicalSchedule(e.target.value)}
                  placeholder="e.g. Classes 9-4, Free evenings from 6 PM"
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Lifestyle Desires */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  Layer 2 — Things I Want More Of
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Select the aspects of your life you want AI to actively protect and recommend time for.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {lifestyleOptions.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`checkin-tag-pill ${lifestyleDesires.includes(opt.key) ? 'active' : ''}`}
                    onClick={() => toggleLifestyle(opt.key)}
                  >
                    {lifestyleDesires.includes(opt.key) && <Check size={14} />}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Preferences */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  Layer 3 — Suggestion Preferences
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  What kind of free-time suggestions do you prefer?
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {preferenceOptions.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    className={`checkin-tag-pill ${suggestionPreferences.includes(opt.key) ? 'active' : ''}`}
                    onClick={() => togglePreference(opt.key)}
                  >
                    {suggestionPreferences.includes(opt.key) && <Check size={14} />}
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* STEP 4: Tone Personality */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  Layer 4 — How Should I Talk to You?
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Choose a communication style. You can change this anytime in Settings.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {toneOptions.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setTone(opt.key)}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${tone === opt.key ? 'var(--color-primary)' : 'var(--border-subtle)'}`,
                      background: tone === opt.key ? 'rgba(23,42,58,0.06)' : 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{opt.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.94rem', color: 'var(--color-primary)', marginBottom: '4px' }}>
                        {opt.label}
                        {tone === opt.key && (
                          <span style={{ marginLeft: '8px', fontSize: '0.72rem', color: 'var(--color-secondary)', fontWeight: 700 }}>SELECTED</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        {opt.preview}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {step > 1 && (
            <button className="btn-secondary" onClick={() => setStep((step - 1) as 1 | 2 | 3)}>
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          {step < 4 ? (
            <button className="btn-primary" onClick={() => setStep((step + 1) as 2 | 3 | 4)}>
              <span>Next</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn-mint" onClick={handleFinish}>
              <Check size={16} />
              <span>Save & Balance My Life</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
