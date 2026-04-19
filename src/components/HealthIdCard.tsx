import { ShieldCheck } from "lucide-react";

import { useProfile } from "@/context/ProfileContext";

export function HealthIdCard() {
  const { activeProfile } = useProfile();

  if (!activeProfile) {
    return null;
  }

  return (
    <div className="glass-panel rounded-[1.75rem] border border-white/60 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Health ID</p>
          <p className="mt-2 text-2xl font-semibold tracking-[0.12em] text-slate-950">{activeProfile.healthId}</p>
        </div>
        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        This is {activeProfile.name}&apos;s portable Health ID inside the React + Firebase version.
      </p>
    </div>
  );
}
