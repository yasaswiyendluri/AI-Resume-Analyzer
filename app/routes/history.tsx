import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import { clearHistory, deleteSession, loadHistory } from "~/lib/storage";
import { cn, formatDate, scoreTone } from "~/lib/utils";
import type { AnalysisSession } from "~/types/analysis";

export const meta: MetaFunction = () => [{ title: "History | ResumeAI" }];

const TONE_TEXT = { success: "text-success bg-success-soft", warning: "text-warning bg-warning-soft", danger: "text-danger bg-danger-soft" } as const;

export default function History() {
  const [items, setItems] = useState<AnalysisSession[] | null>(null);

  useEffect(() => setItems(loadHistory()), []);

  if (items === null) return <main className="page-shell" />;

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl">History</h1>
            <p className="mt-3 text-ink-muted">
              Your recent analyses, stored only in this browser. Compare versions as you tailor your resume.
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              className="btn-secondary text-danger"
              onClick={() => {
                if (confirm("Delete all saved analyses from this browser?")) {
                  clearHistory();
                  setItems([]);
                }
              }}
            >
              Clear all
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-ink-muted">No saved analyses yet.</p>
            <Link to="/upload" className="btn-primary mt-6">
              Analyze a resume
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((s) => (
              <li key={s.id} className="card p-4 sm:p-5 flex items-center gap-4">
                <span
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold tabular-nums",
                    TONE_TEXT[scoreTone(s.analysis.score)]
                  )}
                >
                  {s.analysis.score}
                </span>
                <Link to={`/results?id=${s.id}`} className="min-w-0 flex-1 group">
                  <p className="font-semibold text-ink truncate group-hover:text-accent">{s.jobTitle}</p>
                  <p className="text-sm text-ink-muted truncate">
                    {s.fileName} · {formatDate(s.analyzedAt)}
                    {s.aiReview && " · ✨ AI reviewed"}
                  </p>
                </Link>
                <button
                  type="button"
                  aria-label={`Delete analysis for ${s.jobTitle}`}
                  className="text-xs font-medium text-ink-muted hover:text-danger px-2 py-1"
                  onClick={() => {
                    deleteSession(s.id);
                    setItems(loadHistory());
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
