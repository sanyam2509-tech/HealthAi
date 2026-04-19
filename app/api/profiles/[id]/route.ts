import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { deleteProfile, listProfiles, updateProfile } from "@/lib/profiles";

const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Profile name must be at least 2 characters long."),
  relation: z.string().trim().min(2, "Select a valid relation.")
});

type ProfileRouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(req: Request, { params }: ProfileRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid profile details." },
        { status: 400 }
      );
    }

    const profile = await updateProfile({
      userId: session.user.id,
      profileId: params.id,
      name: parsed.data.name,
      relation: parsed.data.relation
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: ProfileRouteContext) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  const profiles = await listProfiles(session.user.id);

  if (profiles.length <= 1) {
    return NextResponse.json(
      { error: "At least one profile must remain in the account." },
      { status: 400 }
    );
  }

  try {
    const result = await deleteProfile({
      userId: session.user.id,
      profileId: params.id
    });

    if (!result) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    return NextResponse.json({
      nextProfileId: result.nextProfileId,
      profiles: result.profiles
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
