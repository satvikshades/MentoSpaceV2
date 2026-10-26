import { useState } from "react";
import toast from "react-hot-toast";
import AuthShell, { FieldError } from "../../AuthShell";
import ConsentForm, { Helplines } from "../../ConsentForm";
import { ADULT_AGE, ageFrom, CONSENT_VERSION, MIN_AGE } from "../../../lib/legal";
import { saveConsent } from "../../../lib/consent";
import { logout } from "../../../lib/session";

/**
 * Shown instead of the dashboard when a signed-in user hasn't accepted the
 * current consent version (older accounts, or after the notice changes).
 */
export default function ConsentGate({ user, profile, onDone }) {
  const [role, setRole] = useState(profile?.role || "student");
  const [dob, setDob] = useState(profile?.dob || "");
  const [step, setStep] = useState(profile?.dob && profile?.role ? 2 : 1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const age = ageFrom(dob);
  const isMinor = role === "student" && age !== null && age < ADULT_AGE;
  const updated = !!profile?.consent && profile.consentVersion !== CONSENT_VERSION;

  const accept = async (record) => {
    setBusy(true);
    try {
      const extra = {
        role,
        dob,
        ageGroup: isMinor ? "minor" : "adult",
        name: profile?.name || user.displayName || "",
        email: profile?.email || user.email || "",
      };
      if (role === "mentor" && profile?.mentorStatus !== "verified") extra.mentorStatus = "pending";
      if (isMinor && profile?.guardianStatus !== "verified") extra.guardianStatus = "pending";
      await saveConsent(user.uid, record, extra);
      onDone({ ...(profile || {}), ...extra, consent: record, consentVersion: record.version });
      toast.success("Thanks. You're all set.");
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save that. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const side = (
    <p className="font-serif text-[34px] italic leading-[1.15] text-white/95">
      What you share stays between you and your mentor, with a few limits we explain here.
    </p>
  );

  if (step === 1) {
    const tooYoung = role === "student" && age !== null && age < MIN_AGE;
    return (
      <AuthShell title="One quick thing first" subtitle="We need your date of birth to show you the right consent form." side={side}>
        {!profile?.role && (
          <div className="mb-4 grid grid-cols-2 gap-2">
            {["student", "mentor"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-xl p-3 text-sm font-bold capitalize ring-1 transition ${role === r ? "bg-primary-50 text-primary ring-2 ring-primary" : "ring-line"}`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
        <label className="label" htmlFor="gate-dob">Date of birth</label>
        <input id="gate-dob" type="date" className="field" value={dob} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setDob(e.target.value)} />
        <FieldError>{error}</FieldError>
        {tooYoung && (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-ink/80">MentoSpace is for students 13 and over. If something is worrying you, please talk to an adult you trust or call:</p>
            <Helplines compact />
          </div>
        )}
        <div className="mt-6 flex justify-between gap-3">
          <button onClick={logout} className="btn-ghost">Log out</button>
          <button
            className="btn-primary"
            disabled={tooYoung}
            onClick={() => {
              if (age === null || age > 100) return setError("Enter your date of birth.");
              if (role === "mentor" && age < ADULT_AGE) return setError("Mentors must be 18 or older.");
              setError("");
              setStep(2);
            }}
          >
            Continue
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={updated ? "We've updated our consent form" : "Before you continue"}
      subtitle={
        updated
          ? "Please read the new version and agree to keep using MentoSpace."
          : "Please read how we handle what you share, and agree to keep using MentoSpace."
      }
      side={side}
      wide
    >
      <ConsentForm role={role} isMinor={isMinor} busy={busy} submitLabel="Agree and continue" backLabel="Log out" onAccept={accept} onBack={logout} />
      <p className="mt-4 text-center text-xs text-muted">Don't want to agree? You can log out, and ask our Grievance Officer to delete your account. Contact details are on the privacy page.</p>
    </AuthShell>
  );
}
