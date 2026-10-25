🎓 Student-Life OS
Don't just optimize your productivity. Optimize your life.

Student-Life OS is an intelligent student life-management platform designed to help engineering students balance academics, projects, fitness, relationships, hobbies, exploration, and rest. Instead of turning your life into an endless task list, it looks at the bigger picture and helps answer a more useful question:

"Given everything going on in my life right now, what should I actually do next?"

Student-Life OS Dashboard

✨ Built around 6 Life Pillars
📚 Learn · 🛠️ Build · 🏃 Move · 👥 Connect · 🌎 Explore · 😴 Rest

Student-Life OS combines task management, scheduling, daily check-ins, life-balance analysis, contextual recommendations, and AI-assisted planning into one student-focused system.

💻 [Repository](https://github.com/rawatayush62/Student-Life-OS-v2) · See Getting Started to run it locally.

🚀 Why Student-Life OS?
Engineering students constantly switch between:

📚 Classes and academics
💻 Coding and personal projects
📝 Assignments and deadlines
🏋️ Health and fitness
👥 Friends and social life
🎸 Hobbies and interests
😴 Rest and recovery
Most productivity tools optimize for getting more work done. Student-Life OS is designed to optimize for using your limited time well. The goal isn't to maximize the number of tasks completed — it's to help students make progress without sacrificing everything else.

✨ Core Features
🧠 Brain Dump
Instead of manually creating every task, students can simply describe everything on their mind:

"I have a physics assignment due Friday, need to finish my web project, submit the club form tomorrow, and I want to go to the gym today."

Student-Life OS extracts individual commitments and determines title, category, priority, deadline, estimated effort, and reasoning — using either:

Offline NLP Engine — works without an external API
Gemini AI — optional integration for deeper extraction and reasoning, with automatic fallback to the local engine if unavailable
📅 Intelligent Schedule Generation
Transforms pending commitments into a focused schedule by prioritizing unfinished tasks, considering priority and estimated effort, creating focused work blocks, inserting restorative breaks, and working within a defined time budget. The objective isn't to fill every minute — it's to create a schedule realistic enough to actually follow.

⚖️ Life Balance Engine
Evaluates time across six life pillars:

Pillar	Purpose
📚 LEARN	Classes, studying and academics
🛠️ BUILD	Projects, coding and creation
🏃 MOVE	Exercise and physical activity
👥 CONNECT	Friends and social relationships
🌎 EXPLORE	Hobbies, interests and experiences
😴 REST	Recovery and downtime
The engine turns these signals into a diagnosis (🟢 Balanced, 🟡 Academic Heavy, 🔴 Burnout Risk, 🏃 Need Movement, 👥 Social Deficit) and actionable recommendations — not just statistics.

🌱 Context-Aware Free-Time Advisor
Recommends activities based on current balance — physical activity, mental recharge, social time, creative hobbies, exploration, or rest — adapted to the user's preferred communication tone.

🔄 Adaptive Rebalancing
Plans rarely survive contact with reality. If a student falls behind during a focus session, the system identifies remaining work and shifts subsequent commitments to maintain a realistic plan, rather than forcing adherence to the original schedule.

🎯 Focus Mode
A dedicated, distraction-free environment for individual tasks. Focus sessions feed into the overall balance analysis.

📝 Daily Check-In
Students record how their day is going across academics, physical activity, life outside academics, mood, energy, and notes — another input into the balance engine.

🗣️ Adaptive Personality
Student-Life OS isn't limited to sterile productivity notifications. Users choose how the system communicates:

Mode	Personality
🎓 Professional	Direct and structured
🙂 Friendly	Casual and encouraging
💀 Unhinged	Gen-Z / meme-driven
🎨 Personalization
Themes: ☀️ Light · 🌙 Dark · 🪩 Funky
Tones: Professional, Friendly, Unhinged
🧩 How It Works
                  ┌───────────────────┐
                  │   Student Input   │
                  └─────────┬─────────┘
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        Brain Dump      Daily Check-In   Tasks
             │              │              │
             ▼              ▼              ▼
        NLP / Gemini    User Signals   Priorities
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                 ┌─────────────────────┐
                 │  Student-Life OS    │
                 │      Engines        │
                 └──────────┬──────────┘
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
    Schedule Engine   Balance Engine   Recommendations
          │                 │                 │
          └─────────────────┼─────────────────┘
                            ▼
                  ┌───────────────────┐
                  │  Student's Plan   │
                  └───────────────────┘
The application combines deterministic local logic with optional AI assistance, so the core experience never depends entirely on an external AI service.

🛠️ Tech Stack
Frontend

React 18, TypeScript, Vite, CSS, Lucide React
Application Logic

Custom NLP task parser
Task prioritization engine
Schedule optimization engine
Life-balance analysis engine
Adaptive schedule rebalancing
Context-aware recommendation engine
Optional AI

Google Gemini API (Gemini 2.5 Flash)
Browser APIs / Utilities

localStorage for client-side persistence
Keyboard event handling
Canvas Confetti
Custom sound synthesis
🏗️ Project Structure
Student-Life-OS/
│
├── src/
│   ├── components/
│   │   ├── BalanceWidget.tsx
│   │   ├── BrainDumpModal.tsx
│   │   ├── CalendarView.tsx
│   │   ├── DailyCheckInModal.tsx
│   │   ├── Dashboard.tsx
│   │   ├── FocusMode.tsx
│   │   ├── FreeTimeAdvisorModal.tsx
│   │   ├── OnboardingModal.tsx
│   │   ├── ScheduleGeneratorModal.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── Sidebar.tsx
│   │   └── TaskManager.tsx
│   │
│   ├── context/
│   │   └── AppContext.tsx
│   │
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── balanceEngine.ts
│   │   ├── nlpParser.ts
│   │   ├── prioritizationEngine.ts
│   │   └── scheduleOptimizer.ts
│   │
│   ├── styles/
│   │   ├── components.css
│   │   ├── main.css
│   │   └── theme.css
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   └── utils/
│       ├── seedData.ts
│       ├── soundSynthesizer.ts
│       └── toneMessages.ts
│
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
🚀 Getting Started
Prerequisites
Node.js
npm
1. Clone the repository
git clone https://github.com/rawatayush62/Student-Life-OS.git
cd Student-Life-OS
2. Install dependencies
npm install
3. Start the development server
npm run dev
Open the local Vite URL displayed in your terminal.

4. Build for production
npm run build
5. Preview the production build
npm run preview
🤖 Gemini AI Integration
Gemini integration is optional. Student-Life OS includes a local NLP engine so Brain Dump works without an external API.

With a Gemini API key:

Brain Dump → Gemini API → Structured Tasks
Without an API key (or if unavailable):

Brain Dump → Local NLP Engine → Structured Tasks
⚠️ Security note: API keys should never be committed to source control.

💾 Data Persistence
Student-Life OS currently uses browser localStorage for client-side persistence, storing tasks, schedule blocks, focus sessions, daily check-ins, user profile, and theme preferences — no backend database required to maintain state between sessions.

⌨️ Keyboard Shortcuts
Shortcut	Action
Ctrl/Cmd + K	Open Brain Dump
Esc	Close active modal / exit Focus Mode
🧠 Design Philosophy
Productivity ≠ More Work — a system that pushes constant work isn't necessarily helping.
Suggestions > Commands — the app should help students decide, not dictate.
Three Good Options > Twenty Recommendations — avoid overwhelming choice.
Plans Should Adapt — real life changes, and a useful schedule needs to respond.
Students Are More Than Their Tasks — academics are only one part of a student's life.
📸 Screenshots
Dashboard — Life Balance	Free Time Rescue
Dashboard	Free Time Rescue
Priority Queue & Today's Schedule	AI Schedule Generator
Priority Queue	AI Scheduler
Weekly Calendar	Focus Mode
Schedule	Focus Mode
Tasks — Kanban View	Tasks — Priority List
Tasks Kanban	Tasks List
Personalized Onboarding	Settings & Tone
Onboarding	Settings
🎥 Product Flow
Onboarding → Brain Dump → Task Extraction → Schedule Generation
→ Focus Session → Daily Check-In → Life Balance → Free-Time Recommendation
🧪 Verification
The repository includes a basic verification script covering Brain Dump NLP extraction, development server connectivity, root element detection, and application title verification.

node test_verify.js
🔮 Roadmap
Near Term

Improve mobile responsiveness
Add richer task analytics
Improve schedule conflict detection
Add more personalization options
Add better empty states and onboarding guidance
Expand automated testing
Future

Backend persistence
User authentication
Cross-device synchronization
Calendar integrations
Notification/reminder system
More advanced adaptive scheduling
Historical balance analytics
AI-powered long-term planning
🎯 What I Learned
Building Student-Life OS involved:

Designing a product around a real user problem
Building a component-based React application
Managing application state with React Context
Writing TypeScript interfaces for complex application data
Designing deterministic recommendation logic
Implementing task prioritization and a scheduling algorithm
Working with natural-language input
Integrating an external AI API and designing graceful fallbacks
Persisting application state in the browser
Building multiple UI themes and tones for different user personalities
AI should enhance the product, not become a single point of failure.

👨‍💻 Author
Ayush Rawat Computer Engineering Student — interested in software engineering, web development, and building practical products.

GitHub: @rawatayush62

📄 License
This project is a personal/educational project and is not currently licensed for reuse.