"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Link2, Loader2 } from "lucide-react";

import { useClipboard } from "@/hooks/useClipboard";
import { useProfile } from "@/hooks/useProfile";
import { createShareLinkRequest } from "@/services/profile-service";

export function ProfileShareCard() {
  const { activeProfile } = useProfile();
  const activeProfileId = activeProfile?.id ?? "";
  const [sharePath, setSharePath] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { copied, copy } = useClipboard("Share link copied");

  useEffect(() => {
    if (!activeProfileId) {
      return;
    }

    setSharePath("");
    setExpiresAt("");
    setError("");
  }, [activeProfileId]);

  if (!activeProfile) {
    return null;
  }

  async function createShareLink() {
    if (!activeProfileId) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const data = await createShareLinkRequest(activeProfileId);
      setSharePath(data.sharePath);
      setExpiresAt(data.expiresAt);
    } catch (shareError) {
      setError(shareError instanceof Error ? shareError.message : "Failed to create share link.");
    } finally {
      setIsLoading(false);
    }
  }

  async function copyShareLink() {
    if (!sharePath) {
      return;
    }

    const url = `${window.location.origin}${sharePath}`;
    await copy(url);
  }

  return (
    <div className="glass-panel rounded-[1.75rem] border border-white/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
        Share access
      </p>
      <h3 className="mt-2 text-xl font-semibold text-slate-950">Doctor-ready share link</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Create a read-only link for {activeProfile.name}. It shows the latest health snapshot and recent reports, without exposing the whole account.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={createShareLink}
          disabled={isLoading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
          {sharePath ? "Refresh share link" : "Create share link"}
        </button>

        {sharePath ? (
          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied link" : "Copy link"}
          </button>
        ) : null}
      </div>

      {sharePath ? (
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/85 p-4">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Share link</p>
          <p className="mt-2 break-all text-sm leading-6 text-slate-800">{sharePath}</p>
          {expiresAt ? (
            <p className="mt-3 text-xs text-slate-500">
              Expires on {new Date(expiresAt).toLocaleString("en-IN")}
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
