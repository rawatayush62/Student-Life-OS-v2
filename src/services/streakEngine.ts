/**
 * streakEngine.ts — Streak, XP, Achievements, Side Quests, Weekly Review
 */
import { StreakData, XPData, Achievement, AchievementId, SideQuest, WeeklyReview, LifePillar, DailyCheckIn, FocusSession, Task, BalanceDiagnosis, AppTone } from '../types';

export const XP_REWARDS = {
  TASK_COMPLETE: 20,
  TASK_COMPLETE_CRITICAL: 50,
  TASK_COMPLETE_HIGH: 35,
  FOCUS_SESSION_PER_25MIN: 15,
  DAILY_CHECKIN: 25,
  STREAK_BONUS_3: 50,
  STREAK_BONUS_7: 150,
  STREAK_BONUS_14: 400,
  SIDE_QUEST: 30,
} as const;

export const XP_PER_LEVEL = 200;

export function getLevelFromXP(totalXP: number): { level: number; xpToNextLevel: number } {
  const level = Math.floor(totalXP / XP_PER_LEVEL) + 1;
  const xpIntoCurrentLevel = totalXP % XP_PER_LEVEL;
  return { level, xpToNextLevel: XP_PER_LEVEL - xpIntoCurrentLevel };
}

export function getLevelTitle(level: number, tone: AppTone): string {
  const t: Record<AppTone, string[]> = {
    professional: ['Initiate','Analyst','Associate','Senior Associate','Manager','Director','VP','SVP','C-Suite','Legendary'],
    friendly: ['Just Started','Getting Going','On a Roll','Crushing It','In The Zone','Unstoppable','Legend','Mythic','Ascended','GOD MODE'],
    unhinged: ['Rookie Cooked','Slightly Cooked','Medium Rare','Well Done','Extra Crispy','Fully Flame-Grilled','Final Boss','Actually Dangerous','Bro What','TRANSCENDED 💀'],
  };
  return t[tone][Math.min(level - 1, t[tone].length - 1)];
}

export function defaultStreakData(): StreakData {
  return { checkInStreak: 0, focusStreak: 0, taskStreak: 0, lastCheckInDate: '', lastFocusDate: '', lastTaskDate: '', longestCheckInStreak: 0, longestFocusStreak: 0 };
}

export function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split('T')[0];
}

export function defaultXPData(): XPData {
  const monday = getMondayOfWeek(new Date());
  return { totalXP: 0, weeklyXP: 0, weekStart: monday, pillarXP: { LEARN: 0, BUILD: 0, MOVE: 0, CONNECT: 0, EXPLORE: 0, REST: 0 }, level: 1, xpToNextLevel: XP_PER_LEVEL };
}

function isConsecutiveDay(prevDateStr: string, todayStr: string): boolean {
  if (!prevDateStr) return false;
  const diff = (new Date(todayStr).getTime() - new Date(prevDateStr).getTime()) / (1000 * 60 * 60 * 24);
  return Math.round(diff) === 1;
}

export function recalculateStreaks(prev: StreakData, checkIns: DailyCheckIn[], focusSessions: FocusSession[], tasks: Task[]): StreakData {
  const today = new Date().toISOString().split('T')[0];
  const latestCheckIn = [...checkIns].sort((a, b) => b.date.localeCompare(a.date))[0];
  let { checkInStreak, lastCheckInDate, focusStreak, lastFocusDate, taskStreak, lastTaskDate } = prev;

  if (latestCheckIn && latestCheckIn.date !== prev.lastCheckInDate) {
    checkInStreak = (isConsecutiveDay(prev.lastCheckInDate, latestCheckIn.date) || !prev.lastCheckInDate) ? checkInStreak + 1 : 1;
    lastCheckInDate = latestCheckIn.date;
  }

  const latestFocus = [...focusSessions].sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
  const latestFocusDate = latestFocus ? latestFocus.completedAt.split('T')[0] : '';
  if (latestFocusDate && latestFocusDate !== prev.lastFocusDate) {
    focusStreak = (isConsecutiveDay(prev.lastFocusDate, latestFocusDate) || !prev.lastFocusDate) ? focusStreak + 1 : 1;
    lastFocusDate = latestFocusDate;
  }

  const completedToday = tasks.some(t => t.completedAt?.startsWith(today));
  if (completedToday && !prev.lastTaskDate.startsWith(today)) {
    taskStreak = (isConsecutiveDay(prev.lastTaskDate, today) || !prev.lastTaskDate) ? taskStreak + 1 : 1;
    lastTaskDate = today;
  }

  return { checkInStreak, focusStreak, taskStreak, lastCheckInDate, lastFocusDate, lastTaskDate, longestCheckInStreak: Math.max(prev.longestCheckInStreak, checkInStreak), longestFocusStreak: Math.max(prev.longestFocusStreak, focusStreak) };
}

