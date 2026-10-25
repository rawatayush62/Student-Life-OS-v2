import {
  LifePillar,
  Task,
  ScheduleBlock,
  FocusSession,
  DailyCheckIn,
  UserProfile,
  BalanceDiagnosis,
  FreeTimeSuggestion,
  AppTone,
} from '../types';

export function calculateLifeBalance(
  tasks: Task[],
  scheduleBlocks: ScheduleBlock[],
  focusSessions: FocusSession[],
  checkIns: DailyCheckIn[],
  profile: UserProfile
): BalanceDiagnosis {
  // Compute hours per pillar
  const pillarHours: Record<LifePillar, number> = {
    LEARN: 0,
    BUILD: 0,
    MOVE: 0,
    CONNECT: 0,
    EXPLORE: 0,
    REST: 0,
  };

  // 1. From Schedule Blocks
  scheduleBlocks.forEach(block => {
    const [sh, sm] = block.startTime.split(':').map(Number);
    const [eh, em] = block.endTime.split(':').map(Number);
    const durationHours = Math.max(0.5, (eh * 60 + em - (sh * 60 + sm)) / 60);

    if (block.pillar) {
      pillarHours[block.pillar] += durationHours;
    } else if (block.type === 'class') {
      pillarHours.LEARN += durationHours;
    } else if (block.type === 'study') {
      pillarHours.LEARN += durationHours;
    } else if (block.type === 'personal') {
      pillarHours.MOVE += durationHours;
    } else if (block.type === 'break') {
      pillarHours.REST += durationHours;
    }
  });

  // 2. From Focus Sessions
  focusSessions.forEach(session => {
    const hours = session.durationMinutes / 60;
    if (session.pillar) {
      pillarHours[session.pillar] += hours;
    } else {
      pillarHours.LEARN += hours;
    }
  });

  // 3. From Daily Check-Ins
  checkIns.forEach(checkIn => {
    if (checkIn.body.some(b => b.includes('Gym') || b.includes('workout') || b.includes('Walk') || b.includes('lifted') || b.includes('grass'))) {
      pillarHours.MOVE += 1.0;
    }
    if (checkIn.body.some(b => b.includes('Slept well') || b.includes('corpse'))) {
      pillarHours.REST += 1.5;
    }
    if (checkIn.life.some(l => l.includes('friends') || l.includes('human') || l.includes('Ate with friends'))) {
      pillarHours.CONNECT += 2.0;
    }
    if (checkIn.life.some(l => l.includes('hobby') || l.includes('fun') || l.includes('nothing'))) {
      pillarHours.EXPLORE += 1.5;
    }
  });

  // Base calibration so fresh accounts have realistic week context (e.g. 24h learn, 10h build, 2h move, 1h connect, 2h explore, 8h rest)
  if (pillarHours.LEARN === 0) pillarHours.LEARN = 22;
  if (pillarHours.BUILD === 0) pillarHours.BUILD = 12;
  if (pillarHours.MOVE === 0) pillarHours.MOVE = 2;
  if (pillarHours.CONNECT === 0) pillarHours.CONNECT = 1.5;
  if (pillarHours.EXPLORE === 0) pillarHours.EXPLORE = 2;
  if (pillarHours.REST === 0) pillarHours.REST = 7;

  const totalHours = Object.values(pillarHours).reduce((a, b) => a + b, 0);

  const pillarPercentages: Record<LifePillar, number> = {
    LEARN: Math.round((pillarHours.LEARN / totalHours) * 100),
    BUILD: Math.round((pillarHours.BUILD / totalHours) * 100),
    MOVE: Math.round((pillarHours.MOVE / totalHours) * 100),
    CONNECT: Math.round((pillarHours.CONNECT / totalHours) * 100),
    EXPLORE: Math.round((pillarHours.EXPLORE / totalHours) * 100),
    REST: Math.round((pillarHours.REST / totalHours) * 100),
  };

  const academicHours = Math.round(pillarHours.LEARN + pillarHours.BUILD);
  const movementHours = Math.round(pillarHours.MOVE);
  const socialHours = Math.round(pillarHours.CONNECT);
  const restHours = Math.round(pillarHours.REST);

  let status: BalanceDiagnosis['status'] = 'Balanced';
  let overallScore = 75;
  let headline = 'Healthy Life Balance';
  let detailedAnalysis = `You have logged ${academicHours}h across academics & projects, ${movementHours}h on movement, and ${socialHours}h connecting with others.`;
  let recommendation = 'Your week has a solid foundation. Continue balancing deep work with active recovery.';

  if (academicHours >= 30 && socialHours <= 2 && movementHours <= 3) {
    status = 'Academic Heavy';
    overallScore = 58;
    headline = 'Academic Heavy — Social & Body Deficit';
    detailedAnalysis = `You have spent ${academicHours} hours this week on coursework and coding (LEARN · BUILD), but almost no time on exercise, social activities, or hobbies.`;
    recommendation = `Keep tonight's priority study blocks, but protect Saturday evening for something social. You're already on track academically.`;
  } else if (academicHours >= 40 && restHours < 5) {
    status = 'Burnout Risk';
    overallScore = 48;
    headline = 'High Workload Fatigue Alert';
    detailedAnalysis = `Over ${academicHours}h logged with minimal downtime. Cognitive stamina diminishes without deliberate rest.`;
    recommendation = `Schedule a mandatory 2-hour disconnect block tonight. Avoid cramming past 10 PM.`;
  } else if (movementHours < 2) {
    status = 'Need Movement';
    overallScore = 65;
    headline = 'Low Physical Movement';
    detailedAnalysis = `You have logged less than 2 hours of movement this week.`;
    recommendation = `Insert a 45-min workout or outdoor walk before your evening study session.`;
  }

  return {
    overallScore,
    status,
    headline,
    detailedAnalysis,
    recommendation,
    pillarHours,
    pillarPercentages,
  };
}

