import { AppTone, LifePillar } from '../types';

// ──────────────────────────────────────────────
// TONE-AWARE MESSAGE ENGINE
// Central place for all personality-driven text.
// Professional = data-driven | Friendly = warm | Unhinged = Gen-Z meme
// ──────────────────────────────────────────────

type ToneMap = Record<AppTone, string>;

// Helper to pick the right tone string
export function tone(map: ToneMap, t: AppTone): string {
  return map[t] ?? map.friendly;
}

// ── Daily Check-in Prompts ──────────────────────
export const checkInMainPrompt: ToneMap = {
  professional: 'Daily Reflection Log',
  friendly: '🌙 How was your day?',
  unhinged: '💀 How cooked are you today?',
};

export const checkInSubtitle: ToneMap = {
  professional: 'Record your activity across academic, health, and life dimensions.',
  friendly: 'Tell me what you got up to — academics, body, life.',
  unhinged: "be honest. no cap. no one's judging (i am a little).",
};

// ── Mood Options ─────────────────────────────────
export type MoodOption = { rating: number; emoji: string; label: string };

export const moodOptions: Record<AppTone, MoodOption[]> = {
  professional: [
    { rating: 1, emoji: '😞', label: 'Very Poor' },
    { rating: 2, emoji: '😐', label: 'Below Average' },
    { rating: 3, emoji: '🙂', label: 'Satisfactory' },
    { rating: 4, emoji: '😄', label: 'Good' },
    { rating: 5, emoji: '🤩', label: 'Excellent' },
  ],
  friendly: [
    { rating: 1, emoji: '😞', label: 'Rough' },
    { rating: 2, emoji: '😐', label: 'Okay' },
    { rating: 3, emoji: '🙂', label: 'Good' },
    { rating: 4, emoji: '😄', label: 'Great' },
    { rating: 5, emoji: '🤩', label: 'Amazing' },
  ],
  unhinged: [
    { rating: 1, emoji: '💀', label: 'Absolutely cooked' },
    { rating: 2, emoji: '🥲', label: 'Struggling' },
    { rating: 3, emoji: '😐', label: 'Meh' },
    { rating: 4, emoji: '🗿', label: 'Fine' },
    { rating: 5, emoji: '🔥', label: 'Ate and left no crumbs' },
  ],
};

// ── Academic Check-in Options ────────────────────
export const academicOptions: Record<AppTone, string[]> = {
  professional: [
    'Attended scheduled lectures',
    'Completed assignments',
    'Worked on a project',
    'Self-study session',
  ],
  friendly: [
    'Studied',
    'Worked on a project',
    'Completed important tasks',
    'Attended all classes',
  ],
  unhinged: [
    '🧠 Academic weapon (actually studied)',
    '🙂 Doing alright (sort of)',
    '🫠 Barely surviving (vibed with the slides)',
    '💀 It\'s over (Netflix won)',
  ],
};

// ── Body Check-in Options ────────────────────────
export const bodyOptions: Record<AppTone, string[]> = {
  professional: [
    'Completed workout session',
    'Outdoor/walking activity',
    'Adequate sleep (7+ hrs)',
    'Nutritious meals',
  ],
  friendly: [
    'Gym / workout',
    'Walk / outdoor activity',
    'Slept well (7+ hrs)',
    'Healthy meals',
  ],
  unhinged: [
    '🏋️ Touched grass AND lifted',
    '🚶 Went outside (rare W)',
    '😴 Slept like a corpse (good)',
    '🥡 Ate something that wasn\'t instant noodles',
  ],
};

// ── Life / Social Check-in Options ───────────────
export const lifeOptions: Record<AppTone, string[]> = {
  professional: [
    'Social engagement with peers',
    'Hobby or creative activity',
    'Recreational activity',
    'Mindfulness / rest',
  ],
  friendly: [
    'Spent time with friends',
    'Worked on a hobby',
    'Did something just for fun',
    'Relaxed downtime',
  ],
  unhinged: [
    '👥 Touched a human being (social)',
    '🎸 Did something for fun (not studying)',
    '🍕 Ate with friends / went somewhere',
    '🛌 Did absolutely nothing (rest arc)',
  ],
};

// ── Section Labels ───────────────────────────────
export const academicLabel: ToneMap = {
  professional: '📊 Academic & Cognitive',
  friendly: '📚 Academics & Focus',
  unhinged: '📚 Academic Situation Report',
};

export const bodyLabel: ToneMap = {
  professional: '🏃 Physical Health',
  friendly: '🏋️ Body & Health',
  unhinged: '💪 Did You Move Your Body Today',
};

