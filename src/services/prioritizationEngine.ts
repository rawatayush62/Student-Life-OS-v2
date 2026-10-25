import { Task, AIRecommendation } from '../types';

export function calculatePriorityScore(task: Task): { score: number; level: 'Critical' | 'High' | 'Medium' | 'Low' } {
  if (task.completed) {
    return { score: 0, level: 'Low' };
  }

  const now = new Date();
  const deadlineDate = new Date(task.deadline);
  // Set time to end of deadline day if no time specified
  if (task.deadline.length === 10) {
    deadlineDate.setHours(23, 59, 59);
  }

  const hoursRemaining = Math.max(1, (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  const daysRemaining = hoursRemaining / 24;

  // 1. Urgency Component (0 - 45 pts)
  let urgencyScore = 0;
  if (daysRemaining <= 0.5) urgencyScore = 45;
  else if (daysRemaining <= 1.2) urgencyScore = 40;
  else if (daysRemaining <= 2.2) urgencyScore = 32;
  else if (daysRemaining <= 4.0) urgencyScore = 22;
  else if (daysRemaining <= 7.0) urgencyScore = 14;
  else urgencyScore = 6;

  // 2. Importance / Category Component (0 - 25 pts)
  let importanceScore = 10;
  if (task.priority === 'Critical') importanceScore = 25;
  else if (task.priority === 'High') importanceScore = 20;
  else if (task.priority === 'Medium') importanceScore = 12;
  else importanceScore = 5;

  if (task.category === 'Exam') importanceScore += 5;
  if (task.category === 'Academic') importanceScore += 3;

  // 3. Workload Incompletion Component (0 - 20 pts)
  const remainingWorkMinutes = (task.estimatedMinutes * (100 - (task.progress || 0))) / 100;
  const progressDeficit = (100 - (task.progress || 0)) / 100; // 0 to 1
  const workloadScore = progressDeficit * 15 + Math.min(5, (remainingWorkMinutes / 60) * 2);

  // 4. Overdue Penalty (0 - 10 pts)
  let overduePenalty = 0;
  if (deadlineDate.getTime() < now.getTime()) {
    overduePenalty = 10;
  }

  const totalScore = Math.min(100, Math.round(urgencyScore + importanceScore + workloadScore + overduePenalty));

  let level: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
  if (totalScore >= 85) level = 'Critical';
  else if (totalScore >= 65) level = 'High';
  else if (totalScore >= 45) level = 'Medium';
  else level = 'Low';

  return { score: totalScore, level };
}

export function generateAIRecommendation(tasks: Task[]): AIRecommendation {
  const activeTasks = tasks
    .filter(t => !t.completed)
    .map(t => ({
      task: t,
      ...calculatePriorityScore(t),
    }))
    .sort((a, b) => b.score - a.score);

  if (activeTasks.length === 0) {
    return {
      id: 'rec-all-clear',
      type: 'streak_boost',
      title: 'All caught up!',
      message: 'You have cleared all urgent assignments. Great time to dump new thoughts or schedule light review.',
      actionText: 'Brain Dump Ideas',
      urgency: 'info',
      actionType: 'open_brain_dump',
    };
  }

  const highestRisk = activeTasks[0];

  if (highestRisk.score >= 80) {
    return {
      id: `rec-${highestRisk.task.id}`,
      type: 'urgent_risk',
      title: 'Highest-Risk Assignment Detected',
      message: `Your ${highestRisk.task.title} is currently your highest-risk task (Progress: ${highestRisk.task.progress || 0}%).`,
      actionText: 'Start 45 min Focus Session',
      taskId: highestRisk.task.id,
      urgency: 'critical',
      actionType: 'start_focus',
    };
  }

  return {
    id: `rec-${highestRisk.task.id}`,
    type: 'urgent_risk',
    title: 'Top Priority Focus',
    message: `We recommend focusing on "${highestRisk.task.title}" next to stay ahead of upcoming deadlines.`,
    actionText: 'Start 45 min Focus Session',
    taskId: highestRisk.task.id,
    urgency: 'high',
    actionType: 'start_focus',
  };
}
