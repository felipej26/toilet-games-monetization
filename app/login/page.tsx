"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginButton } from "@/components/LoginButton";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 text-center shadow-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-400">
          Toilet Games
        </p>
        <h1 className="mt-4 text-2xl font-bold text-white">Monetização AdMob</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          Faça login com sua conta Google autorizada para visualizar os ganhos
          dos seus apps.
        </p>
        <div className="mt-8">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
