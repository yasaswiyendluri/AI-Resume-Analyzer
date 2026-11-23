import { scoreTone } from "~/lib/utils";

const TONE_STROKE = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
} as const;

/** Semi-circular gauge. Uses pathLength=100 so no DOM measurement is needed. */
export default function ScoreGauge({ score }: { score: number }) {
  const tone = scoreTone(score);
  return (
    <div className="relative w-48 h-24" role="img" aria-label={`Score ${score} out of 100`}>
      <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
        <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="var(--color-border)" strokeWidth="10" strokeLinecap="round" />
        <path
          d="M10,50 A40,40 0 0,1 90,50"
          fill="none"
          stroke={TONE_STROKE[tone]}
          strokeWidth="10"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - score}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <span className="text-4xl font-bold text-ink">{score}</span>
        <span className="text-sm text-ink-muted">/100</span>
      </div>
    </div>
  );
}
