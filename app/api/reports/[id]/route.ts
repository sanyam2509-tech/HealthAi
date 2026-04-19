import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { deleteReport } from "@/lib/reports";

type ReportRouteContext = {
  params: {
    id: string;
  };
};

export async function DELETE(_: Request, { params }: ReportRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  try {
    const deleted = await deleteReport(params.id, session.user.id);

    if (!deleted) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete report.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
