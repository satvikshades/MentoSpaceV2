import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { FiCheck } from "react-icons/fi";
import { auth } from "../firebase";
import AuthShell, { FieldError, PasswordInput } from "../components/AuthShell";
import { Spinner } from "../components/ui";

/** Handles Firebase's reset link when the action URL points here (?oobCode=...). */
function ResetPassword() {
  const [params] = useSearchParams();
  const code = params.get("oobCode");
  const [state, setState] = useState(code ? "checking" : "nocode");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!code) return;
    verifyPasswordResetCode(auth, code)
      .then((e) => {
        setEmail(e);
        setState("form");
      })
      .catch(() => setState("expired"));
  }, [code]);

  const submit = async (e) => {
    e.preventDefault();
    if (pw.length < 8) return setError("Use at least 8 characters.");
    if (pw !== confirm) return setError("The passwords don't match.");
    setLoading(true);
    try {
      await confirmPasswordReset(auth, code, pw);
      setState("done");
    } catch {
      setState("expired");
    } finally {
      setLoading(false);
    }
  };

  const side = <p className="font-serif text-[34px] italic leading-[1.15] text-white/95">A fresh start, for your password at least.</p>;

  if (state === "checking")
    return (
      <AuthShell title="One moment" side={side}>
        <Spinner className="h-6 w-6 text-primary" />
      </AuthShell>
    );

  if (state === "nocode" || state === "expired")
    return (
      <AuthShell
        title={state === "expired" ? "This link has expired" : "Use the link from your email"}
        subtitle={state === "expired" ? "Reset links only work once and for a short time." : "Open the reset link we emailed you to choose a new password."}
        side={side}
      >
        <Link to="/forgot-password" className="btn-primary w-full py-3">Send a new link</Link>
      </AuthShell>
    );

  if (state === "done")
    return (
      <AuthShell title="Password updated" side={side}>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-2xl text-emerald-600 animate-pop">
          <FiCheck />
        </div>
        <p className="mt-5 text-[15px] text-ink/80">You can log in with your new password now.</p>
        <Link to="/login" className="btn-primary mt-8 w-full py-3">Log in</Link>
      </AuthShell>
    );

  return (
    <AuthShell title="Choose a new password" subtitle={`For ${email}`} side={side}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="pw">New password</label>
          <PasswordInput id="pw" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" placeholder="At least 8 characters" />
        </div>
        <div>
          <label className="label" htmlFor="pw2">Repeat it</label>
          <PasswordInput id="pw2" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="" />
          <FieldError>{error}</FieldError>
        </div>
        <button disabled={loading} className="btn-primary w-full py-3">
          {loading && <Spinner />} Save password
        </button>
      </form>
    </AuthShell>
  );
}

export default ResetPassword;
