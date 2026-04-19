import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  analyzeMedicalReportFromFile,
  analyzeMedicalReportFromImage
} from "@/lib/gemini";
import { getAccessibleProfile } from "@/lib/profiles";
import { saveAnalysisReport } from "@/lib/reports";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in to analyze and save reports." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const profileId = formData.get("profileId");

    const activeProfile = await getAccessibleProfile(
      session.user.id,
      typeof profileId === "string" ? profileId : null
    );

    if (!activeProfile) {
      return NextResponse.json(
        { error: "Please create or select a family profile first." },
        { status: 400 }
      );
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "A report file is required." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isPdf = file.type.includes("pdf") || file.name.toLowerCase().endsWith(".pdf");
    const isImage =
      file.type.startsWith("image/") ||
      [".png", ".jpg", ".jpeg", ".webp"].some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isPdf && !isImage) {
      return NextResponse.json(
        { error: "Only PDF, PNG, JPG, JPEG, and WEBP files are supported right now." },
        { status: 400 }
      );
    }

    const analysis = isPdf
      ? await analyzeMedicalReportFromFile(buffer, file.type || "application/pdf")
      : await analyzeMedicalReportFromImage(buffer, file.type || "image/jpeg");
    const savedReport = await saveAnalysisReport({
      userId: session.user.id,
      profileId: activeProfile.id,
      fileName: file.name,
      fileType: file.type || (isPdf ? "application/pdf" : "image/jpeg"),
      sourceType: isPdf ? "pdf" : "image",
      analysis
    });

    return NextResponse.json({
      fileName: file.name,
      sourceType: isPdf ? "pdf" : "image",
      extractedText: null,
      analysis,
      saved: Boolean(savedReport),
      reportId: savedReport?.id ?? null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to analyze report.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
