"use client";

import { useAuth } from "./AuthProvider";

export function DashboardHeader() {
  const { user, signOutUser } = useAuth();

  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
          Toilet Games
        </p>
        <h1 className="mt-2 text-3xl font-bold text-white">
          Monetização AdMob
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Acompanhe seus ganhos em tempo quase real, em reais.
        </p>
      </div>
      <div className="flex items-center gap-3">
        {user?.email ? (
          <span className="hidden text-sm text-zinc-400 sm:inline">
            {user.email}
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => signOutUser()}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
