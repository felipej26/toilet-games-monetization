import { formatBRL } from "@/lib/format";

interface EarningsCardProps {
  title: string;
  amount: number;
  previousAmount: number;
  comparisonLabel: string;
  subtitle?: string;
  highlight?: boolean;
}

type ComparisonTone = "up" | "down" | "neutral";

function getComparison(
  current: number,
  previous: number,
  periodLabel: string,
): { text: string; tone: ComparisonTone } {
  const diff = current - previous;

  if (diff === 0) {
    return { text: `Igual a ${periodLabel}`, tone: "neutral" };
  }

  const formattedDiff = formatBRL(Math.abs(diff));

  if (diff > 0) {
    return {
      text: `${formattedDiff} a mais que ${periodLabel}`,
      tone: "up",
    };
  }

  return {
    text: `${formattedDiff} a menos que ${periodLabel}`,
    tone: "down",
  };
}

const toneStyles: Record<ComparisonTone, string> = {
  up: "text-emerald-400",
  down: "text-red-400",
  neutral: "text-zinc-500",
};

const toneIcons: Record<ComparisonTone, string> = {
  up: "↑",
  down: "↓",
  neutral: "→",
};

export function EarningsCard({
  title,
  amount,
  previousAmount,
  comparisonLabel,
  subtitle,
  highlight = false,
}: EarningsCardProps) {
  const comparison = getComparison(amount, previousAmount, comparisonLabel);

  return (
    <article
      className={`rounded-2xl border p-6 shadow-sm ${
        highlight
          ? "border-emerald-500/30 bg-emerald-500/10"
          : "border-zinc-800 bg-zinc-900/70"
      }`}
    >
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">
        {formatBRL(amount)}
      </p>
      <p className={`mt-2 text-sm font-medium ${toneStyles[comparison.tone]}`}>
        <span aria-hidden="true">{toneIcons[comparison.tone]} </span>
        {comparison.text}
      </p>
      {subtitle ? (
        <p className="mt-2 text-xs text-zinc-500">{subtitle}</p>
      ) : null}
    </article>
  );
}
