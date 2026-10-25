import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  X,
  Volume2,
  CloudRain,
  Radio,
  Wind,
  Waves,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { soundscape } from '../utils/soundSynthesizer';
import { getRandomFocusQuote } from '../utils/toneMessages';

export const FocusMode: React.FC = () => {
  const {
    activeFocusTask,
    tasks,
    startFocusOnTask,
    exitFocusMode,
    logCompletedFocus,
    profile,
  } = useApp();

  const initialDuration = (profile.preferredFocusDuration || 45) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [totalSessionSeconds, setTotalSessionSeconds] = useState(initialDuration);
  const [activeSound, setActiveSound] = useState<'none' | 'rain' | 'binaural' | 'whitenoise' | 'stream'>('none');
  const [volume, setVolume] = useState(0.25);

  const selectedTaskId = activeFocusTask ? activeFocusTask.id : tasks.find(t => !t.completed)?.id;
  const currentTask = tasks.find(t => t.id === selectedTaskId);

  const setPreset = (mins: number) => {
    setIsActive(false);
    setSecondsRemaining(mins * 60);
    setTotalSessionSeconds(mins * 60);
  };

  useEffect(() => {
    let interval: number | undefined = undefined;
    if (isActive && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      handleFinishSession(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining]);

  useEffect(() => {
    if (activeSound === 'none') {
      soundscape.stop();
    } else {
      soundscape.play(activeSound);
      soundscape.setVolume(volume);
    }

    return () => {
      soundscape.stop();
    };
  }, [activeSound]);

  useEffect(() => {
    soundscape.setVolume(volume);
  }, [volume]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const progressPercent = ((totalSessionSeconds - secondsRemaining) / totalSessionSeconds) * 100;

  const handleFinishSession = (markTaskDone: boolean) => {
    soundscape.stop();
    setActiveSound('none');
    setIsActive(false);

    const elapsedMins = Math.max(1, Math.round((totalSessionSeconds - secondsRemaining) / 60));
    logCompletedFocus(currentTask?.id, elapsedMins, markTaskDone);

    exitFocusMode();
  };

  const [currentQuote] = useState(() => getRandomFocusQuote(profile.tone || 'friendly'));

  return (
    <div className="focus-fullscreen">
      {/* Top Bar */}
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="badge badge-secondary" style={{ background: 'rgba(67, 198, 181, 0.2)', color: 'var(--color-secondary)' }}>
            ✦ Deep Focus Mode
          </span>
          <select
            value={selectedTaskId || ''}
            onChange={e => startFocusOnTask(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            {tasks
              .filter(t => !t.completed)
              .map(t => (
                <option key={t.id} value={t.id} style={{ background: '#172A3A', color: 'white' }}>
                  {t.title} ({t.pillar || 'LEARN'})
                </option>
              ))}
          </select>
        </div>

        <button
          className="icon-button"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.15)' }}
          onClick={() => {
            soundscape.stop();
            exitFocusMode();
          }}
          title="Exit Focus Mode (Esc)"
        >
          <X size={20} />
        </button>
      </div>

      {/* Center Stage */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px', textAlign: 'center' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-secondary)' }}>
          {currentTask ? currentTask.title : 'DEEP WORK SESSION'}
        </div>

        {/* Large Timer Display */}
        <div className="focus-timer-display">
          {formatTime(secondsRemaining)}
        </div>

        {/* Linear Progress Bar */}
        <div
          style={{
            width: '320px',
            height: '6px',
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            margin: '0 auto',
          }}
        >
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'var(--color-secondary)',
              transition: 'width 1s linear',
            }}
          />
        </div>

        <div className="focus-quote">{currentQuote}</div>

        {/* Timer Presets */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: '25m Pomodoro', val: 25 },
            { label: '45m Deep Focus', val: 45 },
            { label: '60m Intensive', val: 60 },
          ].map(p => (
            <button
              key={p.val}
              className={`sound-option-btn ${totalSessionSeconds === p.val * 60 ? 'active' : ''}`}
              onClick={() => setPreset(p.val)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            className="btn-mint"
            style={{
              padding: '14px 32px',
              fontSize: '1.05rem',
              borderRadius: 'var(--radius-full)',
            }}
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
            <span>{isActive ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            className="btn-secondary"
            style={{
              padding: '14px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255,255,255,0.08)',
              color: '#FFFFFF',
              borderColor: 'rgba(255,255,255,0.15)',
            }}
            onClick={() => {
              setIsActive(false);
              setSecondsRemaining(totalSessionSeconds);
            }}
            title="Reset Timer"
          >
            <RotateCcw size={16} />
          </button>

          {currentTask && (
            <button
              className="btn-secondary"
              style={{
                padding: '14px 22px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(16, 185, 129, 0.2)',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
              }}
              onClick={() => handleFinishSession(true)}
            >
              <CheckCircle2 size={16} />
              <span>Complete Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Ambient Soundscape Picker */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 20px',
          background: 'rgba(255, 255, 255, 0.06)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700 }}>
          AMBIENT SOUND:
        </span>

        <button
          className={`sound-option-btn ${activeSound === 'none' ? 'active' : ''}`}
          onClick={() => setActiveSound('none')}
        >
          Mute
        </button>

        <button
          className={`sound-option-btn ${activeSound === 'rain' ? 'active' : ''}`}
          onClick={() => setActiveSound('rain')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <CloudRain size={13} />
          <span>Lofi Rain</span>
        </button>

        <button
          className={`sound-option-btn ${activeSound === 'binaural' ? 'active' : ''}`}
          onClick={() => setActiveSound('binaural')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <Radio size={13} />
          <span>Alpha Waves</span>
        </button>

        <button
          className={`sound-option-btn ${activeSound === 'whitenoise' ? 'active' : ''}`}
          onClick={() => setActiveSound('whitenoise')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <Wind size={13} />
          <span>Brown Noise</span>
        </button>

        <button
          className={`sound-option-btn ${activeSound === 'stream' ? 'active' : ''}`}
          onClick={() => setActiveSound('stream')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <Waves size={13} />
          <span>Zen Stream</span>
        </button>

        {activeSound !== 'none' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
            <Volume2 size={14} color="#94A3B8" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{ width: '70px', accentColor: 'var(--color-secondary)', cursor: 'pointer' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
