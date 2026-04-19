"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileImage,
  FileText,
  Loader2,
  ShieldAlert,
  Sparkles
} from "lucide-react";

import type { MedicalAnalysis } from "@/lib/analysis";
import { useProfile } from "@/hooks/useProfile";
import { analyzeReportRequest } from "@/services/report-service";

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

function getOverallTone(
  status: "normal" | "mostly_normal" | "needs_attention" | "urgent_review"
) {
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

export default function UploadBox() {
  const { activeProfile } = useProfile();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<MedicalAnalysis | null>(null);
  const [wasSaved, setWasSaved] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const overallTone = result ? getOverallTone(result.health_card.overall_status) : null;

  useEffect(() => {
    setFile(null);
    setResult(null);
    setWasSaved(null);
    setError("");
    setShowFullAnalysis(false);
  }, [activeProfile?.id]);

  const upload = async () => {
    if (!file || !activeProfile) return;

    setIsLoading(true);
    setError("");
    setWasSaved(null);
    setShowFullAnalysis(false);

    try {
      const data = await analyzeReportRequest(file, activeProfile.id);
      setResult(data.analysis);
      setWasSaved(data.saved ?? false);
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "Failed to analyze report.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeProfile) {
    return null;
  }

  return (
    <div className="glass-panel space-y-6 rounded-[2rem] border border-white/60 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-6 md:p-8">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Upload</p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Analyze a medical report
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-slate-600">
          Upload a PDF or report image. HealthAI will read the report, identify abnormal values,
          and explain them in plain language.
        </p>
        <p className="text-sm font-medium text-slate-700">
          Saving to profile: <span className="text-slate-950">{activeProfile.name}</span>
        </p>
        <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">PDF</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">PNG</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">JPG / JPEG</span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">WEBP</span>
        </div>
      </div>

      <div className="grid gap-4 rounded-[1.75rem] border border-slate-200/80 bg-gradient-to-br from-white to-sky-50/70 p-4 md:grid-cols-[1fr_auto] md:items-center">
        <label className="block">
          <span className="sr-only">Choose report file</span>
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          />
        </label>

        <button
          onClick={upload}
          disabled={!file || isLoading}
          className="min-h-12 w-full rounded-2xl bg-gradient-to-br from-slate-950 to-slate-800 px-6 py-4 text-sm font-medium text-white shadow-[0_14px_30px_rgba(15,23,42,0.24)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
        >
          <span className="inline-flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 text-sky-300" />
            )}
            {isLoading ? "Analyzing..." : "Analyze report"}
          </span>
        </button>
      </div>

      {file ? (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-700">
          {file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf") ? (
            <FileText className="h-4 w-4 text-slate-500" />
          ) : (
            <FileImage className="h-4 w-4 text-slate-500" />
          )}
          <span className="font-medium text-slate-900">{file.name}</span>
          <span className="text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4 rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5">
          <div className="flex items-center gap-3 text-slate-700">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="font-medium">HealthVault is decoding the report story</p>
              <p className="text-sm text-slate-500">
                Pulling out the important values, checking what stands out, and shaping it into a clean health summary.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="h-24 animate-pulse rounded-2xl bg-white" />
            <div className="h-24 animate-pulse rounded-2xl bg-white" />
            <div className="h-24 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="space-y-6 rounded-[2rem] border border-[#dbe8f4] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_22%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-4 text-slate-950 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm uppercase tracking-[0.2em] text-sky-600">Analysis complete</p>
                {overallTone ? (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${overallTone.badge}`}>
                  {overallTone.label}
                </span>
              ) : null}
              </div>
              <h3 className="text-xl font-semibold leading-tight text-slate-950 sm:text-2xl md:text-3xl">
                {result.health_card.headline}
              </h3>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">
                HealthAI found {result.health_card.abnormal_count} flagged value
                {result.health_card.abnormal_count === 1 ? "" : "s"} in this report.
              </p>
            </div>

            <div className="grid gap-3 text-sm md:min-w-72">
              <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Report type</p>
                <p className="mt-2 font-medium text-slate-950">{result.metadata.report_type}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Report date</p>
                  <p className="mt-2 font-medium text-slate-950">{result.metadata.report_date}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Patient</p>
                  <p className="mt-2 font-medium text-slate-950">{result.metadata.patient_name}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Lab</p>
                  <p className="mt-2 font-medium text-slate-950">
                    {result.metadata.lab_name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Abnormal values</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{result.health_card.abnormal_count}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overall status</p>
              <div className="mt-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${overallTone?.badge ?? ""}`}>
                  {overallTone?.label}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Saved</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {wasSaved
                  ? "This analysis was stored and should appear in your recent report history."
                  : "Analysis worked, but no database was available to save report history."}
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-sky-200 bg-gradient-to-r from-sky-100 to-cyan-50 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-700">What this report means</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{result.analysis.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Key takeaways</p>
              <div className="mt-4 space-y-3">
                {result.analysis.key_takeaways.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/80 bg-white/80 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">General next steps</p>
              <div className="mt-4 space-y-3">
                {result.analysis.general_next_steps.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Key findings</p>
                <h4 className="mt-2 text-lg font-semibold text-slate-950 sm:text-xl">
                  Quick summary of flagged values
                </h4>
              </div>
              <span className="w-fit rounded-full border border-white/80 bg-white/85 px-3 py-1 text-sm text-slate-600 shadow-sm">
                {result.analysis.abnormal_values.length} finding
                {result.analysis.abnormal_values.length === 1 ? "" : "s"}
              </span>
            </div>

            {result.analysis.abnormal_values.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {result.analysis.abnormal_values.map((item) => {
                  const tone = getStatusTone(item.status);

                  return (
                    <article
                      key={`${item.test}-${item.value}`}
                      className={`rounded-[1.5rem] border p-4 shadow-sm ${tone.panel}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h5 className="text-base font-semibold text-slate-950">{item.test}</h5>
                          <p className="mt-1 text-sm text-slate-600">{item.value}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        {item.simple_explanation}
                      </p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800">
                No clearly abnormal values were detected in this report.
              </div>
            )}
          </div>

          {result.analysis.abnormal_values.length > 0 ? (
            <div className="rounded-[1.75rem] border border-white/80 bg-white/85 p-5 shadow-sm">
              <button
                type="button"
                onClick={() => setShowFullAnalysis((current) => !current)}
                className="flex min-h-12 w-full items-start justify-between gap-4 text-left"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Full analysis
                  </p>
                  <h4 className="mt-2 text-lg font-semibold text-slate-950 sm:text-xl">
                    {showFullAnalysis ? "Hide full analysis" : "Show full analysis"}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Open the full report explanation only when you want the detailed causes,
                    guidance, and follow-up advice for each finding.
                  </p>
                </div>
                <div className="rounded-full border border-slate-200 bg-slate-50 p-3 text-slate-700 shrink-0">
                  {showFullAnalysis ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </button>

              {showFullAnalysis ? (
                <div className="mt-5 space-y-3 border-t border-slate-200 pt-5">
                  {result.analysis.abnormal_values.map((item) => {
                    const tone = getStatusTone(item.status);
                    const Icon = tone.icon;

                    return (
                      <article
                        key={`detail-${item.test}-${item.value}`}
                        className={`rounded-[1.75rem] border p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] ${tone.panel}`}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="flex items-start gap-3">
                            <div className="rounded-xl border border-white/80 bg-white/80 p-2 text-slate-900 shadow-sm">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <h5 className="text-lg font-semibold text-slate-950">{item.test}</h5>
                              <p className="mt-1 text-sm text-slate-700">{item.value}</p>
                            </div>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
                            {item.status} • {item.severity}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                              Simple explanation
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-800">
                              {item.simple_explanation}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                              Why it matters
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-800">
                              {item.why_it_matters}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                              Possible causes
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-slate-800">
                              {item.possible_causes.map((cause) => (
                                <li key={cause}>{cause}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                              What may help
                            </p>
                            <ul className="mt-3 space-y-2 text-sm text-slate-800">
                              {item.what_may_help.map((step) => (
                                <li key={step}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/70 bg-white/85 p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                            When to follow up
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-800">
                            {item.when_to_follow_up}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          {result.analysis.urgent_flags.length > 0 ? (
            <div className="rounded-[1.75rem] border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-red-700">Urgent care warning</p>
              <div className="mt-3 space-y-2">
                {result.analysis.urgent_flags.map((flag) => (
                  <p key={flag} className="text-sm leading-6 text-slate-700">
                    {flag}
                  </p>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Disclaimer</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{result.analysis.disclaimer}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
