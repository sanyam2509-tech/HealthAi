import Link from "next/link";
import { Activity, HeartPulse } from "lucide-react";
import { getServerSession } from "next-auth";

import { SignOutButton } from "@/components/SignOutButton";
import { authOptions } from "@/lib/auth";

export async function Navbar() {
  const session = await getServerSession(authOptions);
  const isSignedIn = Boolean(session?.user?.id);

  return (
    <header className="sticky top-0 z-30 px-3 py-3 sm:px-4 sm:py-4 md:px-6">
      <div className="container">
        <div className="glass-panel rounded-[1.5rem] border border-white/60 px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:px-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="flex min-w-0 items-center gap-3 font-semibold text-slate-950">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-300 text-slate-950 shadow-[0_12px_30px_rgba(56,189,248,0.22)] sm:h-11 sm:w-11">
              <HeartPulse className="h-5 w-5" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm sm:text-base">HealthVault AI</span>
              <span className="truncate text-[11px] font-medium text-slate-500 sm:text-xs">
                Medical reports, made readable
              </span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-600">
            <Link
              href="/"
              className="rounded-full px-3 py-2 transition hover:bg-white hover:text-slate-950 sm:px-4"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full px-3 py-2 transition hover:bg-white hover:text-slate-950 sm:px-4"
            >
              Dashboard
            </Link>

            {isSignedIn ? (
              <>
                <span className="hidden max-w-[220px] truncate rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700 xl:inline-flex">
                  {session?.user?.name ?? session?.user?.email}
                </span>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-full px-3 py-2 transition hover:bg-white hover:text-slate-950 sm:px-4"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-slate-950 px-3 py-2 text-white transition hover:opacity-95 sm:px-4"
                >
                  Register
                </Link>
              </>
            )}

            <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-600 md:inline-flex">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              Analyzer live
            </span>
          </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
