import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Clock3,
  Droplets,
  FileSpreadsheet,
  FileText,
  Sparkles,
  TestTubeDiagonal,
  UserRound
} from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { ProfileProvider } from "@/context/ProfileContext";
import { ProfileSwitcher } from "@/components/ProfileSwitcher";
import { HealthIdCard } from "@/components/HealthIdCard";
import { ProfileShareCard } from "@/components/ProfileShareCard";
import UploadBox from "@/components/UploadBox";
import { authOptions } from "@/lib/auth";
import { getAccessibleProfile, listProfiles } from "@/lib/profiles";
import { getReportStats, listRecentReports } from "@/lib/reports";

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

function getTrendTone(label: "First report" | "Improved" | "Worsened" | "Stable" | "Mixed") {
  switch (label) {
    case "Improved":
      return "bg-emerald-100 text-emerald-700";
    case "Worsened":
      return "bg-red-100 text-red-700";
    case "Mixed":
      return "bg-amber-100 text-amber-800";
    case "Stable":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-sky-100 text-sky-700";
  }
}

function getReportTypeIcon(reportType: string) {
  const normalized = reportType.toLowerCase();

  if (normalized.includes("lipid") || normalized.includes("cholesterol")) {
    return Activity;
  }

  if (normalized.includes("urine")) {
    return Droplets;
  }

  if (normalized.includes("cbc") || normalized.includes("blood")) {
    return TestTubeDiagonal;
  }

  return FileSpreadsheet;
}

function formatReportMonth(value: Date) {
  return value.toLocaleString("en-IN", {
    month: "long",
    year: "numeric"
  });
}

