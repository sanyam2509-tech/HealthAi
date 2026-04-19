import Link from "next/link";
import { AlertTriangle, CheckCircle2, ChevronLeft, ShieldAlert } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DeleteReportButton } from "@/components/DeleteReportButton";
import { authOptions } from "@/lib/auth";
import { getReportById } from "@/lib/reports";

type ReportDetailPageProps = {
  params: {
    id: string;
  };
};

function getStatusTone(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("high") || normalized.includes("low") || normalized.includes("abnormal")) {
    return {
      badge: "bg-red-100 text-red-700",
      panel: "border-red-200 bg-red-50/70",
      icon: AlertTriangle
    };
  }

  if (normalized.includes("normal")) {
    return {
      badge: "bg-emerald-100 text-emerald-700",
      panel: "border-emerald-200 bg-emerald-50/70",
      icon: CheckCircle2
    };
  }

  return {
    badge: "bg-amber-100 text-amber-800",
    panel: "border-amber-200 bg-amber-50/70",
    icon: ShieldAlert
  };
}

function getOverallTone(status: "normal" | "mostly_normal" | "needs_attention" | "urgent_review") {
  switch (status) {
    case "normal":
      return {
        badge: "bg-emerald-100 text-emerald-700",
        panel: "border-emerald-200 bg-emerald-50",
        label: "Normal"
      };
    case "mostly_normal":
      return {
        badge: "bg-sky-100 text-sky-700",
        panel: "border-sky-200 bg-sky-50",
        label: "Mostly normal"
      };
    case "urgent_review":
      return {
        badge: "bg-red-100 text-red-700",
        panel: "border-red-200 bg-red-50",
        label: "Urgent review"
      };
    default:
      return {
        badge: "bg-amber-100 text-amber-800",
        panel: "border-amber-200 bg-amber-50",
        label: "Needs attention"
      };
  }
}

