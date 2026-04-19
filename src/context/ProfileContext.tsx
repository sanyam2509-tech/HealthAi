import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import {
  createProfile,
  deleteProfile,
  ensureDefaultProfile,
  listProfiles,
  updateProfile,
  type ProfileRecord
} from "@/services/profile-service";

type ProfileContextValue = {
  profiles: ProfileRecord[];
  activeProfile: ProfileRecord | null;
  loading: boolean;
  refreshProfiles: () => Promise<void>;
  selectProfile: (profileId: string) => void;
  createNewProfile: (name: string, relation: string) => Promise<void>;
  updateCurrentProfile: (name: string, relation: string) => Promise<void>;
  deleteCurrentProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<ProfileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshProfiles() {
    if (!user) {
      setProfiles([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let nextProfiles = await listProfiles(user.uid);

      if (nextProfiles.length === 0) {
        const fallbackName = user.displayName?.trim() || user.email?.split("@")[0] || "My Profile";
        const createdProfile = await ensureDefaultProfile(user.uid, fallbackName);
        nextProfiles = [createdProfile];
      }

      setProfiles(nextProfiles);

      if (nextProfiles.length > 0 && !searchParams.get("profile")) {
        setSearchParams((current) => {
          const next = new URLSearchParams(current);
          next.set("profile", nextProfiles[0].id);
          return next;
        });
      }
    } catch (error) {
      console.error("Unable to load profiles", error);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshProfiles();
  }, [user]);

  const activeProfileId = searchParams.get("profile");
  const activeProfile = useMemo(
    () => profiles.find((profile) => profile.id === activeProfileId) ?? profiles[0] ?? null,
    [profiles, activeProfileId]
  );

  function selectProfile(profileId: string) {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("profile", profileId);
      return next;
    });
  }

  async function createNewProfile(name: string, relation: string) {
    if (!user) {
      return;
    }

    await createProfile(user.uid, name, relation);
    await refreshProfiles();
  }

  async function updateCurrentProfile(name: string, relation: string) {
    if (!activeProfile) {
      return;
    }

    await updateProfile(activeProfile.id, name, relation);
    await refreshProfiles();
  }

  async function deleteCurrentProfile() {
    if (!activeProfile) {
      return;
    }

    await deleteProfile(activeProfile.id);
    await refreshProfiles();
  }

  const value = useMemo<ProfileContextValue>(
    () => ({
      profiles,
      activeProfile,
      loading,
      refreshProfiles,
      selectProfile,
      createNewProfile,
      updateCurrentProfile,
      deleteCurrentProfile
    }),
    [profiles, activeProfile, loading]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);

  if (!context) {
    throw new Error("useProfile must be used inside a ProfileProvider.");
  }

  return context;
}
