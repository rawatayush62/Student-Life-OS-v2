import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateTonightSchedule, GeneratedScheduleResult } from '../services/scheduleOptimizer';

export const ScheduleGeneratorModal: React.FC = () => {
  const {
    isScheduleGeneratorOpen,
    setIsScheduleGeneratorOpen,
    tasks,
    scheduleBlocks,
    batchAddScheduleBlocks,
    setActiveTab,
  } = useApp();

  const [freeHours, setFreeHours] = useState<number>(3);
  const [startHour, setStartHour] = useState<number>(18);
  const [previewResult, setPreviewResult] = useState<GeneratedScheduleResult | null>(null);

  if (!isScheduleGeneratorOpen) return null;

  const handleGeneratePreview = () => {
    const result = generateTonightSchedule(tasks, scheduleBlocks, freeHours, startHour);
    setPreviewResult(result);
  };

  const handleApplyToCalendar = () => {
    if (!previewResult || previewResult.blocks.length === 0) return;

    batchAddScheduleBlocks(previewResult.blocks);

    setIsScheduleGeneratorOpen(false);
    setPreviewResult(null);
    setActiveTab('calendar');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-modal-enter" style={{ maxWidth: '640px' }}>
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
              <Zap size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                AI Schedule Generator
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Time-box pending tasks into balanced Pomodoro study & restorative break blocks
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={() => setIsScheduleGeneratorOpen(false)}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div
            style={{
              padding: '16px 20px',
              background: 'var(--bg-app)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                Free Time Block: <span style={{ color: 'var(--color-secondary-hover)' }}>{freeHours} hours</span>
              </label>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {freeHours * 60} mins available
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="6"
              step="0.5"
              value={freeHours}
              onChange={e => {
                setFreeHours(parseFloat(e.target.value));
                setPreviewResult(null);
              }}
              style={{ width: '100%', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              <span>1 hr</span>
              <span>2 hrs</span>
              <span>3 hrs (Standard)</span>
              <span>4 hrs</span>
              <span>6 hrs</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Session Start Time
            </label>
            <select
              value={startHour}
              onChange={e => {
                setStartHour(parseInt(e.target.value, 10));
                setPreviewResult(null);
              }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '7px 12px',
                color: 'var(--text-main)',
                fontWeight: 600,
                fontSize: '0.84rem',
              }}
            >
              <option value="16">4:00 PM (16:00)</option>
              <option value="17">5:00 PM (17:00)</option>
              <option value="18">6:00 PM (18:00 - Evening)</option>
              <option value="19">7:00 PM (19:00)</option>
              <option value="20">8:00 PM (20:00)</option>
            </select>
          </div>

          {!previewResult && (
            <button
              className="btn-primary"
              style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
              onClick={handleGeneratePreview}
            >
              <Sparkles size={16} />
              <span>Generate Balanced Routine</span>
            </button>
          )}

          {previewResult && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <CheckCircle2 size={18} color="var(--pillar-move)" />
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-primary)' }}>
                  Proposed Routine
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {previewResult.summary}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {previewResult.blocks.map((block, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: block.type === 'study' ? 'var(--bg-app)' : '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {block.startTime} – {block.endTime}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-main)' }}>
                        {block.title}
                      </span>
                    </div>

                    <span className={`badge ${block.type === 'study' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '0.68rem' }}>
                      {block.type === 'study' ? '45m Focus' : '15m Break'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setIsScheduleGeneratorOpen(false)}>
            Cancel
          </button>

          {previewResult && (
            <button className="btn-mint" onClick={handleApplyToCalendar}>
              <Check size={16} />
              <span>Add to Calendar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
