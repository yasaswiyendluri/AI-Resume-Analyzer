import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";

// Import Navbar component
import Navbar from "./components/Navbar";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0d9488" />
        <link rel="icon" href="/favicon.ico" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Navbar visible on all pages */}
        <Navbar />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <main className="page-shell flex justify-center">
      <div className="h-10 w-10 rounded-full border-4 border-accent-soft border-t-accent animate-spin" aria-label="Loading" />
    </main>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-xl card p-10 text-center">
        <h1 className="text-3xl">{message}</h1>
        <p className="mt-3 text-ink-muted">{details}</p>
        <a href="/" className="btn-primary mt-8">
          Back to home
        </a>
        {stack && (
          <pre className="mt-6 w-full p-4 overflow-x-auto text-left text-xs bg-slate-50 rounded-xl">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </main>
  );
}