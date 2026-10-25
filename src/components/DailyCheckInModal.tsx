import React, { useState } from 'react';
import { Moon, Check, Sparkles, Flame, Skull } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  checkInMainPrompt,
  checkInSubtitle,
  moodOptions,
  academicOptions,
  bodyOptions,
  lifeOptions,
  academicLabel,
  bodyLabel,
  lifeLabel,
} from '../utils/toneMessages';

export const DailyCheckInModal: React.FC = () => {
  const { isCheckInOpen, setIsCheckInOpen, addCheckIn, profile } = useApp();
  const tone = profile.tone || 'friendly';

  const [academics, setAcademics] = useState<string[]>(() => {
    return [academicOptions[tone][0]];
  });
  const [body, setBody] = useState<string[]>(() => {
    return [bodyOptions[tone][0]];
  });
  const [life, setLife] = useState<string[]>(() => {
    return [lifeOptions[tone][0]];
  });
  const [mood, setMood] = useState<number>(4);
  const [energy, setEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');

  if (!isCheckInOpen) return null;

  const currentMoods = moodOptions[tone];
  const currentAcademicOptions = academicOptions[tone];
  const currentBodyOptions = bodyOptions[tone];
  const currentLifeOptions = lifeOptions[tone];

  const toggleTag = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const handleSave = () => {
    addCheckIn({
      academics,
      body,
      life,
      mood,
      energy,
      notes,
    });

    setIsCheckInOpen(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-modal-enter" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary)',
                color: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {tone === 'unhinged' ? <Skull size={20} /> : <Moon size={18} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {checkInMainPrompt[tone]}
                </h3>
                {tone === 'unhinged' && (
                  <span className="badge badge-critical" style={{ fontSize: '0.68rem' }}>
                    MEME MODE
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {checkInSubtitle[tone]}
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={() => setIsCheckInOpen(false)}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Mood / Cooked-meter */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                {tone === 'unhinged' ? 'Current Status (Cooked Scale)' : 'Overall Mood'}
              </label>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-secondary)', fontWeight: 700 }}>
                {currentMoods.find(m => m.rating === mood)?.label}
              </span>
            </div>
            <div className="mood-selector">
              {currentMoods.map(m => (
                <button
                  key={m.rating}
                  type="button"
                  className={`mood-btn ${mood === m.rating ? 'active' : ''}`}
                  onClick={() => setMood(m.rating)}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Energy Level */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
              {tone === 'unhinged' ? 'Battery Life:' : 'Energy Level:'} <span style={{ textTransform: 'capitalize', color: 'var(--color-secondary)' }}>{energy}</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {(['low', 'medium', 'high'] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  className={`checkin-tag-pill ${energy === lvl ? 'active' : ''}`}
                  style={{ justifyContent: 'center', textTransform: 'capitalize' }}
                  onClick={() => setEnergy(lvl)}
                >
                  {lvl === 'low'
                    ? (tone === 'unhinged' ? '🪫 1% power' : '🪫 Low')
                    : lvl === 'medium'
                    ? (tone === 'unhinged' ? '⚡ Surviving' : '⚡ Moderate')
                    : (tone === 'unhinged' ? '🔥 Locked In' : '🔥 High Energy')}
                </button>
              ))}
            </div>
          </div>

          {/* Academics Section */}
          <div className="checkin-tags-group">
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {academicLabel[tone]}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {currentAcademicOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`checkin-tag-pill ${academics.includes(opt) ? 'active' : ''}`}
                  onClick={() => toggleTag(academics, setAcademics, opt)}
                >
                  {academics.includes(opt) && <Check size={14} />}
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Body Section */}
          <div className="checkin-tags-group">
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {bodyLabel[tone]}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {currentBodyOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`checkin-tag-pill ${body.includes(opt) ? 'active' : ''}`}
                  onClick={() => toggleTag(body, setBody, opt)}
                >
                  {body.includes(opt) && <Check size={14} />}
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Life Section */}
          <div className="checkin-tags-group">
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {lifeLabel[tone]}
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {currentLifeOptions.map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`checkin-tag-pill ${life.includes(opt) ? 'active' : ''}`}
                  onClick={() => toggleTag(life, setLife, opt)}
                >
                  {life.includes(opt) && <Check size={14} />}
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '6px' }}>
              {tone === 'unhinged' ? 'Midnight Confession / Thoughts (Optional)' : 'Quick Reflection / Note (Optional)'}
            </label>
            <input
              type="text"
              placeholder={tone === 'unhinged' ? "how we feeling about tomorrow's agenda..." : "What went well? What could be balanced tomorrow?"}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setIsCheckInOpen(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Check size={16} />
            <span>{tone === 'unhinged' ? 'Lock In Check-in 🗿' : 'Save Reflection'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
