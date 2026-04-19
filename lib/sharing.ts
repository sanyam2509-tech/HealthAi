import { randomBytes } from "crypto";

import { db } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";
import { medicalAnalysisSchema } from "@/lib/analysis";

function buildShareToken() {
  return randomBytes(24).toString("base64url");
}

async function generateUniqueShareToken() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const token = buildShareToken();
    const existing = await db.shareLink.findUnique({
      where: {
        token
      },
      select: {
        id: true
      }
    });

    if (!existing) {
      return token;
    }
  }

  throw new Error("Could not generate a unique share token.");
}

export async function createProfileShareLink(profileId: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const token = await generateUniqueShareToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  return db.shareLink.create({
    data: {
      token,
      profileId,
      expiresAt
    }
  });
}

export async function getActiveShareLink(profileId: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  return db.shareLink.findFirst({
    where: {
      profileId,
      revokedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getSharedProfileSnapshot(token: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const shareLink = await db.shareLink.findFirst({
    where: {
      token,
      revokedAt: null,
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      profile: true
    }
  });

  if (!shareLink) {
    return null;
  }

  const reports = await db.report.findMany({
    where: {
      profileId: shareLink.profileId
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 5
  });

  const parsedReports = reports.map((report) => {
    const fullReport = medicalAnalysisSchema.parse(report.analysis);

    return {
      id: report.id,
      reportType: report.reportType,
      reportDate: report.reportDate,
      createdAt: report.createdAt,
      summary: fullReport.analysis.summary,
      healthCard: fullReport.health_card,
      analysis: fullReport.analysis,
      structuredTests: fullReport.structured_tests
    };
  });

  return {
    shareLink,
    profile: shareLink.profile,
    reports: parsedReports,
    latestReport: parsedReports[0] ?? null
  };
}
