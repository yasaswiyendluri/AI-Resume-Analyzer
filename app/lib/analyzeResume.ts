import type {
  AnalysisResult,
  CategoryScore,
  ContactCheck,
  Insight,
  KeywordHit,
  ResumeStats,
  SectionCheck,
} from "~/types/analysis";
import { SKILLS, type SkillDef } from "./skills";

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

const STOP_WORDS = new Set(
  `a an the and or but in on at to for of with by from as is are was were be been being
  have has had do does did will would could should may might must shall can need this that
  these those i you he she it we they what which who whom when where why how all each every
  both few more most other some such no nor not only own same so than too very just about into
  through during before after above below between under again further then once here there any
  our your their its my me him her them us am if while also etc able via per within across
  upon onto like well new etc. e.g. i.e. get got make made take one two three plus`.split(/\s+/)
);

/** Words that are common in job posts but carry no signal about the candidate. */
const JD_NOISE = new Set(
  `experience experienced years year role roles position positions team teams work working works
  using use used uses including include includes included required require requires requirement
  requirements responsibilities responsibility preferred qualifications qualification candidate
  candidates applicant applicants job jobs company companies opportunity opportunities looking seeking
  join joining ideal strong excellent good great ability abilities skills skill knowledge understanding
  familiarity familiar proficiency proficient plus bonus nice must have will help helping ensure
  support supporting within across environment based related relevant equivalent degree bachelor
  bachelors master masters field minimum least preferably etc high highly level levels day days
  part full time fast paced fast-paced dynamic passionate motivated self-motivated world class
  world-class best benefits salary competitive equal employer offer offers apply applying please
  location remote hybrid office us our you your who what why across closely key various multiple
  other others new ways way make making build building deliver delivering drive driving own owning
  take taking provide providing area areas business products product people person write writing
  perform performing turn partner partnering grow growing find finding findings complex looking
  hiring hire hires growing exciting impact impactful ownership closely collaborate collaborating
  responsible successful success thrive solutions solution tasks task strong ensure ensuring
  understand develop developing create creating maintain maintaining manage managing`.split(/\s+/)
);

export function normalize(text: string): string {
  return text
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/ /g, " ")
    .toLowerCase();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

/** Whole-word (or whole-symbol) match that also works for terms like "c++", ".net", "ci/cd". */
function containsTerm(haystack: string, term: string): boolean {
  const re = new RegExp(`(?<![a-z0-9+#])${escapeRegex(term)}(?![a-z0-9+#])`, "i");
  return re.test(haystack);
}

function tokenize(text: string): string[] {
  return normalize(text)
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.replace(/^[.\-/]+|[.\-/]+$/g, ""))
    .filter(Boolean);
}

/** Tiny suffix stemmer — good enough to treat "deploy", "deploys", "deployed" alike. */
export function stem(word: string): string {
  if (word.length <= 4) return word;
  for (const suffix of ["ations", "ation", "ings", "ing", "ers", "ies", "ed", "es", "er", "s"]) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 4) {
      const base = word.slice(0, -suffix.length);
      return suffix === "ies" ? base + "y" : base;
    }
  }
  return word;
}

function isContentWord(w: string): boolean {
  return (
    w.length > 2 &&
    !STOP_WORDS.has(w) &&
    !JD_NOISE.has(w) &&
    !/^\d+$/.test(w) &&
    /[a-z]/.test(w)
  );
}

/* ------------------------------------------------------------------ */
/* Keyword extraction                                                  */
/* ------------------------------------------------------------------ */

interface JobKeyword {
  label: string;
  kind: KeywordHit["kind"];
  weight: number;
  /** For skills: the aliases. For terms: stemmed tokens that must all appear. */
  skill?: SkillDef;
  stems?: string[];
}

