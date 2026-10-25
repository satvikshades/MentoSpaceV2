import { useState } from "react";
import toast from "react-hot-toast";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { FiLock, FiBell, FiLogOut, FiAlertTriangle } from "react-icons/fi";
import { db } from "../../../firebase";
import { useDashboard } from "../../../lib/useProgress";
import { Modal, PageHeader, Spinner } from "../../ui";
import { logout } from "../../../lib/session";

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-4">
      <span>
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? "bg-primary" : "bg-bg-medium-gray"}`}
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

function Setting() {
  const { user, profile, setProfile } = useDashboard();
  const usesPassword = user.providerData.some((p) => p.providerId === "password");
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwBusy, setPwBusy] = useState(false);
  const [del, setDel] = useState(false);
  const [delText, setDelText] = useState("");
  const [delPw, setDelPw] = useState("");
  const [delBusy, setDelBusy] = useState(false);
  const prefs = { reminders: true, ...(profile.prefs || {}) };

  const setPref = async (key, value) => {
    const next = { ...prefs, [key]: value };
    setProfile((p) => ({ ...p, prefs: next }));
    try {
      await updateDoc(doc(db, "users", user.uid), { prefs: next });
    } catch {
      toast.error("Couldn't save that setting.");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.next.length < 8) return toast.error("Use at least 8 characters.");
    if (pw.next !== pw.confirm) return toast.error("The new passwords don't match.");
    setPwBusy(true);
    try {
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, pw.current));
      await updatePassword(user, pw.next);
      setPw({ current: "", next: "", confirm: "" });
      toast.success("Password changed");
    } catch (err) {
      const code = err.code || "";
      toast.error(
        code.includes("wrong-password") || code.includes("invalid-credential")
          ? "Your current password is wrong."
          : code.includes("weak-password")
          ? "Pick a stronger password."
          : "Couldn't change your password."
      );
    } finally {
      setPwBusy(false);
    }
  };

  const deleteAccount = async () => {
    setDelBusy(true);
    try {
      if (usesPassword) await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, delPw));
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      toast.error(
        err.code === "auth/requires-recent-login"
          ? "For safety, log out and back in, then try again."
          : err.code?.includes("credential") || err.code?.includes("password")
          ? "That password is wrong."
          : "Couldn't delete your account."
      );
      setDelBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader eyebrow="Settings" title="Your account" />

      <section className="card px-5 sm:px-6">
        <h2 className="flex items-center gap-2 pt-5 text-lg font-bold">
          <FiBell className="text-muted" /> Notifications
        </h2>
        <div>
          <Toggle
            label="Evening check-in reminder"
            hint="If you haven't checked in by 6pm, your Today page shows a reminder."
            checked={prefs.reminders}
            onChange={(v) => setPref("reminders", v)}
          />
        </div>
      </section>

      {usesPassword && (
        <section className="card p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <FiLock className="text-muted" /> Password
          </h2>
          <form onSubmit={changePassword} className="mt-4 space-y-3">
            <input type="password" autoComplete="current-password" required placeholder="Current password" className="field" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="password" autoComplete="new-password" required placeholder="New password" className="field" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              <input type="password" autoComplete="new-password" required placeholder="Repeat new password" className="field" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
            </div>
            <button disabled={pwBusy} className="btn-primary">
              {pwBusy && <Spinner />} Update password
            </button>
          </form>
        </section>
      )}

      <section className="card p-5 sm:p-6">
        <button onClick={logout} className="btn-ghost w-full sm:w-auto">
          <FiLogOut /> Log out
        </button>
      </section>

      <section className="rounded-2xl border border-red-200 bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-red-700">
          <FiAlertTriangle /> Delete account
        </h2>
        <p className="mt-1 text-sm text-muted">This removes your profile and signs you out for good. It can't be undone.</p>
        <button onClick={() => setDel(true)} className="btn-danger mt-4">
          Delete my account
        </button>
      </section>

      <Modal open={del} onClose={() => !delBusy && setDel(false)} title="Delete your account?">
        <p className="text-sm text-muted">
          Type <b className="text-ink">DELETE</b> to confirm{usesPassword ? ", and enter your password" : ""}.
        </p>
        <div className="mt-4 space-y-3">
          <input className="field" value={delText} onChange={(e) => setDelText(e.target.value)} placeholder="DELETE" />
          {usesPassword && (
            <input type="password" className="field" value={delPw} onChange={(e) => setDelPw(e.target.value)} placeholder="Password" />
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => setDel(false)} className="btn-ghost" disabled={delBusy}>Cancel</button>
          <button
            onClick={deleteAccount}
            disabled={delText !== "DELETE" || (usesPassword && !delPw) || delBusy}
            className="btn bg-red-600 text-white hover:bg-red-700"
          >
            {delBusy && <Spinner />} Delete forever
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default Setting;
