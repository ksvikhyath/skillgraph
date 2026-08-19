# SkillGraph

SkillGraph checks what you claim against what
your GitHub actually shows, scores the match, ranks the highest-impact gaps,
and tells you exactly what to build next.

No accounts, no database — each analysis is a single stateless request.

## What it does

- **Skill extraction** — pulls known skills out of your resume and the job post
- **GitHub evidence** — checks your public repos for the languages, Dockerfiles,
  CI configs, and tests that back up what your resume claims
- **Match score** — weighted by how early each requirement appears in the job post
- **Gap analysis** — ranks missing/unverified skills by how much closing them
  would move your match score
- **ATS check** — keyword coverage + structure, in plain language
- **Roadmap** — one project recommendation sized to close your top real gaps,
  not a generic list of things to go learn

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind, API routes for the backend.
No database. Deploys as a single app on Vercel.

- Skill extraction and matching are **deterministic** (a plain keyword/alias
  engine in `lib/skills.ts` and `lib/scoring.ts`) — no external calls, no cost,
  works immediately.
- If you add a `GEMINI_API_KEY`, the roadmap's project description gets
  written by Gemini instead of the built-in template. Everything else stays
  the same either way.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment variables (both optional)

Copy `.env.example` to `.env.local` and fill in what you want:

- `GEMINI_API_KEY` — free key from https://aistudio.google.com/apikey.
  Unlocks LLM-written roadmap descriptions. Without it, roadmap descriptions
  come from built-in templates.
- `GITHUB_TOKEN` — a GitHub personal access token (no scopes needed, this
  only reads public data). Without it, GitHub lookups are capped at 60
  requests/hour per IP, which is fine for personal use but can rate-limit
  under heavier traffic.

## Deploy to Vercel

1. Push this folder to a new GitHub repo:
   ```bash
   git init
   git add .
   git commit -m "SkillGraph"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. Go to https://vercel.com/new and import that repo. Vercel auto-detects
   Next.js — no config needed.
3. Under **Environment Variables**, optionally add `GEMINI_API_KEY` and
   `GITHUB_TOKEN`.
4. Deploy. You'll get a live `*.vercel.app` URL in about a minute.

## Project structure

```
app/
  page.tsx              - main flow: upload -> results -> roadmap
  api/analyze/route.ts   - resume + JD -> full match analysis
  api/roadmap/route.ts   - gap list -> project recommendation
  api/parse-resume/route.ts - PDF/text upload -> plain text
lib/
  skills.ts       - skill taxonomy + text extraction
  github.ts       - public GitHub API evidence lookup
  scoring.ts      - match %, confidence, gap ranking, ATS score
  roadmap.ts      - project templates + optional LLM narration
  llm.ts          - thin Gemini wrapper, no-op without a key
components/       - UploadForm, ResultsView, RoadmapView, SkillGraphMark
```

To add a new recognized skill, add one entry to `SKILLS` in `lib/skills.ts` —
extraction, matching, evidence, and roadmap templates all pick it up
automatically. To add a new roadmap project template, add an entry to
`PROJECT_TEMPLATES` in `lib/roadmap.ts`.
