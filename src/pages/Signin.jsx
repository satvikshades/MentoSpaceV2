import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, createUserDoc, db, googleProvider, signInWithEmailAndPassword, signInWithPopup } from "../firebase";
import AuthShell, { Divider, GoogleIcon, PasswordInput } from "../components/AuthShell";
import { Spinner } from "../components/ui";

const ERRORS = {
  "auth/invalid-credential": "That email and password don't match.",
  "auth/wrong-password": "That email and password don't match.",
  "auth/user-not-found": "There's no account with that email.",
  "auth/invalid-email": "That doesn't look like an email address.",
  "auth/too-many-requests": "Too many tries. Wait a minute, or reset your password.",
  "auth/network-request-failed": "You seem to be offline.",
  "auth/popup-closed-by-user": "",
  "auth/cancelled-popup-request": "",
};

function Side() {
  return (
    <div>
      <p className="font-serif text-[34px] italic leading-[1.15] text-white/95">
        Five seconds a day is enough to start noticing what helps.
      </p>
      <div className="mt-10 max-w-sm rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur">
        <div className="flex items-center justify-between text-sm text-white/60">
          <span>Your streak</span>
          <span>This week</span>
        </div>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-4xl font-extrabold">🔥 12</p>
          <div className="flex gap-1.5">
            {[1, 1, 1, 1, 1, 0, 0].map((d, i) => (
              <span key={i} className={`h-7 w-4 rounded-md ${d ? "bg-gradient-to-b from-primary to-secondary" : "bg-white/10"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Signin() {
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.from || "/dashboard";
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, (u) => u && navigate(next, { replace: true })), [navigate, next]);

  const update = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError("Enter your email and password.");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, form.email.trim(), form.password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(ERRORS[err.code] ?? "Couldn't log you in. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setError("");
    setLoading(true);
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        await createUserDoc(user.uid, { name: user.displayName || "", email: user.email, role: "student", expertise: "" });
      }
      navigate(next, { replace: true });
    } catch (err) {
      setError(ERRORS[err.code] ?? "Google sign-in didn't work. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Pick up where you left off." side={<Side />}>
      <button onClick={google} disabled={loading} className="btn-ghost w-full py-3">
        <GoogleIcon /> Continue with Google
      </button>
      <div className="my-6">
        <Divider />
      </div>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={update} className="field" placeholder="you@example.com" />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className="label" htmlFor="password">Password</label>
            <Link to="/forgot-password" className="text-[13px] font-semibold text-primary hover:underline">
              Forgot it?
            </Link>
          </div>
          <PasswordInput id="password" value={form.password} onChange={update} />
        </div>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 animate-fade">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading && <Spinner />} Log in
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        New here?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export default Signin;
