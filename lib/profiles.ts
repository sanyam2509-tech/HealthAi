import { randomBytes } from "crypto";

import { db } from "@/lib/db";
import { hasDatabaseUrl } from "@/lib/env";

export const defaultProfileRelation = "Self";
export type ProfileRecord = {
  id: string;
  name: string;
  relation: string;
  healthId: string | null;
};

function buildHealthId() {
  return `HV-${randomBytes(2).toString("hex").toUpperCase()}-${randomBytes(2)
    .toString("hex")
    .toUpperCase()}`;
}

async function generateUniqueProfileHealthId() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const healthId = buildHealthId();
    const existingProfile = await db.profile.findUnique({
      where: {
        healthId
      },
      select: {
        id: true
      }
    });

    if (!existingProfile) {
      return healthId;
    }
  }

  throw new Error("Could not generate a unique Health ID.");
}

async function ensureProfileHealthIds<T extends Array<{ id: string; healthId: string | null }>>(
  profiles: T
) {
  const missingProfiles = profiles.filter((profile) => !profile.healthId);

  if (missingProfiles.length === 0) {
    return profiles;
  }

  for (const profile of missingProfiles) {
    const healthId = await generateUniqueProfileHealthId();

    await db.profile.update({
      where: {
        id: profile.id
      },
      data: {
        healthId
      }
    });

    profile.healthId = healthId;
  }

  return profiles;
}

export async function ensureDefaultProfile(userId: string, fallbackName: string) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const existingProfile = await db.profile.findFirst({
    where: {
      userId,
      relation: defaultProfileRelation
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  if (existingProfile) {
    if (!existingProfile.healthId) {
      return db.profile.update({
        where: {
          id: existingProfile.id
        },
        data: {
          healthId: await generateUniqueProfileHealthId()
        }
      });
    }

    return existingProfile;
  }

  return db.profile.create({
    data: {
      userId,
      healthId: await generateUniqueProfileHealthId(),
      name: fallbackName,
      relation: defaultProfileRelation
    }
  });
}

export async function listProfiles(userId: string) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  try {
    const profiles = await db.profile.findMany({
      where: { userId },
      orderBy: [{ relation: "asc" }, { createdAt: "asc" }]
    });

    return ensureProfileHealthIds(profiles);
  } catch {
    return [];
  }
}

export async function getAccessibleProfile(userId: string, profileId?: string | null) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const profiles = await listProfiles(userId);

  if (profiles.length === 0) {
    return null;
  }

  if (profileId) {
    const requestedProfile = profiles.find((profile) => profile.id === profileId);

    if (requestedProfile) {
      return requestedProfile;
    }
  }

  return profiles[0];
}

export async function createProfile(input: {
  userId: string;
  name: string;
  relation: string;
}) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  try {
    return await db.profile.create({
      data: {
        userId: input.userId,
        healthId: await generateUniqueProfileHealthId(),
        name: input.name,
        relation: input.relation
      }
    });
  } catch {
    return null;
  }
}

export async function updateProfile(input: {
  userId: string;
  profileId: string;
  name: string;
  relation: string;
}) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const profile = await db.profile.findFirst({
    where: {
      id: input.profileId,
      userId: input.userId
    }
  });

  if (!profile) {
    return null;
  }

  try {
    return await db.profile.update({
      where: {
        id: profile.id
      },
      data: {
        name: input.name,
        relation: input.relation
      }
    });
  } catch {
    return null;
  }
}

export async function deleteProfile(input: { userId: string; profileId: string }) {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const profiles = await listProfiles(input.userId);
  const profile = profiles.find((item) => item.id === input.profileId);

  if (!profile || profiles.length <= 1) {
    return null;
  }

  try {
    await db.$transaction([
      db.report.deleteMany({
        where: {
          userId: input.userId,
          profileId: input.profileId
        }
      }),
      db.profile.delete({
        where: {
          id: input.profileId
        }
      })
    ]);

    const remainingProfiles = await listProfiles(input.userId);
    const nextProfileId = remainingProfiles[0]?.id ?? null;

    if (!nextProfileId) {
      return null;
    }

    return {
      nextProfileId,
      profiles: remainingProfiles
    };
  } catch {
    return null;
  }
}
