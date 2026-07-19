import { formatBRL } from "@/lib/format";

interface EarningsCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  highlight?: boolean;
}

export function EarningsCard({
  title,
  amount,
  subtitle,
  highlight = false,
}: EarningsCardProps) {
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
      {subtitle ? (
        <p className="mt-2 text-xs text-zinc-500">{subtitle}</p>
      ) : null}
    </article>
  );
}
