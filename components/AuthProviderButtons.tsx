"use client";

import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

type AuthProviderButtonsProps = {
  googleEnabled: boolean;
  appleEnabled: boolean;
};

export function AuthProviderButtons({
  googleEnabled,
  appleEnabled
}: AuthProviderButtonsProps) {
  const [activeProvider, setActiveProvider] = useState<"google" | "apple" | null>(null);

  if (!googleEnabled && !appleEnabled) {
    return null;
  }

  async function handleProviderSignIn(provider: "google" | "apple") {
    setActiveProvider(provider);
    await signIn(provider, { callbackUrl: "/dashboard" });
  }

  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-slate-200" />
        <span className="relative bg-white/80 px-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          Or continue with
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {googleEnabled ? (
          <button
            type="button"
            onClick={() => handleProviderSignIn("google")}
            disabled={activeProvider !== null}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {activeProvider === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Continue with Google
          </button>
        ) : null}

        {appleEnabled ? (
          <button
            type="button"
            onClick={() => handleProviderSignIn("apple")}
            disabled={activeProvider !== null}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-950 px-4 py-3 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {activeProvider === "apple" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Continue with Apple
          </button>
        ) : null}
      </div>
    </div>
  );
}
