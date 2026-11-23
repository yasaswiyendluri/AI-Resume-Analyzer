import type { MetaFunction } from "react-router";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { analyzeResume } from "~/lib/analyzeResume";
import { newId, saveSession } from "~/lib/storage";
import { cn, formatSize } from "~/lib/utils";
import type { AnalysisSession } from "~/types/analysis";

export const meta: MetaFunction = () => [{ title: "Analyze Resume | ResumeAI" }];

const MAX_FILE_MB = 10;
const MIN_JD_WORDS = 30;

type Mode = "pdf" | "text";
type Step = "idle" | "reading" | "analyzing" | "saving";

const STEP_LABELS: Record<Exclude<Step, "idle">, string> = {
  reading: "Reading your resume…",
  analyzing: "Matching skills & keywords…",
  saving: "Building your report…",
};

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export default function Upload() {
  const [mode, setMode] = useState<Mode>("pdf");
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const setPdfFile = useCallback((next: File | null) => {
    if (!next) {
      setFile(null);
      return;
    }
    if (next.type !== "application/pdf" && !next.name.toLowerCase().endsWith(".pdf")) {
      setError("Please upload a PDF file.");
      return;
    }
    if (next.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_FILE_MB} MB.`);
      return;
    }
    setError("");
    setFile(next);
  }, []);

  async function runAnalysis() {
    if (mode === "pdf" && !file) return setError("Please upload your resume (PDF).");
    if (mode === "text" && wordCount(resumeText) < 50)
      return setError("Please paste your full resume text (at least 50 words).");
    if (!jobDesc.trim()) return setError("Please paste the job description.");

    setError("");
    try {
      setStep("reading");
      let text = resumeText;
      if (mode === "pdf" && file) {
        const { extractTextFromPDF } = await import("~/utils/pdfParser");
        text = (await extractTextFromPDF(file)).text;
        if (wordCount(text) < 30) {
          setMode("text");
          throw new Error(
            "We couldn't read much text from this PDF — it may be a scanned image. Paste your resume text below instead."
          );
        }
      }

      setStep("analyzing");
      // Yield a frame so the status updates before the synchronous analysis runs.
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const analysis = analyzeResume(text, jobDesc);

      setStep("saving");
      const session: AnalysisSession = {
        id: newId(),
        fileName: mode === "pdf" && file ? file.name : "Pasted resume text",
        jobTitle: jobTitle.trim() || "Target role",
        jobDescription: jobDesc,
        resumeText: text,
        analysis,
        analyzedAt: new Date().toISOString(),
      };
      saveSession(session);
      navigate(`/results?id=${session.id}`);
    } catch (err) {
      setStep("idle");
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    }
  }

  const jdWords = wordCount(jobDesc);
  const busy = step !== "idle";

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl">Analyze your resume</h1>
          <p className="mt-3 text-ink-muted">
            Your resume is parsed and scored locally in your browser — nothing is uploaded.
          </p>
        </div>

        {!busy ? (
          <div className="card-elevated p-6 sm:p-8 space-y-8 animate-fade-up">
            <div>
              <div className="flex items-center justify-between mb-2 gap-3">
                <span className="text-sm font-medium text-ink-muted">Resume</span>
                <div className="inline-flex rounded-lg border border-border p-0.5 text-xs font-medium" role="tablist">
                  {(["pdf", "text"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="tab"
                      aria-selected={mode === m}
                      onClick={() => setMode(m)}
                      className={cn(
                        "rounded-md px-3 py-1.5 transition-colors",
                        mode === m ? "bg-accent text-white" : "text-ink-muted hover:text-ink"
                      )}
                    >
                      {m === "pdf" ? "Upload PDF" : "Paste text"}
                    </button>
                  ))}
                </div>
              </div>

              {mode === "pdf" ? (
                <>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload resume PDF"
                    className={cn("drop-zone", dragActive && "drop-zone-active")}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const dropped = e.dataTransfer.files?.[0];
                      if (dropped) setPdfFile(dropped);
                    }}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        inputRef.current?.click();
                      }
                    }}
                  >
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="sr-only"
                      onChange={(e) => {
                        setPdfFile(e.target.files?.[0] ?? null);
                        e.target.value = "";
                      }}
                    />
                    <svg className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="font-medium text-ink">Drag & drop your PDF here</p>
                    <p className="text-sm text-ink-muted">or click to browse · max {MAX_FILE_MB} MB</p>
                  </div>
                  {file && (
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                      <span className="font-medium text-ink truncate">{file.name}</span>
                      <span className="text-ink-muted shrink-0 ml-auto pl-2">{formatSize(file.size)}</span>
                      <button
                        type="button"
                        className="ml-3 text-ink-muted hover:text-danger text-xs font-medium"
                        onClick={() => setFile(null)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <textarea
                    id="resume-text"
                    aria-label="Resume text"
                    rows={10}
                    placeholder="Paste the full text of your resume here…"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                  <p className="mt-2 text-xs text-ink-muted">
                    {wordCount(resumeText)} words · useful for scanned PDFs or Word documents
                  </p>
                </>
              )}
            </div>

            <div>
              <label htmlFor="job-title" className="block mb-2">
                Job title <span className="font-normal text-ink-muted">(optional)</span>
              </label>
              <input
                id="job-title"
                type="text"
                placeholder="e.g. Frontend Developer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="job-desc" className="block mb-2">
                Job description <span className="text-danger">*</span>
              </label>
              <textarea
                id="job-desc"
                rows={8}
                placeholder="Paste the full job posting here — requirements, skills, responsibilities…"
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
              />
              <p className={cn("mt-2 text-xs", jdWords > 0 && jdWords < MIN_JD_WORDS ? "text-warning" : "text-ink-muted")}>
                {jdWords} words
                {jdWords > 0 && jdWords < MIN_JD_WORDS
                  ? " · this looks short — paste the full posting for accurate matching"
                  : " · more detail = better keyword matching"}
              </p>
            </div>

            {error && (
              <div role="alert" className="rounded-xl bg-danger-soft border border-red-200 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <button type="button" className="btn-primary w-full py-3.5" onClick={runAnalysis}>
              Run analysis
            </button>
          </div>
        ) : (
          <div className="card-elevated p-10 flex flex-col items-center text-center animate-fade-up" aria-live="polite">
            <h2 className="text-2xl font-semibold text-ink mb-8">Analyzing your resume</h2>
            <div className="h-14 w-14 rounded-full border-4 border-accent-soft border-t-accent animate-spin" aria-hidden />
            <ol className="mt-8 space-y-2 text-sm text-left">
              {(Object.keys(STEP_LABELS) as (keyof typeof STEP_LABELS)[]).map((s, i, all) => {
                const current = all.indexOf(step as keyof typeof STEP_LABELS);
                const state = i < current ? "done" : i === current ? "active" : "todo";
                return (
                  <li
                    key={s}
                    className={cn(
                      "flex items-center gap-2",
                      state === "done" && "text-success",
                      state === "active" && "text-ink font-medium",
                      state === "todo" && "text-ink-muted/60"
                    )}
                  >
                    <span aria-hidden>{state === "done" ? "✓" : state === "active" ? "•" : "○"}</span>
                    {STEP_LABELS[s]}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
