# AI Resume Analyzer 🚀

Upload your resume (PDF or pasted text), paste a job description, and get an ATS-style match
score with a category breakdown, matched and missing skills, an ATS checklist, and prioritized
suggestions. An optional **AI recruiter review** adds a written assessment, rewritten bullet
points, and a tailored professional summary.

**Live demo:** https://ai-resume-analyzer-yasaswi.netlify.app/

---

## Features

### Local analysis (private, instant, no account)
Your resume is parsed with PDF.js and scored **entirely in your browser**, so nothing is uploaded.

- **Overall ATS score** combined from four weighted categories:
  | Category | Weight | What it measures |
  |---|---|---|
  | Keyword match | 45% | Job-description skills & recurring terms found in your resume |
  | Impact & achievements | 20% | Quantified bullets, action-verb openers, weak/cliché phrases |
  | Structure & contact | 20% | Standard sections, email, phone, LinkedIn/portfolio |
  | Readability & ATS format | 15% | Length, bullet length, first-person pronouns, garbled text from complex layouts |
- **Skill-aware keyword matching**: a curated dictionary of 130+ skills with aliases
  (`k8s` → Kubernetes, `Postgres` → PostgreSQL, `React.js` → React), whole-word matching
  (Java ≠ JavaScript), and light stemming for other terms. Generic job-post filler is filtered out.
- **Matched / missing keywords**, with known skills highlighted and a one-click "copy all".
- **ATS checklist**: sections, contact details, pronouns, clichés.
- **Prioritized suggestions** labelled high / medium / low.
- **History**: your last 15 analyses are saved in `localStorage`, so you can compare versions as you tailor.
- **Save as PDF**: a print-optimized report layout.
- **Paste-text mode** for scanned PDFs or Word documents.

### Optional AI recruiter review
Click **Get AI review** on the results page to send the resume text and job description to an LLM
via [Puter.js](https://docs.puter.com). There is no API key and no backend: Puter asks the user to sign in to a
free Puter account and bills usage to them. The Puter script loads only when you click the button,
and the review is stored with that analysis in your history.

---

## Tech stack

- **React 19** + **React Router v7** (framework mode, SPA: `ssr: false`)
- **TypeScript**, **Tailwind CSS v4**, **Vite 7**
- **pdfjs-dist** for client-side PDF text extraction (lazy-loaded, own chunk)
- **Puter.js** for the optional AI review (lazy-loaded)
- **Vitest** for unit tests of the scoring engine

---

## Getting started

Requires Node.js 20+.

```bash
git clone https://github.com/yasaswiyendluri/AI-Resume-Analyzer.git
cd AI-Resume-Analyzer
npm install
npm run dev          # http://localhost:5173
```

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `build/client` (static SPA) |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | Generate route types and run `tsc` |
| `npm test` | Run the analyzer unit tests |

---

## Project structure

```
app/
├── root.tsx                  # HTML shell, navbar, error boundary
├── routes.ts                 # Route config
├── routes/
│   ├── home.tsx              # Landing page
│   ├── upload.tsx            # PDF upload / paste text + job description
│   ├── results.tsx           # Score report (?id=<analysis id>)
│   ├── history.tsx           # Saved analyses
│   └── not-found.tsx         # 404
├── components/
│   ├── Navbar.tsx            # Responsive nav with mobile menu
│   ├── ScoreGauge.tsx
│   ├── AiReviewPanel.tsx     # Optional Puter.js AI review
│   └── CopyButton.tsx
├── lib/
│   ├── analyzeResume.ts      # Scoring engine (pure, unit-tested)
│   ├── analyzeResume.test.ts
│   ├── skills.ts             # Skill dictionary with aliases
│   ├── aiReview.ts           # Puter.js loader, prompt, response parsing
│   ├── storage.ts            # localStorage history
│   └── utils.ts
├── utils/pdfParser.ts        # PDF.js text extraction (keeps line structure)
└── types/analysis.ts
```

---

## Deployment

The build output is a static SPA in `build/client`, and every unknown path must fall back to `index.html`.

- **Netlify**: build `npm run build`, publish `build/client` (`public/_redirects` handles the fallback).
- **Vercel**: `vercel.json` is included.
- **Docker**: `docker build -t resume-analyzer . && docker run -p 8080:80 resume-analyzer` serves the build with nginx.

---

## Limitations

- Scoring is heuristic. It approximates how ATS keyword filters and recruiters read a resume, but it is not
  a real ATS. Use it to guide tailoring, not as a final verdict.
- Scanned (image-only) PDFs contain no text layer. Use **Paste text** for those.
- Multi-column PDF layouts can extract in an unusual order, which may affect section detection.

## Roadmap

- [ ] DOCX upload
- [ ] Side-by-side comparison of two analyses
- [ ] Cover letter analyzer
- [ ] Dark mode

## Author

**Yendluri Yasaswi** · [GitHub](https://github.com/yasaswiyendluri)
