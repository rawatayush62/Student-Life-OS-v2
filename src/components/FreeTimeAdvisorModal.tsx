import React, { useState } from 'react';
import { Sparkles, Calendar, ArrowRight, Check, Plus, Clock, Skull } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateContextAwareFreeTimeOptions } from '../services/balanceEngine';
import { FreeTimeSuggestion } from '../types';

export const FreeTimeAdvisorModal: React.FC = () => {
  const {
    isFreeTimeAdvisorOpen,
    setIsFreeTimeAdvisorOpen,
    balanceDiagnosis,
    addScheduleBlock,
    setActiveTab,
    profile,
  } = useApp();

  const tone = profile.tone || 'friendly';
  const isUnhinged = tone === 'unhinged';

  const [freeHours, setFreeHours] = useState<number>(3);
  const [targetDate, setTargetDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>('18:30');

  if (!isFreeTimeAdvisorOpen) return null;

  const suggestions = generateContextAwareFreeTimeOptions(balanceDiagnosis, freeHours, tone);

  const handleScheduleOption = (opt: FreeTimeSuggestion) => {
    // Calculate end time
    const [sh, sm] = startTime.split(':').map(Number);
    const endMinutesTotal = sh * 60 + sm + opt.estimatedMinutes;
    const eh = Math.floor(endMinutesTotal / 60);
    const em = endMinutesTotal % 60;
    const endTimeStr = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;

    addScheduleBlock({
      title: `${opt.title} — ${opt.suggestedAction}`,
      type: opt.pillar === 'MOVE' ? 'fitness' : opt.pillar === 'CONNECT' ? 'social' : opt.pillar === 'EXPLORE' ? 'hobby' : 'personal',
      pillar: opt.pillar,
      startTime,
      endTime: endTimeStr,
      date: targetDate,
      notes: `(Life Balance Advisor) ${opt.why}`,
      completed: false,
    });

    setIsFreeTimeAdvisorOpen(false);
    setActiveTab('calendar');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-modal-enter" style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-secondary)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
              }}
            >
              {isUnhinged ? <Skull size={20} /> : <Sparkles size={18} />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {isUnhinged ? 'Free Time Rescue Plan 💀' : 'Free Time & Life Balance Advisor'}
                </h3>
                {isUnhinged && (
                  <span className="badge badge-critical" style={{ fontSize: '0.68rem' }}>
                    MEME MODE
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {isUnhinged
                  ? "Don't just optimize for productivity. Optimize for having a life."
                  : 'Proactive ideas to make the most of your free evening or weekend blocks'}
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={() => setIsFreeTimeAdvisorOpen(false)}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Free time settings */}
          <div
            style={{
              padding: '14px 18px',
              background: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--color-primary)" />
              <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Available Window:
              </span>
              <select
                value={freeHours}
                onChange={e => setFreeHours(parseFloat(e.target.value))}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                }}
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours free</option>
                <option value="4">4 hours free</option>
                <option value="5">5 hours (Open Saturday)</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="date"
                value={targetDate}
                onChange={e => setTargetDate(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                }}
              />
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                }}
              />
            </div>
          </div>

          <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
            {isUnhinged ? (
              <span>
                Based on your 38+ hours of academic grind, here is what Student Life OS suggests so you don't burn out:
              </span>
            ) : (
              <span>
                We analyzed your weekly hours across <strong>LEARN · BUILD · MOVE · CONNECT · EXPLORE · REST</strong>.
                Here are 3 tailored recommendations:
              </span>
            )}
          </div>

          {/* 3 Option Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {suggestions.map(opt => (
              <div
                key={opt.id}
                style={{
                  padding: '16px 20px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                  <div
                    style={{
                      fontSize: '1.6rem',
                      width: '44px',
                      height: '44px',
                      background: 'var(--bg-app)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {opt.icon}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--color-primary)' }}>
                        {opt.optionNumber} — {opt.title}
                      </span>
                      <span className={`badge badge-pillar-${opt.pillar.toLowerCase()}`}>
                        {opt.pillar}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ⏱️ ~{opt.estimatedMinutes}m
                      </span>
                    </div>

                    <div style={{ fontSize: '0.83rem', color: 'var(--color-important)', fontWeight: 600 }}>
                      Why: {opt.why}
                    </div>

                    <div style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>
                      👉 {opt.suggestedAction}
                    </div>
                  </div>
                </div>

                <button
                  className="btn-mint"
                  style={{ padding: '8px 14px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                  onClick={() => handleScheduleOption(opt)}
                >
                  <Plus size={14} />
                  <span>Schedule</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setIsFreeTimeAdvisorOpen(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
