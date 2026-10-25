import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { FiArrowLeft, FiMail } from "react-icons/fi";
import { auth } from "../firebase";
import AuthShell from "../components/AuthShell";
import { Spinner } from "../components/ui";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Enter a valid email address.");
    setLoading(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (err) {
      // Don't reveal whether an account exists.
      if (err.code === "auth/user-not-found") setSent(true);
      else setError(err.code === "auth/too-many-requests" ? "Too many tries. Wait a few minutes." : "Couldn't send the email. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={sent ? "Check your inbox" : "Reset your password"}
      subtitle={sent ? undefined : "We'll email you a link to choose a new one."}
      side={<p className="font-serif text-[34px] italic leading-[1.15] text-white/95">It happens to everyone.</p>}
    >
      {sent ? (
        <div className="animate-rise">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-2xl text-primary">
            <FiMail />
          </div>
          <p className="mt-5 text-[15px] leading-relaxed text-ink/80">
            If there's an account for <b>{email}</b>, a reset link is on its way. It can take a minute, and it sometimes lands in spam.
          </p>
          <Link to="/login" className="btn-primary mt-8 w-full py-3">
            Back to log in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@example.com" />
          </div>
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
          <button disabled={loading} className="btn-primary w-full py-3">
            {loading && <Spinner />} Send reset link
          </button>
          <Link to="/login" className="flex items-center justify-center gap-2 pt-4 text-sm font-semibold text-muted hover:text-ink">
            <FiArrowLeft /> Back to log in
          </Link>
        </form>
      )}
    </AuthShell>
  );
}

export default ForgotPassword;
