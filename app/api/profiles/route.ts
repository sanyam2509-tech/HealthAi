import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { createProfile } from "@/lib/profiles";

const createProfileSchema = z.object({
  name: z.string().trim().min(2, "Profile name must be at least 2 characters long."),
  relation: z.string().trim().min(2, "Select a valid relation.")
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = createProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid profile details." },
        { status: 400 }
      );
    }

    const profile = await createProfile({
      userId: session.user.id,
      name: parsed.data.name,
      relation: parsed.data.relation
    });

    if (!profile) {
      return NextResponse.json({ error: "Failed to create profile." }, { status: 500 });
    }

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
