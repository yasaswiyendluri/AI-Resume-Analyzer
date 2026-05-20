import type { MetaFunction } from "react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  analyzeResume,
  saveAnalysisSession,
} from "~/lib/analyzeResume";
import { formatSize } from "~/lib/utils";

export const meta: MetaFunction = () => {
  return [{ title: "Analyze Resume | ResumeAI" }];
};

const MAX_FILE_MB = 10;

const LOADING_STEPS = [
  { until: 35, label: "Reading your PDF…" },
  { until: 65, label: "Extracting skills & keywords…" },
  { until: 90, label: "Comparing with job description…" },
  { until: 100, label: "Building your report…" },
];

function stepLabel(progress: number): string {
  const step = LOADING_STEPS.find((s) => progress < s.until);
  return step?.label ?? "Done";
}

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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
    if (!file) {
      setError("Please upload your resume (PDF).");
      return;
    }
    if (!jobDesc.trim()) {
      setError("Please paste the job description.");
      return;
    }

    setError("");
    setLoading(true);
    setProgress(8);

    try {
      setProgress(25);
      const { extractTextFromPDF } = await import("~/utils/pdfParser");
      const resumeText = await extractTextFromPDF(file);
      setProgress(55);

      if (!resumeText.trim()) {
        throw new Error(
          "Could not read text from this PDF. Try a text-based PDF (not a scanned image)."
        );
      }

      setProgress(75);
      const analysis = analyzeResume(resumeText, jobDesc);
      setProgress(95);

      const session = {
        fileName: file.name,
        jobTitle: jobTitle.trim() || "Target role",
        jobDescription: jobDesc,
        analysis,
        analyzedAt: new Date().toISOString(),
      };

      saveAnalysisSession(session);
      setProgress(100);

      navigate("/results", { state: session });
    } catch (err) {
      setLoading(false);
      setProgress(0);
      setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
    }
  }

  useEffect(() => {
    if (!loading || progress >= 100) return;
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 94));
    }, 120);
    return () => clearInterval(timer);
  }, [loading, progress]);

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl">Analyze your resume</h1>
          <p className="mt-3 text-ink-muted">
            We parse your PDF locally and score it against the job description.
          </p>
        </div>

        {!loading ? (
          <div className="card-elevated p-6 sm:p-8 space-y-8 animate-fade-up">
            <div>
              <label className="block mb-2">Resume (PDF)</label>
              <div
                role="button"
                tabIndex={0}
                className={`drop-zone ${dragActive ? "drop-zone-active" : ""}`}
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
                  if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="sr-only"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                />
                <svg className="h-10 w-10 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="font-medium text-ink">
                  {file ? file.name : "Drag & drop your PDF here"}
                </p>
                <p className="text-sm text-ink-muted">
                  or click to browse · max {MAX_FILE_MB} MB
                </p>
              </div>
              {file && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-medium text-ink truncate">{file.name}</span>
                  <span className="text-ink-muted shrink-0 ml-2">{formatSize(file.size)}</span>
                  <button
                    type="button"
                    className="ml-3 text-ink-muted hover:text-danger text-xs font-medium"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
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
              <p className="mt-2 text-xs text-ink-muted">
                {jobDesc.trim().split(/\s+/).filter(Boolean).length} words · more detail = better keyword matching
              </p>
            </div>

            {error && (
              <div className="rounded-xl bg-danger-soft border border-red-200 px-4 py-3 text-sm text-danger">
                {error}
              </div>
            )}

            <button type="button" className="btn-primary w-full py-3.5" onClick={runAnalysis}>
              Run analysis
            </button>
          </div>
        ) : (
          <div className="card-elevated p-10 flex flex-col items-center text-center animate-fade-up">
            <h2 className="text-2xl font-semibold text-ink mb-8">Analyzing your resume</h2>
            <div className="relative h-36 w-36">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (264 * progress) / 100}
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-accent">
                {progress}%
              </span>
            </div>
            <p className="mt-8 text-ink-muted animate-pulse-soft">{stepLabel(progress)}</p>
            {file && (
              <p className="mt-2 text-xs text-ink-muted">File: {file.name}</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