export function extractJobKeywords(jobDescription: string): JobKeyword[] {
  const jd = normalize(jobDescription);
  const keywords: JobKeyword[] = [];
  const coveredTokens = new Set<string>();

  // 1. Known skills (with alias support). Weighted by how often they're mentioned.
  for (const skill of SKILLS) {
    let mentions = 0;
    for (const alias of skill.aliases) {
      const re = new RegExp(`(?<![a-z0-9+#])${escapeRegex(alias)}(?![a-z0-9+#])`, "gi");
      mentions += (jd.match(re) ?? []).length;
    }
    if (mentions > 0) {
      keywords.push({
        label: skill.label,
        kind: skill.kind,
        weight: (skill.kind === "hard" ? 3 : 1.5) + Math.min(mentions - 1, 2) * 0.5,
        skill,
      });
      skill.aliases.forEach((a) => a.split(/\s+/).forEach((t) => coveredTokens.add(stem(t))));
    }
  }

  // 2. Other recurring terms (single words and two-word phrases) from the JD.
  const tokens = tokenize(jobDescription);
  const unigram = new Map<string, { count: number; display: string }>();
  const bigram = new Map<string, { count: number; display: string; stems: string[] }>();

  for (let i = 0; i < tokens.length; i++) {
    const w = tokens[i];
    if (!isContentWord(w)) continue;
    const s = stem(w);
    if (coveredTokens.has(s)) continue;
    const u = unigram.get(s) ?? { count: 0, display: w };
    u.count++;
    if (w.length < u.display.length) u.display = w;
    unigram.set(s, u);

    const next = tokens[i + 1];
    if (next && isContentWord(next) && !coveredTokens.has(stem(next))) {
      const key = `${s} ${stem(next)}`;
      const b = bigram.get(key) ?? { count: 0, display: `${w} ${next}`, stems: [s, stem(next)] };
      b.count++;
      bigram.set(key, b);
    }
  }

  const usedStems = new Set<string>();
  const phrases = [...bigram.values()]
    .filter((b) => b.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
  for (const p of phrases) {
    keywords.push({ label: p.display, kind: "term", weight: 1.5, stems: p.stems });
    p.stems.forEach((s) => usedStems.add(s));
  }

  // Single mentions are mostly noise ("growing", "turn") — require a term to repeat.
  const terms = [...unigram.entries()]
    .filter(([s, u]) => u.count >= 2 && !usedStems.has(s))
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 15);
  for (const [s, u] of terms) {
    keywords.push({ label: u.display, kind: "term", weight: 1, stems: [s] });
  }

  return keywords;
}

function matchKeyword(kw: JobKeyword, resumeNorm: string, resumeStems: Set<string>): boolean {
  if (kw.skill) return kw.skill.aliases.some((a) => containsTerm(resumeNorm, a));
  return (kw.stems ?? []).every((s) => resumeStems.has(s));
}

/* ------------------------------------------------------------------ */
/* Resume heuristics                                                   */
/* ------------------------------------------------------------------ */

const SECTION_DEFS: { id: string; label: string; patterns: string[] }[] = [
  { id: "summary", label: "Summary / Profile", patterns: ["summary", "profile", "objective", "about me", "professional summary"] },
  { id: "experience", label: "Experience", patterns: ["experience", "employment", "work history", "internship", "internships"] },
  { id: "education", label: "Education", patterns: ["education", "academic", "qualifications"] },
  { id: "skills", label: "Skills", patterns: ["skills", "technical skills", "technologies", "core competencies", "tech stack", "tools"] },
  { id: "projects", label: "Projects", patterns: ["projects", "personal projects", "academic projects"] },
  { id: "certifications", label: "Certifications / Awards", patterns: ["certifications", "certificates", "certification", "licenses", "awards", "achievements", "honors"] },
];

const ACTION_VERBS = new Set(
  `achieved accelerated architected automated built boosted collaborated configured coordinated created
  cut decreased delivered deployed designed developed directed drove eliminated engineered enhanced
  established executed expanded generated grew guided implemented improved increased initiated integrated
  introduced launched led maintained managed mentored migrated modernized negotiated optimized orchestrated
  organized overhauled owned pioneered planned produced programmed published redesigned reduced refactored
  resolved restructured revamped saved scaled secured shipped simplified spearheaded streamlined
  strengthened supervised taught tested trained transformed tripled doubled won wrote analyzed authored
  conducted contributed debugged evaluated facilitated identified investigated modeled monitored presented
  prototyped researched solved upgraded validated visualized`.split(/\s+/)
);