function getSourceNote(sourceType: string) {
  if (sourceType === "image") {
    return "This analysis came from an uploaded image. Photos and handwritten reports can be harder to read clearly, so important values should always be checked against the original report.";
  }

  return "This analysis came from a digital document upload. Even with clearer source files, important medical decisions should still be based on the original report and a clinician review.";
}

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const report = await getReportById(params.id, session.user.id);

  if (!report) {
    return (
      <section className="space-y-6">
        <div className="glass-panel rounded-[2rem] border border-white/60 p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Saved report</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            Report not found
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            This report does not exist yet, or database history is not enabled.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white"
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    );
  }

  const { metadata, health_card, analysis } = report.fullReport;
  const overallTone = getOverallTone(health_card.overall_status);

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="glass-panel overflow-hidden rounded-[2rem] border border-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1.2fr_0.8fr] md:gap-8 md:p-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-sky-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">
                Saved report
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${overallTone.badge}`}>
                {overallTone.label}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
                {health_card.headline}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                {analysis.summary}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Abnormal values</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">
                  {health_card.abnormal_count}
                </p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Report type</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">{metadata.report_type}</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Saved on</p>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-950">
                  {report.createdAt.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 self-start">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm sm:w-fit"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
              <DeleteReportButton reportId={report.id} />
            </div>

            <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quick health card</p>
              <div className="mt-4 space-y-3">
                {health_card.key_points.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    {point}
                  </div>
                ))}
              </div>
              <div className={`mt-4 rounded-2xl border px-4 py-4 ${overallTone.panel}`}>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Next step</p>
                <p className="mt-2 text-sm leading-6 text-slate-800">{health_card.next_step}</p>
              </div>
            </div>

            <div className="grid gap-3 text-sm">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Report date</p>
                <p className="mt-2 font-medium text-slate-950">{metadata.report_date}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Patient</p>
                <p className="mt-2 font-medium text-slate-950">{metadata.patient_name}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Lab</p>
                <p className="mt-2 font-medium text-slate-950">{metadata.lab_name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                How HealthVault got this answer
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Trust and transparency
              </h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600">
              Grounded in the uploaded report
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Report source</p>
              <p className="mt-2 text-sm font-medium text-slate-950">
                {report.sourceType === "image" ? "Photo / image upload" : "PDF / digital report"}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Values extracted</p>
              <p className="mt-2 text-sm font-medium text-slate-950">
                {report.fullReport.structured_tests.length} structured test values
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Flagged results</p>
              <p className="mt-2 text-sm font-medium text-slate-950">
                {analysis.abnormal_values.length} values highlighted for review
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-sky-100 bg-sky-50/80 p-5">
            <p className="text-sm leading-7 text-slate-700">
              HealthVault first reads the uploaded report, extracts visible lab values, checks which ones appear outside the stated range, and then explains them in simpler language. It does not replace the original report or a doctor&apos;s interpretation.
            </p>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50/80 p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-amber-700">Clarity note</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">{getSourceNote(report.sourceType)}</p>
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Doctor visit prep</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
            Best way to use this page
          </h2>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 text-sm leading-6 text-slate-700">
              Bring the original report and use this page as a plain-language guide, not as a diagnosis.
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 text-sm leading-6 text-slate-700">
              Focus first on the flagged values, trend snapshot, and the next-step recommendations.
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 text-sm leading-6 text-slate-700">
              Ask your doctor what changed, what matters most, and whether any test needs repeating.
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Compared with previous report
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              Trend snapshot
            </h2>
          </div>
          {report.comparison.has_previous_report ? (
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600">
              Previous similar report: {report.comparison.previous_report_date}
            </span>
          ) : null}
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-sky-100 bg-sky-50/80 p-5">
          <p className="text-sm leading-7 text-slate-700">{report.comparison.summary}</p>
        </div>

        {report.comparison.changes.length > 0 ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {report.comparison.changes.map((change) => {
              const tone =
                change.direction === "improved"
                  ? "border-emerald-200 bg-emerald-50"
                  : change.direction === "worsened"
                    ? "border-red-200 bg-red-50"
                    : "border-slate-200 bg-slate-50";
              const badge =
                change.direction === "improved"
                  ? "bg-emerald-100 text-emerald-700"
                  : change.direction === "worsened"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-200 text-slate-700";

              return (
                <article key={`${change.test}-${change.current_value}`} className={`rounded-[1.5rem] border p-5 ${tone}`}>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-950">{change.test}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${badge}`}>
                      {change.direction}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/80 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Previous</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{change.previous_value}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Current</p>
                      <p className="mt-2 text-sm font-medium text-slate-900">{change.current_value}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-700">{change.note}</p>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Key takeaways</p>
          <div className="mt-4 space-y-3">
            {analysis.key_takeaways.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">General next steps</p>
          <div className="mt-4 space-y-3">
            {analysis.general_next_steps.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {report.fullReport.structured_tests.length > 0 ? (
        <div className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Structured values</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Extracted test values
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              These values are used for comparison across similar reports over time.
            </p>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {report.fullReport.structured_tests.map((test) => (
              <article
                key={`${test.test}-${test.value}`}
                className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-950">{test.test}</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {test.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Value</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{test.value}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Range</p>
                    <p className="mt-2 text-sm font-medium text-slate-900">{test.reference_range}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}

      <div className="glass-panel rounded-[2rem] border border-white/60 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Detailed findings</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              Full report analysis
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-slate-600">
            Review each flagged value below for a simple explanation, why it matters, likely
            causes, and what may help next.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {analysis.abnormal_values.length > 0 ? (
            analysis.abnormal_values.map((item) => {
              const tone = getStatusTone(item.status);
              const Icon = tone.icon;

              return (
                <article
                  key={`${report.id}-${item.test}-${item.value}`}
                  className={`rounded-[1.75rem] border p-6 shadow-[0_14px_30px_rgba(15,23,42,0.05)] ${tone.panel}`}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl border border-white/80 bg-white/80 p-2 text-slate-900 shadow-sm">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-950">{item.test}</h3>
                        <p className="mt-2 text-sm text-slate-600">{item.value}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                      {item.status} • {item.severity}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                        Simple explanation
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {item.simple_explanation}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                        Why it matters
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{item.why_it_matters}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                        Possible causes
                      </p>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700">
                        {item.possible_causes.map((cause) => (
                          <li key={cause}>{cause}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
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

                  <div className="mt-4 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                      When to follow up
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{item.when_to_follow_up}</p>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">
              No clearly abnormal values were detected in this report.
            </div>
          )}
        </div>

        {analysis.urgent_flags.length > 0 ? (
          <div className="mt-6 rounded-[1.75rem] border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-red-700">Urgent care warning</p>
            <div className="mt-3 space-y-2">
              {analysis.urgent_flags.map((flag) => (
                <p key={flag} className="text-sm leading-6 text-slate-700">
                  {flag}
                </p>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white/90 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Disclaimer</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{analysis.disclaimer}</p>
        </div>
      </div>
    </section>
  );
}
