import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Task,
  ScheduleBlock,
  FocusSession,
  UserProfile,
  DailyCheckIn,
  BrainDumpParsedItem,
  AIRecommendation,
  BalanceDiagnosis,
  AppTheme,
} from '../types';
import { initialProfile, initialTasks, initialScheduleBlocks, initialCheckIns } from '../utils/seedData';
import { generateAIRecommendation } from '../services/prioritizationEngine';
import { calculateLifeBalance } from '../services/balanceEngine';

interface AppContextType {
  tasks: Task[];
  scheduleBlocks: ScheduleBlock[];
  focusSessions: FocusSession[];
  checkIns: DailyCheckIn[];
  profile: UserProfile;
  activeTab: 'dashboard' | 'tasks' | 'calendar' | 'focus' | 'settings';
  theme: AppTheme;
  isDarkMode: boolean;
  
  // Modals
  isBrainDumpOpen: boolean;
  isScheduleGeneratorOpen: boolean;
  isSettingsOpen: boolean;
  isOnboardingOpen: boolean;
  isCheckInOpen: boolean;
  isFreeTimeAdvisorOpen: boolean;

  activeFocusTask: Task | null;
  aiRecommendation: AIRecommendation;
  balanceDiagnosis: BalanceDiagnosis;
  adaptiveNotice: { title: string; message: string; actionText?: string; onAction?: () => void } | null;

  // Actions
  setActiveTab: (tab: 'dashboard' | 'tasks' | 'calendar' | 'focus' | 'settings') => void;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  toggleDarkMode: () => void;
  setIsBrainDumpOpen: (open: boolean) => void;
  setIsScheduleGeneratorOpen: (open: boolean) => void;
  setIsSettingsOpen: (open: boolean) => void;
  setIsOnboardingOpen: (open: boolean) => void;
  setIsCheckInOpen: (open: boolean) => void;
  setIsFreeTimeAdvisorOpen: (open: boolean) => void;
  setAdaptiveNotice: (notice: { title: string; message: string; actionText?: string; onAction?: () => void } | null) => void;
  
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'priorityScore'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  updateTaskProgress: (id: string, progress: number) => void;
  batchAddTasks: (items: BrainDumpParsedItem[]) => void;

  addScheduleBlock: (block: Omit<ScheduleBlock, 'id'>) => void;
  deleteScheduleBlock: (id: string) => void;
  batchAddScheduleBlocks: (blocks: ScheduleBlock[]) => void;
  
  addCheckIn: (checkIn: Omit<DailyCheckIn, 'id' | 'date'>) => void;

  startFocusOnTask: (taskId?: string) => void;
  exitFocusMode: () => void;
  logCompletedFocus: (taskId: string | undefined, durationMinutes: number, taskFinished: boolean) => void;

