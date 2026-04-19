import Link from "next/link";
import {
  ArrowRight,
  Brain,
  FileClock,
  Files,
  HeartPulse,
  ScanSearch,
  ShieldCheck,
  Stethoscope,
  Users
} from "lucide-react";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

const featureCards = [
  {
    title: "Upload a report in seconds",
    description: "Use a blood report PDF or a clear report photo. HealthVault reads it and prepares a structured summary.",
    icon: ScanSearch
  },
  {
    title: "See what matters first",
    description: "Abnormal values are highlighted with simple explanations, likely meaning, and what may help next.",
    icon: Brain
  },
  {
    title: "Keep your report history together",
    description: "Save reports by account so you can come back later instead of searching through folders, WhatsApp, or email.",
    icon: FileClock
  }
];

const reasons = [
  {
    title: "Most families do not store reports in one clear system",
    body: "Reports often sit in bags, drawers, downloads folders, and chat threads. HealthVault gives them one searchable home."
  },
  {
    title: "Medical language is hard to read quickly",
    body: "Even when people receive the report, they often do not know which values are important or what follow-up is sensible."
  },
  {
    title: "Follow-up gets easier when history is visible",
    body: "A saved report timeline helps people compare older results and speak to doctors with better context."
  }
];

const trustPoints = [
  "Plain-language explanations for patients, parents, and older family members",
  "Quick health card for fast review, with full detail only when needed",
  "Account-based report history so past analyses stay available",
  "Built to expand into family profiles later without changing the core product"
];

const workflow = [
  {
    step: "1",
    title: "Upload",
    description: "Add a PDF or report image from your phone or laptop."
  },
  {
    step: "2",
    title: "Analyze",
    description: "HealthVault reads the report and identifies abnormal values."
  },
  {
    step: "3",
    title: "Understand",
    description: "You get a short health card plus a deeper explanation when you want it."
  },
  {
    step: "4",
    title: "Save",
    description: "The report stays in your account so you can revisit it later."
  }
];

const audiences = [
  {
    title: "For patients",
    description: "Understand your own reports without guessing which values matter."
  },
  {
    title: "For families",
    description: "Help parents or relatives review reports in simpler language."
  },
  {
    title: "For follow-up visits",
    description: "Bring older reports into doctor conversations with less confusion."
  }
];

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const primaryHref = session?.user?.id ? "/dashboard" : "/register";
  const primaryLabel = session?.user?.id ? "Open dashboard" : "Create account";

  return (
    <section className="space-y-12">
      <div className="mesh-card relative overflow-hidden rounded-[2rem] border border-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="pointer-events-none absolute -left-10 top-20 h-40 w-40 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-10 h-32 w-32 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-10 right-1/3 h-24 w-24 rounded-full bg-emerald-200/20 blur-3xl" />
        <div className="grid gap-10 p-8 md:grid-cols-[1.1fr_0.9fr] md:p-12">
          <div className="space-y-7">
            <span className="animate-fade-up inline-flex rounded-full border border-sky-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
              Personal health records, made readable
            </span>

            <div className="space-y-5">
              <h1 className="animate-fade-up delay-1 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
                HealthVault helps people understand medical reports without the usual confusion.
              </h1>
              <p className="animate-fade-up delay-2 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">
                Upload a medical report, let AI identify what looks abnormal, and get a calm,
                simple explanation you can actually use. Then keep that report saved in one place
                for the next time you need it.
              </p>
            </div>

            <div className="animate-fade-up delay-3 flex flex-wrap gap-4">
              <Link
                href={primaryHref}
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.2)]"
              >
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
              >
                See the product flow
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="glass-panel rounded-3xl border border-white/60 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.1)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Input
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">PDF + Images</p>
              </div>
              <div className="glass-panel rounded-3xl border border-white/60 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.1)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Output
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">Simple language</p>
              </div>
              <div className="glass-panel rounded-3xl border border-white/60 p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.1)]">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  History
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">Saved by account</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 self-start">
            <div className="animate-float-soft rounded-[1.75rem] border border-sky-100 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f5fbff_100%)] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(56,189,248,0.14)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
                    Quick health card
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    Cholesterol values need attention
                  </h2>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  Needs attention
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-700">
                  LDL is above the normal range.
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-700">
                  Triglycerides are also high.
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Next step</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Review this report with your doctor and compare it with any older lipid tests.
                </p>
              </div>
            </div>

            <div className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.1)]">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-300 text-slate-950 shadow-[0_12px_30px_rgba(56,189,248,0.22)]">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Why people use it
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">
                    Less confusion. Better memory. Faster follow-up.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {trustPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-700"
                  >
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {featureCards.map(({ title, description, icon: Icon }) => (
          <article
            key={title}
            className="glass-panel animate-fade-up rounded-[1.75rem] border border-white/60 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1.5 hover:border-sky-100 hover:shadow-[0_22px_44px_rgba(15,23,42,0.12)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[2rem] border border-white/60 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition duration-300 hover:shadow-[0_20px_44px_rgba(15,23,42,0.1)]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              What HealthVault is
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              A personal health record assistant for everyday people.
            </h2>
            <p className="text-sm leading-7 text-slate-600 md:text-base">
              HealthVault is not trying to replace doctors. It helps people organize their own
              medical reports, understand the important values faster, and return to old reports
              without starting from zero every time.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {reasons.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-sky-100 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]"
              >
                <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] border border-white/60 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition duration-300 hover:shadow-[0_20px_44px_rgba(15,23,42,0.1)]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
              <Files className="h-4 w-4" />
              How it works
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Built for a simple first version that still feels useful.
            </h2>
          </div>

          <div className="mt-6 grid gap-4">
            {workflow.map((item) => (
              <div
                key={item.step}
                className="grid gap-4 rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-sky-100 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)] md:grid-cols-[auto_1fr]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {audiences.map(({ title, description }, index) => {
          const Icon = index === 0 ? Stethoscope : index === 1 ? Users : FileClock;

          return (
            <article
              key={title}
              className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_44px_rgba(15,23,42,0.12)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
            </article>
          );
        })}
      </div>

      <div className="glass-panel rounded-[2rem] border border-white/60 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition duration-300 hover:shadow-[0_20px_44px_rgba(15,23,42,0.1)]">
        <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950">
              Start with one person, then grow into a family health workspace later.
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
              The current version already supports account-based report history, AI summaries,
              detailed report views, and Google login. That makes it useful today, while still
              leaving room for family profiles, broader timelines, and richer health tracking next.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href={primaryHref}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.2)]"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-900 transition duration-200 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
            >
              Try dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
