import type { MetaFunction } from "react-router";
import { Link } from "react-router";

export const meta: MetaFunction = () => {
  return [{ title: "Account | ResumeAI" }];
};

export default function Auth() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-md text-center card p-10">
        <h1 className="text-3xl">Sign in</h1>
        <p className="mt-3 text-ink-muted text-sm leading-relaxed">
          This app runs analysis in your browser — no account is required for the core
          flow. Cloud sign-in (via Puter.js) can be wired later for saving history across
          devices.
        </p>
        <div className="mt-8 rounded-xl bg-accent-soft/50 border border-teal-100 px-4 py-3 text-sm text-ink-muted text-left">
          <p className="font-medium text-ink mb-1">Tip</p>
          Use <Link to="/upload" className="text-accent font-medium hover:underline">Analyze</Link>{" "}
          to get started. Your last result is kept in this browser until you clear site data.
        </div>
        <Link to="/upload" className="btn-primary mt-8 w-full">
          Go to analyzer
        </Link>
      </div>
    </main>
  );
}
