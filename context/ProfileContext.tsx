"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  createProfileRequest,
  deleteProfileRequest,
  updateProfileRequest
} from "@/services/profile-service";

export type ProfileOption = {
  id: string;
  name: string;
  relation: string;
  healthId: string | null;
};

type CreateProfileInput = {
  name: string;
  relation: string;
};

type UpdateProfileInput = {
  name: string;
  relation: string;
};

type ProfileContextValue = {
  profiles: ProfileOption[];
  activeProfile: ProfileOption | null;
  activeProfileId: string;
  isPending: boolean;
  selectProfile: (profileId: string) => void;
  createProfile: (input: CreateProfileInput) => Promise<ProfileOption>;
  updateActiveProfile: (input: UpdateProfileInput) => Promise<ProfileOption>;
  deleteActiveProfile: () => Promise<string>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

type ProfileProviderProps = {
  children: React.ReactNode;
  initialProfiles: ProfileOption[];
  initialActiveProfileId: string;
};

export function ProfileProvider({
  children,
  initialProfiles,
  initialActiveProfileId
}: ProfileProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [profiles, setProfiles] = useState(initialProfiles);
  const [activeProfileId, setActiveProfileId] = useState(initialActiveProfileId);

  useEffect(() => {
    setProfiles(initialProfiles);
    setActiveProfileId(initialActiveProfileId);
  }, [initialProfiles, initialActiveProfileId]);

  const navigateToProfile = useCallback(
    (profileId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("profile", profileId);

      setActiveProfileId(profileId);
      startTransition(() => {
        router.push(`/dashboard?${params.toString()}`);
        router.refresh();
      });
    },
    [router, searchParams]
  );

  const selectProfile = useCallback(
    (profileId: string) => {
      navigateToProfile(profileId);
    },
    [navigateToProfile]
  );

  const createProfile = useCallback(
    async (input: CreateProfileInput) => {
      const profile = await createProfileRequest(input);

      setProfiles((current) => [...current, profile]);
      navigateToProfile(profile.id);

      return profile;
    },
    [navigateToProfile]
  );

  const updateActiveProfile = useCallback(
    async (input: UpdateProfileInput) => {
      const profile = await updateProfileRequest(activeProfileId, input);

      setProfiles((current) =>
        current.map((item) => (item.id === profile.id ? { ...item, ...profile } : item))
      );
      router.refresh();

      return profile;
    },
    [activeProfileId, router]
  );

  const deleteActiveProfile = useCallback(async () => {
    const response = await deleteProfileRequest(activeProfileId);

    setProfiles(response.profiles);
    navigateToProfile(response.nextProfileId);

    return response.nextProfileId;
  }, [activeProfileId, navigateToProfile]);

  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === activeProfileId) ?? null,
    [profiles, activeProfileId]
  );

  const value = useMemo<ProfileContextValue>(
    () => ({
      profiles,
      activeProfile,
      activeProfileId,
      isPending,
      selectProfile,
      createProfile,
      updateActiveProfile,
      deleteActiveProfile
    }),
    [
      profiles,
      activeProfile,
      activeProfileId,
      isPending,
      selectProfile,
      createProfile,
      updateActiveProfile,
      deleteActiveProfile
    ]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfileContext() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfileContext must be used inside a ProfileProvider.");
  }

  return context;
}
