import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { buildMockAnalysis, type MedicalAnalysis } from "@/lib/analysis";
import { db, storage } from "@/services/firebase";

export type ReportRecord = {
  id: string;
  userId: string;
  profileId: string;
  fileName: string;
  fileUrl: string;
  sourceType: "pdf" | "image";
  reportType: string;
  reportDate: string;
  patientName: string;
  labName: string;
  healthCard: MedicalAnalysis["health_card"];
  analysis: MedicalAnalysis;
  summary: string;
  abnormalCount: number;
  createdAt?: unknown;
};

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Unable to read file."));
        return;
      }

      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };

    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

async function analyzeWithEndpoint(file: File) {
  const endpoint = import.meta.env.VITE_ANALYZE_ENDPOINT;

  if (!endpoint) {
    return buildMockAnalysis(file.name);
  }

  const data = await fileToBase64(file);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      data
    })
  });

  const payload = (await response.json()) as { analysis?: MedicalAnalysis; error?: string };

  if (!response.ok || !payload.analysis) {
    throw new Error(payload.error ?? "Failed to analyze report.");
  }

  return payload.analysis;
}

async function uploadReportFile(userId: string, profileId: string, file: File) {
  if (!storage) {
    return "";
  }

  const fileRef = ref(storage, `reports/${userId}/${profileId}/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

export async function analyzeAndSaveReport(userId: string, profileId: string, file: File) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  const analysis = await analyzeWithEndpoint(file);
  const fileUrl = await uploadReportFile(userId, profileId, file);

  const docRef = await addDoc(collection(db, "reports"), {
    userId,
    profileId,
    fileName: file.name,
    fileUrl,
    sourceType: file.type.includes("pdf") ? "pdf" : "image",
    reportType: analysis.metadata.report_type,
    reportDate: analysis.metadata.report_date,
    patientName: analysis.metadata.patient_name,
    labName: analysis.metadata.lab_name,
    healthCard: analysis.health_card,
    analysis,
    summary: analysis.analysis.summary,
    abnormalCount: analysis.health_card.abnormal_count,
    createdAt: serverTimestamp()
  });

  return {
    id: docRef.id,
    analysis,
    saved: true
  };
}

export async function listReports(userId: string, profileId: string) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  const snapshot = await getDocs(
    query(
      collection(db, "reports"),
      where("userId", "==", userId),
      where("profileId", "==", profileId),
      orderBy("createdAt", "desc")
    )
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<ReportRecord, "id">)
  })) as ReportRecord[];
}

export async function getReportById(id: string) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  const snapshot = await getDoc(doc(db, "reports", id));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<ReportRecord, "id">)
  } as ReportRecord;
}

export async function deleteReport(id: string) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  await deleteDoc(doc(db, "reports", id));
}

export async function getSharedReports(profileId: string) {
  if (!db) {
    throw new Error("Firebase is not configured yet.");
  }

  const snapshot = await getDocs(
    query(collection(db, "reports"), where("profileId", "==", profileId), orderBy("createdAt", "desc"))
  );

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<ReportRecord, "id">)
  })) as ReportRecord[];
}
