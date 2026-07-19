"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dashboard } from "@/components/Dashboard";
import { useAuth } from "@/components/AuthProvider";

export default function HomePage() {
  const { sessionReady, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !sessionReady) {
      router.replace("/login");
    }
  }, [loading, sessionReady, router]);

  if (loading || !sessionReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-400">Carregando...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Dashboard />
    </div>
  );
}
