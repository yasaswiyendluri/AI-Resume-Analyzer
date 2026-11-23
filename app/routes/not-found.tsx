import type { MetaFunction } from "react-router";
import { Link } from "react-router";

export const meta: MetaFunction = () => [{ title: "Page not found | ResumeAI" }];

export default function NotFound() {
  return (
    <main className="page-shell">
      <div className="mx-auto max-w-md text-center card p-10">
        <p className="text-sm font-semibold text-accent">404</p>
        <h1 className="mt-2 text-3xl">Page not found</h1>
        <p className="mt-3 text-ink-muted">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary mt-8">
          Back to home
        </Link>
      </div>
    </main>
  );
}
