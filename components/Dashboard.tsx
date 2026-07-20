"use client";

import { useCallback, useEffect, useState } from "react";
import type { EarningsSummary } from "@/lib/admob/reports";
import { AppEarningsList } from "./AppEarningsList";
import { DashboardHeader } from "./DashboardHeader";
import { EarningsCard } from "./EarningsCard";

function EarningsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/70"
        />
      ))}
    </div>
  );
}

async function fetchEarningsSummary(): Promise<EarningsSummary> {
  const response = await fetch("/api/earnings");
  const payload = (await response.json()) as
    | EarningsSummary
    | { error?: string };

  if (!response.ok) {
    throw new Error(
      "error" in payload && payload.error
        ? payload.error
        : "Falha ao carregar ganhos.",
    );
  }

  return payload as EarningsSummary;
}

export function Dashboard() {
  const [data, setData] = useState<EarningsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEarnings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const earnings = await fetchEarningsSummary();
      setData(earnings);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao carregar ganhos.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialEarnings() {
      try {
        const earnings = await fetchEarningsSummary();
        if (isActive) {
          setData(earnings);
        }
      } catch (err) {
        if (isActive) {
          const message =
            err instanceof Error ? err.message : "Falha ao carregar ganhos.";
          setError(message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadInitialEarnings();

    return () => {
      isActive = false;
    };
  }, []);

  const updatedAt = data?.updatedAt
    ? new Date(data.updatedAt).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      })
    : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-6 py-10">
      <DashboardHeader />

      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-zinc-500">
          {updatedAt
            ? `Última atualização: ${updatedAt}`
            : "Carregando dados..."}
        </p>
        <button
          type="button"
          onClick={() => void loadEarnings()}
          disabled={loading}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Atualizar
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <EarningsSkeleton />
      ) : data ? (
        <div className="space-y-8">
          <section className="grid gap-4 md:grid-cols-2">
            <EarningsCard
              title="Hoje"
              amount={data.today}
              previousAmount={data.yesterday}
              comparisonLabel="ontem"
              highlight
            />
            <EarningsCard
              title="Ontem"
              amount={data.yesterday}
              previousAmount={data.dayBeforeYesterday}
              comparisonLabel="anteontem"
            />
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <EarningsCard
              title="Este mês"
              amount={data.currentMonth}
              previousAmount={data.lastMonthSamePeriod}
              comparisonLabel="o mesmo período do mês passado"
            />
            <EarningsCard
              title="Mês passado"
              amount={data.lastMonth}
              previousAmount={data.monthBeforeLast}
              comparisonLabel="o mês anterior"
              subtitle="Total do mês anterior completo"
            />
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">
              Ganhos por app — Este mês
            </h2>
            <AppEarningsList apps={data.currentMonthByApp} />
          </section>
        </div>
      ) : null}
    </main>
  );
}