export function awardXP(prev: XPData, amount: number, pillar?: LifePillar): XPData {
  const currentMonday = getMondayOfWeek(new Date());
  const weeklyXP = prev.weekStart === currentMonday ? prev.weeklyXP + amount : amount;
  const totalXP = prev.totalXP + amount;
  const { level, xpToNextLevel } = getLevelFromXP(totalXP);
  const pillarXP = { ...prev.pillarXP };
  if (pillar) pillarXP[pillar] = (pillarXP[pillar] || 0) + amount;
  return { ...prev, totalXP, weeklyXP, weekStart: currentMonday, pillarXP, level, xpToNextLevel };
}

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_checkin',         emoji: '📋', title: 'First Reflection',        description: 'Complete your first daily check-in',                     xpReward: 50  },
  { id: 'first_focus',           emoji: '🎯', title: 'Lock In',                 description: 'Complete your first focus session',                       xpReward: 50  },
  { id: 'first_task',            emoji: '✅', title: 'One Down',                description: 'Complete your first task',                                xpReward: 30  },
  { id: 'streak_3',              emoji: '🔥', title: '3-Day Streak',            description: 'Check in 3 days in a row',                               xpReward: 75  },
  { id: 'streak_7',              emoji: '🔥', title: 'Week Warrior',            description: 'Check in 7 days in a row',                               xpReward: 200 },
  { id: 'streak_14',             emoji: '💀', title: 'Built Different',         description: '14-day check-in streak. Legendary.',                     xpReward: 500 },
  { id: 'balanced_week',         emoji: '⚖️', title: 'Balanced Week',           description: 'Achieve a balance score over 70',                        xpReward: 150 },
  { id: 'social_butterfly',      emoji: '🦋', title: 'Social Butterfly',        description: 'Log social activity in 3 check-ins',                     xpReward: 80  },
  { id: 'focus_warrior',         emoji: '⚔️', title: 'Focus Warrior',           description: 'Complete 10 focus sessions total',                       xpReward: 100 },
  { id: 'pillar_master_learn',   emoji: '🎓', title: 'Academic Weapon',         description: 'Earn 200 XP in the LEARN pillar',                        xpReward: 100 },
  { id: 'pillar_master_move',    emoji: '💪', title: 'Gym Rat',                 description: 'Earn 200 XP in the MOVE pillar',                         xpReward: 100 },
  { id: 'pillar_master_connect', emoji: '🤝', title: 'Social Legend',           description: 'Earn 200 XP in the CONNECT pillar',                     xpReward: 100 },
  { id: 'night_owl',             emoji: '🦉', title: 'Night Owl',               description: 'Complete a focus session after 10 PM',                   xpReward: 40  },
  { id: 'early_bird',            emoji: '🐦', title: 'Early Bird',              description: 'Complete a focus session before 8 AM',                   xpReward: 40  },
  { id: 'xp_100',                emoji: '⭐', title: '100 XP',                 description: 'Earn your first 100 XP',                                 xpReward: 0   },
  { id: 'xp_500',                emoji: '🌟', title: '500 XP Club',            description: 'Earn 500 total XP',                                      xpReward: 50  },
  { id: 'xp_1000',               emoji: '💎', title: '1000 XP Legend',          description: "Earn 1000 total XP. You're actually built different.",   xpReward: 100 },
];

export function defaultAchievements(): Achievement[] {
  return ALL_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false }));
}

export function checkAchievements(prev: Achievement[], xpData: XPData, streakData: StreakData, focusSessions: FocusSession[], tasks: Task[], checkIns: DailyCheckIn[], balanceDiagnosis: BalanceDiagnosis): { achievements: Achievement[]; newlyUnlocked: Achievement[] } {
  const now = new Date().toISOString();
  const newlyUnlocked: Achievement[] = [];
  const completedTasks = tasks.filter(t => t.completed);
  const socialCheckIns = checkIns.filter(c => c.life.length > 0);
  const updated = prev.map(a => {
    if (a.unlocked) return a;
    let should = false;
    switch (a.id) {
      case 'first_checkin':         should = checkIns.length >= 1; break;
      case 'first_focus':           should = focusSessions.length >= 1; break;
      case 'first_task':            should = completedTasks.length >= 1; break;
      case 'streak_3':              should = streakData.checkInStreak >= 3; break;
      case 'streak_7':              should = streakData.checkInStreak >= 7; break;
      case 'streak_14':             should = streakData.checkInStreak >= 14; break;
      case 'balanced_week':         should = balanceDiagnosis.overallScore >= 70; break;
      case 'social_butterfly':      should = socialCheckIns.length >= 3; break;
      case 'focus_warrior':         should = focusSessions.length >= 10; break;
      case 'pillar_master_learn':   should = (xpData.pillarXP['LEARN'] || 0) >= 200; break;
      case 'pillar_master_move':    should = (xpData.pillarXP['MOVE'] || 0) >= 200; break;
      case 'pillar_master_connect': should = (xpData.pillarXP['CONNECT'] || 0) >= 200; break;
      case 'night_owl':             should = focusSessions.some(s => new Date(s.completedAt).getHours() >= 22); break;
      case 'early_bird':            should = focusSessions.some(s => new Date(s.completedAt).getHours() < 8); break;
      case 'xp_100':                should = xpData.totalXP >= 100; break;
      case 'xp_500':                should = xpData.totalXP >= 500; break;
      case 'xp_1000':               should = xpData.totalXP >= 1000; break;
    }
    if (should) { const u = { ...a, unlocked: true, unlockedAt: now }; newlyUnlocked.push(u); return u; }
    return a;
  });
  return { achievements: updated, newlyUnlocked };
}