export function generateContextAwareFreeTimeOptions(
  diagnosis: BalanceDiagnosis,
  freeHours: number = 3,
  tone: AppTone = 'friendly'
): FreeTimeSuggestion[] {
  const isUnhinged = tone === 'unhinged';
  const suggestions: FreeTimeSuggestion[] = [];

  // Option 1: Reset / Body
  suggestions.push({
    id: 'opt-reset',
    optionNumber: 1,
    pillar: 'MOVE',
    type: 'Reset',
    icon: isUnhinged ? '🌱' : '🏋️',
    title: isUnhinged ? 'Maybe touch some grass?' : 'Physical Reset',
    why: isUnhinged
      ? 'Bro has been sitting for 6 days straight 💀 Chair has permanent imprint.'
      : 'You missed gym sessions earlier this week. A quick workout restores focus and energy.',
    suggestedAction: isUnhinged
      ? '🏋️ Gym workout, 🚶 30-min walk, or ⚽ Kick a ball outside'
      : '45–60 min workout at the Student Rec Center or an outdoor jog.',
    estimatedMinutes: 60,
  });

  // Option 2: Recharge / Rest
  suggestions.push({
    id: 'opt-recharge',
    optionNumber: 2,
    pillar: 'REST',
    type: 'Recharge',
    icon: isUnhinged ? '🍿' : '🎬',
    title: isUnhinged ? 'Guilt-free Bed Rot Arc' : 'Mental Recharge',
    why: isUnhinged
      ? "Bro's brain is fried from 38 hours of coding. Sleep or watch something."
      : "You've had a heavy academic week with multiple deadlines. Pure downtime prevents burnout.",
    suggestedAction: isUnhinged
      ? '🍿 Movie night, 🍕 Grab takeout, or 🎮 Gaming session with no alarms set'
      : 'Movie night, relaxed reading, or guilt-free casual gaming.',
    estimatedMinutes: 120,
  });

  // Option 3: Connect / Social
  suggestions.push({
    id: 'opt-connect',
    optionNumber: 3,
    pillar: 'CONNECT',
    type: 'Connect',
    icon: isUnhinged ? '👥' : '🍕',
    title: isUnhinged ? 'Prove you are still alive' : 'Social Connection',
    why: isUnhinged
      ? "💀 Bro, your friends haven't seen you since Monday. They think you moved away."
      : "You haven't logged social activities with friends this week. Relationships need dedicated time.",
    suggestedAction: isUnhinged
      ? '👥 Meet a friend, 🎮 Play something together, or 🍕 Grab food somewhere'
      : 'Meet friends for dinner, coffee, or try a new campus hangout spot.',
    estimatedMinutes: 90,
  });

  // Option 4: Explore / Hobbies
  suggestions.push({
    id: 'opt-explore',
    optionNumber: 4,
    pillar: 'EXPLORE',
    type: 'Explore',
    icon: '🎸',
    title: isUnhinged ? 'Do a human hobby' : 'Creative Exploration',
    why: isUnhinged
      ? 'Studying and scrolling TikTok are not hobbies bestie.'
      : 'Nurturing non-academic hobbies fuels lateral thinking and long-term fulfillment.',
    suggestedAction: isUnhinged
      ? '🎸 Play an instrument, 🎨 Draw something, or 🚶 Walk with a podcast'
      : 'Practice an instrument, sketch, or take an evening photo walk.',
    estimatedMinutes: 60,
  });

  return suggestions.slice(0, 3);
}