const WEAK_PHRASES = [
  "responsible for",
  "duties included",
  "duties include",
  "worked on",
  "helped with",
  "assisted with",
  "involved in",
  "tasked with",
  "team player",
  "hard worker",
  "hard-working",
  "go-getter",
  "detail-oriented",
  "results-driven",
  "think outside the box",
  "references available upon request",
];

const BULLET_RE = /^\s*[•●▪◦‣∙·\-*–>]\s*/;
const QUANT_RE =
  /(\d+(\.\d+)?\s?%|[$€£₹]\s?\d|\b\d+(\.\d+)?\s?(k|m|mm|bn|x)\b|\b\d{1,3}(,\d{3})+\b|\b\d+\+|\b\d+\s+(users|clients|customers|projects|people|members|engineers|developers|students|hours|days|weeks|months|requests|transactions|countries|teams|stores|services|apps|applications|features|pages|endpoints|records|downloads|leads)\b|\b(?!(19|20)\d{2}\b)\d{2,}\b)/i;

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

/** Lines that read like experience/project bullet points. */
function getBulletLines(lines: string[]): string[] {
  const explicit = lines.filter((l) => BULLET_RE.test(l) && l.split(/\s+/).length >= 4);
  if (explicit.length >= 3) return explicit.map((l) => l.replace(BULLET_RE, ""));
  // PDF text often loses bullet glyphs — fall back to sentence-like lines.
  return lines.filter((l) => {
    const words = l.split(/\s+/).length;
    return words >= 6 && words <= 60 && /^[A-Za-z]/.test(l);
  });
}

function detectSections(resumeNorm: string, lines: string[]): SectionCheck[] {
  const headingLines = lines
    .filter((l) => l.split(/\s+/).length <= 5)
    .map((l) => normalize(l).replace(/[^a-z\s]/g, " ").trim());
  return SECTION_DEFS.map((def) => {
    const asHeading = headingLines.some((h) => def.patterns.some((p) => containsTerm(h, p)));
    // Fall back to the word anywhere (PDF extraction may merge headings into body lines).
    const anywhere = def.patterns.some((p) => containsTerm(resumeNorm, p));
    return { id: def.id, label: def.label, found: asHeading || anywhere };
  });
}

