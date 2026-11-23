import type { AiReview } from "~/types/analysis";

/**
 * Optional AI review powered by Puter.js (https://docs.puter.com).
 * Puter lets a static site call LLMs with no API key: the *user* signs in to a free
 * Puter account in a popup the first time and usage is billed to them, not to us.
 * The script is loaded lazily so the core (offline) analyzer never depends on it.
 */

const PUTER_SRC = "https://js.puter.com/v2/";
/** Tried in order; if Puter rejects a model name we fall back to its default model. */
const MODEL_CANDIDATES = ["claude-sonnet-4-5", "claude-sonnet-4", undefined] as const;

interface PuterLike {
  ai: {
    chat: (prompt: string, options?: { model?: string }) => Promise<unknown>;
  };
}

declare global {
  interface Window {
    puter?: PuterLike;
  }
}

let loader: Promise<PuterLike> | null = null;

function loadPuter(): Promise<PuterLike> {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser only"));
  if (window.puter) return Promise.resolve(window.puter);
  if (loader) return loader;
  loader = new Promise<PuterLike>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PUTER_SRC;
    script.async = true;
    script.onload = () =>
      window.puter ? resolve(window.puter) : reject(new Error("Puter.js loaded but is unavailable."));
    script.onerror = () => {
      loader = null;
      script.remove();
      reject(new Error("Could not load Puter.js — check your connection or ad-blocker."));
    };
    document.head.appendChild(script);
  });
  return loader;
}

function responseText(res: unknown): string {
  const r = res as { message?: { content?: unknown }; text?: string } | string;
  if (typeof r === "string") return r;
  const content = r?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content.map((c) => (typeof c === "string" ? c : (c?.text ?? ""))).join("");
  }
  if (typeof r?.text === "string") return r.text;
  return String(res ?? "");
}

export function parseAiJson(text: string): Omit<AiReview, "model" | "generatedAt"> {
  const cleaned = text.replace(/```(?:json)?/gi, "");
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("The AI response did not contain JSON.");
  const data = JSON.parse(cleaned.slice(start, end + 1));

  const strings = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "").slice(0, 8) : [];

  return {
    score: Math.max(0, Math.min(100, Math.round(Number(data.score) || 0))),
    summary: typeof data.summary === "string" ? data.summary : "",
    strengths: strings(data.strengths),
    gaps: strings(data.gaps),
    bulletRewrites: Array.isArray(data.bulletRewrites)
      ? data.bulletRewrites
          .filter((b: any) => b && typeof b.original === "string" && typeof b.improved === "string")
          .slice(0, 5)
      : [],
    tailoredSummary: typeof data.tailoredSummary === "string" ? data.tailoredSummary : "",
  };
}

export function buildPrompt(resumeText: string, jobTitle: string, jobDescription: string): string {
  return `You are an expert technical recruiter and ATS (applicant tracking system) specialist.
Review the candidate's resume against the target job and give honest, specific, actionable feedback.
Be critical where warranted — a weak match should get a low score. Never invent experience the candidate does not have.

<job_title>${jobTitle}</job_title>
<job_description>
${jobDescription.slice(0, 8000)}
</job_description>
<resume>
${resumeText.slice(0, 12000)}
</resume>

Respond with ONLY a JSON object (no markdown, no commentary) of this exact shape:
{
  "score": number,            // 0-100 overall fit for THIS job
  "summary": string,          // 2-3 sentence verdict
  "strengths": string[],      // 3-5 specific strengths relevant to the job
  "gaps": string[],           // 3-5 most important gaps or fixes, most important first
  "bulletRewrites": [         // 2-4 weak bullets from the resume rewritten to show impact; keep facts truthful, use placeholders like [X%] where a metric is unknown
    { "original": string, "improved": string }
  ],
  "tailoredSummary": string   // a 2-3 sentence professional summary tailored to this job
}`;
}

export async function runAiReview(
  resumeText: string,
  jobTitle: string,
  jobDescription: string
): Promise<AiReview> {
  if (!resumeText.trim()) {
    throw new Error("The resume text for this analysis isn't available. Please re-run the analysis.");
  }
  const puter = await loadPuter();
  const prompt = buildPrompt(resumeText, jobTitle, jobDescription);

  let lastError: unknown;
  for (const model of MODEL_CANDIDATES) {
    try {
      const res = await puter.ai.chat(prompt, model ? { model } : undefined);
      const parsed = parseAiJson(responseText(res));
      return { ...parsed, model: model ?? "puter-default", generatedAt: new Date().toISOString() };
    } catch (err) {
      lastError = err;
      const msg = errorMessage(err).toLowerCase();
      // Only try the next model if the failure looks model-related.
      if (!/model|not (found|supported|available)/.test(msg)) break;
    }
  }
  throw new Error(`AI review failed: ${errorMessage(lastError)}`);
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err) {
    const e = err as { error?: { message?: string } | string; message?: string };
    if (typeof e.error === "string") return e.error;
    if (e.error?.message) return e.error.message;
    if (e.message) return e.message;
  }
  return String(err ?? "Unknown error");
}
