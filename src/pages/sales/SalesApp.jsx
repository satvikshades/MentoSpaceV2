import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { FiCheck } from "react-icons/fi";
import { auth } from "../../firebase";
import AuthShell, { FieldError, PasswordInput } from "../../components/AuthShell";
import { NoticeSections } from "../../components/ConsentForm";
import { Spinner } from "../../components/ui";
import { createRep, getRep, SALES_AGREEMENT, SALES_AGREEMENT_ITEMS, SALES_AGREEMENT_VERSION, STAGES } from "../../lib/sales";
import SalesDashboard from "./SalesDashboard";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal", "Other",
];

function Side() {
  return (
    <div>
      <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-secondary">MentoSpace sales</p>
      <p className="mt-3 font-serif text-[34px] italic leading-[1.15] text-white/95">Every school you sign is a place where no student faces it alone.</p>
      <ol className="mt-10 space-y-3">
        {STAGES.slice(1).map((s) => (
          <li key={s.key} className="flex items-center justify-between rounded-2xl bg-white/[0.06] px-4 py-3 ring-1 ring-white/10">
            <span className="text-[15px] text-white/85">
              <span className="mr-2 text-white/50">{s.short}</span>
              {s.label}
            </span>
            <span className="text-sm font-extrabold text-white">+{s.xp} XP</span>
          </li>
        ))}
        <li className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3">
          <span className="text-[15px] font-semibold text-white">Institution signed and verified</span>
          <span className="text-sm font-extrabold text-white">XP × 2</span>
        </li>
      </ol>
    </div>
  );
}

function Login({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError(err.code === "auth/too-many-requests" ? "Too many tries. Wait a minute, or reset your password." : "That email and password don't match.");
    } finally {
      setBusy(false);
    }
  };

  const forgot = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Type your email above first, then tap Forgot password.");
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch {
      /* same message either way */
    }
    toast.success("If that email has an account, a reset link is on its way.");
  };

  return (
    <AuthShell title="Sales console" subtitle="Log in to see your pipeline, XP and team ranking." side={<Side />}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="s-email">Work email</label>
          <input id="s-email" type="email" autoComplete="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className="label" htmlFor="s-pw">Password</label>
            <button type="button" onClick={forgot} className="text-[13px] font-semibold text-primary hover:underline">Forgot it?</button>
          </div>
          <PasswordInput id="s-pw" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
        <button disabled={busy || !email || !password} className="btn-primary w-full py-3">
          {busy && <Spinner />} Log in
        </button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">
        Want to sell MentoSpace to schools?{" "}
        <button onClick={onSwitch} className="font-semibold text-primary hover:underline">Apply to join</button>
      </p>
    </AuthShell>
  );
}

function Agreement({ busy, onAccept, onBack }) {
  const [ticked, setTicked] = useState({});
  const ok = SALES_AGREEMENT_ITEMS.every((i) => !i.required || ticked[i.id]);
  return (
    <div className="space-y-5 animate-rise">
      <NoticeSections sections={SALES_AGREEMENT} />
      <div className="space-y-2">
        {SALES_AGREEMENT_ITEMS.map((item) => (
          <label key={item.id} className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 ring-1 transition ${ticked[item.id] ? "bg-primary-50/60 ring-primary/40" : "ring-line"}`}>
            <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 ${ticked[item.id] ? "border-primary bg-primary text-white" : "border-line text-transparent"}`}>
              <FiCheck className="h-3.5 w-3.5" strokeWidth={3.5} />
            </span>
            <input type="checkbox" className="sr-only" checked={!!ticked[item.id]} onChange={(e) => setTicked((t) => ({ ...t, [item.id]: e.target.checked }))} />
            <span className="text-[14px] leading-snug">{item.label}</span>
          </label>
        ))}
      </div>
      <div className="flex justify-between gap-3">
        <button type="button" onClick={onBack} className="btn-ghost">Back</button>
        <button
          disabled={!ok || busy}
          onClick={() =>
            onAccept({
              version: SALES_AGREEMENT_VERSION,
              acceptedAt: new Date().toISOString(),
              items: Object.fromEntries(SALES_AGREEMENT_ITEMS.map((i) => [i.id, !!ticked[i.id]])),
            })
          }
          className="btn-primary py-3"
        >
          {busy && <Spinner />} Agree and apply
        </button>
      </div>
    </div>
  );
}