function detectContact(text: string): ContactCheck {
  const t = normalize(text);
  return {
    email: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(t),
    phone: (t.match(/\+?\(?\d[\d\s().-]{7,}\d/g) ?? []).some((c) => {
      const digits = c.replace(/\D/g, "").length;
      return digits >= 10 && digits <= 15 && !/^(19|20)\d{2}\s*-\s*(19|20)\d{2}/.test(c.trim());
    }),
    linkedin: /linkedin(\.com)?/.test(t),
    portfolio: /(github\.com|gitlab\.com|behance\.net|dribbble\.com|portfolio|https?:\/\/(?!.*linkedin))/.test(t),
  };
}

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/* ------------------------------------------------------------------ */
/* Main entry point                                                    */
/* ------------------------------------------------------------------ */

export function analyzeResume(resumeText: string, jobDescription: string): AnalysisResult {
  const resumeNorm = normalize(resumeText);
  const resumeStems = new Set(tokenize(resumeText).map(stem));
  const lines = splitLines(resumeText);
  const strengths: Insight[] = [];
  const improvements: Insight[] = [];

  /* ---- Keywords ---- */
  const jobKeywords = extractJobKeywords(jobDescription);
  const matched: KeywordHit[] = [];
  const missing: (KeywordHit & { weight: number })[] = [];
  let totalWeight = 0;
  let matchedWeight = 0;
  for (const kw of jobKeywords) {
    totalWeight += kw.weight;
    if (matchKeyword(kw, resumeNorm, resumeStems)) {
      matchedWeight += kw.weight;
      matched.push({ label: kw.label, kind: kw.kind });
    } else {
      missing.push({ label: kw.label, kind: kw.kind, weight: kw.weight });
    }
  }
  missing.sort((a, b) => b.weight - a.weight);
  const keywordScore = totalWeight > 0 ? clamp((matchedWeight / totalWeight) * 100 * 1.1) : 60;
  const missingHard = missing.filter((m) => m.kind === "hard");
  const matchedHard = matched.filter((m) => m.kind === "hard");

  if (keywordScore >= 70) {
    strengths.push({ category: "keywords", priority: "high", text: `Strong keyword alignment — ${matched.length} of ${jobKeywords.length} job terms appear in your resume.` });
  } else if (keywordScore >= 45) {
    improvements.push({ category: "keywords", priority: "medium", text: "Moderate keyword overlap. Mirror the job post's exact wording for the skills you genuinely have." });
  } else {
    improvements.push({ category: "keywords", priority: "high", text: "Low keyword overlap with this job description — ATS filters may screen this resume out. Tailor your skills and bullets to the posting." });
  }
  if (matchedHard.length >= 3) {
    strengths.push({ category: "keywords", priority: "medium", text: `Covers key technical requirements: ${matchedHard.slice(0, 5).map((m) => m.label).join(", ")}.` });
  }
  if (missingHard.length > 0) {
    improvements.push({ category: "keywords", priority: "high", text: `Required skills not found: ${missingHard.slice(0, 5).map((m) => m.label).join(", ")}. Add them (skills section + a bullet showing usage) if you have that experience.` });
  }

  /* ---- Impact ---- */
  const bullets = getBulletLines(lines);
  const quantified = bullets.filter((b) => QUANT_RE.test(b)).length;
  const actionVerb = bullets.filter((b) => {
    const first = normalize(b).split(/\s+/)[0]?.replace(/[^a-z]/g, "");
    return first ? ACTION_VERBS.has(first) : false;
  }).length;
  const weakPhrases = WEAK_PHRASES.filter((p) => resumeNorm.includes(p));
  const longBullets = bullets.filter((b) => b.split(/\s+/).length > 40).length;

  let impactScore: number;
  if (bullets.length >= 3) {
    const quantRatio = quantified / bullets.length;
    const verbRatio = actionVerb / bullets.length;
    impactScore = 25 + Math.min(quantRatio / 0.4, 1) * 45 + Math.min(verbRatio / 0.6, 1) * 30 - weakPhrases.length * 6;
  } else {
    impactScore = (QUANT_RE.test(resumeText) ? 55 : 35) - weakPhrases.length * 6;
  }
  impactScore = clamp(impactScore, 5);

  if (bullets.length >= 3 && quantified / bullets.length >= 0.3) {
    strengths.push({ category: "impact", priority: "high", text: `${quantified} of ${bullets.length} bullet points include measurable results — great for demonstrating impact.` });
  } else {
    improvements.push({ category: "impact", priority: "high", text: "Quantify more achievements — add numbers like % improvement, users served, time or money saved." });
  }
  if (bullets.length >= 3 && actionVerb / bullets.length >= 0.5) {
    strengths.push({ category: "impact", priority: "medium", text: "Most bullet points start with strong action verbs." });
  } else if (bullets.length >= 3) {
    improvements.push({ category: "impact", priority: "medium", text: "Start each bullet with a strong action verb (Built, Led, Reduced, Shipped…) instead of a noun or \"Responsible for\"." });
  }
  if (weakPhrases.length > 0) {
    improvements.push({ category: "impact", priority: "medium", text: `Replace weak or cliché phrases: "${weakPhrases.slice(0, 3).join('", "')}". Describe what you achieved instead.` });
  }

  /* ---- Structure ---- */
  const sections = detectSections(resumeNorm, lines);
  const contact = detectContact(resumeText);
  const has = (id: string) => sections.find((s) => s.id === id)?.found ?? false;
  const structureScore = clamp(
    (has("experience") || has("projects") ? 25 : 0) +
      (has("education") ? 15 : 0) +
      (has("skills") ? 20 : 0) +
      (has("summary") ? 10 : 0) +
      (has("projects") || has("certifications") ? 10 : 0) +
      (contact.email ? 10 : 0) +
      (contact.phone ? 5 : 0) +
      (contact.linkedin || contact.portfolio ? 5 : 0)
  );

  const missingSections = sections.filter((s) => !s.found && s.id !== "certifications");
  if (missingSections.length === 0) {
    strengths.push({ category: "structure", priority: "medium", text: "All standard sections are present, so ATS parsers can map your resume cleanly." });
  } else {
    improvements.push({
      category: "structure",
      priority: missingSections.some((s) => s.id === "experience" || s.id === "skills") ? "high" : "low",
      text: `Add clearly labelled section(s): ${missingSections.map((s) => s.label).join(", ")}.`,
    });
  }
  if (!contact.email || !contact.phone) {
    improvements.push({ category: "structure", priority: "high", text: `Contact details incomplete — add your ${[!contact.email && "email", !contact.phone && "phone number"].filter(Boolean).join(" and ")} at the top.` });
  }
  if (!contact.linkedin && !contact.portfolio) {
    improvements.push({ category: "structure", priority: "low", text: "Add a LinkedIn profile or portfolio/GitHub link so recruiters can learn more." });
  }

  /* ---- Readability / ATS-friendliness ---- */
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const pronounCount = (resumeNorm.match(/\b(i|me|my|myself)\b/g) ?? []).length;
  const weirdChars = (resumeText.match(/[^\x20-\x7E\s -ɏ•●▪◦‣–—’‘“”€£₹]/g) ?? []).length;
  const garbleRatio = resumeText.length ? weirdChars / resumeText.length : 0;

  const lengthPts = wordCount >= 350 && wordCount <= 900 ? 40 : wordCount >= 250 && wordCount <= 1200 ? 28 : 12;
  const pronounPts = Math.max(0, 20 - pronounCount * 4);
  const bulletPts = Math.max(0, 20 - longBullets * 5);
  const parsePts = garbleRatio < 0.01 ? 20 : garbleRatio < 0.05 ? 10 : 0;
  const readabilityScore = clamp(lengthPts + pronounPts + bulletPts + parsePts);

  if (lengthPts === 40) {
    strengths.push({ category: "readability", priority: "low", text: `Length (~${wordCount} words) is in the sweet spot for a 1–2 page resume.` });
  } else if (wordCount < 350) {
    improvements.push({ category: "readability", priority: "medium", text: `Your resume is short (~${wordCount} words). Expand with projects, outcomes and relevant skills.` });
  } else {
    improvements.push({ category: "readability", priority: "medium", text: `Your resume is long (~${wordCount} words). Trim older or less relevant content to stay within 1–2 pages.` });
  }
  if (pronounCount > 2) {
    improvements.push({ category: "readability", priority: "low", text: `Avoid first-person pronouns ("I", "my") — found ${pronounCount}. Resume bullets read better without them.` });
  }
  if (longBullets > 0) {
    improvements.push({ category: "readability", priority: "low", text: `${longBullets} bullet point(s) run over 40 words. Keep bullets to 1–2 lines.` });
  }
  if (parsePts < 20) {
    improvements.push({ category: "readability", priority: "high", text: "Some text extracted as unusual symbols — icons, tables or multi-column layouts may confuse ATS parsers. Prefer a simple single-column layout." });
  }

  /* ---- Overall ---- */
  const categories: CategoryScore[] = [
    { id: "keywords", label: "Keyword match", weight: 0.45, score: keywordScore, summary: `${matched.length}/${jobKeywords.length} job terms found` },
    { id: "impact", label: "Impact & achievements", weight: 0.2, score: impactScore, summary: `${quantified} quantified · ${actionVerb} action-verb bullets` },
    { id: "structure", label: "Structure & contact", weight: 0.2, score: structureScore, summary: `${sections.filter((s) => s.found).length}/${sections.length} sections detected` },
    { id: "readability", label: "Readability & ATS format", weight: 0.15, score: readabilityScore, summary: `~${wordCount} words` },
  ];
  const score = clamp(
    categories.reduce((sum, c) => sum + c.score * c.weight, 0),
    5,
    99
  );

  const rank = { high: 0, medium: 1, low: 2 } as const;
  const byPriority = (a: Insight, b: Insight) => rank[a.priority] - rank[b.priority];

  const stats: ResumeStats = {
    wordCount,
    bulletCount: bullets.length,
    quantifiedBullets: quantified,
    actionVerbBullets: actionVerb,
    longBullets,
    pronounCount,
    weakPhrases,
  };

  return {
    version: 2,
    score,
    categories,
    strengths: strengths.sort(byPriority).slice(0, 6),
    improvements: improvements.sort(byPriority).slice(0, 8),
    matchedKeywords: matched,
    missingKeywords: missing.map(({ label, kind }) => ({ label, kind })),
    sections,
    contact,
    stats,
  };
}
