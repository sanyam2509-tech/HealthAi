import type { MedicalAnalysis } from "@/lib/analysis";

export type AnalyzeResponse = {
  fileName?: string;
  sourceType?: "pdf" | "image";
  extractedText?: string | null;
  analysis?: MedicalAnalysis;
  saved?: boolean;
  reportId?: string | null;
  error?: string;
};

export type SuccessfulAnalyzeResponse = AnalyzeResponse & {
  analysis: MedicalAnalysis;
};

async function parseAnalyzeResponse(response: Response): Promise<AnalyzeResponse> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as AnalyzeResponse;
  }

  const body = await response.text();
  const looksLikeHtml =
    body.trimStart().startsWith("<!DOCTYPE") || body.trimStart().startsWith("<html");

  if (looksLikeHtml) {
    throw new Error("The server returned an HTML error page. Check the terminal for the real API error.");
  }

  throw new Error(body || "The server returned an unexpected response.");
}

export async function analyzeReportRequest(
  file: File,
  profileId: string
): Promise<SuccessfulAnalyzeResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("profileId", profileId);

  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData
  });
  const data = await parseAnalyzeResponse(response);

  if (!response.ok || !data.analysis) {
    throw new Error(data.error ?? "Failed to analyze report.");
  }

  return {
    ...data,
    analysis: data.analysis
  };
}

export async function deleteReportRequest(reportId: string) {
  const response = await fetch(`/api/reports/${reportId}`, {
    method: "DELETE"
  });
  const data = (await response.json()) as { success?: boolean; error?: string };

  if (!response.ok || !data.success) {
    throw new Error(data.error ?? "Failed to delete report.");
  }
}
