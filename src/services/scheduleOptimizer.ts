import { Task, ScheduleBlock } from '../types';
import { calculatePriorityScore } from './prioritizationEngine';

export interface GeneratedScheduleResult {
  blocks: ScheduleBlock[];
  summary: string;
  totalStudyMinutes: number;
}

export function generateTonightSchedule(
  tasks: Task[],
  existingBlocks: ScheduleBlock[],
  freeHours: number = 3,
  startHour: number = 18,
  dateIso?: string
): GeneratedScheduleResult {
  const targetDate = dateIso || new Date().toISOString().split('T')[0];

  // Prioritize active tasks by dynamic score
  const sortedTasks = tasks
    .filter(t => !t.completed)
    .map(t => ({
      task: t,
      ...calculatePriorityScore(t),
    }))
    .sort((a, b) => b.score - a.score);

  if (sortedTasks.length === 0) {
    return {
      blocks: [],
      summary: 'No pending tasks to schedule. You are completely caught up!',
      totalStudyMinutes: 0,
    };
  }

  const generatedBlocks: ScheduleBlock[] = [];
  let currentMinutes = startHour * 60; // e.g. 18 * 60 = 1080 (18:00)
  const totalAvailableMinutes = freeHours * 60;
  let remainingBudget = totalAvailableMinutes;

  let taskIndex = 0;

  while (remainingBudget >= 30 && taskIndex < sortedTasks.length) {
    const current = sortedTasks[taskIndex];
    // Work chunk: 45 min or remaining task requirement
    const taskNeededMinutes = Math.max(30, (current.task.estimatedMinutes * (100 - (current.task.progress || 0))) / 100);
    const sessionChunk = Math.min(taskNeededMinutes > 60 ? 45 : Math.round(taskNeededMinutes), remainingBudget);

    if (sessionChunk < 20) break;

    const startH = Math.floor(currentMinutes / 60);
    const startM = currentMinutes % 60;
    const endTotal = currentMinutes + sessionChunk;
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;

    const startTimeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;
    const endTimeStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

    generatedBlocks.push({
      id: `ai-block-${Date.now()}-${generatedBlocks.length}`,
      title: `${current.task.title} (Focus Block)`,
      type: 'study',
      pillar: current.task.pillar || 'LEARN',
      startTime: startTimeStr,
      endTime: endTimeStr,
      date: targetDate,
      taskId: current.task.id,
      isAiGenerated: true,
      notes: `AI-prioritized focus chunk for ${current.task.category} (${current.level} Priority)`,
    });

    currentMinutes += sessionChunk;
    remainingBudget -= sessionChunk;

    // Insert 15m break if we still have >= 45m left
    if (remainingBudget >= 45) {
      const breakStartH = Math.floor(currentMinutes / 60);
      const breakStartM = currentMinutes % 60;
      const breakEndTotal = currentMinutes + 15;
      const breakEndH = Math.floor(breakEndTotal / 60);
      const breakEndM = breakEndTotal % 60;

      generatedBlocks.push({
        id: `ai-break-${Date.now()}-${generatedBlocks.length}`,
        title: 'Recharge & Hydrate Break',
        type: 'break',
        pillar: 'REST' as const,
        startTime: `${String(breakStartH).padStart(2, '0')}:${String(breakStartM).padStart(2, '0')}`,
        endTime: `${String(breakEndH).padStart(2, '0')}:${String(breakEndM).padStart(2, '0')}`,
        date: targetDate,
        isAiGenerated: true,
        notes: 'Step away from the screen, stretch, and drink water.',
      });

      currentMinutes += 15;
      remainingBudget -= 15;
    }

    // Move to next task or loop if high-priority needs another chunk
    if (taskNeededMinutes > 60 && remainingBudget >= 45) {
      // High-risk task takes another session
    } else {
      taskIndex++;
    }
  }

  const studyBlocks = generatedBlocks.filter(b => b.type === 'study');
  const totalStudyMinutes = studyBlocks.length * 45;

  const topTaskTitle = sortedTasks[0]?.task.title || 'Tasks';
  const summary = `Allocated ${totalAvailableMinutes / 60} hours into ${studyBlocks.length} deep focus sessions and restorative breaks, prioritizing ${topTaskTitle}.`;

  return {
    blocks: generatedBlocks,
    summary,
    totalStudyMinutes,
  };
}

export interface AdaptiveRebalanceProposal {
  message: string;
  affectedTaskTitle: string;
  shiftedTaskTitle?: string;
  updatedBlocks: ScheduleBlock[];
}

export function computeAdaptiveRebalance(
  currentBlocks: ScheduleBlock[],
  incompleteTaskId: string,
  actualMinutesCompleted: number,
  plannedMinutes: number,
  allTasks: Task[]
): AdaptiveRebalanceProposal {
  const currentTask = allTasks.find(t => t.id === incompleteTaskId);
  const taskName = currentTask ? currentTask.title : 'Current Task';

  const deficit = Math.max(15, plannedMinutes - actualMinutesCompleted);

  // Find subsequent study blocks for today
  const today = new Date().toISOString().split('T')[0];
  const todayStudyBlocks = currentBlocks.filter(b => b.date === today && b.type === 'study' && b.taskId !== incompleteTaskId && !b.completed);

  if (todayStudyBlocks.length > 0) {
    const shiftedBlock = todayStudyBlocks[todayStudyBlocks.length - 1];
    
    // Shift the last block to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIso = tomorrow.toISOString().split('T')[0];

    const updatedBlocks = currentBlocks.map(b => {
      if (b.id === shiftedBlock.id) {
        return {
          ...b,
          date: tomorrowIso,
          notes: `(Auto-rescheduled by AI) Shifted from yesterday to maintain focus balance.`,
        };
      }
      return b;
    });

    return {
      message: `You completed ${actualMinutesCompleted}m of ${taskName} (planned ${plannedMinutes}m). I've moved "${shiftedBlock.title}" to tomorrow and extended your study buffer to keep you on track.`,
      affectedTaskTitle: taskName,
      shiftedTaskTitle: shiftedBlock.title,
      updatedBlocks,
    };
  }

  return {
    message: `You completed ${actualMinutesCompleted}m of ${taskName}. We have adjusted your remaining study targets for tonight.`,
    affectedTaskTitle: taskName,
    updatedBlocks: currentBlocks,
  };
}