function Register({ onSwitch, existingUser, onCreated }) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ name: existingUser?.displayName || "", email: existingUser?.email || "", phone: "", city: "", state: "", referral: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [apiError, setApiError] = useState("");
  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    setErrors((x) => ({ ...x, [k]: null }));
  };

  const validate = () => {
    const e = {};
    if (f.name.trim().split(" ").filter(Boolean).length < 2) e.name = "Use your full name as on your ID.";
    if (!existingUser && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email.";
    if (!/^[+\d][\d\s-]{9,}$/.test(f.phone.trim())) e.phone = "Enter a phone number we can reach you on.";
    if (!f.city.trim()) e.city = "Which city will you cover?";
    if (!f.state) e.state = "Choose a state.";
    if (!existingUser && f.password.length < 8) e.password = "Use at least 8 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const create = async (agreement) => {
    setBusy(true);
    setApiError("");
    try {
      let user = existingUser;
      if (!user) {
        const cred = await createUserWithEmailAndPassword(auth, f.email.trim(), f.password);
        user = cred.user;
        await updateProfile(user, { displayName: f.name.trim() });
      }
      const rep = await createRep(user.uid, {
        name: f.name.trim(),
        email: user.email,
        phone: f.phone.trim(),
        city: f.city.trim(),
        state: f.state,
        referral: f.referral.trim(),
        agreement,
      });
      onCreated(rep);
    } catch (err) {
      setApiError(err.code === "auth/email-already-in-use" ? "That email already has an account. Log in instead, then apply." : "Couldn't send your application. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title={step === 1 ? "Join the sales team" : "Sales partner agreement"}
      subtitle={step === 1 ? "Tell us about you. The MentoSpace team reviews every application." : "Please read this, then agree to apply."}
      side={<Side />}
      wide={step === 2}
    >
      {apiError && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{apiError}</p>}
      {step === 2 ? (
        <Agreement busy={busy} onAccept={create} onBack={() => setStep(1)} />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (validate()) setStep(2);
          }}
          className="space-y-4"
          noValidate
        >
          <div>
            <label className="label" htmlFor="r-name">Full name</label>
            <input id="r-name" className="field" autoComplete="name" value={f.name} onChange={set("name")} />
            <FieldError>{errors.name}</FieldError>
          </div>
          {!existingUser && (
            <div>
              <label className="label" htmlFor="r-email">Email</label>
              <input id="r-email" type="email" autoComplete="email" className="field" value={f.email} onChange={set("email")} />
              <FieldError>{errors.email}</FieldError>
            </div>
          )}
          <div>
            <label className="label" htmlFor="r-phone">Phone</label>
            <input id="r-phone" type="tel" inputMode="tel" placeholder="+91" className="field" value={f.phone} onChange={set("phone")} />
            <FieldError>{errors.phone}</FieldError>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="r-city">City you'll cover</label>
              <input id="r-city" className="field" value={f.city} onChange={set("city")} />
              <FieldError>{errors.city}</FieldError>
            </div>
            <div>
              <label className="label" htmlFor="r-state">State</label>
              <select id="r-state" className="field" value={f.state} onChange={set("state")}>
                <option value="">Choose</option>
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <FieldError>{errors.state}</FieldError>
            </div>
          </div>
          <div>
            <label className="label" htmlFor="r-ref">Referral or employee code <span className="font-normal text-muted">(optional)</span></label>
            <input id="r-ref" className="field" value={f.referral} onChange={set("referral")} />
          </div>
          {!existingUser && (
            <div>
              <label className="label" htmlFor="r-pw">Password</label>
              <PasswordInput id="r-pw" value={f.password} onChange={set("password")} autoComplete="new-password" placeholder="At least 8 characters" />
              <FieldError>{errors.password}</FieldError>
            </div>
          )}
          <button className="btn-primary w-full py-3">Continue</button>
        </form>
      )}
      {!existingUser && (
        <p className="mt-8 text-center text-sm text-muted">
          Already on the team?{" "}
          <button onClick={onSwitch} className="font-semibold text-primary hover:underline">Log in</button>
        </p>
      )}
    </AuthShell>
  );
}

function StatusScreen({ rep, user }) {
  const pending = rep.status === "pending";
  return (
    <div className="grid min-h-screen place-items-center bg-bg-light-gray px-5">
      <div className="card w-full max-w-md p-8 text-center animate-rise">
        <div className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl text-2xl ${pending ? "bg-primary-50" : "bg-red-50"}`}>{pending ? "⏳" : "🔒"}</div>
        <h1 className="mt-5 text-2xl font-extrabold">
          {pending ? "Application received" : rep.status === "rejected" ? "Application not approved" : "Account paused"}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {pending
            ? `Thanks, ${rep.name.split(" ")[0]}. The MentoSpace team reviews every sales partner. We may call you before approving. You'll be able to use the console as soon as you're approved.`
            : rep.statusReason || "Contact the MentoSpace team if you think this is a mistake."}
        </p>
        <p className="mt-4 text-xs text-muted">Signed in as {user.email}</p>
        <button onClick={() => signOut(auth)} className="btn-ghost mt-6">Log out</button>
      </div>
    </div>
  );
}

export default function SalesApp() {
  const [user, setUser] = useState(undefined);
  const [rep, setRep] = useState(undefined);
  const [mode, setMode] = useState("login");

  useEffect(() => {
    document.title = "MentoSpace Sales";
    return onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      if (!u) return setRep(null);
      setRep(undefined);
      try {
        setRep(await getRep(u.uid));
      } catch {
        setRep(null);
      }
    });
  }, []);

  if (user === undefined || (user && rep === undefined))
    return (
      <div className="grid min-h-screen place-items-center bg-bg-light-gray text-primary">
        <Spinner className="h-6 w-6" />
      </div>
    );

  if (!user) return mode === "login" ? <Login onSwitch={() => setMode("join")} /> : <Register onSwitch={() => setMode("login")} onCreated={setRep} />;

  if (!rep)
    return mode === "join" ? (
      <Register existingUser={user} onCreated={setRep} />
    ) : (
      <div className="grid min-h-screen place-items-center bg-bg-light-gray px-5">
        <div className="card w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-extrabold">This isn't a sales account</h1>
          <p className="mt-3 text-[15px] text-muted">
            {user.email} is signed in, but hasn't applied to the sales team. You can apply with this login, or log out.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button onClick={() => signOut(auth)} className="btn-ghost">Log out</button>
            <button onClick={() => setMode("join")} className="btn-primary">Apply with this login</button>
          </div>
          <Link to="/dashboard" className="mt-5 inline-block text-sm font-semibold text-primary">Go to my MentoSpace dashboard</Link>
        </div>
      </div>
    );

  if (rep.status !== "approved") return <StatusScreen rep={rep} user={user} />;

  return <SalesDashboard user={user} rep={rep} setRep={setRep} />;
}
