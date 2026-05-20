# ResumeAI — AI Resume Analyzer

Upload a PDF resume, paste a job description, and get an instant match score with keyword insights, strengths, and improvement tips. Analysis runs **in your browser** (PDF parsing + keyword matching) — no API keys required for the default flow.

![Stack](https://img.shields.io/badge/React-19-61dafb) ![React Router](https://img.shields.io/badge/React_Router-7-ca4248) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)

## Features

- **PDF upload** with drag-and-drop
- **Job description matching** — keyword overlap vs. missing terms
- **Match score** with structure checks (length, sections, metrics)
- **Actionable feedback** — strengths and improvements
- **Session memory** — last result saved in `sessionStorage` (refresh-safe)

## Prerequisites

- **Node.js** 20 or newer ([download](https://nodejs.org/))
- **npm** (comes with Node)

Check versions:

```bash
node -v
npm -v
```

## Quick start

### 1. Clone and open the project

```bash
cd "AI-Resume-Analyzer"
```

Use the full path to your folder if different, for example:

```bash
cd "c:\sem4\projects\ai resume analyser myne\AI-Resume-Analyzer"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open the URL shown in the terminal (usually **http://localhost:5173**).

### 4. Use the app

1. Go to **Analyze** (or **Start analysis** on the home page).
2. Upload a **text-based PDF** resume (not a scanned image-only PDF).
3. Optionally enter a **job title**.
4. Paste the full **job description**.
5. Click **Run analysis** and view your **Results**.

## Available scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Serve production build (run `build` first) |
| `npm run typecheck` | TypeScript + React Router type generation |

## Production build

```bash
npm run build
npm run start
```

The server port depends on your environment; check the terminal output after `npm run start`.

## Docker (optional)

```bash
docker build -t resume-ai .
docker run -p 3000:3000 resume-ai
```

## Project structure

```
app/
  routes/          # Pages: home, upload, results, auth
  components/      # Navbar, ScoreGauge, feedback widgets
  lib/             # analyzeResume, utils, puter store
  utils/           # PDF text extraction
constants/         # Sample data & AI prompt templates (for future AI integration)
```

## How analysis works

1. **PDF text** is extracted client-side with `pdfjs-dist`.
2. **Keywords** are taken from the job description (frequency-weighted).
3. Your resume is checked for **keyword overlap**, **section cues** (experience, skills), **length**, and **numbers/metrics**.
4. A **score (0–98)** and tip lists are generated locally.

> **Note:** This is a smart heuristic analyzer, not a live LLM call. The repo also includes Puter.js integration stubs (`app/lib/puter.ts`) for optional cloud AI auth later.

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| Empty or failed PDF read | Use a PDF exported from Word/Google Docs, not a photo scan |
| Score always low | Paste a longer, detailed job description |
| `npm install` errors | Delete `node_modules` and `package-lock.json`, then `npm install` again |
| Port in use | Stop other dev servers or set `PORT` if your tooling supports it |

## Tech stack

- [React Router v7](https://reactrouter.com/) (full-stack template)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [pdfjs-dist](https://mozilla.github.io/pdf.js/) for PDF parsing
- TypeScript

## License

Use and modify for learning and projects. See repository owner for distribution terms.
