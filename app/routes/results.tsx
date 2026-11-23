import type { MetaFunction } from "react-router";
import { Link, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import ScoreGauge from "~/components/ScoreGauge";
import AiReviewPanel from "~/components/AiReviewPanel";
import CopyButton from "~/components/CopyButton";
import { getSession } from "~/lib/storage";
import { cn, formatDate, scoreLabel, scoreTone } from "~/lib/utils";
import type { AnalysisSession, Insight } from "~/types/analysis";

export const meta: MetaFunction = () => [{ title: "Your Results | ResumeAI" }];

const TONE_BADGE = { success: "badge-success", warning: "badge-warning", danger: "badge-danger" } as const;
const TONE_BAR = { success: "bg-success", warning: "bg-warning", danger: "bg-danger" } as const;
const PRIORITY_STYLE = {
  high: "bg-danger-soft text-danger",
  medium: "bg-warning-soft text-warning",
  low: "bg-slate-100 text-ink-muted",
} as const;

function EmptyState() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-lg text-center card p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-3xl" aria-hidden>
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

function InsightList({ items, variant }: { items: Insight[]; variant: "good" | "improve" }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item, idx) => (
        <li key={idx} className="flex gap-3 text-sm text-ink leading-relaxed">
          <span
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold",
              variant === "good" ? "bg-success" : "bg-warning"
            )}
            aria-hidden
          >
            {variant === "good" ? "✓" : "→"}
          </span>
          <span className="flex-1">
            {item.text}
            {variant === "improve" && (
              <span className={cn("ml-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide", PRIORITY_STYLE[item.priority])}>
                {item.priority}
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function Results() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [session, setSession] = useState<AnalysisSession | null | undefined>(undefined);

  useEffect(() => {
    setSession(getSession(id));
  }, [id]);

  if (session === undefined) return <main className="page-shell" />;
  if (!session) return <EmptyState />;

  const { fileName, jobTitle, analysis, analyzedAt } = session;
  const tone = scoreTone(analysis.score);
  const missingLabels = analysis.missingKeywords.map((k) => k.label);

  return (
    <main className="page-shell">
      <header className="mb-10 animate-fade-up flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-sm font-medium text-accent uppercase tracking-wide">Analysis complete</p>
          <h1 className="mt-2 text-4xl sm:text-5xl">Your resume report</h1>
          <p className="mt-3 text-ink-muted max-w-2xl">
            Scored against <strong className="text-ink">{jobTitle}</strong>
            {fileName && <> · <span className="text-ink">{fileName}</span></>}
            {analyzedAt && <span className="block mt-1 text-sm">Analyzed {formatDate(analyzedAt)}</span>}
          </p>
        </div>
        <div className="flex gap-3 no-print">
          <button type="button" className="btn-secondary" onClick={() => window.print()}>
            Save as PDF
          </button>
          <Link to="/history" className="btn-secondary">
            History
          </Link>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <section className="card-elevated p-8 flex flex-col items-center text-center animate-fade-up">
          <span className={cn(TONE_BADGE[tone], "mb-6")}>{scoreLabel(analysis.score)}</span>
          <ScoreGauge score={analysis.score} />
          <p className="mt-4 text-sm text-ink-muted">Overall ATS match score</p>
          <p className="mt-4 text-sm text-ink-muted leading-relaxed">
            {analysis.score >= 75
              ? "Solid alignment. Polish impact metrics and any missing keywords below."
              : analysis.score >= 55
                ? "Good foundation — tailoring keywords and quantifying wins will help most."
                : "Focus on keyword overlap, a clear skills section, and measurable achievements."}
          </p>
        </section>

        <section className="card p-6 sm:p-8 animate-fade-up">
          <h2 className="text-lg">Score breakdown</h2>
          <div className="mt-5 space-y-5">
            {analysis.categories.map((c) => {
              const t = scoreTone(c.score);
              return (
                <div key={c.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium text-ink">
                      {c.label} <span className="text-xs text-ink-muted font-normal">· {Math.round(c.weight * 100)}% weight</span>
                    </span>
                    <span className="font-semibold text-ink tabular-nums">{c.score}</span>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-700", TONE_BAR[t])} style={{ width: `${c.score}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">{c.summary}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6 animate-fade-up">
          <h2 className="text-lg flex items-center gap-2">
            <span className="text-success" aria-hidden>✓</span> Matched keywords ({analysis.matchedKeywords.length})
          </h2>
          <p className="mt-1 text-sm text-ink-muted mb-4">Job description terms found in your resume</p>
          {analysis.matchedKeywords.length ? (
            <div className="flex flex-wrap gap-2">
              {analysis.matchedKeywords.map((kw) => (
                <span key={kw.label} className={cn("keyword-match", kw.kind === "term" && "font-normal")}>
                  {kw.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">No overlapping terms found.</p>
          )}
        </section>

        <section className="card p-6 animate-fade-up">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg flex items-center gap-2">
              <span className="text-danger" aria-hidden>!</span> Missing keywords ({analysis.missingKeywords.length})
            </h2>
            {missingLabels.length > 0 && <CopyButton text={missingLabels.join(", ")} label="Copy all" />}
          </div>
          <p className="mt-1 text-sm text-ink-muted mb-4">
            Add these naturally — only if they reflect your real experience. <strong>Bold</strong> = known skill.
          </p>
          {analysis.missingKeywords.length ? (
            <div className="flex flex-wrap gap-2">
              {analysis.missingKeywords.map((kw) => (
                <span key={kw.label} className={cn("keyword-miss", kw.kind === "term" ? "font-normal" : "font-semibold")}>
                  {kw.label}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-success">Nothing important missing. 🎉</p>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-emerald-200 bg-success-soft/40 p-6 animate-fade-up">
          <h2 className="text-lg text-success">What&apos;s working well</h2>
          {analysis.strengths.length ? (
            <InsightList items={analysis.strengths} variant="good" />
          ) : (
            <p className="mt-4 text-sm text-ink-muted">Apply the suggestions to start building strengths.</p>
          )}
        </section>

        <section className="rounded-2xl border border-amber-200 bg-warning-soft/40 p-6 animate-fade-up">
          <h2 className="text-lg text-warning">Suggested improvements</h2>
          {analysis.improvements.length ? (
            <InsightList items={analysis.improvements} variant="improve" />
          ) : (
            <p className="mt-4 text-sm text-ink-muted">No major issues found — fine-tune wording for this role.</p>
          )}
        </section>
      </div>

      <section className="mt-6 card p-6 animate-fade-up">
        <h2 className="text-lg">ATS checklist</h2>
        <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          {[
            ...analysis.sections.map((s) => ({ label: `${s.label} section`, ok: s.found })),
            { label: "Email address", ok: analysis.contact.email },
            { label: "Phone number", ok: analysis.contact.phone },
            { label: "LinkedIn profile", ok: analysis.contact.linkedin },
            { label: "Portfolio / GitHub link", ok: analysis.contact.portfolio },
            { label: "No first-person pronouns", ok: analysis.stats.pronounCount <= 2 },
            { label: "No cliché / weak phrases", ok: analysis.stats.weakPhrases.length === 0 },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className={cn("font-bold", row.ok ? "text-success" : "text-danger")} aria-hidden>
                {row.ok ? "✓" : "✗"}
              </span>
              <span className={row.ok ? "text-ink" : "text-ink-muted"}>{row.label}</span>
              <span className="sr-only">{row.ok ? "passed" : "missing"}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-muted">
          {analysis.stats.wordCount} words · {analysis.stats.bulletCount} bullet points ·{" "}
          {analysis.stats.quantifiedBullets} with metrics · {analysis.stats.actionVerbBullets} start with an action verb
        </p>
      </section>

      <div className="mt-6">
        <AiReviewPanel session={session} onUpdate={setSession} />
      </div>

      <footer className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 pb-8 no-print">
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
