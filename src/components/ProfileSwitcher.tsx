import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { useProfile } from "@/context/ProfileContext";

const relationOptions = ["Self", "Mother", "Father", "Spouse", "Son", "Daughter", "Other"];

export function ProfileSwitcher() {
  const {
    profiles,
    activeProfile,
    loading,
    selectProfile,
    createNewProfile,
    updateCurrentProfile,
    deleteCurrentProfile
  } = useProfile();
  const activeProfileId = activeProfile?.id ?? "";
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("Other");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setSuccessMessage(""), 2200);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

  async function handleCreateProfile() {
    setError("");
    setIsCreating(true);

    try {
      await createNewProfile(name, relation);
      setShowCreateForm(false);
      setName("");
      setRelation("Other");
      setSuccessMessage("Profile created");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Failed to create profile.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleUpdateProfile() {
    if (!activeProfile) {
      return;
    }

    setError("");
    setIsUpdating(true);

    try {
      await updateCurrentProfile(name, relation);
      setShowEditForm(false);
      setSuccessMessage("Profile updated");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteProfile() {
    setError("");
    setIsDeleting(true);

    try {
      await deleteCurrentProfile();
      setShowEditForm(false);
      setSuccessMessage("Profile deleted");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Failed to delete profile.");
    } finally {
      setIsDeleting(false);
    }
  }

  function openCreateForm() {
    setShowEditForm(false);
    setName("");
    setRelation("Other");
    setShowCreateForm((current) => !current);
    setError("");
  }

  function openEditForm() {
    if (!activeProfile) {
      return;
    }

    setShowCreateForm(false);
    setName(activeProfile.name);
    setRelation(activeProfile.relation);
    setShowEditForm((current) => !current);
    setError("");
  }

  return (
    <div className="glass-panel rounded-[1.75rem] border border-white/60 p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Family profiles
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-950 sm:text-xl">
            Choose whose reports you are viewing
          </h3>
        </div>
        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50 md:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add profile
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <div className="md:hidden">
          <label htmlFor="active-profile" className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Active profile
          </label>
          <select
            id="active-profile"
            value={activeProfileId}
            onChange={(event) => selectProfile(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-sky-300"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name} · {profile.relation}
              </option>
            ))}
          </select>
        </div>

        <div className="-mx-1 hidden gap-3 overflow-x-auto px-1 pb-1 md:flex md:flex-wrap md:overflow-visible">
          {profiles.map((profile) => {
            const isActive = profile.id === activeProfileId;

            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => selectProfile(profile.id)}
                className={`shrink-0 rounded-full px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {profile.name} · {profile.relation}
              </button>
            );
          })}

          {loading ? <Loader2 className="h-4 w-4 animate-spin self-center text-slate-500" /> : null}
        </div>
      </div>

      {activeProfile ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-600">
            Active profile: <span className="font-medium text-slate-950">{activeProfile.name}</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={openEditForm}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
            >
              <Pencil className="h-4 w-4" />
              Edit active profile
            </button>
            <button
              type="button"
              onClick={() => void handleDeleteProfile()}
              disabled={profiles.length <= 1 || isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete active profile
            </button>
          </div>
        </div>
      ) : null}

      {showCreateForm ? (
        <div className="mt-5 rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="profile-name" className="text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
                placeholder="e.g. Mom"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="profile-relation" className="text-sm font-medium text-slate-700">
                Relation
              </label>
              <select
                id="profile-relation"
                value={relation}
                onChange={(event) => setRelation(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
              >
                {relationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleCreateProfile()}
              disabled={isCreating || name.trim().length < 2}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save profile
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {showEditForm ? (
        <div className="mt-5 rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="edit-profile-name" className="text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="edit-profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="edit-profile-relation" className="text-sm font-medium text-slate-700">
                Relation
              </label>
              <select
                id="edit-profile-relation"
                value={relation}
                onChange={(event) => setRelation(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300"
              >
                {relationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void handleUpdateProfile()}
              disabled={isUpdating || name.trim().length < 2}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
