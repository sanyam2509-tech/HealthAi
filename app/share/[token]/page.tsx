import Link from "next/link";
import { FileSpreadsheet, ShieldCheck } from "lucide-react";

import { getSharedProfileSnapshot } from "@/lib/sharing";

type SharedProfilePageProps = {
  params: {
    token: string;
  };
};

function getOverallTone(status: "normal" | "mostly_normal" | "needs_attention" | "urgent_review") {
  switch (status) {
    case "normal":
      return "bg-emerald-100 text-emerald-700";
    case "mostly_normal":
      return "bg-sky-100 text-sky-700";
    case "urgent_review":
      return "bg-red-100 text-red-700";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

function getStatusTone(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("high") || normalized.includes("low") || normalized.includes("abnormal")) {
    return {
      badge: "bg-red-100 text-red-700",
      panel: "border-red-200 bg-red-50/70"
    };
  }

  if (normalized.includes("normal")) {
    return {
      badge: "bg-emerald-100 text-emerald-700",
      panel: "border-emerald-200 bg-emerald-50/70"
    };
  }

  return {
    badge: "bg-amber-100 text-amber-800",
    panel: "border-amber-200 bg-amber-50/70"
  };
}

export default async function SharedProfilePage({ params }: SharedProfilePageProps) {
  const snapshot = await getSharedProfileSnapshot(params.token);

  if (!snapshot) {
    return (
      <section className="space-y-6">
        <div className="glass-panel rounded-[2rem] border border-white/60 p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Shared view</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Share link unavailable
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This share link may have expired, been revoked, or never existed.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
          >
            Back to HealthVault
          </Link>
        </div>
      </section>
    );
  }

  const latestReport = snapshot.latestReport;

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="mesh-card overflow-hidden rounded-[2rem] border border-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:p-10">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-sky-200 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
              Shared health summary
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
                {snapshot.profile.name}&apos;s health snapshot
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                This is a read-only summary shared from HealthVault. It shows the latest report overview and recent report history for this profile.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="glass-panel rounded-3xl border border-white/60 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Profile
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{snapshot.profile.name}</p>
                <p className="mt-1 text-sm text-slate-500">{snapshot.profile.relation}</p>
              </div>
              <div className="glass-panel rounded-3xl border border-white/60 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Health ID
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[0.12em] text-slate-950">
                  {snapshot.profile.healthId}
                </p>
              </div>
              <div className="glass-panel rounded-3xl border border-white/60 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Shared reports
                </p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{snapshot.reports.length}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 self-start">
            <div className="glass-panel rounded-[1.75rem] border border-white/60 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Latest report snapshot
                  </p>
                  <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                    {latestReport ? latestReport.healthCard.headline : "No reports shared yet"}
                  </h2>
                </div>
                <ShieldCheck className="mt-1 h-5 w-5 text-sky-500" />
              </div>

              {latestReport ? (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getOverallTone(
                        latestReport.healthCard.overall_status
                      )}`}
                    >
                      {latestReport.healthCard.overall_status.replaceAll("_", " ")}
                    </span>
                    <span className="text-sm text-slate-500">{latestReport.reportDate}</span>
                  </div>

                  <div className="space-y-2">
                    {latestReport.healthCard.key_points.slice(0, 2).map((point) => (
                      <div
                        key={point}
                        className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-slate-700"
                      >
                        {point}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Summary</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{latestReport.summary}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-slate-600">No reports are available in this shared view yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Recent reports</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Shared report timeline
          </h2>
        </div>

        {snapshot.reports.length > 0 ? (
          <div className="space-y-4">
            {snapshot.reports.map((report) => (
              <article
                key={report.id}
                className="glass-panel rounded-[1.75rem] border border-white/60 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)]"
              >
                <div className="grid gap-4 md:grid-cols-[auto_1fr_auto] md:items-start">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-slate-950 text-white">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {report.reportType}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getOverallTone(
                          report.healthCard.overall_status
                        )}`}
                      >
                        {report.healthCard.overall_status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                      {report.healthCard.headline}
                    </h3>
                    <p className="text-sm leading-6 text-slate-600">{report.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {report.healthCard.key_points.slice(0, 2).map((point) => (
                        <div
                          key={point}
                          className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-700"
                        >
                          {point}
                        </div>
                      ))}
                    </div>

                    <details className="group rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-4">
                      <summary className="cursor-pointer list-none text-sm font-medium text-slate-900">
                        <span className="inline-flex items-center gap-2">
                          View full report analysis
                        </span>
                      </summary>

                      <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                              Key takeaways
                            </p>
                            <div className="mt-3 space-y-2">
                              {report.analysis.key_takeaways.map((item) => (
                                <p key={item} className="text-sm leading-6 text-slate-700">
                                  {item}
                                </p>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                              General next steps
                            </p>
                            <div className="mt-3 space-y-2">
                              {report.analysis.general_next_steps.map((item) => (
                                <p key={item} className="text-sm leading-6 text-slate-700">
                                  {item}
                                </p>
                              ))}
                            </div>
                          </div>
                        </div>

                        {report.analysis.abnormal_values.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                              Detailed findings
                            </p>
                            {report.analysis.abnormal_values.map((item) => {
                              const tone = getStatusTone(item.status);

                              return (
                                <article
                                  key={`${report.id}-${item.test}-${item.value}`}
                                  className={`rounded-[1.5rem] border p-4 ${tone.panel}`}
                                >
                                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                      <h4 className="text-base font-semibold text-slate-950">
                                        {item.test}
                                      </h4>
                                      <p className="mt-1 text-sm text-slate-600">{item.value}</p>
                                    </div>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                                      {item.status} • {item.severity}
                                    </span>
                                  </div>

                                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-4">
                                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                                        Simple explanation
                                      </p>
                                      <p className="mt-2 text-sm leading-6 text-slate-700">
                                        {item.simple_explanation}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-4">
                                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                                        Why it matters
                                      </p>
                                      <p className="mt-2 text-sm leading-6 text-slate-700">
                                        {item.why_it_matters}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                    <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-4">
                                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                                        Possible causes
                                      </p>
                                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                                        {item.possible_causes.map((cause) => (
                                          <li key={cause}>{cause}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div className="rounded-2xl border border-white/80 bg-white/85 px-4 py-4">
                                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                                        What may help
                                      </p>
                                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                                        {item.what_may_help.map((step) => (
                                          <li key={step}>{step}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>

                                  <div className="mt-4 rounded-2xl border border-white/80 bg-white/85 px-4 py-4">
                                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                                      When to follow up
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-slate-700">
                                      {item.when_to_follow_up}
                                    </p>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        ) : null}

                        {report.analysis.urgent_flags.length > 0 ? (
                          <div className="rounded-[1.5rem] border border-red-200 bg-red-50/80 px-4 py-4">
                            <p className="text-xs uppercase tracking-[0.15em] text-red-700">
                              Urgent care warning
                            </p>
                            <div className="mt-3 space-y-2">
                              {report.analysis.urgent_flags.map((flag) => (
                                <p key={flag} className="text-sm leading-6 text-slate-700">
                                  {flag}
                                </p>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        <div className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50 px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                            Disclaimer
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {report.analysis.disclaimer}
                          </p>
                        </div>
                      </div>
                    </details>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-600">
                    <p>{report.reportDate}</p>
                    <p className="mt-1">{report.createdAt.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-[1.75rem] border border-dashed border-white/70 p-6 text-sm text-slate-500 shadow-sm">
            No shared reports yet.
          </div>
        )}

        <div className="rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 text-sm leading-6 text-slate-600 shadow-sm">
          This shared page is read-only and intentionally limited. It is designed for quick doctor or caregiver review, not account management.
        </div>
      </section>
    </section>
  );
}
