import type { AnalysisResult, AnalysisSession } from "~/types/analysis";

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "by", "from", "as", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "must", "shall", "can", "need", "this", "that", "these", "those",
  "i", "you", "he", "she", "it", "we", "they", "what", "which", "who", "when",
  "where", "why", "how", "all", "each", "every", "both", "few", "more", "most",
  "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so",
  "than", "too", "very", "just", "about", "into", "through", "during", "before",
  "after", "above", "below", "between", "under", "again", "further", "then",
  "once", "here", "there", "any", "our", "your", "their", "its", "my", "me",
  "him", "her", "them", "us", "am", "if", "while", "also", "etc", "able",
  "experience", "years", "year", "role", "position", "team", "work", "working",
  "using", "use", "used", "including", "include", "includes", "required",
  "requirements", "responsibilities", "responsibility", "preferred", "qualifications",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function uniqueKeywords(tokens: string[], minLength = 3): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const token of tokens) {
    if (token.length < minLength || seen.has(token)) continue;
    seen.add(token);
    result.push(token);
  }
  return result;
}

function extractJobKeywords(jobDescription: string): string[] {
  const tokens = tokenize(jobDescription);
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word]) => word);
}

function hasSection(resumeLower: string, keywords: string[]): boolean {
  return keywords.some((k) => resumeLower.includes(k));
}

export function analyzeResume(
  resumeText: string,
  jobDescription: string
): AnalysisResult {
  const resumeLower = resumeText.toLowerCase();
  const resumeTokens = new Set(tokenize(resumeText));
  const jobKeywords = extractJobKeywords(jobDescription);

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const keyword of jobKeywords) {
    if (resumeTokens.has(keyword) || resumeLower.includes(keyword)) {
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  const keywordScore =
    jobKeywords.length > 0
      ? Math.round((matchedKeywords.length / jobKeywords.length) * 100)
      : 50;

  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  let structureBonus = 0;
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (wordCount >= 250 && wordCount <= 900) {
    structureBonus += 8;
    strengths.push("Resume length is in a solid range for recruiters and ATS systems.");
  } else if (wordCount < 250) {
    improvements.push("Expand your resume — it looks short. Add projects, impact bullets, and skills.");
  } else {
    improvements.push("Trim dense sections — very long resumes often score lower with ATS parsers.");
  }

  if (hasSection(resumeLower, ["experience", "employment", "work history"])) {
    structureBonus += 6;
    strengths.push("Clear experience section helps recruiters scan your background quickly.");
  } else {
    improvements.push("Add a dedicated Experience section with role, company, dates, and outcomes.");
  }

  if (hasSection(resumeLower, ["skills", "technologies", "technical", "tools"])) {
    structureBonus += 6;
    strengths.push("Skills section improves keyword matching for this role.");
  } else {
    improvements.push("Include a Skills section aligned with the job description keywords.");
  }

  if (hasSection(resumeLower, ["education", "degree", "university", "college"])) {
    structureBonus += 4;
  }

  if (/\d+%|\$\d|#\d|\d+\+|\d{2,}/.test(resumeText)) {
    structureBonus += 8;
    strengths.push("Quantified achievements (numbers, %, metrics) strengthen impact.");
  } else {
    improvements.push("Add measurable results — percentages, revenue, users, or time saved.");
  }

  if (matchedKeywords.length >= 8) {
    strengths.push(
      `Strong keyword overlap with the job description (${matchedKeywords.length} terms matched).`
    );
  } else if (matchedKeywords.length >= 4) {
    strengths.push("Moderate alignment with role keywords — room to tailor further.");
  } else {
    improvements.push(
      "Mirror more language from the job description — ATS and recruiters look for keyword overlap."
    );
  }

  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 5).join(", ");
    improvements.push(`Consider weaving in missing role terms: ${topMissing}.`);
  }

  const score = Math.min(
    98,
    Math.max(12, Math.round(keywordScore * 0.65 + structureBonus + 10))
  );

  if (strengths.length === 0) {
    strengths.push("Resume uploaded successfully — use the suggestions below to improve alignment.");
  }
  if (improvements.length === 0) {
    improvements.push("Fine-tune phrasing to mirror the job post’s top responsibilities.");
  }

  return {
    score,
    strengths: strengths.slice(0, 5),
    improvements: improvements.slice(0, 5),
    matchedKeywords: matchedKeywords.slice(0, 12),
    missingKeywords: missingKeywords.slice(0, 12),
    wordCount,
  };
}

export const ANALYSIS_STORAGE_KEY = "resume-analyzer:last-session";

export function saveAnalysisSession(session: AnalysisSession): void {
  try {
    sessionStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore quota errors */
  }
}

export function loadAnalysisSession(): AnalysisSession | null {
  try {
    const raw = sessionStorage.getItem(ANALYSIS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AnalysisSession;
  } catch {
    return null;
  }
}
