import { formatBRL } from "@/lib/format";
import type { AppEarning } from "@/lib/admob/reports";

interface AppEarningsListProps {
  apps: AppEarning[];
}

function formatPlatform(platform: string): string {
  if (platform.toUpperCase() === "ANDROID") {
    return "Android";
  }
  if (platform.toUpperCase() === "IOS") {
    return "iOS";
  }
  return platform;
}

export function AppEarningsList({ apps }: AppEarningsListProps) {
  if (apps.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-700 px-4 py-8 text-center text-sm text-zinc-500">
        Nenhum ganho por app encontrado para este mês.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800 bg-zinc-900/70">
      {apps.map((app) => (
        <li
          key={`${app.appId}-${app.platform}`}
          className="flex items-center justify-between gap-4 px-5 py-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-white">{app.appName}</p>
              <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {formatPlatform(app.platform)}
              </span>
            </div>
            <p className="text-xs text-zinc-500">{app.appId}</p>
          </div>
          <p className="text-lg font-semibold text-emerald-400">
            {formatBRL(app.amount)}
          </p>
        </li>
      ))}
    </ul>
  );
}
