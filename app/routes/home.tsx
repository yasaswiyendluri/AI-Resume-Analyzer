import type { MetaFunction } from "react-router";
import { Link } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "ResumeAI — Smart Resume Analyzer" },
    {
      name: "description",
      content: "Upload your resume, paste a job description, and get ATS-style feedback in seconds.",
    },
  ];
};

const features = [
  {
    title: "Keyword matching",
    description: "See how your resume aligns with the job description’s language.",
  },
  {
    title: "ATS-friendly tips",
    description: "Actionable suggestions for structure, length, and measurable impact.",
  },
  {
    title: "Instant results",
    description: "PDF parsing and analysis run locally in your browser — no account required.",
  },
];

export default function Home() {
  return (
    <main>
      <section className="page-shell">
        <div className="mx-auto max-w-3xl text-center animate-fade-up">
          <p className="badge-success mb-6 mx-auto w-fit">
            Free · Browser-based · PDF support
          </p>
          <h1>
            Land more interviews with a resume that{" "}
            <span className="italic text-accent">fits the role</span>
          </h1>
          <p className="mt-6 text-lg text-ink-muted leading-relaxed max-w-2xl mx-auto">
            Upload your PDF, paste the job description, and get a match score plus
            strengths, gaps, and keyword insights — tailored to what recruiters and ATS
            systems look for.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/upload" className="btn-primary text-base px-8 py-3.5">
              Analyze my resume
            </Link>
            <Link to="/results" className="btn-secondary text-base px-8 py-3.5">
              View last result
            </Link>
          </div>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {["PDF upload", "Job description match", "Keyword gaps", "Score breakdown"].map(
            (item) => (
              <span key={item} className="feature-pill">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {item}
              </span>
            )
          )}
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {features.map((f, i) => (
            <article
              key={f.title}
              className="card p-6 animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent font-bold">
                {i + 1}
              </div>
              <h2 className="text-lg">{f.title}</h2>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                {f.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-16 card-elevated p-8 sm:p-10 text-center">
          <h2 className="font-display text-3xl text-ink">Ready in three steps</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3 text-left">
            {[
              ["Upload", "Drop your resume PDF (one file, under 10 MB)."],
              ["Paste", "Add the target job title and full job description."],
              ["Improve", "Use your score, keywords, and tips to refine your resume."],
            ].map(([step, desc], i) => (
              <li key={step} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white text-sm font-bold">
                  {i + 1}
                </span>
                <div>
                  <p className="font-semibold text-ink">{step}</p>
                  <p className="mt-1 text-sm text-ink-muted">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
