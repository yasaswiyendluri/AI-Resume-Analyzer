import { useState } from "react";
import { runAiReview } from "~/lib/aiReview";
import { saveSession } from "~/lib/storage";
import type { AnalysisSession } from "~/types/analysis";
import CopyButton from "./CopyButton";

export default function AiReviewPanel({
  session,
  onUpdate,
}: {
  session: AnalysisSession;
  onUpdate: (s: AnalysisSession) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const review = session.aiReview;

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const aiReview = await runAiReview(session.resumeText, session.jobTitle, session.jobDescription);
      const updated = { ...session, aiReview };
      saveSession(updated);
      onUpdate(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI review failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card-elevated p-6 sm:p-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2">
            <span aria-hidden>✨</span> AI recruiter review
          </h2>
          <p className="mt-1 text-sm text-ink-muted max-w-xl">
            Get a written review, rewritten bullet points and a tailored summary from an LLM.
            Powered by Puter.js — you may be asked to sign in to a free Puter account. Your resume
            text is sent to the AI provider only when you click the button.
          </p>
        </div>
        <button type="button" className="btn-primary shrink-0 no-print" onClick={generate} disabled={loading}>
          {loading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden />
              Reviewing…
            </>
          ) : review ? (
            "Regenerate"
          ) : (
            "Get AI review"
          )}
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-4 rounded-xl bg-danger-soft border border-red-200 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {review && (
        <div className="mt-6 space-y-6">
          <div className="rounded-xl bg-accent-soft/40 border border-teal-100 p-4">
            <p className="text-sm font-semibold text-accent">AI fit score: {review.score}/100</p>
            <p className="mt-1 text-sm text-ink leading-relaxed">{review.summary}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-success">Strengths</h3>
              <ul className="mt-2 space-y-2 text-sm list-disc pl-5">
                {review.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-warning">Gaps to address</h3>
              <ul className="mt-2 space-y-2 text-sm list-disc pl-5">
                {review.gaps.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </div>

          {review.bulletRewrites.length > 0 && (
            <div>
              <h3 className="font-semibold">Suggested bullet rewrites</h3>
              <div className="mt-3 space-y-3">
                {review.bulletRewrites.map((b, i) => (
                  <div key={i} className="rounded-xl border border-border p-4 text-sm">
                    <p className="text-ink-muted line-through decoration-danger/40">{b.original}</p>
                    <div className="mt-2 flex items-start justify-between gap-3">
                      <p className="text-ink font-medium">{b.improved}</p>
                      <CopyButton text={b.improved} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {review.tailoredSummary && (
            <div>
              <h3 className="font-semibold">Tailored professional summary</h3>
              <div className="mt-3 flex items-start justify-between gap-3 rounded-xl bg-slate-50 p-4 text-sm">
                <p className="leading-relaxed">{review.tailoredSummary}</p>
                <CopyButton text={review.tailoredSummary} />
              </div>
            </div>
          )}

          <p className="text-xs text-ink-muted">
            Generated with {review.model}. AI feedback can be wrong — verify suggestions and never add
            experience you don't have.
          </p>
        </div>
      )}
    </section>
  );
}
