import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Zap,
  Play,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ScheduleBlock, BlockType, LifePillar } from '../types';

export const CalendarView: React.FC = () => {
  const {
    scheduleBlocks,
    addScheduleBlock,
    deleteScheduleBlock,
    startFocusOnTask,
    setIsFreeTimeAdvisorOpen,
    setIsScheduleGeneratorOpen,
  } = useApp();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'day' | 'week'>('week');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [newBlock, setNewBlock] = useState<{
    title: string;
    type: BlockType;
    pillar: LifePillar;
    startTime: string;
    endTime: string;
    date: string;
    location: string;
    notes: string;
  }>({
    title: '',
    type: 'class',
    pillar: 'LEARN',
    startTime: '09:00',
    endTime: '10:00',
    date: new Date().toISOString().split('T')[0],
    location: '',
    notes: '',
  });

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewType === 'day') {
      d.setDate(d.getDate() - 1);
    } else {
      d.setDate(d.getDate() - 7);
    }
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewType === 'day') {
      d.setDate(d.getDate() + 1);
    } else {
      d.setDate(d.getDate() + 7);
    }
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getWeekDates = (baseDate: Date) => {
    const d = new Date(baseDate);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));

    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      week.push(nextDay);
    }
    return week;
  };

  const weekDates = getWeekDates(currentDate);
  const hours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 AM to 10 PM

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlock.title.trim()) return;

    addScheduleBlock({
      title: newBlock.title,
      type: newBlock.type,
      pillar: newBlock.pillar,
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      date: newBlock.date,
      location: newBlock.location,
      notes: newBlock.notes,
      completed: false,
    });

    setIsAddModalOpen(false);
    setNewBlock({
      title: '',
      type: 'class',
      pillar: 'LEARN',
      startTime: '09:00',
      endTime: '10:00',
      date: new Date().toISOString().split('T')[0],
      location: '',
      notes: '',
    });
  };

  const getPillarColor = (pillar: LifePillar) => {
    switch (pillar) {
      case 'LEARN': return { bg: 'rgba(23, 42, 58, 0.08)', border: 'rgba(23, 42, 58, 0.25)', text: 'var(--pillar-learn)' };
      case 'BUILD': return { bg: 'rgba(37, 99, 235, 0.08)', border: 'rgba(37, 99, 235, 0.25)', text: 'var(--pillar-build)' };
      case 'MOVE': return { bg: 'rgba(5, 150, 105, 0.08)', border: 'rgba(5, 150, 105, 0.25)', text: 'var(--pillar-move)' };
      case 'CONNECT': return { bg: 'var(--color-important-subtle)', border: 'rgba(231, 111, 81, 0.3)', text: 'var(--pillar-connect)' };
      case 'EXPLORE': return { bg: 'var(--color-warning-subtle)', border: 'rgba(244, 185, 66, 0.35)', text: '#B45309' };
      case 'REST': return { bg: 'var(--color-secondary-subtle)', border: 'rgba(78, 205, 196, 0.4)', text: '#0D9488' };
      default: return { bg: 'rgba(23, 42, 58, 0.05)', border: 'var(--border-subtle)', text: 'var(--text-main)' };
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Top Header */}
      <div className="top-header">
        <div>
          <h2>Balanced Weekly Schedule</h2>
          <p>Time-blocked commitments color-coded by the 6 Life Pillars</p>
        </div>

        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setIsFreeTimeAdvisorOpen(true)}
          >
            <Sparkles size={16} color="var(--color-secondary)" />
            <span>Free Time Advisor</span>
          </button>

          <button
            className="btn-mint"
            onClick={() => setIsScheduleGeneratorOpen(true)}
          >
            <Zap size={16} />
            <span>AI Auto-Plan</span>
          </button>

          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Navigation & Legend Bar */}
      <div
        className="app-card"
        style={{
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.82rem' }} onClick={handleToday}>
            Today
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button className="icon-button" style={{ width: '32px', height: '32px' }} onClick={handlePrev}>
              <ChevronLeft size={16} />
            </button>
            <button className="icon-button" style={{ width: '32px', height: '32px' }} onClick={handleNext}>
              <ChevronRight size={16} />
            </button>
          </div>

          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--color-primary)', marginLeft: '6px' }}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.76rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--pillar-learn)', fontWeight: 700 }}>
            ● LEARN
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--pillar-build)', fontWeight: 700 }}>
            ● BUILD
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--pillar-move)', fontWeight: 700 }}>
            ● MOVE
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--pillar-connect)', fontWeight: 700 }}>
            ● CONNECT
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--pillar-explore)', fontWeight: 700 }}>
            ● EXPLORE
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--pillar-rest)', fontWeight: 700 }}>
            ● REST
          </span>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
          <button
            className="btn-secondary"
            style={{
              padding: '5px 12px',
              fontSize: '0.8rem',
              borderRadius: '0',
              background: viewType === 'day' ? 'var(--bg-app)' : 'transparent',
              fontWeight: viewType === 'day' ? 700 : 500,
            }}
            onClick={() => setViewType('day')}
          >
            Day
          </button>
          <button
            className="btn-secondary"
            style={{
              padding: '5px 12px',
              fontSize: '0.8rem',
              borderRadius: '0',
              background: viewType === 'week' ? 'var(--bg-app)' : 'transparent',
              fontWeight: viewType === 'week' ? 700 : 500,
            }}
            onClick={() => setViewType('week')}
          >
            Week
          </button>
        </div>
      </div>

      {/* Week Grid */}
      {viewType === 'week' ? (
        <div className="app-card" style={{ padding: '20px', overflowX: 'auto' }}>
          <div style={{ minWidth: '850px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', gap: '8px', marginBottom: '16px' }}>
              <div />
              {weekDates.map((dayDate, i) => {
                const isToday = dayDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                return (
                  <div
                    key={i}
                    style={{
                      textAlign: 'center',
                      padding: '8px 4px',
                      borderRadius: 'var(--radius-md)',
                      background: isToday ? 'var(--bg-app)' : 'transparent',
                      border: isToday ? '1px solid var(--color-primary)' : '1px solid transparent',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: isToday ? 'var(--color-primary)' : 'var(--text-secondary)' }}>
                      {dayDate.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                      {dayDate.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hours */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {hours.map(hour => {
                const hourStr = `${String(hour).padStart(2, '0')}:00`;
                return (
                  <div
                    key={hour}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px repeat(7, 1fr)',
                      gap: '8px',
                      minHeight: '60px',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', paddingTop: '4px' }}>
                      {hourStr}
                    </div>

                    {weekDates.map((dayDate, dIdx) => {
                      const dayIso = dayDate.toISOString().split('T')[0];
                      const matchingBlocks = scheduleBlocks.filter(b => {
                        if (b.date !== dayIso) return false;
                        const blockHour = parseInt(b.startTime.split(':')[0], 10);
                        return blockHour === hour;
                      });

                      return (
                        <div
                          key={dIdx}
                          style={{
                            background: 'var(--bg-card)',
                            borderRadius: 'var(--radius-xs)',
                            padding: '3px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '3px',
                          }}
                        >
                          {matchingBlocks.map(block => {
                            const style = getPillarColor(block.pillar || 'LEARN');

                            return (
                              <div
                                key={block.id}
                                style={{
                                  background: style.bg,
                                  border: `1px solid ${style.border}`,
                                  borderRadius: 'var(--radius-xs)',
                                  padding: '5px 7px',
                                  fontSize: '0.73rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '2px',
                                }}
                              >
                                <div style={{ fontWeight: 700, color: style.text, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>{block.title}</span>
                                </div>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                                  {block.startTime} - {block.endTime}
                                </div>

                                {block.type === 'study' && block.taskId && (
                                  <button
                                    onClick={() => startFocusOnTask(block.taskId)}
                                    style={{
                                      marginTop: '3px',
                                      padding: '2px 6px',
                                      background: 'var(--color-primary)',
                                      borderRadius: '4px',
                                      color: '#FFFFFF',
                                      fontSize: '0.66rem',
                                      fontWeight: 700,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      width: 'fit-content',
                                    }}
                                  >
                                    <Play size={8} fill="white" />
                                    <span>Focus</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Day View */
        <div className="app-card" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={() => setIsScheduleGeneratorOpen(true)}>
              <Zap size={14} />
              <span>Optimize Day</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {scheduleBlocks
              .filter(b => b.date === currentDate.toISOString().split('T')[0])
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(block => {
                const style = getPillarColor(block.pillar || 'LEARN');

                return (
                  <div
                    key={block.id}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: style.bg,
                      border: `1px solid ${style.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {block.startTime}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {block.title}
                          <span className={`badge badge-pillar-${(block.pillar || 'LEARN').toLowerCase()}`}>
                            {block.pillar || 'LEARN'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {block.startTime} – {block.endTime} {block.location ? `• 📍 ${block.location}` : ''}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {block.type === 'study' && block.taskId && (
                        <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => startFocusOnTask(block.taskId)}>
                          <Play size={12} fill="white" />
                          <span>Focus</span>
                        </button>
                      )}
                      <button className="icon-button" style={{ width: '32px', height: '32px', color: 'var(--color-important)' }} onClick={() => deleteScheduleBlock(block.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-modal-enter">
            <div className="modal-header">
              <h3 style={{ color: 'var(--color-primary)' }}>Add Class or Life Event</h3>
              <button className="icon-button" onClick={() => setIsAddModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operating Systems Lecture or Gym Session"
                    value={newBlock.title}
                    onChange={e => setNewBlock({ ...newBlock, title: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                      Life Pillar
                    </label>
                    <select
                      value={newBlock.pillar}
                      onChange={e => setNewBlock({ ...newBlock, pillar: e.target.value as LifePillar })}
                      style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                    >
                      <option value="LEARN">📚 LEARN (Class / Lecture / Study)</option>
                      <option value="BUILD">💻 BUILD (Coding / Project)</option>
                      <option value="MOVE">🏋️ MOVE (Fitness / Sports)</option>
                      <option value="CONNECT">👥 CONNECT (Friends / Social)</option>
                      <option value="EXPLORE">🎸 EXPLORE (Hobbies / Travel)</option>
                      <option value="REST">😴 REST (Break / Recovery)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                      Date
                    </label>
                    <input
                      type="date"
                      value={newBlock.date}
                      onChange={e => setNewBlock({ ...newBlock, date: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newBlock.startTime}
                      onChange={e => setNewBlock({ ...newBlock, startTime: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newBlock.endTime}
                      onChange={e => setNewBlock({ ...newBlock, endTime: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