const SIDE_QUEST_POOL: Omit<SideQuest, 'id' | 'completed' | 'completedAt' | 'expiresAt'>[] = [
  { pillar: 'CONNECT', emoji: '📱', title: 'Text 3 Friends',         description: "Reach out to 3 people you haven't talked to this week.",      xpReward: 30 },
  { pillar: 'CONNECT', emoji: '🍕', title: 'Grab Food With Someone',  description: "Eat a meal with a friend. Don't eat alone today.",           xpReward: 30 },
  { pillar: 'MOVE',    emoji: '🚶', title: '10-Minute Walk',          description: 'Step outside for 10 minutes. Your brain needs this.',        xpReward: 25 },
  { pillar: 'MOVE',    emoji: '🏋️', title: 'Any Workout',            description: 'Any movement counts — gym, yoga, stretch, whatever.',        xpReward: 25 },
  { pillar: 'EXPLORE', emoji: '🎨', title: 'Do Something Creative',   description: 'Spend 20 minutes on any creative activity.',                 xpReward: 30 },
  { pillar: 'EXPLORE', emoji: '📖', title: 'Read Something New',      description: "Read 10 pages of anything that isn't a textbook.",           xpReward: 25 },
  { pillar: 'REST',    emoji: '🧘', title: '5-Minute Breathe',        description: 'Close your eyes, breathe slowly for 5 minutes. No phone.',  xpReward: 20 },
  { pillar: 'REST',    emoji: '🎮', title: 'Play Something',          description: 'Play a game just for fun. No guilt.',                       xpReward: 20 },
  { pillar: 'BUILD',   emoji: '🛠️', title: 'Work on a Side Project',  description: 'Spend 30 minutes on a personal project.',                   xpReward: 35 },
  { pillar: 'LEARN',   emoji: '📝', title: 'Review Your Notes',       description: 'Spend 15 minutes reviewing notes from this week.',          xpReward: 20 },
];

export function generateDailySideQuests(balanceDiagnosis: BalanceDiagnosis, existingQuests: SideQuest[]): SideQuest[] {
  const today = new Date().toISOString().split('T')[0];
  const todaysQuests = existingQuests.filter(q => q.expiresAt === today);
  if (todaysQuests.length >= 3) return existingQuests;
  const entries = Object.entries(balanceDiagnosis.pillarPercentages) as [LifePillar, number][];
  const neglectedPillars = [...entries].sort((a, b) => a[1] - b[1]).slice(0, 3).map(e => e[0]);
  const picked: Omit<SideQuest, 'id' | 'completed' | 'completedAt' | 'expiresAt'>[] = [];
  for (const pillar of neglectedPillars) {
    const pool = SIDE_QUEST_POOL.filter(q => q.pillar === pillar);
    if (pool.length) picked.push(pool[Math.floor(Math.random() * pool.length)]);
    if (picked.length >= 3) break;
  }
  while (picked.length < 3) {
    const r = SIDE_QUEST_POOL[Math.floor(Math.random() * SIDE_QUEST_POOL.length)];
    if (!picked.find(p => p.title === r.title)) picked.push(r);
  }
  const newQuests: SideQuest[] = picked.slice(0, 3).map((q, i) => ({ ...q, id: `sq-${today}-${i}`, completed: false, expiresAt: today }));
  return [...existingQuests.filter(q => q.expiresAt < today), ...newQuests];
}

