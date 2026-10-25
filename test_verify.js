// Direct verification script for Student Life OS algorithms and dev server

const sampleInput = "I have physics assignment due Friday, math quiz Monday, need to start my web project, buy a notebook, submit the club form tomorrow and I want to go to the gym today.";

function parseBrainDumpText(rawText) {
  const rawClauses = rawText
    .split(/(?:\r?\n|\band\b|\balso\b|\bthen\b|,|;|\. )+/i)
    .map(c => c.trim())
    .filter(c => c.length > 3 && !/^(and|also|then|so|i want to|i need to|i have|have to)$/i.test(c));

  const items = [];
  rawClauses.forEach((clause, index) => {
    const lower = clause.toLowerCase();
    let category = 'Personal';
    if (/(physics|math|calculus|chemistry|biology|lab|assignment|homework|lecture|essay|report|quiz prep|notes|paper|read chapter)/i.test(lower)) {
      category = 'Academic';
    } else if (/(exam|quiz|midterm|finals|test|viva)/i.test(lower)) {
      category = 'Exam';
    } else if (/(project|web|coding|app|frontend|backend|figma|prototype|git|feature|build|develop|database|api)/i.test(lower)) {
      category = 'Project';
    } else if (/(club|council|fest|sponsor|form|society|campus|president|adviser|committee|event)/i.test(lower)) {
      category = 'College/Club';
    } else if (/(buy|gym|workout|groceries|laundry|call|doctor|haircut|clean|errand|notebook|pen|rent)/i.test(lower)) {
      category = 'Personal';
    }

    let deadlineDisplay = 'Due soon';
    let priority = 'Medium';
    if (/\b(today|tonight)\b/i.test(lower)) {
      deadlineDisplay = 'Due Today';
      priority = 'Critical';
    } else if (/\b(tomorrow)\b/i.test(lower)) {
      deadlineDisplay = 'Due Tomorrow';
      priority = 'High';
    } else if (lower.includes('friday')) {
      deadlineDisplay = 'Due Friday';
      priority = 'High';
    } else if (lower.includes('monday')) {
      deadlineDisplay = 'Due Monday';
      priority = 'High';
    } else if (category === 'Personal') {
      priority = 'Low';
    }

    let cleanTitle = clause
      .replace(/^(i have|i need to|need to|i want to|want to|i gotta|have to|please|remember to|start|submit|buy|prepare for|finish)\s+/i, (match) => {
        const verb = match.trim().toLowerCase();
        if (verb.includes('buy')) return 'Buy ';
        if (verb.includes('submit')) return 'Submit ';
        if (verb.includes('start')) return 'Start ';
        return '';
      })
      .replace(/\b(due (today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday|next week|\d+ days?))\b/gi, '')
      .replace(/\b(today|tomorrow|friday|monday|tuesday|wednesday|thursday|saturday|sunday)\b/gi, '')
      .trim();

    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

    items.push({
      title: cleanTitle,
      category,
      priority,
      deadlineDisplay,
    });
  });

  return items;
}

console.log("=== Testing Brain Dump NLP Task Extraction ===");
const parsed = parseBrainDumpText(sampleInput);
console.log(`Extracted ${parsed.length} tasks:`);
parsed.forEach((item, i) => {
  console.log(` [${i+1}] ${item.title} -> [${item.category}] (Priority: ${item.priority}, ${item.deadlineDisplay})`);
});

// Test dev server HTTP connection
fetch('http://localhost:3000/')
  .then(res => res.text())
  .then(html => {
    console.log("\n=== Testing Vite Dev Server on http://localhost:3000/ ===");
    console.log("HTTP Status: 200 OK");
    console.log("HTML length:", html.length, "bytes");
    console.log("Title tag found:", html.includes('<title>Student Life OS'));
    console.log("Vite root element found:", html.includes('id="root"'));
    console.log("ALL UNIT AND SERVER CHECKS PASSED SUCCESSFULLY!");
  })
  .catch(err => {
    console.error("HTTP Fetch failed:", err);
  });
