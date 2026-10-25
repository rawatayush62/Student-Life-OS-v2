import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Play,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Zap,
  Moon,
  Heart,
  Compass,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculatePriorityScore } from '../services/prioritizationEngine';
import { BalanceWidget } from './BalanceWidget';

export const Dashboard: React.FC = () => {
  const {
    tasks,
    scheduleBlocks,
    focusSessions,
    profile,
    aiRecommendation,
    adaptiveNotice,
    setAdaptiveNotice,
    setIsBrainDumpOpen,
    setIsScheduleGeneratorOpen,
    setIsCheckInOpen,
    setIsFreeTimeAdvisorOpen,
    addScheduleBlock,
    startFocusOnTask,
    setActiveTab,
  } = useApp();

  const tone = profile.tone || 'friendly';
  const isUnhinged = tone === 'unhinged';
  const [scheduledToast, setScheduledToast] = useState<string | null>(null);

  const now = new Date();
  const currentHour = now.getHours();
  let greetingTime = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) greetingTime = 'Good afternoon';
  else if (currentHour >= 17) greetingTime = 'Good evening';

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const todayIso = now.toISOString().split('T')[0];
  const todayBlocks = scheduleBlocks.filter(b => b.date === todayIso);
  const classCount = todayBlocks.filter(b => b.type === 'class').length;
  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  const loggedStudyMinutes = focusSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const plannedStudyMinutes = todayBlocks
    .filter(b => b.type === 'study')
    .reduce((acc, b) => {
      const [sh, sm] = b.startTime.split(':').map(Number);
      const [eh, em] = b.endTime.split(':').map(Number);
      return acc + (eh * 60 + em - (sh * 60 + sm));
    }, 0);
  const totalStudyMinutes = Math.max(loggedStudyMinutes, plannedStudyMinutes || 200);
  const studyHours = Math.floor(totalStudyMinutes / 60);
  const studyMins = totalStudyMinutes % 60;

  const prioritizedAttentionTasks = tasks
    .filter(t => !t.completed)
    .map(t => ({
      task: t,
      ...calculatePriorityScore(t),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const getDeadlineText = (deadlineStr: string) => {
    const d = new Date(deadlineStr);
    const todayZero = new Date();
    todayZero.setHours(0, 0, 0, 0);
    const targetZero = new Date(d);
    targetZero.setHours(0, 0, 0, 0);
    const diffDays = Math.round((targetZero.getTime() - todayZero.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays > 1) return `Due in ${diffDays} days`;
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`;
    return 'Upcoming';
  };

  const sortedTodaySchedule = [...todayBlocks].sort((a, b) => a.startTime.localeCompare(b.startTime));

  const pillarsList = [
    { name: 'LEARN', color: 'var(--pillar-learn)' },
    { name: 'BUILD', color: 'var(--pillar-build)' },
    { name: 'MOVE', color: 'var(--pillar-move)' },
    { name: 'CONNECT', color: 'var(--pillar-connect)' },
    { name: 'EXPLORE', color: 'var(--pillar-explore)' },
    { name: 'REST', color: 'var(--pillar-rest)' },
  ];

  const handleQuickSocialSchedule = (title: string, durationMinutes: number) => {
    addScheduleBlock({
      title,
      type: 'social',
      pillar: 'CONNECT',
      startTime: '19:00',
      endTime: '20:30',
      date: todayIso,
      notes: isUnhinged
        ? '💀 Real-world social hangout scheduled. Productivity is cool, but living life is cooler.'
        : 'Dedicated social recharge session with friends.',
      completed: false,
    });

    setScheduledToast(`Scheduled: "${title}" for tonight at 7:00 PM! 🍕`);
    setTimeout(() => setScheduledToast(null), 4000);
  };

  return (
    <div className="animate-fade-in">
      {/* 6 Life Pillars Header Strip */}
      <div className="pillars-strip app-card">
        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.08em' }}>
          THE 6 LIFE PILLARS:
        </span>
        {pillarsList.map(p => (
          <div key={p.name} className="pillar-item">
            <span className="pillar-dot" style={{ background: p.color }} />
            <span>{p.name}</span>
          </div>
        ))}
      </div>

      {/* Top Header */}
      <div className="top-header">
        <div className="greeting-text">
          <h2>
            {greetingTime}, {profile.name} {isUnhinged ? '💀' : ''}
          </h2>
          <div className="greeting-date">{formattedDate}</div>
        </div>

        <div className="header-actions">
          <button
            className="btn-secondary"
            onClick={() => setIsFreeTimeAdvisorOpen(true)}
          >
            <Sparkles size={16} color="var(--color-secondary)" />
            <span>{isUnhinged ? 'Free Time Rescue 🍿' : 'Free Time Advisor'}</span>
          </button>
          
          <button
            className="btn-primary"
            onClick={() => setIsBrainDumpOpen(true)}
          >
            <Sparkles size={16} />
            <span>Brain Dump</span>
          </button>
        </div>
      </div>

      {/* Scheduled Toast Alert */}
      {scheduledToast && (
        <div
          className="app-card animate-modal-enter"
          style={{
            marginBottom: '20px',
            padding: '12px 18px',
            background: 'var(--color-secondary-subtle)',
            borderColor: 'var(--color-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
            <Check size={16} color="var(--color-secondary)" />
            <span>{scheduledToast}</span>
          </div>
          <button
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.76rem' }}
            onClick={() => setActiveTab('calendar')}
          >
            View Calendar
          </button>
        </div>
      )}

      {/* Adaptive Notice Banner */}
      {adaptiveNotice && (
        <div
          className="app-card"
          style={{
            marginBottom: '28px',
            padding: '16px 20px',
            borderColor: 'var(--color-warning)',
            background: 'var(--color-warning-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} color="var(--color-warning)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-primary)' }}>
                {adaptiveNotice.title}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>
                {adaptiveNotice.message}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {adaptiveNotice.onAction && (
              <button
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                onClick={adaptiveNotice.onAction}
              >
                {adaptiveNotice.actionText || 'Apply Adjustment'}
              </button>
            )}
            <button
              className="btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.82rem' }}
              onClick={() => setAdaptiveNotice(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Social Meme Nudge Banner (Encourages Real-World Interaction) */}
      <div
        className="app-card"
        style={{
          marginBottom: '28px',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          borderLeft: '4px solid var(--pillar-connect)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>{isUnhinged ? '💀' : '👥'}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--color-primary)' }}>
                {isUnhinged
                  ? "Bro, your friends haven't seen you since Monday."
                  : tone === 'professional'
                  ? 'Social Connection & Cognitive Recovery Check'
                  : 'Time to take a social break with friends!'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {isUnhinged
                  ? "You've spent most of this week studying (38+ hours). Don't just optimize productivity. Optimize your life."
                  : "You've made great academic progress. Dedicating 1–2 hours to real-world connection keeps you energized."}
              </div>
            </div>
          </div>
          <span className="badge badge-pillar-connect">CONNECT PILLAR</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ justifyContent: 'center', fontSize: '0.84rem', padding: '10px', borderRadius: 'var(--radius-sm)' }}
            onClick={() => handleQuickSocialSchedule('Meet a friend for coffee or dinner', 90)}
          >
            👥 Meet a friend
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ justifyContent: 'center', fontSize: '0.84rem', padding: '10px', borderRadius: 'var(--radius-sm)' }}
            onClick={() => handleQuickSocialSchedule('Gaming session with friends', 60)}
          >
            🎮 Play something together
          </button>
          <button
            type="button"
            className="btn-secondary"
            style={{ justifyContent: 'center', fontSize: '0.84rem', padding: '10px', borderRadius: 'var(--radius-sm)' }}
            onClick={() => handleQuickSocialSchedule('Grab food / dinner with friends', 60)}
          >
            🍕 Grab food somewhere
          </button>
        </div>
      </div>

      {/* Life Balance Overview Widget */}
      <BalanceWidget />

      {/* Overview Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '28px' }}>
        <div className="app-card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Classes</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{classCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Today's lectures</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--color-secondary-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-secondary)' }}>
            <BookOpen size={20} />
          </div>
        </div>

        <div className="app-card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Tasks</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{activeTasks.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{completedTasks.length} completed</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--color-success-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="app-card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Study Time</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{studyHours}h {studyMins}m</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target: {Math.floor(profile.dailyStudyGoalMinutes / 60)}h</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--pillar-build)' }}>
            <Clock size={20} />
          </div>
        </div>

        <div className="app-card" style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Completion</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-primary)' }}>{completionRate}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All commitments</div>
          </div>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--color-warning-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-warning)' }}>
            <Sparkles size={20} />
          </div>
        </div>
      </div>

      {/* 2-Column Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '28px' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* AI Recommendation Box */}
          <div
            className="app-card"
            style={{
              padding: '24px',
              background: 'var(--color-primary)',
              color: 'var(--text-inverse)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-secondary)', marginBottom: '10px' }}>
              <Sparkles size={16} />
              <span>✦ AI Recommendation</span>
            </div>
            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-inverse)', lineHeight: 1.5, marginBottom: '18px' }}>
              {aiRecommendation.message}
            </p>
            <button
              className="btn-mint"
              onClick={() => {
                if (aiRecommendation.actionType === 'start_focus') {
                  startFocusOnTask(aiRecommendation.taskId);
                } else if (aiRecommendation.actionType === 'open_free_time') {
                  setIsFreeTimeAdvisorOpen(true);
                } else if (aiRecommendation.actionType === 'open_check_in') {
                  setIsCheckInOpen(true);
                } else {
                  setIsBrainDumpOpen(true);
                }
              }}
            >
              <Play size={15} fill="currentColor" />
              <span>{aiRecommendation.actionText}</span>
            </button>
          </div>

          {/* Priority Section: YOUR ATTENTION */}
          <div className="app-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                <span>Your Attention</span>
                <span className="badge badge-primary">Priority Queue</span>
              </div>
              <button
                className="btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                onClick={() => setActiveTab('tasks')}
              >
                <span>View All Tasks</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {prioritizedAttentionTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  🎉 No critical assignments. Your workload is under control!
                </div>
              ) : (
                prioritizedAttentionTasks.map(({ task, level }) => {
                  const isCrit = level === 'Critical';
                  const isHigh = level === 'High';

                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: '14px 16px',
                        background: 'var(--bg-app)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--color-primary)' }}>
                            {task.title}
                          </span>
                          <span className={`badge ${isCrit ? 'badge-critical' : isHigh ? 'badge-warning' : 'badge-secondary'}`}>
                            {level}
                          </span>
                          <span className={`badge badge-pillar-${(task.pillar || 'LEARN').toLowerCase()}`}>
                            {task.pillar || 'LEARN'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          <span>⏱️ {task.estimatedMinutes}m</span>
                          <span>•</span>
                          <span>{getDeadlineText(task.deadline)}</span>
                        </div>
                      </div>

                      <button
                        className="btn-primary"
                        style={{ padding: '7px 14px', fontSize: '0.8rem' }}
                        onClick={() => startFocusOnTask(task.id)}
                      >
                        <Play size={12} fill="currentColor" />
                        <span>Focus</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: TODAY'S SCHEDULE TIMELINE */}
        <div className="app-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                Today's Schedule
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {todayBlocks.length} planned blocks
              </p>
            </div>
            <button
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => setActiveTab('calendar')}
            >
              <span>Full Schedule</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sortedTodaySchedule.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                No events scheduled for today.
              </div>
            ) : (
              sortedTodaySchedule.map(block => (
                <div
                  key={block.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        color: 'var(--color-primary)',
                        width: '90px',
                      }}
                    >
                      {block.startTime} – {block.endTime}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.86rem', color: 'var(--color-primary)' }}>
                        {block.title}
                      </div>
                      {block.location && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                          📍 {block.location}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className={`badge badge-pillar-${(block.pillar || 'LEARN').toLowerCase()}`}>
                    {block.pillar || 'LEARN'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