type DashboardPageProps = {
  searchParams?: {
    profile?: string;
  };
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const profiles = await listProfiles(session.user.id);
  const activeProfile = await getAccessibleProfile(session.user.id, searchParams?.profile);

  if (!activeProfile) {
    redirect("/login");
  }

  const reports = await listRecentReports(session.user.id, activeProfile.id);
  const stats = await getReportStats(session.user.id, activeProfile.id);
  const firstName = (session.user.name ?? session.user.email ?? "there").split(" ")[0];
  const latestReport = stats.latestReport;
  const groupedReports = reports.reduce<Array<{ month: string; items: typeof reports }>>(
    (groups, report) => {
      const month = formatReportMonth(report.createdAt);
      const existingGroup = groups.find((group) => group.month === month);

      if (existingGroup) {
        existingGroup.items.push(report);
        return groups;
      }

      groups.push({
        month,
        items: [report]
      });

      return groups;
    },
    []
  );

  return (
    <ProfileProvider
      initialProfiles={profiles.map((profile) => ({
        id: profile.id,
        name: profile.name,
        relation: profile.relation,
        healthId: profile.healthId
      }))}
      initialActiveProfileId={activeProfile.id}
    >
      <section className="space-y-6 sm:space-y-8">
        <div className="mesh-card overflow-hidden rounded-[2rem] border border-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1.1fr_0.9fr] md:gap-8 md:p-10">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-sky-200 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
                Your health workspace
              </span>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
                  Welcome back, {firstName}.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                  Review reports for <span className="font-semibold text-slate-950">{activeProfile.name}</span>, upload a new file, and keep each family member&apos;s history separate and readable.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="glass-panel rounded-3xl border border-white/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Active profile
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{activeProfile.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{activeProfile.relation}</p>
                </div>
                <div className="glass-panel rounded-3xl border border-white/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Saved reports
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{stats.totalReports}</p>
                </div>
                <div className="glass-panel rounded-3xl border border-white/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Account
                  </p>
                  <p className="mt-2 truncate text-lg font-semibold text-slate-950">
                    {session.user.email}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                <HealthIdCard />
                <ProfileShareCard />
              </div>
            </div>

            <div className="grid gap-4 self-start">
              <div className="glass-panel rounded-[1.75rem] border border-white/60 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Latest health snapshot
                    </p>
                    <h2 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                      {latestReport
                        ? latestReport.fullReport.health_card.headline
                        : `The first report for ${activeProfile.name} will appear here`}
                    </h2>
                  </div>
                  <Sparkles className="mt-1 h-5 w-5 text-sky-500" />
                </div>

                {latestReport ? (
                  <div className="mt-5 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getOverallTone(
                          latestReport.fullReport.health_card.overall_status
                        )}`}
                      >
                        {latestReport.fullReport.health_card.overall_status.replaceAll("_", " ")}
                      </span>
                      <span className="text-sm text-slate-500">{latestReport.reportDate}</span>
                    </div>

                    <div className="space-y-2">
                      {latestReport.fullReport.health_card.key_points.slice(0, 2).map((point) => (
                        <div
                          key={point}
                          className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3 text-sm text-slate-700"
                        >
                          {point}
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Next step</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {latestReport.fullReport.health_card.next_step}
                      </p>
                    </div>

                    <Link
                      href={`/reports/${latestReport.id}`}
                      className="inline-flex w-full justify-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white sm:w-fit"
                    >
                      Open latest report
                    </Link>
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    Upload the first report for {activeProfile.name} to start building this profile&apos;s health history.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-1">
                <div className="glass-panel rounded-3xl border border-white/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-700">Reports stay grouped by profile</p>
                  </div>
                </div>
                <div className="glass-panel rounded-3xl border border-white/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center gap-3">
                    <Clock3 className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-700">History follows report date first</p>
                  </div>
                </div>
                <div className="glass-panel rounded-3xl border border-white/60 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
                  <div className="flex items-center gap-3">
                    <UserRound className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-700">
                      {profiles.length} profile{profiles.length === 1 ? "" : "s"} in this account
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProfileSwitcher />

        <UploadBox />

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                {activeProfile.name}&apos;s Reports
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Saved analysis history
              </h2>
            </div>
            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-sm text-slate-600 shadow-sm">
              {stats.totalReports} total
            </span>
          </div>

          {reports.length > 0 ? (
            <div className="space-y-6">
              {groupedReports.map((group) => (
                <section key={group.month} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="rounded-full border border-slate-200 bg-white/85 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm">
                      {group.month}
                    </span>
                    <div className="h-px flex-1 bg-white/70" />
                  </div>

                  <div className="space-y-4">
                    {group.items.map((report) => {
                      const ReportIcon = getReportTypeIcon(report.reportType);

                      return (
                        <article
                          key={report.id}
                          className="glass-panel rounded-[1.75rem] border border-white/60 p-4 shadow-[0_16px_40px_rgba(15,23,42,0.07)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(15,23,42,0.1)] sm:p-5"
                        >
                          <div className="grid gap-5 md:grid-cols-[auto_1fr_auto] md:items-start">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]">
                              <ReportIcon className="h-5 w-5" />
                            </div>

                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center gap-3">
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                                  {report.reportType}
                                </span>
                                <span className="rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-xs text-slate-600">
                                  {activeProfile.name}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getOverallTone(
                                    report.fullReport.health_card.overall_status
                                  )}`}
                                >
                                  {report.fullReport.health_card.overall_status.replaceAll("_", " ")}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getTrendTone(
                                    report.historyTrend.label
                                  )}`}
                                >
                                  {report.historyTrend.label}
                                </span>
                              </div>

                              <div>
                                <h3 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                                  {report.fullReport.health_card.headline}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-600">
                                  {report.fullReport.analysis.summary}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {report.fullReport.health_card.key_points.slice(0, 2).map((point) => (
                                  <div
                                    key={point}
                                    className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-2 text-sm text-slate-700"
                                  >
                                    {point}
                                  </div>
                                ))}
                              </div>

                              <div className="rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Next step</p>
                                <p className="mt-2 text-sm font-medium text-slate-700">
                                  {report.fullReport.health_card.next_step}
                                </p>
                              </div>

                              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-3">
                                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                                  Trend note
                                </p>
                                <p className="mt-2 text-sm leading-6 text-slate-700">
                                  {report.historyTrend.summary}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3 md:items-end">
                              <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm text-white">
                                {report.fullReport.health_card.abnormal_count} abnormal value
                                {report.fullReport.health_card.abnormal_count === 1 ? "" : "s"}
                              </div>
                              <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm text-slate-600">
                                <p>{report.reportDate}</p>
                                <p className="mt-1">{report.createdAt.toLocaleString("en-IN")}</p>
                              </div>
                              <Link
                                href={`/reports/${report.id}`}
                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-95 md:w-auto"
                              >
                                View full report
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-[1.75rem] border border-dashed border-white/70 p-6 text-sm text-slate-500 shadow-sm">
              No saved reports yet for {activeProfile.name}. Upload a report to start this profile&apos;s history.
            </div>
          )}
        </section>
      </section>
    </ProfileProvider>
  );
}
