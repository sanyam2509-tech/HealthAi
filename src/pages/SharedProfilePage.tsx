import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getSharedProfileByToken } from "@/services/profile-service";
import { getSharedReports, type ReportRecord } from "@/services/report-service";

type SharedProfile = {
  id: string;
  name: string;
  relation: string;
  healthId: string;
};

type SharedState = {
  profile: SharedProfile;
  reports: ReportRecord[];
} | null;

export function SharedProfilePage() {
  const { token = "" } = useParams();
  const [state, setState] = useState<SharedState>(null);

  useEffect(() => {
    async function load() {
      const shared = await getSharedProfileByToken(token);

      if (!shared) {
        setState(null);
        return;
      }

      const reports = await getSharedReports(shared.profile.id);
      setState({
        profile: shared.profile as SharedProfile,
        reports
      });
    }

    void load();
  }, [token]);

  if (!state) {
    return (
      <section className="space-y-6">
        <div className="glass-panel rounded-[2rem] border border-white/60 p-8 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Shared view</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Share link unavailable</h1>
          <Link to="/" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white">
            Back to HealthVault
          </Link>
        </div>
      </section>
    );
  }

  const { profile, reports } = state;

  return (
    <section className="space-y-6 sm:space-y-8">
      <div className="mesh-card overflow-hidden rounded-[2rem] border border-white/60 p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{profile.name}&apos;s health snapshot</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">This is a read-only summary from the React conversion.</p>
      </div>
      <div className="space-y-4">
        {reports.map((report) => (
          <article key={report.id} className="glass-panel rounded-[1.75rem] border border-white/60 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.07)]">
            <h3 className="text-lg font-semibold tracking-tight text-slate-950">{report.healthCard.headline}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{report.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
