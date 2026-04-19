import {
  medicalAnalysisSchema,
  type MedicalAnalysis,
  type StructuredTest
} from "@/lib/analysis";
import { db } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";

type SaveReportInput = {
  userId: string;
  profileId: string;
  fileName: string;
  fileType: string;
  sourceType: "pdf" | "image";
  analysis: MedicalAnalysis;
};

function parseReportDateValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const directTimestamp = Date.parse(trimmed);

  if (!Number.isNaN(directTimestamp)) {
    return directTimestamp;
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

  if (slashMatch) {
    const [, day, month, year] = slashMatch;
    const normalized = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const normalizedTimestamp = Date.parse(normalized);

    return Number.isNaN(normalizedTimestamp) ? null : normalizedTimestamp;
  }

  return null;
}

function getReportSortTimestamp(reportDate: string, createdAt: Date) {
  return parseReportDateValue(reportDate) ?? createdAt.getTime();
}

function normalizeTestName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function findPreviousComparableReport(
  currentReport: {
    id: string;
    profileId: string | null;
    reportType: string;
    reportDate: string;
    createdAt: Date;
  },
  reports: Array<{
    id: string;
    profileId: string | null;
    reportType: string;
    reportDate: string;
    createdAt: Date;
    analysis: unknown;
  }>
) {
  const currentTimestamp = getReportSortTimestamp(currentReport.reportDate, currentReport.createdAt);
  const matchingReports = reports
    .filter(
      (report) =>
        report.id !== currentReport.id &&
        report.profileId === currentReport.profileId &&
        report.reportType.toLowerCase() === currentReport.reportType.toLowerCase()
    )
    .sort(
      (left, right) =>
        getReportSortTimestamp(right.reportDate, right.createdAt) -
        getReportSortTimestamp(left.reportDate, left.createdAt)
    );

  return (
    matchingReports.find(
      (report) => getReportSortTimestamp(report.reportDate, report.createdAt) < currentTimestamp
    ) ?? null
  );
}

function formatStructuredValue(test: StructuredTest) {
  const unit = test.unit && test.unit !== "Not clearly found" ? ` ${test.unit}` : "";
  return `${test.numeric_value ?? test.value}${unit}`.trim();
}

type ReportComparisonChange = {
  test: string;
  previous_value: string;
  current_value: string;
  direction: "improved" | "worsened" | "unchanged";
  note: string;
};

type ReportComparison = {
  has_previous_report: boolean;
  previous_report_date: string | null;
  summary: string;
  changes: ReportComparisonChange[];
};

type ReportHistoryTrend = {
  label: "First report" | "Improved" | "Worsened" | "Stable" | "Mixed";
  summary: string;
};

function compareDirection(previous: StructuredTest, current: StructuredTest) {
  const previousStatus = previous.status.toLowerCase();
  const currentStatus = current.status.toLowerCase();

  if (previousStatus === currentStatus) {
    return "unchanged" as const;
  }

  const normalKeywords = ["normal", "within range", "in range"];
  const currentIsMoreNormal = normalKeywords.some((keyword) => currentStatus.includes(keyword));
  const previousIsMoreNormal = normalKeywords.some((keyword) => previousStatus.includes(keyword));

  if (currentIsMoreNormal && !previousIsMoreNormal) {
    return "improved" as const;
  }

  if (previousIsMoreNormal && !currentIsMoreNormal) {
    return "worsened" as const;
  }

  const previousDistance = Math.abs(previous.numeric_value ?? 0);
  const currentDistance = Math.abs(current.numeric_value ?? 0);

  if (currentDistance < previousDistance) {
    return "improved" as const;
  }

  if (currentDistance > previousDistance) {
    return "worsened" as const;
  }

  return "unchanged" as const;
}

function buildComparisonNote(direction: ReportComparisonChange["direction"], test: StructuredTest) {
  if (direction === "improved") {
    return `${test.test} looks better than the previous report.`;
  }

  if (direction === "worsened") {
    return `${test.test} looks worse than the previous report.`;
  }

  return `${test.test} is close to the previous report.`;
}

function buildComparisonSummary(changes: ReportComparisonChange[]) {
  if (changes.length === 0) {
    return "No directly comparable test values were found between these reports.";
  }

  const improvedCount = changes.filter((change) => change.direction === "improved").length;
  const worsenedCount = changes.filter((change) => change.direction === "worsened").length;

  if (improvedCount > 0 && worsenedCount > 0) {
    return "Some values improved, while some moved in a less favorable direction.";
  }

  if (improvedCount > 0) {
    return "Some comparable values improved compared with the previous report.";
  }

  if (worsenedCount > 0) {
    return "Some comparable values worsened compared with the previous report.";
  }

  return "Comparable values stayed close to the previous report.";
}

function buildHistoryTrend(comparison: ReportComparison): ReportHistoryTrend {
  if (!comparison.has_previous_report) {
    return {
      label: "First report",
      summary: "No previous similar report is available yet."
    };
  }

  const improvedCount = comparison.changes.filter((change) => change.direction === "improved").length;
  const worsenedCount = comparison.changes.filter((change) => change.direction === "worsened").length;

  if (improvedCount > 0 && worsenedCount === 0) {
    return {
      label: "Improved",
      summary: comparison.summary
    };
  }

  if (worsenedCount > 0 && improvedCount === 0) {
    return {
      label: "Worsened",
      summary: comparison.summary
    };
  }

  if (improvedCount > 0 && worsenedCount > 0) {
    return {
      label: "Mixed",
      summary: comparison.summary
    };
  }

  return {
    label: "Stable",
    summary: comparison.summary
  };
}

