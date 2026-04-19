import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getAccessibleProfile } from "@/lib/profiles";
import { createProfileShareLink, getActiveShareLink } from "@/lib/sharing";

type ShareRouteContext = {
  params: {
    id: string;
  };
};

export async function POST(_: Request, { params }: ShareRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const profile = await getAccessibleProfile(session.user.id, params.id);

  if (!profile || profile.id !== params.id) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  try {
    const existingShareLink = await getActiveShareLink(profile.id);
    const shareLink = existingShareLink ?? (await createProfileShareLink(profile.id));

    if (!shareLink) {
      return NextResponse.json({ error: "Failed to create share link." }, { status: 500 });
    }

    return NextResponse.json({
      sharePath: `/share/${shareLink.token}`,
      expiresAt: shareLink.expiresAt.toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create share link.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
