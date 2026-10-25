export type LifePillar = 'LEARN' | 'BUILD' | 'MOVE' | 'CONNECT' | 'EXPLORE' | 'REST';

export type TaskCategory = 'Academic' | 'Personal' | 'College/Club' | 'Project' | 'Exam';

export type PriorityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  pillar: LifePillar; // LEARN, BUILD, MOVE, CONNECT, EXPLORE, REST
  priority: PriorityLevel;
  deadline: string; // YYYY-MM-DD
  estimatedMinutes: number;
  completed: boolean;
  progress: number; // 0 to 100
  priorityScore: number; // 0 to 100
  tags: string[];
  subtasks?: Subtask[];
  createdAt: string;
  source?: 'manual' | 'brain_dump' | 'ai_schedule';
  completedAt?: string;
}

export type BlockType = 'class' | 'assignment' | 'study' | 'break' | 'personal' | 'social' | 'fitness' | 'hobby';

export interface ScheduleBlock {
  id: string;
  title: string;
  type: BlockType;
  pillar: LifePillar;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  date: string;      // YYYY-MM-DD
  taskId?: string;
  location?: string;
  completed?: boolean;
  isAiGenerated?: boolean;
  notes?: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  taskTitle: string;
  category?: TaskCategory;
  pillar: LifePillar;
  durationMinutes: number;
  completedAt: string;
  soundscape?: string;
}

// Themes
export type AppTheme = 'light' | 'dark' | 'funky';

// 3-Layer Student Setup
export type AppTone = 'professional' | 'friendly' | 'unhinged';

export interface UserProfile {
  // Layer 1: Essential
  name: string;
  ageOrYear: string;
  branch: string;
  careerGoal: string;
  typicalSchedule: string;
  majorCommitments: string;
  
  // Layer 2: Lifestyle ("Things I want more of")
  lifestyleDesires: string[]; // ['fitness', 'hobbies', 'socializing', 'travel', 'learning', 'entertainment', 'rest', 'career']

  // Layer 3: Preferences ("What kind of suggestions do you like?")
  suggestionPreferences: string[]; // ['calm', 'active', 'social', 'productive', 'creative', 'spontaneous']

  // Layer 4: Tone
  tone: AppTone; // 'professional' | 'friendly' | 'unhinged'

  geminiApiKey: string;
  preferredFocusDuration: number;
  dailyStudyGoalMinutes: number;
  isOnboarded: boolean;
}

export interface DailyCheckIn {
  id: string;
  date: string; // YYYY-MM-DD
  academics: string[]; // e.g. ['Studied', 'Worked on a project', 'Completed important tasks']
  body: string[];      // e.g. ['Gym / workout', 'Walk / outdoor activity', 'Slept well']
  life: string[];      // e.g. ['Spent time with friends', 'Worked on a hobby', 'Did something just for fun']
  mood: number;        // 1 (😞) to 5 (🤩)
  energy: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface FreeTimeSuggestion {
  id: string;
  optionNumber: number;
  pillar: LifePillar;
  type: 'Reset' | 'Recharge' | 'Connect' | 'Build' | 'Explore' | 'Rest';
  icon: string;
  title: string;
  why: string;
  suggestedAction: string;
  estimatedMinutes: number;
}

export interface BalanceDiagnosis {
  overallScore: number; // 0 to 100
  status: 'Balanced' | 'Academic Heavy' | 'Burnout Risk' | 'Need Movement' | 'Social Deficit';
  headline: string;
  detailedAnalysis: string;
  recommendation: string;
  pillarHours: Record<LifePillar, number>;
  pillarPercentages: Record<LifePillar, number>;
}

export interface BrainDumpParsedItem {
  id: string;
  title: string;
  category: TaskCategory;
  pillar: LifePillar;
  priority: PriorityLevel;
  deadline: string;
  deadlineDisplay: string;
  estimatedMinutes: number;
  selected: boolean;
  reasoning?: string;
}

export interface AIRecommendation {
  id: string;
  type: 'urgent_risk' | 'balance_alert' | 'free_time_opportunity' | 'streak_boost';
  title: string;
  message: string;
  actionText: string;
  taskId?: string;
  urgency: 'critical' | 'high' | 'info';
  actionType: 'start_focus' | 'open_free_time' | 'open_check_in' | 'open_brain_dump';
}

// ──┠Streak & XP System ──────────────────────────────────────────────────────┊
export interface StreakData {
  checkInStreak: number;        // consecutive days with a check-in
  focusStreak: number;          // consecutive days with a focus session
  taskStreak: number;           // consecutive days completing at least 1 task
  lastCheckInDate: string;      // YYYY-MM-DD
  lastFocusDate: string;        // YYYY-MM-DD
  lastTaskDate: string;         // YYYY-MM-DD
  longestCheckInStreak: number;
  longestFocusStreak: number;
}

export interface XPData {
  totalXP: number;
  weeklyXP: number;
  weekStart: string;            // YYYY-MM-DD (Monday of current week)
  pillarXP: Record<LifePillar, number>;
  level: number;                // derived from totalXP
  xpToNextLevel: number;
}

export type AchievementId =
  | 'first_checkin'
  | 'first_focus'
  | 'first_task'
  | 'streak_3'
  | 'streak_7'
  | 'streak_14'
  | 'balanced_week'
  | 'social_butterfly'
  | 'focus_warrior'
  | 'pillar_master_learn'
  | 'pillar_master_move'
  | 'pillar_master_connect'
  | 'night_owl'
  | 'early_bird'
  | 'xp_100'
  | 'xp_500'
  | 'xp_1000';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  unlockedAt?: string;         // ISO datetime if unlocked
  unlocked: boolean;
}

// ──┠Side Quest System ───────────────────────────────────────────────────────┊
export interface SideQuest {
  id: string;
  pillar: LifePillar;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  completedAt?: string;
  completed: boolean;
  expiresAt: string;            // YYYY-MM-DD †quests reset daily
}

// ──┠Weekly Review ───────────────────────────────────────────────────────────┊
export interface WeeklyReview {
  weekStart: string;            // YYYY-MM-DD (Monday)
  weekEnd: string;              // YYYY-MM-DD (Sunday)
  pillarHours: Record<LifePillar, number>;
  tasksCompleted: number;
  focusMinutes: number;
  checkInsCompleted: number;
  xpEarned: number;
  balanceScore: number;
  headline: string;
  aiMessage: string;
  topPillar: LifePillar;
  neglectedPillar: LifePillar;
}
