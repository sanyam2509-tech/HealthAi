import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { auth, db, isFirebaseConfigured } from "@/services/firebase";

export type AppUserProfile = {
  uid: string;
  name: string;
  email: string;
  healthId: string;
};

function buildHealthId() {
  return `HV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

async function ensureUserDocument(user: User) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName ?? user.email?.split("@")[0] ?? "HealthVault User",
      email: user.email ?? "",
      healthId: buildHealthId(),
      createdAt: serverTimestamp()
    });
  }

  return getUserProfile(user.uid);
}

export async function getUserProfile(uid: string): Promise<AppUserProfile | null> {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  const snapshot = await getDoc(doc(db, "users", uid));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as AppUserProfile;
}

export function observeAuthState(callback: (user: User | null) => void) {
  if (!auth || !isFirebaseConfigured) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, callback);
}

export async function registerWithEmail(name: string, email: string, password: string) {
  if (!auth) {
    throw new Error("Firebase Auth is not configured yet.");
  }

  const credentials = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credentials.user, {
    displayName: name
  });

  await ensureUserDocument({
    ...credentials.user,
    displayName: name
  } as User);
}

export async function loginWithEmail(email: string, password: string) {
  if (!auth) {
    throw new Error("Firebase Auth is not configured yet.");
  }

  const credentials = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserDocument(credentials.user);
}

export async function loginWithGoogle() {
  if (!auth) {
    throw new Error("Firebase Auth is not configured yet.");
  }

  const credentials = await signInWithPopup(auth, new GoogleAuthProvider());
  await ensureUserDocument(credentials.user);
}

export async function logout() {
  if (!auth) {
    return;
  }

  await signOut(auth);
}
