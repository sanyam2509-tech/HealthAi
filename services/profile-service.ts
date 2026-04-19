export type ProfilePayload = {
  id: string;
  name: string;
  relation: string;
  healthId: string | null;
};

type ProfileResponse = {
  profile?: ProfilePayload;
  error?: string;
};

type DeleteProfileResponse = {
  nextProfileId?: string;
  profiles?: ProfilePayload[];
  error?: string;
};

type ShareLinkResponse = {
  sharePath?: string;
  expiresAt?: string;
  error?: string;
};

async function parseJson<T>(response: Response) {
  return (await response.json()) as T;
}

export async function createProfileRequest(input: { name: string; relation: string }) {
  const response = await fetch("/api/profiles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await parseJson<ProfileResponse>(response);

  if (!response.ok || !data.profile) {
    throw new Error(data.error ?? "Failed to create profile.");
  }

  return data.profile;
}

export async function updateProfileRequest(
  profileId: string,
  input: { name: string; relation: string }
) {
  const response = await fetch(`/api/profiles/${profileId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(input)
  });
  const data = await parseJson<ProfileResponse>(response);

  if (!response.ok || !data.profile) {
    throw new Error(data.error ?? "Failed to update profile.");
  }

  return data.profile;
}

export async function deleteProfileRequest(profileId: string) {
  const response = await fetch(`/api/profiles/${profileId}`, {
    method: "DELETE"
  });
  const data = await parseJson<DeleteProfileResponse>(response);

  if (!response.ok || !data.nextProfileId || !data.profiles) {
    throw new Error(data.error ?? "Failed to delete profile.");
  }

  return {
    nextProfileId: data.nextProfileId,
    profiles: data.profiles
  };
}

export async function createShareLinkRequest(profileId: string) {
  const response = await fetch(`/api/profiles/${profileId}/share`, {
    method: "POST"
  });
  const data = await parseJson<ShareLinkResponse>(response);

  if (!response.ok || !data.sharePath) {
    throw new Error(data.error ?? "Failed to create share link.");
  }

  return {
    sharePath: data.sharePath,
    expiresAt: data.expiresAt ?? ""
  };
}
