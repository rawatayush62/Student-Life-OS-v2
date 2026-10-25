import React from 'react';
import { Sparkles, ArrowRight, Compass, Skull } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LifePillar } from '../types';
import { getDiagnosisHeadline } from '../utils/toneMessages';

export const BalanceWidget: React.FC = () => {
  const { balanceDiagnosis, setIsFreeTimeAdvisorOpen, setIsCheckInOpen, profile } = useApp();
  const tone = profile.tone || 'friendly';

  const pillarsConfig: { key: LifePillar; label: string; color: string; icon: string }[] = [
    { key: 'LEARN', label: 'Learn', color: 'var(--pillar-learn)', icon: '📚' },
    { key: 'BUILD', label: 'Build', color: 'var(--pillar-build)', icon: '💻' },
    { key: 'MOVE', label: 'Move', color: 'var(--pillar-move)', icon: '🏋️' },
    { key: 'CONNECT', label: 'Connect', color: 'var(--pillar-connect)', icon: '👥' },
    { key: 'EXPLORE', label: 'Explore', color: 'var(--pillar-explore)', icon: '🎸' },
    { key: 'REST', label: 'Rest', color: 'var(--pillar-rest)', icon: '😴' },
  ];

  const headline = getDiagnosisHeadline(balanceDiagnosis.status, tone);

  return (
    <div className="balance-overview-card app-card">
      <div className="balance-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-secondary)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}
          >
            {tone === 'unhinged' ? <Skull size={18} /> : <Compass size={18} />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Life Balance & Weekly Health
              </h3>
              <span
                className={`badge ${
                  balanceDiagnosis.status === 'Balanced'
                    ? 'badge-secondary'
                    : balanceDiagnosis.status === 'Burnout Risk'
                    ? 'badge-critical'
                    : 'badge-warning'
                }`}
              >
                {balanceDiagnosis.status}
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Optimizing for holistic student life: LEARN · BUILD · MOVE · CONNECT · EXPLORE · REST
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
            onClick={() => setIsCheckInOpen(true)}
          >
            <span>{tone === 'unhinged' ? '💀 Cooked Check-in' : '🌙 Daily Check-in'}</span>
          </button>
          <button
            className="btn-mint"
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
            onClick={() => setIsFreeTimeAdvisorOpen(true)}
          >
            <span>Free Time Ideas</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* AI Balance Diagnosis Banner */}
      <div
        style={{
          padding: '14px 18px',
          background: 'var(--bg-app)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-primary)' }}>
          <Sparkles size={14} color="var(--color-secondary)" />
          <span>{headline}</span>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
          {balanceDiagnosis.detailedAnalysis}
        </p>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '2px' }}>
          💡 <span style={{ color: 'var(--color-primary)' }}>Recommendation:</span> {balanceDiagnosis.recommendation}
        </div>
      </div>

      {/* 6 Pillars Breakdown Grid */}
      <div className="balance-bars-grid">
        {pillarsConfig.map(pillar => {
          const hours = balanceDiagnosis.pillarHours[pillar.key] || 0;
          const percentage = balanceDiagnosis.pillarPercentages[pillar.key] || 0;

          return (
            <div key={pillar.key} className="pillar-bar-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                  {pillar.icon} {pillar.label}
                </span>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {hours.toFixed(1)}h
                </span>
              </div>

              <div className="pillar-bar-track">
                <div
                  className="pillar-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.max(8, percentage * 2.5))}%`,
                    background: pillar.color,
                  }}
                />
              </div>

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {percentage}% of time
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