export const lifeLabel: ToneMap = {
  professional: '👥 Social & Life Quality',
  friendly: '👥 Life, Social & Fun',
  unhinged: '🗿 Life Outside The Library',
};

// ── Balance Diagnosis Headlines ───────────────────
export function getDiagnosisHeadline(status: string, t: AppTone): string {
  const map: Record<string, ToneMap> = {
    'Balanced': {
      professional: 'Life Balance: Optimal Distribution Detected',
      friendly: 'Your week looks well-balanced! 🎉',
      unhinged: 'Somehow you\'re not failing at life 🗿 respect.',
    },
    'Academic Heavy': {
      professional: 'Academic Overload: LEARN pillar exceeds healthy threshold.',
      friendly: 'You\'ve been studying a lot — make sure to rest!',
      unhinged: '💀 Bro is cooked. Been studying since Monday and forgot to eat.',
    },
    'Burnout Risk': {
      professional: 'Warning: Burnout probability elevated. Immediate deload recommended.',
      friendly: 'You\'re running at 100% too long — slow down this weekend.',
      unhinged: '🥲 You\'re literally cooked. Touch grass. Log off. Sleep. Please.',
    },
    'Need Movement': {
      professional: 'Physical Activity Deficit: MOVE pillar below recommended threshold.',
      friendly: 'Your body needs some movement — try a quick workout!',
      unhinged: 'bro has not left the chair in 4 days 💀 go touch grass.',
    },
    'Social Deficit': {
      professional: 'Social Engagement Gap: CONNECT & EXPLORE pillars underweighted.',
      friendly: 'Your friends miss you! Make time for some social activities.',
      unhinged: '💀 Bro, your friends haven\'t seen you since Monday. Concerning.',
    },
  };
  return (map[status] ?? map['Balanced'])[t];
}

// ── Free Time Advisor Context ─────────────────────
export function getFreeTimeContext(pillar: LifePillar, t: AppTone): string {
  const map: Record<LifePillar, ToneMap> = {
    LEARN: {
      professional: 'Suggested based on your academic progress this week.',
      friendly: 'You\'ve been on track academically — keep the momentum.',
      unhinged: 'Nerd arc activated. Hit the books (I guess).',
    },
    BUILD: {
      professional: 'Career development gap identified. Portfolio activity recommended.',
      friendly: 'Good time to work on your projects or portfolio!',
      unhinged: 'Side project? That portfolio isn\'t going to build itself bestie.',
    },
    MOVE: {
      professional: 'Physical activity below weekly target. Exercise session recommended.',
      friendly: 'You missed a couple of gym sessions — let\'s get moving!',
      unhinged: '💀 You haven\'t moved since Thursday. Your chair has a dent.',
    },
    CONNECT: {
      professional: 'Social engagement hours below recommended weekly threshold.',
      friendly: 'You haven\'t hung out with friends much this week.',
      unhinged: '💀 Bro, your friends think you moved away. Call someone.',
    },
    EXPLORE: {
      professional: 'Recreational and hobby time significantly underutilized.',
      friendly: 'You deserve some fun time — try a hobby or explore something new!',
      unhinged: 'You\'ve been studying and sleeping and nothing else. Tragic.',
    },
    REST: {
      professional: 'Recovery time insufficient. Rest session strongly recommended.',
      friendly: 'You\'ve had a heavy week — it\'s okay to just relax.',
      unhinged: 'bro needs to literally do nothing for 2 hours. doctor\'s orders.',
    },
  };
  return map[pillar][t];
}

// ── Focus Mode Quotes ─────────────────────────────
export const focusQuotes: Record<AppTone, string[]> = {
  professional: [
    'Deep focus in progress. Eliminate all distractions.',
    'Small deliberate work blocks lead to significant academic outcomes.',
    'Mastery requires sustained, undivided attention.',
    'Protect this session. Your future self will benefit.',
  ],
  friendly: [
    'You\'ve got this — one task at a time!',
    'Stay focused and you\'ll be done before you know it.',
    'Progress over perfection. Keep going!',
    'You\'re doing great — just stay in the zone.',
  ],
  unhinged: [
    'bro is actually studying rn. unbelievable. respect.',
    'no cap this is the most productive you\'ve been all week.',
    'don\'t open Twitter. I know you want to. don\'t.',
    'the assignment isn\'t going to finish itself bestie.',
  ],
};

export function getRandomFocusQuote(t: AppTone): string {
  const list = focusQuotes[t];
  return list[Math.floor(Math.random() * list.length)];
}
