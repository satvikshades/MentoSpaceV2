import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { EXPERTISE_LABELS } from "../lib/people";
import {
  auth,
  createUserWithEmailAndPassword,
  db,
  googleProvider,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
} from "../firebase";
import AuthShell, { Divider, FieldError, GoogleIcon, PasswordInput } from "../components/AuthShell";
import ConsentForm, { Helplines } from "../components/ConsentForm";
import { ADULT_AGE, ageFrom, MIN_AGE, QUALIFICATIONS } from "../lib/legal";
import { saveConsent } from "../lib/consent";

const ERRORS = {
  "auth/email-already-in-use": "There's already an account with that email. Try logging in.",
  "auth/invalid-email": "That doesn't look like an email address.",
  "auth/weak-password": "Pick a stronger password.",
  "auth/network-request-failed": "You seem to be offline.",
  "auth/popup-closed-by-user": "",
  "auth/cancelled-popup-request": "",
};

const ROLES = [
  { key: "student", title: "I'm looking for support", body: "Check in daily, build habits, talk to a mentor." },
  { key: "mentor", title: "I want to mentor", body: "Support students as a psychology mentor." },
];

function strength(pw) {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
  if (/\d/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return s;
}

function Side() {
  return (
    <div className="space-y-4">
      <p className="font-serif text-[34px] italic leading-[1.15] text-white/95">You don't need to have it figured out to start.</p>
      <ul className="space-y-3 pt-6 text-[15px] text-white/75">
        <li className="flex gap-3"><span className="text-secondary">01</span> Tell us a little about you.</li>
        <li className="flex gap-3"><span className="text-secondary">02</span> Read how we protect what you share, and agree.</li>
        <li className="flex gap-3"><span className="text-secondary">03</span> Your account is created. Say hello.</li>
      </ul>
    </div>
  );
}

function Steps({ step }) {
  return (
    <ol className="mb-7 flex items-center gap-2 text-xs font-bold" aria-label="Sign-up progress">
      {["Your details", "Consent"].map((label, i) => {
        const n = i + 1;
        const state = step === n ? "now" : step > n ? "done" : "next";
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full ${
                state === "next" ? "bg-bg-medium-gray text-muted" : "bg-primary text-white"
              }`}
            >
              {state === "done" ? "✓" : n}
            </span>
            <span className={state === "now" ? "text-ink" : "text-muted"}>{label}</span>
            {n === 1 && <span className="mx-1 h-px w-6 bg-line" />}
          </li>
        );
      })}
    </ol>
  );
}

function Registration() {
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.notice;
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState("email");
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    expertise: [],
    qualification: "",
    rciNumber: "",
    experience: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [tooYoung, setTooYoung] = useState(false);
  const score = strength(form.password);
  const age = ageFrom(form.dob);
  const isMinor = role === "student" && age !== null && age < ADULT_AGE;
  const needsRci = QUALIFICATIONS.find((q) => q.key === form.qualification)?.needsRci;

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((x) => ({ ...x, [name]: null }));
    if (apiError) setApiError("");
  };

  const toggleArea = (k) => {
    setForm((f) => ({ ...f, expertise: f.expertise.includes(k) ? f.expertise.filter((x) => x !== k) : [...f.expertise, k] }));
    setErrors((x) => ({ ...x, expertise: null }));
  };

  const validate = (m) => {
    const e = {};
    if (m === "email") {
      if (!form.name.trim()) e.name = "What should we call you? A first name or nickname is fine.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Enter a valid email address.";
      if (form.password.length < 8) e.password = "Use at least 8 characters.";
    }
    if (age === null || age > 100) e.dob = "Enter your date of birth.";
    else if (role === "mentor" && age < ADULT_AGE) e.dob = "Mentors must be 18 or older.";
    if (role === "mentor") {
      if (!form.qualification) e.qualification = "Choose the option closest to your training.";
      if (needsRci && !form.rciNumber.trim()) e.rciNumber = "Clinical psychologists need an RCI registration number.";
      if (form.expertise.length === 0) e.expertise = "Pick at least one area.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = (m) => {
    setMethod(m);
    if (!validate(m)) return;
    if (role === "student" && age < MIN_AGE) {
      setTooYoung(true);
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const profileFields = (name, email) => {
    const p = {
      name,
      email,
      role,
      dob: form.dob,
      ageGroup: isMinor ? "minor" : "adult",
      expertise: role === "mentor" ? form.expertise : "",
      createdAt: new Date().toISOString(),
    };
    if (role === "mentor") {
      p.mentorStatus = "pending";
      p.mentorDetails = {
        qualification: form.qualification,
        rciNumber: form.rciNumber.trim(),
        experienceYears: Number(form.experience) || 0,
      };
    }
    if (isMinor) p.guardianStatus = "pending";
    return p;
  };

  const createAccount = async (consent) => {
    setLoading(true);
    setApiError("");
    try {
      if (method === "google") {
        const { user } = await signInWithPopup(auth, googleProvider);
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().consent) {
          navigate("/dashboard", { replace: true });
          return;
        }
        await saveConsent(user.uid, consent, profileFields(user.displayName || "", user.email));
      } else {
        const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
        await updateProfile(cred.user, { displayName: form.name.trim() });
        await saveConsent(cred.user.uid, consent, profileFields(form.name.trim(), form.email.trim()));
        sendEmailVerification(cred.user).catch(() => {});
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error(err);
      setApiError(ERRORS[err.code] ?? "Couldn't create your account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (tooYoung) {
    return (
      <AuthShell title="MentoSpace is for students 13 and over" side={<Side />}>
        <p className="text-[15px] leading-relaxed text-ink/80">
          We're not able to create an account for you yet. If something is worrying you, please talk to a parent, teacher, or another adult you trust. You can also call these numbers any time, for free:
        </p>
        <div className="mt-5">
          <Helplines />
        </div>
        <button onClick={() => setTooYoung(false)} className="btn-ghost mt-6">
          Back
        </button>
      </AuthShell>
    );
  }

  if (step === 2) {
    return (
      <AuthShell
        title={role === "mentor" ? "Mentor agreement" : "How we protect what you share"}
        subtitle={isMinor ? "You're under 18, so your parent or guardian also needs to agree." : undefined}
        side={<Side />}
        wide
      >
        <Steps step={2} />
        {apiError && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{apiError}</p>}
        <ConsentForm
          role={role}
          isMinor={isMinor}
          busy={loading}
          submitLabel={method === "google" ? "Agree and continue with Google" : "Agree and create account"}
          onBack={() => setStep(1)}
          onAccept={createAccount}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account" subtitle="A nickname is fine. Nobody here needs your real name." side={<Side />}>
      <Steps step={1} />
      {notice && <p className="mb-5 rounded-xl bg-primary-50 px-4 py-3 text-sm font-medium text-primary">{notice}</p>}
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
        {ROLES.map((r) => (
          <button
            key={r.key}
            type="button"
            role="radio"
            aria-checked={role === r.key}
            onClick={() => {
              setRole(r.key);
              setErrors({});
            }}
            className={`rounded-2xl p-3.5 text-left ring-1 transition ${
              role === r.key ? "bg-primary-50 ring-2 ring-primary" : "ring-line hover:bg-bg-light-gray"
            }`}
          >
            <span className={`block text-sm font-bold ${role === r.key ? "text-primary" : ""}`}>{r.title}</span>
            <span className="mt-1 block text-xs leading-snug text-muted">{r.body}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <label className="label" htmlFor="dob">Date of birth</label>
          <input
            id="dob"
            name="dob"
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={form.dob}
            onChange={update}
            className={`field ${errors.dob ? "border-red-400" : ""}`}
          />
          <FieldError>{errors.dob}</FieldError>
          {isMinor && age >= MIN_AGE && (
            <p className="mt-1.5 text-[13px] text-primary">You're under 18, so you'll need a parent or guardian with you for the next step.</p>
          )}
        </div>

        {role === "mentor" && (
          <div className="space-y-4 animate-rise">
            <div>
              <label className="label" htmlFor="qualification">Your training</label>
              <select id="qualification" name="qualification" value={form.qualification} onChange={update} className={`field ${errors.qualification ? "border-red-400" : ""}`}>
                <option value="">Choose one</option>
                {QUALIFICATIONS.map((q) => (
                  <option key={q.key} value={q.key}>{q.label}</option>
                ))}
              </select>
              <FieldError>{errors.qualification}</FieldError>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="rciNumber">
                  RCI registration no. {!needsRci && <span className="font-normal text-muted">(if any)</span>}
                </label>
                <input id="rciNumber" name="rciNumber" value={form.rciNumber} onChange={update} className={`field ${errors.rciNumber ? "border-red-400" : ""}`} />
                <FieldError>{errors.rciNumber}</FieldError>
              </div>
              <div>
                <label className="label" htmlFor="experience">Years of experience</label>
                <input id="experience" name="experience" type="number" min="0" max="60" inputMode="numeric" value={form.experience} onChange={update} className="field" />
              </div>
            </div>
            <div>
              <span className="label">What can you help with?</span>
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
              <FieldError>{errors.expertise}</FieldError>
            </div>
          </div>
        )}
      </div>

      <button type="button" onClick={() => next("google")} className="btn-ghost mt-6 w-full py-3">
        <GoogleIcon /> Continue with Google
      </button>
      <div className="my-6">
        <Divider />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          next("email");
        }}
        className="space-y-4"
        noValidate
      >
        <div>
          <label className="label" htmlFor="name">Name or nickname</label>
          <input id="name" name="name" autoComplete="nickname" value={form.name} onChange={update} className={`field ${errors.name ? "border-red-400" : ""}`} />
          <FieldError>{errors.name}</FieldError>
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} className={`field ${errors.email ? "border-red-400" : ""}`} placeholder="you@example.com" />
          <FieldError>{errors.email}</FieldError>
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <PasswordInput id="password" value={form.password} onChange={update} autoComplete="new-password" placeholder="At least 8 characters" invalid={!!errors.password} />
          {form.password && (
            <div className="mt-2 flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition ${
                    i < score ? (score <= 1 ? "bg-red-400" : score === 2 ? "bg-amber-400" : "bg-emerald-500") : "bg-bg-medium-gray"
                  }`}
                />
              ))}
            </div>
          )}
          <FieldError>{errors.password}</FieldError>
        </div>
        <button type="submit" className="btn-primary w-full py-3">
          Continue
        </button>
        <p className="text-center text-xs text-muted">Your account is only created after you read and agree to the next step.</p>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

export default Registration;
