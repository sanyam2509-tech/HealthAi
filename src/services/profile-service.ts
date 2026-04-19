import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";

import { db } from "@/services/firebase";

export type ProfileRecord = {
  id: string;
  userId: string;
  name: string;
  relation: string;
  healthId: string;
  createdAt?: unknown;
};

function buildHealthId() {
  return `HV-${crypto.randomUUID().slice(0, 4).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
}

function getCreatedAtValue(value: unknown) {
  if (!value || typeof value !== "object") {
    return 0;
  }

  if ("seconds" in value && typeof value.seconds === "number") {
    return value.seconds;
  }

  if ("toMillis" in value && typeof value.toMillis === "function") {
    return value.toMillis();
  }

  return 0;
}

export async function listProfiles(userId: string) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  const snapshot = await getDocs(query(collection(db, "profiles"), where("userId", "==", userId)));

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...(item.data() as Omit<ProfileRecord, "id">)
    }))
    .sort((left, right) => getCreatedAtValue(left.createdAt) - getCreatedAtValue(right.createdAt));
}

export async function createProfile(userId: string, name: string, relation: string) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  const healthId = buildHealthId();
  const docRef = await addDoc(collection(db, "profiles"), {
    userId,
    name,
    relation,
    healthId,
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    userId,
    name,
    relation,
    healthId,
    createdAt: new Date().toISOString()
  };
}

export async function ensureDefaultProfile(userId: string, fallbackName: string) {
  const profiles = await listProfiles(userId);

  if (profiles.length > 0) {
    return profiles[0];
  }

  return createProfile(userId, fallbackName, "Self");
}

export async function updateProfile(profileId: string, name: string, relation: string) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  await updateDoc(doc(db, "profiles", profileId), {
    name,
    relation
  });
}

export async function deleteProfile(profileId: string) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  await deleteDoc(doc(db, "profiles", profileId));
}

export async function createShareLink(profileId: string) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  const token = crypto.randomUUID();
  await addDoc(collection(db, "shareLinks"), {
    token,
    profileId,
    createdAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
  });

  return token;
}

export async function getSharedProfileByToken(token: string) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  const shareSnapshot = await getDocs(
    query(collection(db, "shareLinks"), where("token", "==", token))
  );

  const shareDoc = shareSnapshot.docs[0];

  if (!shareDoc) {
    return null;
  }

  const data = shareDoc.data();
  const profileSnapshot = await getDoc(doc(db, "profiles", data.profileId));

  if (!profileSnapshot.exists()) {
    return null;
  }

  return {
    token,
    profile: {
      id: profileSnapshot.id,
      ...(profileSnapshot.data() as Omit<ProfileRecord, "id">)
    }
  };
}
