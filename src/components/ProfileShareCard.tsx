import { useState } from "react";

import { useProfile } from "@/context/ProfileContext";
import { createShareLink } from "@/services/profile-service";

export function ProfileShareCard() {
  const { activeProfile } = useProfile();
  const [shareLink, setShareLink] = useState("");
  const activeProfileId = activeProfile?.id ?? "";
  const activeProfileName = activeProfile?.name ?? "this profile";

  if (!activeProfile) {
    return null;
  }

  async function handleCreateLink() {
    if (!activeProfileId) {
      return;
    }

    const token = await createShareLink(activeProfileId);
    setShareLink(`${window.location.origin}/share/${token}`);
  }

  return (
    <div className="glass-panel rounded-[1.75rem] border border-white/60 p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Share access</p>
      <h3 className="mt-2 text-xl font-semibold text-slate-950">Doctor-ready share link</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Generate a read-only link for {activeProfileName} in the converted React app.
      </p>
      <button type="button" onClick={() => void handleCreateLink()} className="mt-4 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
        Create share link
      </button>
      {shareLink ? (
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/85 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Share link</p>
          <p className="mt-2 break-all text-sm leading-6 text-slate-800">{shareLink}</p>
        </div>
      ) : null}
    </div>
  );
}
