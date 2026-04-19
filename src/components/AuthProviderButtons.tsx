import { Loader2 } from "lucide-react";
import { useState } from "react";

import { useAuth } from "@/context/AuthContext";

export function AuthProviderButtons() {
  const { loginWithGoogleProvider } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    setError("");
    setLoading(true);

    try {
      await loginWithGoogleProvider();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Google login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-x-0 h-px bg-slate-200" />
        <span className="relative bg-white/80 px-3 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          Or continue with
        </span>
      </div>
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Continue with Google
      </button>
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
    </div>
  );
}
