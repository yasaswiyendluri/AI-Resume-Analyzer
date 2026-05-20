import type { MetaFunction } from "react-router";
import { Link, useLocation } from "react-router";
import { useMemo } from "react";
import ScoreGauge from "~/components/ScoreGauge";
import { loadAnalysisSession } from "~/lib/analyzeResume";
import type { AnalysisSession } from "~/types/analysis";

export const meta: MetaFunction = () => {
  return [{ title: "Your Results | ResumeAI" }];
};

function scoreBadge(score: number): { label: string; className: string } {
  if (score >= 75) return { label: "Strong match", className: "badge-success" };
  if (score >= 55) return { label: "Good potential", className: "badge-warning" };
  return { label: "Needs work", className: "badge-danger" };
}

function EmptyState() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-lg text-center card p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-3xl">
          📄
        </div>
        <h1 className="text-3xl">No results yet</h1>
        <p className="mt-3 text-ink-muted">
          Upload a resume and job description to generate your personalized report.
        </p>
        <Link to="/upload" className="btn-primary mt-8">
          Start analysis
        </Link>
      </div>
    </main>
  );
}

export default function Results() {
  const location = useLocation();
  const state = location.state as AnalysisSession | undefined;

  const session = useMemo(() => {
    if (state?.analysis) return state;
    return loadAnalysisSession();
  }, [state]);

  if (!session?.analysis) {
    return <EmptyState />;
  }

  const { fileName, jobTitle, analysis, analyzedAt } = session;
  const badge = scoreBadge(analysis.score);
  const dateLabel = analyzedAt
    ? new Date(analyzedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <main className="page-shell">
      <header className="mb-10 animate-fade-up">
        <p className="text-sm font-medium text-accent uppercase tracking-wide">
          Analysis complete
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl">Your resume report</h1>
        <p className="mt-3 text-ink-muted max-w-2xl">
          Scored against <strong className="text-ink">{jobTitle}</strong>
          {fileName && (
            <>
              {" "}
              · <span className="text-ink">{fileName}</span>
            </>
          )}
          {dateLabel && <span className="block mt-1 text-sm">Analyzed {dateLabel}</span>}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="card-elevated p-8 flex flex-col items-center text-center animate-fade-up">
          <span className={`${badge.className} mb-6`}>{badge.label}</span>
          <ScoreGauge score={analysis.score} />
          <p className="mt-6 text-3xl font-bold text-ink">{analysis.score}%</p>
          <p className="text-sm text-ink-muted mt-1">match with job keywords & structure</p>
          <p className="mt-6 text-sm text-ink-muted leading-relaxed">
            {analysis.score >= 75
              ? "Solid alignment. Polish impact metrics and any missing keywords below."
              : analysis.score >= 55
              ? "Good foundation — tailoring keywords and quantifying wins will help most."
              : "Focus on keyword overlap, a clear skills section, and measurable achievements."}
          </p>
          <div className="mt-6 w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-ink-muted">
            ~{analysis.wordCount} words in resume
          </div>
        </section>

        <div className="space-y-6">
          {analysis.matchedKeywords.length > 0 && (
            <section className="card p-6 animate-fade-up">
              <h2 className="text-lg flex items-center gap-2">
                <span className="text-success">✓</span> Matched keywords
              </h2>
              <p className="mt-1 text-sm text-ink-muted mb-4">
                Terms from the job description found in your resume
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.matchedKeywords.map((kw) => (
                  <span key={kw} className="keyword-match">
                    {kw}
                  </span>
                ))}
              </div>
            </section>
          )}

          {analysis.missingKeywords.length > 0 && (
            <section className="card p-6 animate-fade-up">
              <h2 className="text-lg flex items-center gap-2">
                <span className="text-danger">!</span> Missing keywords
              </h2>
              <p className="mt-1 text-sm text-ink-muted mb-4">
                Consider adding these naturally if they reflect your experience
              </p>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords.map((kw) => (
                  <span key={kw} className="keyword-miss">
                    {kw}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-emerald-200 bg-success-soft/40 p-6 animate-fade-up">
          <h2 className="text-lg text-success flex items-center gap-2">
            What&apos;s working well
          </h2>
          <ul className="mt-4 space-y-3">
            {analysis.strengths.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-ink leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success text-white text-xs">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-warning-soft/40 p-6 animate-fade-up">
          <h2 className="text-lg text-warning flex items-center gap-2">
            Suggested improvements
          </h2>
          <ul className="mt-4 space-y-3">
            {analysis.improvements.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-ink leading-relaxed">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning text-white text-xs font-bold">
                  →
                </span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 pb-8">
        <Link to="/upload" className="btn-primary">
          Analyze another resume
        </Link>
        <Link to="/" className="btn-secondary">
          Back to home
        </Link>
      </footer>
    </main>
  );
}
