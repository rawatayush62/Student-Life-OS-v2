import React, { useState } from 'react';
import {
  Plus,
  Search,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  Play,
  LayoutList,
  Columns3,
  Sparkles,
  CheckSquare,
  Square,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Task, TaskCategory, PriorityLevel, LifePillar } from '../types';
import { calculatePriorityScore } from '../services/prioritizationEngine';

export const TaskManager: React.FC = () => {
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    updateTaskProgress,
    startFocusOnTask,
    setIsBrainDumpOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'priority' | 'deadline' | 'estimated' | 'title'>('priority');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: TaskCategory;
    pillar: LifePillar;
    priority: PriorityLevel;
    deadline: string;
    estimatedMinutes: number;
    tags: string;
  }>({
    title: '',
    description: '',
    category: 'Academic',
    pillar: 'LEARN',
    priority: 'Medium',
    deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    estimatedMinutes: 60,
    tags: '',
  });

  const pillars: ('All' | LifePillar)[] = ['All', 'LEARN', 'BUILD', 'MOVE', 'CONNECT', 'EXPLORE', 'REST'];

  const openAddModal = () => {
    setEditingTaskId(null);
    setFormData({
      title: '',
      description: '',
      category: 'Academic',
      pillar: 'LEARN',
      priority: 'High',
      deadline: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      estimatedMinutes: 60,
      tags: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTaskId(task.id);
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      pillar: task.pillar || 'LEARN',
      priority: task.priority,
      deadline: task.deadline,
      estimatedMinutes: task.estimatedMinutes,
      tags: task.tags.join(', '),
    });
    setIsModalOpen(true);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const tagsArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingTaskId) {
      updateTask(editingTaskId, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        pillar: formData.pillar,
        priority: formData.priority,
        deadline: formData.deadline,
        estimatedMinutes: formData.estimatedMinutes,
        tags: tagsArray,
      });
    } else {
      addTask({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        pillar: formData.pillar,
        priority: formData.priority,
        deadline: formData.deadline,
        estimatedMinutes: formData.estimatedMinutes,
        completed: false,
        progress: 0,
        tags: tagsArray.length > 0 ? tagsArray : [formData.category, formData.pillar],
      });
    }

    setIsModalOpen(false);
  };

  const handleMilestoneClick = (taskId: string, targetPercent: number, currentPercent: number) => {
    let nextPercent = targetPercent;
    // If clicking the current milestone, toggle it down to previous step
    if (currentPercent === targetPercent) {
      if (targetPercent === 100) nextPercent = 75;
      else if (targetPercent === 75) nextPercent = 50;
      else if (targetPercent === 50) nextPercent = 25;
      else nextPercent = 0;
    }

    updateTaskProgress(taskId, nextPercent);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const updatedSubtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );

    const completedCount = updatedSubtasks.filter(st => st.completed).length;
    const computedProgress = Math.round((completedCount / updatedSubtasks.length) * 100);

    updateTask(taskId, {
      subtasks: updatedSubtasks,
      progress: computedProgress,
      completed: computedProgress === 100,
      completedAt: computedProgress === 100 ? new Date().toISOString() : undefined,
    });
  };

  const filteredTasks = tasks
    .filter(t => {
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPillar = selectedPillar === 'All' || t.pillar === selectedPillar;
      return matchesSearch && matchesPillar;
    })
    .map(t => ({
      task: t,
      ...calculatePriorityScore(t),
    }))
    .sort((a, b) => {
      if (sortBy === 'priority') return b.score - a.score;
      if (sortBy === 'deadline') return a.task.deadline.localeCompare(b.task.deadline);
      if (sortBy === 'estimated') return b.task.estimatedMinutes - a.task.estimatedMinutes;
      return a.task.title.localeCompare(b.task.title);
    });

  return (
    <div className="animate-fade-in">
      {/* Top Header */}
      <div className="top-header">
        <div>
          <h2>Tasks & Life Commitments</h2>
          <p>Prioritize across the 6 Life Pillars (LEARN · BUILD · MOVE · CONNECT · EXPLORE · REST)</p>
        </div>

        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setIsBrainDumpOpen(true)}>
            <Sparkles size={16} color="var(--color-secondary)" />
            <span>Brain Dump</span>
          </button>

          <button className="btn-primary" onClick={openAddModal}>
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className="app-card"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Search */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--bg-app)',
            padding: '8px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            minWidth: '240px',
          }}
        >
          <Search size={16} color="var(--text-secondary)" />
          <input
            type="text"
            placeholder="Search tasks, tags, commitments..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', width: '100%', color: 'var(--text-main)' }}
          />
        </div>

        {/* Pillar Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
          {pillars.map(p => (
            <button
              key={p}
              onClick={() => setSelectedPillar(p)}
              className="checkin-tag-pill"
              style={{
                padding: '6px 12px',
                fontSize: '0.78rem',
                background: selectedPillar === p ? 'var(--color-primary)' : 'var(--bg-card)',
                color: selectedPillar === p ? 'var(--text-inverse)' : 'var(--text-secondary)',
                borderColor: selectedPillar === p ? 'var(--color-primary)' : 'var(--border-subtle)',
                fontWeight: selectedPillar === p ? 700 : 500,
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Sorting & Views */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={14} color="var(--text-secondary)" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'priority' | 'deadline' | 'estimated' | 'title')}
              style={{
                background: 'var(--bg-app)',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.82rem',
                color: 'var(--text-main)',
              }}
            >
              <option value="priority">AI Priority Score</option>
              <option value="deadline">Deadline (Earliest)</option>
              <option value="estimated">Estimated Time</option>
              <option value="title">Alphabetical</option>
            </select>
          </div>

          <div style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <button
              className="icon-button"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '0',
                background: viewMode === 'list' ? 'var(--color-secondary-subtle)' : 'transparent',
                color: viewMode === 'list' ? 'var(--color-secondary)' : 'var(--text-secondary)',
              }}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <LayoutList size={16} />
            </button>
            <button
              className="icon-button"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '0',
                background: viewMode === 'kanban' ? 'var(--color-secondary-subtle)' : 'transparent',
                color: viewMode === 'kanban' ? 'var(--color-secondary)' : 'var(--text-secondary)',
              }}
              onClick={() => setViewMode('kanban')}
              title="Kanban Board"
            >
              <Columns3 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* List vs Kanban */}
      {viewMode === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTasks.length === 0 ? (
            <div className="app-card" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <h3>No tasks found</h3>
              <p style={{ marginTop: '4px' }}>Try switching pillar filters or adding a new task.</p>
            </div>
          ) : (
            filteredTasks.map(({ task, score, level }) => {
              const isCrit = level === 'Critical';
              const isHigh = level === 'High';
              const curProgress = task.progress || 0;

              return (
                <div
                  key={task.id}
                  className="app-card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    opacity: task.completed ? 0.6 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    {/* Left: Checkbox & Details */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        style={{ marginTop: '2px', color: task.completed ? 'var(--color-success)' : 'var(--text-secondary)' }}
                        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                      </button>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.98rem', fontWeight: 700, textDecoration: task.completed ? 'line-through' : 'none', color: 'var(--color-primary)' }}>
                            {task.title}
                          </span>
                          <span className={`badge ${isCrit ? 'badge-critical' : isHigh ? 'badge-warning' : 'badge-secondary'}`}>
                            {level} ({score} pts)
                          </span>
                          <span className={`badge badge-pillar-${(task.pillar || 'LEARN').toLowerCase()}`}>
                            {task.pillar || 'LEARN'}
                          </span>
                        </div>

                        {task.description && (
                          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            {task.description}
                          </p>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '2px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} />
                            {task.deadline}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            {task.estimatedMinutes}m est.
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!task.completed && (
                        <button
                          className="btn-primary"
                          style={{ padding: '7px 12px', fontSize: '0.8rem' }}
                          onClick={() => startFocusOnTask(task.id)}
                        >
                          <Play size={12} fill="currentColor" />
                          <span>Focus</span>
                        </button>
                      )}

                      <button className="icon-button" style={{ width: '32px', height: '32px' }} onClick={() => openEditModal(task)} title="Edit">
                        <Edit2 size={14} />
                      </button>

                      <button className="icon-button" style={{ width: '32px', height: '32px', color: 'var(--color-important)' }} onClick={() => deleteTask(task.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Subtasks Checkboxes if present */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'var(--bg-app)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        marginLeft: '36px',
                      }}
                    >
                      <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Step-by-step Subtasks:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {task.subtasks.map(st => (
                          <div
                            key={st.id}
                            onClick={() => toggleSubtask(task.id, st.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              color: st.completed ? 'var(--text-muted)' : 'var(--text-main)',
                              textDecoration: st.completed ? 'line-through' : 'none',
                            }}
                          >
                            {st.completed ? (
                              <CheckSquare size={15} color="var(--color-secondary)" />
                            ) : (
                              <Square size={15} color="var(--text-secondary)" />
                            )}
                            <span>{st.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Milestone Checkboxes (Replacing the slider) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-subtle)',
                      marginLeft: '36px',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '4px' }}>
                        Progress Checkpoints:
                      </span>
                      {[
                        { pct: 25, label: '25% Start' },
                        { pct: 50, label: '50% Half' },
                        { pct: 75, label: '75% Polish' },
                        { pct: 100, label: '100% Done' },
                      ].map(m => {
                        const isReached = curProgress >= m.pct;
                        return (
                          <button
                            key={m.pct}
                            type="button"
                            onClick={() => handleMilestoneClick(task.id, m.pct, curProgress)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-xs)',
                              border: `1px solid ${isReached ? 'var(--color-secondary)' : 'var(--border-subtle)'}`,
                              background: isReached ? 'var(--color-secondary-subtle)' : 'var(--bg-app)',
                              color: isReached ? 'var(--color-secondary)' : 'var(--text-secondary)',
                              fontSize: '0.74rem',
                              fontWeight: isReached ? 800 : 500,
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)',
                            }}
                          >
                            {isReached ? (
                              <CheckSquare size={13} color="var(--color-secondary)" />
                            ) : (
                              <Square size={13} color="var(--text-secondary)" />
                            )}
                            <span>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '100px',
                          height: '6px',
                          background: 'var(--bg-app)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        <div
                          style={{
                            width: `${curProgress}%`,
                            height: '100%',
                            background: curProgress === 100 ? 'var(--color-success)' : 'var(--color-secondary)',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-primary)', minWidth: '32px' }}>
                        {curProgress}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Kanban Board */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
          {['To Do', 'In Progress', 'Completed'].map(colTitle => {
            const colTasks = filteredTasks.filter(({ task }) => {
              if (colTitle === 'To Do') return !task.completed && (!task.progress || task.progress === 0);
              if (colTitle === 'In Progress') return !task.completed && (task.progress || 0) > 0;
              return task.completed;
            });

            return (
              <div key={colTitle} className="app-card" style={{ padding: '18px', minHeight: '400px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--color-primary)' }}>{colTitle}</h3>
                  <span className="badge badge-primary">{colTasks.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {colTasks.map(({ task }) => {
                    const curProgress = task.progress || 0;
                    return (
                      <div
                        key={task.id}
                        style={{
                          padding: '14px',
                          background: 'var(--bg-app)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className={`badge badge-pillar-${(task.pillar || 'LEARN').toLowerCase()}`}>{task.pillar || 'LEARN'}</span>
                          <button onClick={() => toggleTaskComplete(task.id)} style={{ color: task.completed ? 'var(--color-success)' : 'var(--text-secondary)' }}>
                            {task.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                          </button>
                        </div>

                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>{task.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>📅 {task.deadline}</span>
                          <span>⏱️ {task.estimatedMinutes}m</span>
                        </div>

                        {/* Milestone Checkpoints in Kanban */}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                          {[25, 50, 75, 100].map(pct => {
                            const isReached = curProgress >= pct;
                            return (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => handleMilestoneClick(task.id, pct, curProgress)}
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '0.68rem',
                                  borderRadius: 'var(--radius-xs)',
                                  border: `1px solid ${isReached ? 'var(--color-secondary)' : 'var(--border-subtle)'}`,
                                  background: isReached ? 'var(--color-secondary-subtle)' : 'var(--bg-card)',
                                  color: isReached ? 'var(--color-secondary)' : 'var(--text-secondary)',
                                  fontWeight: isReached ? 800 : 500,
                                  cursor: 'pointer',
                                }}
                              >
                                {pct}%
                              </button>
                            );
                          })}
                        </div>

                        {!task.completed && (
                          <button
                            className="btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.74rem', marginTop: '4px', width: '100%', justifyContent: 'center' }}
                            onClick={() => startFocusOnTask(task.id)}
                          >
                            <Play size={11} fill="currentColor" />
                            <span>Start Focus</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card animate-modal-enter">
            <div className="modal-header">
              <h3 style={{ color: 'var(--color-primary)' }}>{editingTaskId ? 'Edit Commitment' : 'Create New Commitment'}</h3>
              <button className="icon-button" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTask}>
              <div className="modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Systems Lab 3"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                      Life Pillar (Balance Dimension)
                    </label>
                    <select
                      value={formData.pillar}
                      onChange={e => setFormData({ ...formData, pillar: e.target.value as LifePillar })}
                      style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                    >
                      <option value="LEARN">📚 LEARN (Academics & Study)</option>
                      <option value="BUILD">💻 BUILD (Projects & Coding)</option>
                      <option value="MOVE">🏋️ MOVE (Fitness & Health)</option>
                      <option value="CONNECT">👥 CONNECT (Social & Friends)</option>
                      <option value="EXPLORE">🎸 EXPLORE (Hobbies & Creative)</option>
                      <option value="REST">😴 REST (Recovery & Downtime)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                      Priority Urgency
                    </label>
                    <select
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: e.target.value as PriorityLevel })}
                      style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                    >
                      <option value="Critical">Critical (Coral)</option>
                      <option value="High">High (Warm Amber)</option>
                      <option value="Medium">Medium (Navy/Teal)</option>
                      <option value="Low">Low (Restrained)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                      Estimated Minutes
                    </label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={formData.estimatedMinutes}
                      onChange={e => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value, 10) || 30 })}
                      style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '4px' }}>
                    Notes / Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingTaskId ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
