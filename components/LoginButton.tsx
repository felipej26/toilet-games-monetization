"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

export function LoginButton() {
  const { signInWithGoogle, user, sessionReady, authError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const syncingSession = Boolean(user && !sessionReady);
  const displayError = error ?? authError;

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Não foi possível fazer login.";
      setError(message);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (syncingSession) {
      return;
    }
    setLoading(false);
  }, [syncingSession]);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading || syncingSession}
        className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-zinc-200 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading || syncingSession ? "Entrando..." : "Entrar com Google"}
      </button>
      {displayError ? (
        <p className="max-w-sm text-center text-sm text-red-400">{displayError}</p>
      ) : null}
    </div>
  );
}
