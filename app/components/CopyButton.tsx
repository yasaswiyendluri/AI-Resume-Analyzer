import { useState } from "react";
import { cn } from "~/lib/utils";

export default function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={cn(
        "no-print shrink-0 rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-medium text-ink-muted hover:text-ink hover:bg-slate-50 transition-colors",
        className
      )}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked — ignore */
        }
      }}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