export function generateWeeklyReview(tasks: Task[], focusSessions: FocusSession[], checkIns: DailyCheckIn[], xpData: XPData, balanceDiagnosis: BalanceDiagnosis, tone: AppTone): WeeklyReview {
  const monday = getMondayOfWeek(new Date());
  const sun = new Date(monday); sun.setDate(sun.getDate() + 6);
  const weekEnd = sun.toISOString().split('T')[0];
  const completedTasks = tasks.filter(t => t.completed && t.completedAt && t.completedAt >= monday);
  const weekFocus = focusSessions.filter(s => s.completedAt >= monday);
  const weekCheckIns = checkIns.filter(c => c.date >= monday && c.date <= weekEnd);
  const focusMinutes = weekFocus.reduce((a, s) => a + s.durationMinutes, 0);
  const { pillarHours } = balanceDiagnosis;
  const sortedPillars = (Object.entries(pillarHours) as [LifePillar, number][]).sort((a, b) => b[1] - a[1]);
  const topPillar = sortedPillars[0]?.[0] ?? 'LEARN';
  const neglectedPillar = sortedPillars[sortedPillars.length - 1]?.[0] ?? 'REST';
  const fh = (focusMinutes / 60).toFixed(1);
  const msgs: Record<AppTone, string> = {
    professional: `You completed ${completedTasks.length} tasks and logged ${fh}h of focused work this week. Your strongest pillar was ${topPillar}. ${neglectedPillar} needs more attention next week.`,
    friendly: `Nice week! ${completedTasks.length} tasks done, ${weekCheckIns.length} check-ins, ${fh}h of focus. ${topPillar} is your MVP this week 💪 Give ${neglectedPillar} some love next week!`,
    unhinged: `${completedTasks.length} tasks and ${fh}h of focus?? ${topPillar} is literally eating. But ${neglectedPillar} is starving on the floor. Fix it 💀`,
  };
  const headlines: Record<AppTone, string[]> = {
    professional: ['Needs Improvement', 'Solid Progress', 'Strong Performance', 'Exceptional Output'],
    friendly: ['Keep Going! 💪', 'Nice Work! 🙌', 'Great Week ✨', 'Incredible Week 🔥'],
    unhinged: ['You Survived 💀', 'Not Bad Fr', 'Built Different Week 🔥', 'GOATED Week 👑'],
  };
  const headline = headlines[tone][Math.min(Math.floor(completedTasks.length / 2), 3)];
  return { weekStart: monday, weekEnd, pillarHours, tasksCompleted: completedTasks.length, focusMinutes, checkInsCompleted: weekCheckIns.length, xpEarned: xpData.weeklyXP, balanceScore: balanceDiagnosis.overallScore, headline, aiMessage: msgs[tone], topPillar, neglectedPillar };
}

export function generateCheckInResponse(checkIn: Omit<DailyCheckIn, 'id' | 'date'>, streakData: StreakData, tone: AppTone): string {
  const didGym = checkIn.body.some(b => b.toLowerCase().includes('gym') || b.toLowerCase().includes('workout'));
  const didSocial = checkIn.life.length > 0;
  const didStudy = checkIn.academics.length > 0;
  const streak = streakData.checkInStreak;
  if (tone === 'professional') {
    const parts = [];
    if (didStudy && didGym) parts.push('Excellent balance — academic and physical activity in the same day is the optimal pattern.');
    else if (didStudy) parts.push('Solid academic day. Consider adding physical activity tomorrow.');
    else if (didGym) parts.push('Good recovery focus. Schedule academic work for tomorrow.');
    if (streak > 1) parts.push(`${streak}-day streak maintained. Consistency is your strongest asset.`);
    return parts.join(' ') || 'Reflection logged. See you tomorrow.';
  }
  if (tone === 'friendly') {
    const parts = [];
    if (didStudy && didGym) parts.push('You studied AND worked out? That is a seriously good day 💪');
    else if (didStudy) parts.push('Solid academics today! Add some movement tomorrow.');
    else if (didGym) parts.push('Great gym day! Balance it with some study time tomorrow.');
    if (didSocial) parts.push('Spent time with people too — love that.');
    if (streak >= 3) parts.push(`${streak}-day streak going strong 🔥`);
    return parts.join(' ') || 'Good day. Rest up and come back stronger tomorrow!';
  }
  const parts = [];
  if (didStudy && didGym) parts.push('Bro studied AND went to the gym?? Who are you??');
  else if (didStudy && checkIn.mood <= 2) parts.push('Studied even when cooked? Actually W behavior.');
  else if (didStudy) parts.push('Academic weapon behavior detected.');
  else if (didGym) parts.push('Gym day but no studying. Gains for the body, debt for the brain.');
  else if (checkIn.mood <= 2) parts.push('Cooked day recognized. Recovery arc incoming.');
  else parts.push('You checked in. Already more than most people.');
  if (streak >= 7) parts.push(`${streak}-day streak. Actual menace. 💀`);
  else if (streak >= 3) parts.push(`${streak} days straight. Do not stop now fr.`);
  return parts.join(' ');
}