import { BrainDumpParsedItem, TaskCategory, PriorityLevel, LifePillar } from '../types';

export function parseBrainDumpText(rawText: string): BrainDumpParsedItem[] {
  if (!rawText || !rawText.trim()) return [];

  const rawClauses = rawText
    .split(/(?:\r?\n|\band\b|\balso\b|\bthen\b|,|;|\. )+/i)
    .map(c => c.trim())
    .filter(c => c.length > 3 && !/^(and|also|then|so|i want to|i need to|i have|have to)$/i.test(c));

  const items: BrainDumpParsedItem[] = [];

  rawClauses.forEach((clause, index) => {
    const item = parseSingleClause(clause, index);
    if (item) {
      items.push(item);
    }
  });

  return items;
}

function parseSingleClause(clause: string, index: number): BrainDumpParsedItem | null {
  const lower = clause.toLowerCase();

  // 1. Identify Category & Life Pillar (LEARN, BUILD, MOVE, CONNECT, EXPLORE, REST)
  let category: TaskCategory = 'Personal';
  let pillar: LifePillar = 'REST';

  if (/(physics|math|calculus|chemistry|biology|lab|assignment|homework|lecture|essay|report|quiz prep|notes|paper|read chapter)/i.test(lower)) {
    category = 'Academic';
    pillar = 'LEARN';
  } else if (/(exam|quiz|midterm|finals|test|viva)/i.test(lower)) {
    category = 'Exam';
    pillar = 'LEARN';
  } else if (/(project|web|coding|app|frontend|backend|figma|prototype|git|feature|build|develop|database|api)/i.test(lower)) {
    category = 'Project';
    pillar = 'BUILD';
  } else if (/(club|council|fest|sponsor|form|society|campus|president|adviser|committee|event|friends|meet|dinner|party|call)/i.test(lower)) {
    category = 'College/Club';
    pillar = 'CONNECT';
  } else if (/(gym|workout|exercise|run|jog|walk|swim|sports|football|basketball)/i.test(lower)) {
    category = 'Personal';
    pillar = 'MOVE';
  } else if (/(guitar|music|paint|draw|read book|hobby|travel|trip|explore|movie|game)/i.test(lower)) {
    category = 'Personal';
    pillar = 'EXPLORE';
  } else if (/(buy|groceries|laundry|doctor|haircut|clean|errand|notebook|pen|rent)/i.test(lower)) {
    category = 'Personal';
    pillar = 'REST';
  }

  // 2. Identify Deadline & Target Date
  const today = new Date();
  let deadlineOffsetDays = 3;
  let deadlineDisplay = 'Due in a few days';

  if (/\b(today|tonight)\b/i.test(lower)) {
    deadlineOffsetDays = 0;
    deadlineDisplay = 'Due Today';
  } else if (/\b(tomorrow)\b/i.test(lower)) {
    deadlineOffsetDays = 1;
    deadlineDisplay = 'Due Tomorrow';
  } else if (/\b(in (\d+) days?)\b/i.test(lower)) {
    const match = lower.match(/\b(in (\d+) days?)\b/i);
    if (match && match[2]) {
      deadlineOffsetDays = parseInt(match[2], 10);
      deadlineDisplay = `Due in ${deadlineOffsetDays} days`;
    }
  } else {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let d = 0; d < days.length; d++) {
      if (lower.includes(days[d])) {
        const currentDayIndex = today.getDay();
        let targetDayIndex = d;
        let diff = (targetDayIndex - currentDayIndex + 7) % 7;
        if (diff === 0) diff = 7;
        deadlineOffsetDays = diff;
        deadlineDisplay = `Due ${days[d].charAt(0).toUpperCase() + days[d].slice(1)}`;
        break;
      }
    }
  }

  const targetDate = new Date();
  targetDate.setDate(today.getDate() + deadlineOffsetDays);
  const deadlineIso = targetDate.toISOString().split('T')[0];

  // 3. Identify Priority
  let priority: PriorityLevel = 'Medium';
  if (deadlineOffsetDays <= 1 || /(urgent|asap|crucial|critical|high priority|important|must)/i.test(lower)) {
    priority = deadlineOffsetDays === 0 ? 'Critical' : 'High';
  } else if (category === 'Exam' || category === 'Academic' || deadlineOffsetDays <= 3) {
    priority = 'High';
  } else if (category === 'Personal' && deadlineOffsetDays > 1) {
    priority = 'Low';
  }

  // 4. Estimate Time
  let estimatedMinutes = 45;
  const timeMatch = lower.match(/(\d+(?:\.\d+)?)\s*(h|hr|hours?|m|min|mins|minutes?)/i);
  if (timeMatch) {
    const val = parseFloat(timeMatch[1]);
    const unit = timeMatch[2].toLowerCase();
    if (unit.startsWith('h')) {
      estimatedMinutes = Math.round(val * 60);
    } else {
      estimatedMinutes = Math.round(val);
    }
  } else {
    if (category === 'Academic') estimatedMinutes = 90;
    else if (category === 'Project') estimatedMinutes = 120;
    else if (category === 'Exam') estimatedMinutes = 60;
    else if (category === 'College/Club') estimatedMinutes = 30;
    else estimatedMinutes = 30;
  }

  // 5. Clean up title
  let cleanTitle = clause
    .replace(/^(i have|i need to|need to|i want to|want to|i gotta|have to|please|remember to|start|submit|buy|prepare for|finish)\s+/i, (match) => {
      const verb = match.trim().toLowerCase();
      if (verb.includes('buy')) return 'Buy ';
      if (verb.includes('submit')) return 'Submit ';
      if (verb.includes('start')) return 'Start ';
      if (verb.includes('prepare')) return 'Prepare for ';
      if (verb.includes('finish')) return 'Finish ';
      return '';
    })
    .replace(/\b(due (today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday|next week|\d+ days?))\b/gi, '')
    .replace(/\b(today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday)\b/gi, '')
    .trim();

  if (cleanTitle) {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
  } else {
    cleanTitle = clause.charAt(0).toUpperCase() + clause.slice(1);
  }

  return {
    id: `parsed-${Date.now()}-${index}`,
    title: cleanTitle,
    category,
    pillar,
    priority,
    deadline: deadlineIso,
    deadlineDisplay,
    estimatedMinutes,
    selected: true,
    reasoning: `Categorized as ${pillar} (${category}) with ${priority} priority based on ${deadlineDisplay.toLowerCase()}.`,
  };
}
