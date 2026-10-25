import { useState } from "react";
import { EXPERTISE_LABELS } from "../lib/people";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import {
  auth,
  createUserDoc,
  createUserWithEmailAndPassword,
  db,
  googleProvider,
  sendEmailVerification,
  signInWithPopup,
  updateProfile,
} from "../firebase";
import AuthShell, { Divider, FieldError, GoogleIcon, PasswordInput } from "../components/AuthShell";
import { Spinner } from "../components/ui";

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
  { key: "mentor", title: "I want to mentor", body: "Help people through things you've been through." },
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
      <p className="font-serif text-[34px] italic leading-[1.15] text-white/95">
        You don't need to have it figured out to start.
      </p>
      <ul className="space-y-3 pt-6 text-[15px] text-white/75">
        <li className="flex gap-3"><span className="text-secondary">01</span> Say how you feel. One tap.</li>
        <li className="flex gap-3"><span className="text-secondary">02</span> Pick one small habit.</li>
        <li className="flex gap-3"><span className="text-secondary">03</span> Talk to someone who gets it.</li>
      </ul>
    </div>
  );
}

function Registration() {
  const navigate = useNavigate();
  const [role, setRole] = useState("student");
  const [form, setForm] = useState({ name: "", email: "", password: "", expertise: [] });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const score = strength(form.password);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((x) => ({ ...x, [name]: null }));
    if (apiError) setApiError("");
  };

  const toggleArea = (k) =>
    setForm((f) => ({ ...f, expertise: f.expertise.includes(k) ? f.expertise.filter((x) => x !== k) : [...f.expertise, k] }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "What should we call you? A first name or nickname is fine.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Enter a valid email address.";
    if (form.password.length < 8) e.password = "Use at least 8 characters.";
    if (role === "mentor" && form.expertise.length === 0) e.expertise = "Pick at least one area.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      await updateProfile(cred.user, { displayName: form.name.trim() });
      await createUserDoc(cred.user.uid, {
        name: form.name.trim(),
        email: form.email.trim(),
        role,
        expertise: role === "mentor" ? form.expertise : "",
      });
      sendEmailVerification(cred.user).catch(() => {});
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setApiError(ERRORS[err.code] ?? "Couldn't create your account. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    if (role === "mentor" && form.expertise.length === 0) {
      setErrors({ expertise: "Pick at least one area first." });
      return;
    }
    setApiError("");
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        await createUserDoc(user.uid, {
          name: user.displayName || "",
          email: user.email,
          role,
          expertise: role === "mentor" ? form.expertise : "",
        });
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setApiError(ERRORS[err.code] ?? "Google sign-up didn't work. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="A nickname is fine. Nobody here needs your real name." side={<Side />}>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Account type">
        {ROLES.map((r) => (
          <button
            key={r.key}
            type="button"
            role="radio"
            aria-checked={role === r.key}
            onClick={() => setRole(r.key)}
            className={`rounded-2xl p-3.5 text-left ring-1 transition ${
              role === r.key ? "bg-primary-50 ring-2 ring-primary" : "ring-line hover:bg-bg-light-gray"
            }`}
          >
            <span className={`block text-sm font-bold ${role === r.key ? "text-primary" : ""}`}>{r.title}</span>
            <span className="mt-1 block text-xs leading-snug text-muted">{r.body}</span>
          </button>
        ))}
      </div>

      {role === "mentor" && (
        <div className="mt-5 animate-rise">
          <span className="label">What can you help with?</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(EXPERTISE_LABELS).map(([k, label]) => (
              <button
                type="button"
                key={k}
                onClick={() => {
                  toggleArea(k);
                  setErrors((x) => ({ ...x, expertise: null }));
                }}
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
      )}

      <button onClick={google} disabled={loading} className="btn-ghost mt-6 w-full py-3">
        <GoogleIcon /> Sign up with Google
      </button>
      <div className="my-6">
        <Divider />
      </div>

      <form onSubmit={submit} className="space-y-4" noValidate>
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
        {apiError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{apiError}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading && <Spinner />} Create account
        </button>
        <p className="text-center text-xs text-muted">We'll send a link to confirm your email.</p>
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
