import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ShieldAlert } from "lucide-react";

import { DeleteReportButton } from "@/components/DeleteReportButton";
import { getReportById, type ReportRecord } from "@/services/report-service";

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
    return "This analysis came from an uploaded image. Photos and scanned reports can be harder to read clearly, so important values should always be checked against the original report.";
  }

  return "This analysis came from a PDF or digital document. Even with a clearer file, final medical decisions should still be based on the original report and a clinician review.";
}

function formatCreatedAt(value: unknown) {
  if (value && typeof value === "object") {
    if ("toDate" in value && typeof value.toDate === "function") {
      return value.toDate().toLocaleString("en-IN");
    }

    if ("seconds" in value && typeof value.seconds === "number") {
      return new Date(value.seconds * 1000).toLocaleString("en-IN");
    }
  }

  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleString("en-IN");
    }
  }

  return "Not clearly found";
}

export function ReportDetailPage() {
  const { id = "" } = useParams();
  const [report, setReport] = useState<ReportRecord | null>(null);

  useEffect(() => {
    void getReportById(id).then(setReport);
  }, [id]);

  const overallTone = useMemo(() => {
    if (!report) {
      return null;
    }

    return getOverallTone(report.healthCard.overall_status);
  }, [report]);

  if (!report) {
    return <div className="rounded-3xl bg-white/80 p-6 text-sm text-slate-600">Loading report...</div>;
  }

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="glass-panel overflow-hidden rounded-[2rem] border border-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1.2fr_0.8fr] md:gap-8 md:p-10">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex rounded-full border border-sky-200 bg-white/80 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">
                Saved report
              </span>
              {overallTone ? (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${overallTone.badge}`}>
                  {overallTone.label}
                </span>
              ) : null}
            </div>

            <div className="space-y-4">
              <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
                {report.healthCard.headline}
              </h1>
              <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                {report.analysis.analysis.summary}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Abnormal values</p>
                <p className="mt-3 text-3xl font-semibold text-slate-950">{report.healthCard.abnormal_count}</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Report type</p>
                <p className="mt-3 text-lg font-semibold text-slate-950">{report.reportType}</p>
              </div>
              <div className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Saved on</p>
                <p className="mt-3 text-sm font-medium leading-6 text-slate-950">{formatCreatedAt(report.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 self-start">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/dashboard"
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
                {report.healthCard.key_points.map((point) => (
                  <div
                    key={point}
                    className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    {point}
                  </div>
                ))}
              </div>
              {overallTone ? (
                <div className={`mt-4 rounded-2xl border px-4 py-4 ${overallTone.panel}`}>
                  <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Next step</p>
                  <p className="mt-2 text-sm leading-6 text-slate-800">{report.healthCard.next_step}</p>
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 text-sm">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Report date</p>
                <p className="mt-2 font-medium text-slate-950">{report.reportDate}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Patient</p>
                <p className="mt-2 font-medium text-slate-950">{report.patientName}</p>
              </div>
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Lab</p>
                <p className="mt-2 font-medium text-slate-950">{report.labName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">How HealthVault got this answer</p>
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
              <p className="mt-2 text-sm font-medium text-slate-950">{report.analysis.structured_tests.length} structured test values</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Flagged results</p>
              <p className="mt-2 text-sm font-medium text-slate-950">{report.analysis.analysis.abnormal_values.length} values highlighted for review</p>
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-sky-100 bg-sky-50/80 p-5">
            <p className="text-sm leading-7 text-slate-700">
              HealthVault reads the uploaded report, extracts visible values, checks which ones look outside the stated range, and then explains them in simpler language. It does not replace the original report or a doctor's interpretation.
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
              Focus first on the flagged values, structured results, and the next-step recommendations.
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 text-sm leading-6 text-slate-700">
              Ask your doctor what changed, what matters most, and whether any test needs repeating.
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Key findings</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Flagged values and explanations
              </h2>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600">
              {report.analysis.analysis.abnormal_values.length} finding{report.analysis.analysis.abnormal_values.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {report.analysis.analysis.abnormal_values.length > 0 ? (
              report.analysis.analysis.abnormal_values.map((item) => {
                const tone = getStatusTone(item.status);
                const Icon = tone.icon;

                return (
                  <article key={`${item.test}-${item.value}`} className={`rounded-[1.5rem] border p-5 ${tone.panel}`}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl border border-white/80 bg-white/80 p-2 text-slate-900 shadow-sm">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-950">{item.test}</h3>
                          <p className="mt-1 text-sm text-slate-700">{item.value}</p>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                        {item.status} • {item.severity}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Simple explanation</p>
                        <p className="mt-2 text-sm leading-6 text-slate-800">{item.simple_explanation}</p>
                      </div>
                      <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Why it matters</p>
                        <p className="mt-2 text-sm leading-6 text-slate-800">{item.why_it_matters}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Possible causes</p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-800">
                          {item.possible_causes.map((cause) => (
                            <li key={cause}>{cause}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">What may help</p>
                        <ul className="mt-3 space-y-2 text-sm text-slate-800">
                          {item.what_may_help.map((step) => (
                            <li key={step}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">When to follow up</p>
                      <p className="mt-2 text-sm leading-6 text-slate-800">{item.when_to_follow_up}</p>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
                No clearly abnormal values were detected in this report.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Structured values</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              Extracted test values
            </h2>
            <div className="mt-5 space-y-3">
              {report.analysis.structured_tests.length > 0 ? (
                report.analysis.structured_tests.map((test) => (
                  <div key={`${test.test}-${test.value}`} className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 text-sm text-slate-700">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{test.test}</p>
                        <p className="mt-1 text-slate-600">{test.value} {test.unit !== "Not clearly found" ? test.unit : ""}</p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                        {test.status}
                      </span>
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.15em] text-slate-500">Reference range</p>
                    <p className="mt-1 text-sm text-slate-700">{test.reference_range}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-4 text-sm text-slate-700">
                  No structured values were extracted clearly enough from this report.
                </div>
              )}
            </div>
          </div>

          <div className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">General guidance</p>
            <div className="mt-4 space-y-3">
              {report.analysis.analysis.key_takeaways.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-3">
              {report.analysis.analysis.general_next_steps.map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>

          {report.analysis.analysis.urgent_flags.length > 0 ? (
            <div className="glass-panel rounded-[1.75rem] border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-red-700">Urgent care warning</p>
              <div className="mt-3 space-y-2">
                {report.analysis.analysis.urgent_flags.map((flag) => (
                  <p key={flag} className="text-sm leading-6 text-slate-700">{flag}</p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="glass-panel rounded-[1.75rem] border border-white/60 p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Disclaimer</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{report.analysis.analysis.disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