  updateProfile: (updates: Partial<UserProfile>) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('student_life_os_tasks');
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>(() => {
    try {
      const saved = localStorage.getItem('student_life_os_blocks');
      return saved ? JSON.parse(saved) : initialScheduleBlocks;
    } catch {
      return initialScheduleBlocks;
    }
  });

  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    try {
      const saved = localStorage.getItem('student_life_os_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(() => {
    try {
      const saved = localStorage.getItem('student_life_os_checkins');
      return saved ? JSON.parse(saved) : initialCheckIns;
    } catch {
      return initialCheckIns;
    }
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('student_life_os_profile');
      return saved ? JSON.parse(saved) : initialProfile;
    } catch {
      return initialProfile;
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'calendar' | 'focus' | 'settings'>('dashboard');
  const [isBrainDumpOpen, setIsBrainDumpOpen] = useState(false);
  const [isScheduleGeneratorOpen, setIsScheduleGeneratorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isFreeTimeAdvisorOpen, setIsFreeTimeAdvisorOpen] = useState(false);

  const [theme, setThemeState] = useState<AppTheme>(() => {
    const savedTheme = localStorage.getItem('student_life_os_theme') as AppTheme | null;
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'funky') return savedTheme;
    const savedDark = localStorage.getItem('student_life_os_darkmode');
    return savedDark === 'true' ? 'dark' : 'light';
  });

  const isDarkMode = theme === 'dark';

  // Apply theme attribute to <html> immediately and on change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('student_life_os_theme', theme);
    localStorage.setItem('student_life_os_darkmode', String(theme === 'dark'));
  }, [theme]);

  const setTheme = (t: AppTheme) => setThemeState(t);

  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'funky';
      return 'light';
    });
  };

  const toggleDarkMode = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(null);
  const [adaptiveNotice, setAdaptiveNotice] = useState<{ title: string; message: string; actionText?: string; onAction?: () => void } | null>(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('student_life_os_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('student_life_os_blocks', JSON.stringify(scheduleBlocks));
  }, [scheduleBlocks]);

  useEffect(() => {
    localStorage.setItem('student_life_os_sessions', JSON.stringify(focusSessions));
  }, [focusSessions]);

  useEffect(() => {
    localStorage.setItem('student_life_os_checkins', JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem('student_life_os_profile', JSON.stringify(profile));
  }, [profile]);

  const activeFocusTask = tasks.find(t => t.id === activeFocusTaskId) || null;
  const aiRecommendation = generateAIRecommendation(tasks);
  const balanceDiagnosis = calculateLifeBalance(tasks, scheduleBlocks, focusSessions, checkIns, profile);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'priorityScore'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      priorityScore: 70,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          return {
            ...t,
            completed: nextCompleted,
            progress: nextCompleted ? 100 : t.progress === 100 ? 0 : t.progress,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const updateTaskProgress = (id: string, progress: number) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const clamped = Math.max(0, Math.min(100, progress));
          const completed = clamped === 100;
          return {
            ...t,
            progress: clamped,
            completed,
            completedAt: completed ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const batchAddTasks = (items: BrainDumpParsedItem[]) => {
    const newTasks: Task[] = items
      .filter(item => item.selected)
      .map(item => ({
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: item.title,
        description: item.reasoning || '',
        category: item.category,
        pillar: item.pillar || 'LEARN',
        priority: item.priority,
        deadline: item.deadline,
        estimatedMinutes: item.estimatedMinutes,
        completed: false,
        progress: 0,
        priorityScore: item.priority === 'Critical' ? 90 : item.priority === 'High' ? 75 : 50,
        tags: [item.category, item.pillar || 'LEARN'],
        createdAt: new Date().toISOString(),
        source: 'brain_dump',
      }));

    if (newTasks.length > 0) {
      setTasks(prev => [...newTasks, ...prev]);
    }
  };

  const addScheduleBlock = (blockData: Omit<ScheduleBlock, 'id'>) => {
    const newBlock: ScheduleBlock = {
      ...blockData,
      id: `block-${Date.now()}`,
    };
    setScheduleBlocks(prev => [...prev, newBlock]);
  };

  const deleteScheduleBlock = (id: string) => {
    setScheduleBlocks(prev => prev.filter(b => b.id !== id));
  };

  const batchAddScheduleBlocks = (blocks: ScheduleBlock[]) => {
    setScheduleBlocks(prev => [...prev, ...blocks]);
  };

  const addCheckIn = (checkInData: Omit<DailyCheckIn, 'id' | 'date'>) => {
    const newCheckIn: DailyCheckIn = {
      ...checkInData,
      id: `checkin-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setCheckIns(prev => [newCheckIn, ...prev]);
  };

  const startFocusOnTask = (taskId?: string) => {
    if (taskId) {
      setActiveFocusTaskId(taskId);
    } else {
      const top = tasks.find(t => !t.completed);
      setActiveFocusTaskId(top ? top.id : null);
    }
    setActiveTab('focus');
  };

  const exitFocusMode = () => {
    setActiveFocusTaskId(null);
    setActiveTab('dashboard');
  };

  const logCompletedFocus = (taskId: string | undefined, durationMinutes: number, taskFinished: boolean) => {
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        let newProgress = taskFinished ? 100 : Math.min(95, (task.progress || 0) + Math.round((durationMinutes / (task.estimatedMinutes || 60)) * 100));
        updateTaskProgress(taskId, newProgress);

        const session: FocusSession = {
          id: `session-${Date.now()}`,
          taskId: task.id,
          taskTitle: task.title,
          category: task.category,
          pillar: task.pillar || 'LEARN',
          durationMinutes,
          completedAt: new Date().toISOString(),
        };
        setFocusSessions(prev => [session, ...prev]);

        if (!taskFinished && durationMinutes < (task.estimatedMinutes || 60) * 0.75) {
          setAdaptiveNotice({
            title: 'Schedule Drift Detected',
            message: `You spent ${durationMinutes} mins on "${task.title}". AI recommends shifting later non-critical study blocks to protect your evening personal rest.`,
            actionText: 'Auto-Rebalance Schedule',
            onAction: () => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              const tomorrowIso = tomorrow.toISOString().split('T')[0];
              const today = new Date().toISOString().split('T')[0];
              setScheduleBlocks(prev =>
                prev.map(b => (b.date === today && b.type === 'study' && b.taskId !== taskId ? { ...b, date: tomorrowIso } : b))
              );
              setAdaptiveNotice(null);
            },
          });
        }
      }
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const resetToDefaults = () => {
    setTasks(initialTasks);
    setScheduleBlocks(initialScheduleBlocks);
    setFocusSessions([]);
    setCheckIns(initialCheckIns);
    setProfile(initialProfile);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        tasks,
        scheduleBlocks,
        focusSessions,
        checkIns,
        profile,
        activeTab,
        theme,
        isDarkMode,
        isBrainDumpOpen,
        isScheduleGeneratorOpen,
        isSettingsOpen,
        isOnboardingOpen,
        isCheckInOpen,
        isFreeTimeAdvisorOpen,
        activeFocusTask,
        aiRecommendation,
        balanceDiagnosis,
        adaptiveNotice,
        setActiveTab,
        setTheme,
        toggleTheme,
        toggleDarkMode,
        setIsBrainDumpOpen,
        setIsScheduleGeneratorOpen,
        setIsSettingsOpen,
        setIsOnboardingOpen,
        setIsCheckInOpen,
        setIsFreeTimeAdvisorOpen,
        setAdaptiveNotice,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        updateTaskProgress,
        batchAddTasks,
        addScheduleBlock,
        deleteScheduleBlock,
        batchAddScheduleBlocks,
        addCheckIn,
        startFocusOnTask,
        exitFocusMode,
        logCompletedFocus,
        updateProfile,
        resetToDefaults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
