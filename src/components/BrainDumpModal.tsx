import React, { useState } from 'react';
import {
  Sparkles,
  Check,
  RefreshCw,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { extractTasksWithAI } from '../services/aiService';
import { BrainDumpParsedItem, TaskCategory, PriorityLevel, LifePillar } from '../types';

export const BrainDumpModal: React.FC = () => {
  const { isBrainDumpOpen, setIsBrainDumpOpen, batchAddTasks, profile, setActiveTab } = useApp();

  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedItems, setExtractedItems] = useState<BrainDumpParsedItem[]>([]);
  const [extractionSource, setExtractionSource] = useState<'gemini' | 'nlp_engine' | null>(null);

  if (!isBrainDumpOpen) return null;

  const sampleInputs = [
    'I have physics assignment due Friday, math quiz Monday, need to start my web project, buy a notebook, submit the club form tomorrow and I want to go to the gym today.',
    'Review 4 chapters of operating systems for midterm next Wednesday, email professor about recommendation letter by tomorrow, and meal prep tonight.',
    'Finish ML lab report due in 2 days, practice guitar for 30 mins, and meet friends for dinner on Saturday.',
  ];

  const handleOrganize = async () => {
    if (!rawText.trim()) return;

    setIsProcessing(true);
    try {
      const result = await extractTasksWithAI(rawText, profile.geminiApiKey);
      setExtractedItems(result.items);
      setExtractionSource(result.source);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleItemSelection = (id: string) => {
    setExtractedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const updateItemPillar = (id: string, pillar: LifePillar) => {
    setExtractedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, pillar } : item))
    );
  };

  const updateItemPriority = (id: string, priority: PriorityLevel) => {
    setExtractedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, priority } : item))
    );
  };

  const handleAddAllToTasks = () => {
    const selected = extractedItems.filter(i => i.selected);
    if (selected.length > 0) {
      batchAddTasks(selected);
    }

    setIsBrainDumpOpen(false);
    setRawText('');
    setExtractedItems([]);
    setActiveTab('tasks');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-modal-enter" style={{ maxWidth: '740px' }}>
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
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                What's on your mind?
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Dump messy thoughts, deadlines, and life errands. AI will extract structured commitments.
              </p>
            </div>
          </div>
          <button className="icon-button" onClick={() => setIsBrainDumpOpen(false)}>
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          <div>
            <textarea
              className="app-card"
              rows={4}
              placeholder="Tell me everything you need to get done. Don't worry about organizing it..."
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '0.94rem',
                lineHeight: 1.6,
                color: 'var(--text-main)',
                resize: 'vertical',
              }}
            />

            {/* Suggestions */}
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                TRY SAMPLE DUMPS:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {sampleInputs.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="checkin-tag-pill"
                    style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                    onClick={() => setRawText(sample)}
                  >
                    "{sample.slice(0, 42)}..."
                  </button>
                ))}
              </div>
            </div>

            {/* Organize Button */}
            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-mint"
                style={{ padding: '10px 20px' }}
                onClick={handleOrganize}
                disabled={isProcessing || !rawText.trim()}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Extracting Tasks with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>✨ Organize my life</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Extracted Review */}
          {extractedItems.length > 0 && (
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    I found {extractedItems.length} items
                  </h4>
                  <span className="badge badge-secondary">
                    {extractionSource === 'gemini' ? '✦ Gemini 2.5 Flash' : '✦ Smart NLP Engine'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {extractedItems.filter(i => i.selected).length} selected
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {extractedItems.map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: item.selected ? 'var(--bg-app)' : '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <button
                        onClick={() => toggleItemSelection(item.id)}
                        style={{ color: item.selected ? 'var(--color-primary)' : 'var(--text-secondary)' }}
                      >
                        {item.selected ? <CheckSquare size={18} /> : <Square size={18} />}
                      </button>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                          {item.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          <span className={`badge badge-pillar-${(item.pillar || 'LEARN').toLowerCase()}`}>
                            {item.pillar || 'LEARN'}
                          </span>
                          <span>•</span>
                          <span>{item.deadlineDisplay || `Due ${item.deadline}`}</span>
                          <span>•</span>
                          <span>⏱️ {item.estimatedMinutes}m</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <select
                        value={item.pillar || 'LEARN'}
                        onChange={e => updateItemPillar(item.id, e.target.value as LifePillar)}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.72rem',
                          padding: '4px 6px',
                          color: 'var(--text-main)',
                        }}
                      >
                        <option value="LEARN">LEARN</option>
                        <option value="BUILD">BUILD</option>
                        <option value="MOVE">MOVE</option>
                        <option value="CONNECT">CONNECT</option>
                        <option value="EXPLORE">EXPLORE</option>
                        <option value="REST">REST</option>
                      </select>

                      <select
                        value={item.priority}
                        onChange={e => updateItemPriority(item.id, e.target.value as PriorityLevel)}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '0.72rem',
                          padding: '4px 6px',
                          color: 'var(--text-main)',
                        }}
                      >
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={() => setIsBrainDumpOpen(false)}>
            Close
          </button>

          {extractedItems.length > 0 && (
            <button className="btn-primary" onClick={handleAddAllToTasks}>
              <Check size={16} />
              <span>Add {extractedItems.filter(i => i.selected).length} to my commitments</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
