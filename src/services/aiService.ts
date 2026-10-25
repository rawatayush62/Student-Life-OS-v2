import { BrainDumpParsedItem } from '../types';
import { parseBrainDumpText } from './nlpParser';

export async function extractTasksWithAI(
  rawText: string,
  apiKey?: string
): Promise<{ items: BrainDumpParsedItem[]; source: 'gemini' | 'nlp_engine' }> {
  if (!apiKey || !apiKey.trim()) {
    // Zero-config offline NLP parsing
    const items = parseBrainDumpText(rawText);
    return { items, source: 'nlp_engine' };
  }

  try {
    const prompt = `You are the AI engine for Student Life OS. Analyze this student brain dump and extract all individual tasks and events into structured JSON.
Current Date: ${new Date().toISOString().split('T')[0]} (Day of week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}).

Raw Student Text:
"""
${rawText}
"""

Return JSON in this format:
{
  "tasks": [
    {
      "title": "Clean, concise task name",
      "category": "Academic" | "Personal" | "College/Club" | "Project" | "Exam",
      "priority": "Critical" | "High" | "Medium" | "Low",
      "deadline": "YYYY-MM-DD",
      "deadlineDisplay": "e.g. Due Tomorrow, Due Monday",
      "estimatedMinutes": number (estimated time in minutes, e.g. 45, 90, 120),
      "reasoning": "Brief explanation of urgency and categorization"
    }
  ]
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!res.ok) {
      console.warn('Gemini API request failed, falling back to local NLP engine:', res.statusText);
      return { items: parseBrainDumpText(rawText), source: 'nlp_engine' };
    }

    const data = await res.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      return { items: parseBrainDumpText(rawText), source: 'nlp_engine' };
    }

    const parsed = JSON.parse(responseText);
    if (parsed.tasks && Array.isArray(parsed.tasks)) {
      const items: BrainDumpParsedItem[] = parsed.tasks.map((t: Record<string, unknown>, i: number) => ({
        id: `gemini-${Date.now()}-${i}`,
        title: (t.title as string) || 'Untitled Task',
        category: (t.category as string) || 'Personal',
        priority: (t.priority as string) || 'Medium',
        deadline: (t.deadline as string) || new Date().toISOString().split('T')[0],
        deadlineDisplay: (t.deadlineDisplay as string) || 'Upcoming',
        estimatedMinutes: Number(t.estimatedMinutes) || 45,
        selected: true,
        reasoning: (t.reasoning as string) || 'Extracted with Gemini AI',
      }));
      return { items, source: 'gemini' };
    }

    return { items: parseBrainDumpText(rawText), source: 'nlp_engine' };
  } catch (err) {
    console.warn('Error connecting to Gemini API, falling back to NLP engine:', err);
    return { items: parseBrainDumpText(rawText), source: 'nlp_engine' };
  }
}