async function getReportComparison(
  report: {
    id: string;
    profileId: string | null;
    reportType: string;
    reportDate: string;
    createdAt: Date;
    analysis: unknown;
  },
  userId: string
): Promise<ReportComparison> {
  const currentFullReport = medicalAnalysisSchema.parse(report.analysis);

  if (!report.profileId) {
    return {
      has_previous_report: false,
      previous_report_date: null,
      summary: "No previous similar report found for comparison.",
      changes: []
    };
  }

  const previousReports = await db.report.findMany({
    where: {
      userId,
      profileId: report.profileId
    }
  });

  const previousReport = findPreviousComparableReport(report, previousReports);

  if (!previousReport) {
    return {
      has_previous_report: false,
      previous_report_date: null,
      summary: "No previous similar report found for comparison.",
      changes: []
    };
  }

  const previousFullReport = medicalAnalysisSchema.parse(previousReport.analysis);
  const previousTests = new Map(
    previousFullReport.structured_tests.map((test) => [normalizeTestName(test.test), test])
  );

  const changes = currentFullReport.structured_tests
    .filter(
      (test) =>
        test.numeric_value !== null &&
        test.unit !== "Not clearly found" &&
        previousTests.has(normalizeTestName(test.test))
    )
    .map((currentTest) => {
      const previousTest = previousTests.get(normalizeTestName(currentTest.test))!;

      if (previousTest.numeric_value === null || previousTest.unit !== currentTest.unit) {
        return null;
      }

      const direction = compareDirection(previousTest, currentTest);

      return {
        test: currentTest.test,
        previous_value: formatStructuredValue(previousTest),
        current_value: formatStructuredValue(currentTest),
        direction,
        note: buildComparisonNote(direction, currentTest)
      };
    })
    .filter((change): change is ReportComparisonChange => Boolean(change))
    .slice(0, 6);

  return {
    has_previous_report: true,
    previous_report_date: previousReport.reportDate,
    summary: buildComparisonSummary(changes),
    changes
  };
}

export async function saveAnalysisReport(input: SaveReportInput) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  try {
    return await db.report.create({
      data: {
        fileName: input.fileName,
        fileType: input.fileType,
        sourceType: input.sourceType,
        userId: input.userId,
        profileId: input.profileId,
        reportType: input.analysis.metadata.report_type,
        reportDate: input.analysis.metadata.report_date,
        patientName: input.analysis.metadata.patient_name,
        labName: input.analysis.metadata.lab_name,
        healthCard: input.analysis.health_card,
        analysis: input.analysis,
        summary: input.analysis.analysis.summary,
        abnormalCount: input.analysis.health_card.abnormal_count
      }
    });
  } catch {
    return null;
  }
}

export async function listRecentReports(userId: string, profileId?: string) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  try {
    const reports = await db.report.findMany({
      where: {
        userId,
        ...(profileId ? { profileId } : {})
      }
    });

    const sortedReports = reports
      .map((report) => ({
        ...report,
        healthCard: report.analysis ? medicalAnalysisSchema.parse(report.analysis).health_card : null,
        fullReport: medicalAnalysisSchema.parse(report.analysis)
      }))
      .sort((left, right) => {
        const rightTimestamp = getReportSortTimestamp(right.reportDate, right.createdAt);
        const leftTimestamp = getReportSortTimestamp(left.reportDate, left.createdAt);

        if (rightTimestamp !== leftTimestamp) {
          return rightTimestamp - leftTimestamp;
        }

        return right.createdAt.getTime() - left.createdAt.getTime();
      })
      .slice(0, 8);

    const reportsWithTrend = await Promise.all(
      sortedReports.map(async (report) => {
        const comparison = await getReportComparison(report, userId);

        return {
          ...report,
          comparison,
          historyTrend: buildHistoryTrend(comparison)
        };
      })
    );

    return reportsWithTrend;
  } catch {
    return [];
  }
}

export async function getReportById(id: string, userId: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  try {
    const report = await db.report.findUnique({
      where: { id }
    });

    if (!report || report.userId !== userId) {
      return null;
    }

    const comparison = await getReportComparison(report, userId);

    return {
      ...report,
      healthCard: medicalAnalysisSchema.parse(report.analysis).health_card,
      fullReport: medicalAnalysisSchema.parse(report.analysis),
      comparison
    };
  } catch {
    return null;
  }
}

export async function getReportStats(userId: string, profileId?: string) {
  if (!hasDatabaseUrl()) {
    return {
      totalReports: 0,
      latestReport: null as Awaited<ReturnType<typeof listRecentReports>>[number] | null
    };
  }

  try {
    const reports = await listRecentReports(userId, profileId);

    return {
      totalReports: await db.report.count({
        where: {
          userId,
          ...(profileId ? { profileId } : {})
        }
      }),
      latestReport: reports[0] ?? null
    };
  } catch {
    return {
      totalReports: 0,
      latestReport: null as Awaited<ReturnType<typeof listRecentReports>>[number] | null
    };
  }
}

export async function deleteReport(id: string, userId: string) {
  if (!hasDatabaseUrl()) {
    return false;
  }

  try {
    const report = await db.report.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true
      }
    });

    if (!report || report.userId !== userId) {
      return false;
    }

    await db.report.delete({
      where: {
        id
      }
    });

    return true;
  } catch {
    return false;
  }
}
