import type { AnalysisSession } from "~/types/analysis";

const HISTORY_KEY = "resume-analyzer:history:v2";
const MAX_HISTORY = 15;

function isValidSession(s: unknown): s is AnalysisSession {
  const v = s as AnalysisSession;
  return !!v && typeof v.id === "string" && v.analysis?.version === 2;
}

export function loadHistory(): AnalysisSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isValidSession) : [];
  } catch {
    return [];
  }
}

function writeHistory(items: AnalysisSession[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch {
    // Quota exceeded: drop stored resume text from older entries and retry once.
    try {
      const slim = items.slice(0, MAX_HISTORY).map((s, i) => (i === 0 ? s : { ...s, resumeText: "" }));
      localStorage.setItem(HISTORY_KEY, JSON.stringify(slim));
    } catch {
      /* give up silently — history is a convenience */
    }
  }
}

export function saveSession(session: AnalysisSession): void {
  const rest = loadHistory().filter((s) => s.id !== session.id);
  writeHistory([session, ...rest]);
}

export function getSession(id?: string | null): AnalysisSession | null {
  const history = loadHistory();
  if (!id) return history[0] ?? null;
  return history.find((s) => s.id === id) ?? null;
}

export function deleteSession(id: string): void {
  writeHistory(loadHistory().filter((s) => s.id !== id));
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* ignore */
  }
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
