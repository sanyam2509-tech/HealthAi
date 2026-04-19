"use client";

import { Check, Copy, ShieldCheck } from "lucide-react";

import { useClipboard } from "@/hooks/useClipboard";
import { useProfile } from "@/hooks/useProfile";

export function HealthIdCard() {
  const { activeProfile } = useProfile();
  const { copied, copy } = useClipboard("Health ID copied");

  if (!activeProfile) {
    return null;
  }

  const healthId = activeProfile.healthId ?? "Pending";
  const profileName = activeProfile.name;

  return (
    <div className="glass-panel rounded-[1.75rem] border border-white/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Health ID
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-[0.12em] text-slate-950">
            {healthId}
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        This is {profileName}&apos;s shareable Health ID. Later, this is what you can use to connect a doctor to the right profile.
      </p>

      <button
        type="button"
        onClick={() => copy(healthId)}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50 sm:w-auto"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy Health ID"}
      </button>
    </div>
  );
}
