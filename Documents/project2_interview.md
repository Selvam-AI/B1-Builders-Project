Project 2
---------

FitHub AI is my organisational-use B1 project: a shared workout-session portal where multiple members reserve time slots, join synchronized workout broadcasts, give feedback, and admins monitor usage. The important part is not just the app idea, but how I used AI as a co-developer: I started with a CrewAI-style multi-agent design, tested the constraints, then deliberately moved core behaviour to deterministic backend services because it was more reliable, testable, and explainable for a live prototype.
What Evaluators Are Looking For
From the notes, they care about:
Intentional AI use, not blindly accepting generated code.
Explainability: why each technical decision was made.
Maintainability: clear structure, tests, deterministic rules.
Creativity: not just a generic CRUD app.
Facilitation potential: can you explain this to non-technical learners?
Your strongest evidence:
Prompt/development log: docs/PROMPTS_IMPLEMENTATION.md
Implementation phases: docs/IMPLEMENTATION_PLAN.md
Evaluator-facing README: README.md
Backend route surface: routes.py
Demo Order
Start backend and frontend.
Register/sign in as member.
Choose Demo time slot.
Pick workout category.
Reserve slot.
Show workout broadcast/video recommendation.
Open another browser/incognito as another user and join same slot.
Explain synchronized offset: late joiners do not start from zero.
Submit like/dislike feedback.
Login as admin and show occupancy, feedback summary, member management, video cache.
Best Things To Say
Use this almost word-for-word:
“I initially explored a more agentic CrewAI design with Trainer, Safety Checker, Schedule, and Admin Assistant roles. During implementation I found that scheduling, capacity, reservations, and playback sync should not depend on LLM reasoning because those rules need to be predictable. So I kept AI assistance in the development workflow and optional recommendation review, while making the core app deterministic. That made the prototype more reliable and easier to test.”
Another good answer:
“The AI value here is not that an LLM makes every decision at runtime. The AI value is in how I used AI to plan, scaffold, review, debug, and refine the system, while keeping the final behaviour explainable to users and evaluators.”
Likely Questions
“What did AI actually do?”
Answer: It helped with planning, scaffolding, phase breakdown, debugging dependency issues, architecture review, prompt documentation, and implementation of backend/frontend pieces. You kept a prompt log to show steering and decisions.
“Why not use CrewAI fully?”
Answer: Because for reservations, capacity, auth, and session sync, deterministic logic is safer. LLMs are better as optional helpers for summaries/review, not as the source of truth for rules.
“What is the most creative feature?”
Answer: Shared workout broadcast with synchronized playback offset and browser-confirmed YouTube playback cache.
“What is the biggest limitation?”
Answer: Broadcast session state is in backend memory, so restart clears active sessions. Sync is prototype-grade, not production streaming. YouTube availability also depends on browser/network/API conditions.
“What would you improve next?”
Answer: Persist broadcast sessions, add stronger frontend tests, add screenshots/demo video, improve production auth, add audit logs, and make recommendation scoring use feedback more deeply.
