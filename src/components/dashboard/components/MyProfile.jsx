import { useState } from "react";
import { EXPERTISE_LABELS, expertiseList } from "../../../lib/people";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { FiCamera, FiEdit2, FiSettings } from "react-icons/fi";
import { db, storage } from "../../../firebase";
import { useDashboard, useProgress } from "../../../lib/useProgress";
import { Avatar, Spinner } from "../../ui";

function Badges({ uid }) {
  const p = useProgress(uid);
  if (p.loading) return null;
  const earned = p.milestones.filter((m) => m.earned).length;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Day streak", value: p.streak, icon: "🔥" },
          { label: "Best streak", value: p.best, icon: "🏔️" },
          { label: "Check-ins", value: p.moods.length, icon: "💭" },
          { label: p.level.name, value: `${p.xp} XP`, icon: "🌳" },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-xl">{s.icon}</p>
            <p className="mt-2 text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-semibold text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="card p-5 sm:p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Badges</h2>
          <p className="text-sm text-muted">
            {earned} of {p.milestones.length}
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {p.milestones.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl p-4 text-center transition ${
                m.earned ? "bg-gradient-to-br from-primary-50 to-white ring-1 ring-primary/20" : "bg-bg-light-gray"
              }`}
            >
              <div className={`mx-auto grid h-12 w-12 place-items-center rounded-full text-2xl ${m.earned ? "bg-white shadow-sm" : "opacity-30 grayscale"}`}>
                {m.icon}
              </div>
              <p className={`mt-2 text-sm font-bold ${m.earned ? "" : "text-muted"}`}>{m.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-muted">{m.hint}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function MyProfile() {
  const { user, profile, setProfile, role } = useDashboard();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: profile.name || "", bio: profile.bio || "", expertise: expertiseList(profile.expertise).map((e) => e.key) });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("That image is over 5 MB.");
    setUploading(true);
    try {
      const r = ref(storage, `profilePics/${user.uid}`);
      await uploadBytes(r, file, { contentType: file.type });
      const url = await getDownloadURL(r);
      await updateDoc(doc(db, "users", user.uid), { profilePic: url });
      setProfile((p) => ({ ...p, profilePic: url }));
      toast.success("Photo updated");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Try a smaller image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Your name can't be empty.");
    setSaving(true);
    try {
      const patch = { name: form.name.trim(), bio: form.bio.trim() };
      if (role === "mentor") patch.expertise = form.expertise;
      await updateDoc(doc(db, "users", user.uid), patch);
      if (patch.name !== user.displayName) await updateProfile(user, { displayName: patch.name }).catch(() => {});
      setProfile((p) => ({ ...p, ...patch }));
      setEditing(false);
      toast.success("Profile saved");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save your profile.");
    } finally {
      setSaving(false);
    }
  };

  const toggleArea = (k) =>
    setForm((f) => ({ ...f, expertise: f.expertise.includes(k) ? f.expertise.filter((x) => x !== k) : [...f.expertise, k] }));

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="card overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary to-secondary sm:h-32" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex items-end justify-between gap-4">
            <label className="group relative cursor-pointer" title="Change photo">
              <Avatar person={profile} size={96} className="ring-4 ring-white" />
              <span className="absolute bottom-1 right-1 grid h-8 w-8 place-items-center rounded-full bg-ink text-white ring-2 ring-white transition group-hover:bg-primary">
                {uploading ? <Spinner className="h-3.5 w-3.5" /> : <FiCamera className="h-3.5 w-3.5" />}
              </span>
              <input type="file" accept="image/*" className="sr-only" onChange={upload} disabled={uploading} />
            </label>
            <div className="flex gap-2">
              <Link to="/dashboard/settings" className="btn-ghost px-3 lg:hidden" aria-label="Settings">
                <FiSettings />
              </Link>
              {!editing && (
                <button onClick={() => setEditing(true)} className="btn-ghost">
                  <FiEdit2 /> Edit
                </button>
              )}
            </div>
          </div>

          {editing ? (
            <form onSubmit={save} className="mt-5 space-y-4 animate-rise">
              <div>
                <label className="label" htmlFor="p-name">Name</label>
                <input id="p-name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={50} />
              </div>
              <div>
                <label className="label" htmlFor="p-bio">
                  {role === "mentor" ? "What you can help with" : "A bit about you"}
                </label>
                <textarea
                  id="p-bio"
                  rows={4}
                  className="field resize-none"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  maxLength={400}
                  placeholder={
                    role === "mentor"
                      ? "e.g. I dealt with exam anxiety through engineering and now help others find routines that work."
                      : "Anything you'd like a mentor to know. Keep it as short as you like."
                  }
                />
                <p className="mt-1 text-right text-xs text-muted">{form.bio.length}/400</p>
              </div>
              {role === "mentor" && (
                <div>
                  <span className="label">Areas</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(EXPERTISE_LABELS).map(([k, label]) => (
                      <button
                        type="button"
                        key={k}
                        onClick={() => toggleArea(k)}
                        className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition ${
                          form.expertise.includes(k) ? "bg-primary-50 text-primary ring-primary" : "ring-line hover:bg-bg-light-gray"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm({ name: profile.name || "", bio: profile.bio || "", expertise: expertiseList(profile.expertise).map((e) => e.key) });
                  }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button disabled={saving} className="btn-primary">
                  {saving && <Spinner />} Save
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-4">
              <h1 className="text-2xl font-extrabold sm:text-3xl">{profile.name || "Add your name"}</h1>
              <p className="mt-0.5 text-sm text-muted">
                <span className="capitalize">{role}</span> · {profile.email || user.email}
              </p>
              {role === "mentor" && expertiseList(profile.expertise).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {expertiseList(profile.expertise).map((e) => (
                    <span key={e.key} className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary">
                      {e.label}
                    </span>
                  ))}
                </div>
              )}
              <p className={`mt-4 max-w-2xl whitespace-pre-line leading-relaxed ${profile.bio ? "text-ink/80" : "text-muted"}`}>
                {profile.bio ||
                  (role === "mentor"
                    ? "Add a short bio so students know what you can help with."
                    : "You haven't written anything about yourself yet.")}
              </p>
            </div>
          )}
        </div>
      </section>

      {role !== "mentor" && <Badges uid={user.uid} />}
    </div>
  );
}

export default MyProfile;
