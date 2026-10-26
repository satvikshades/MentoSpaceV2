import { useCallback, useEffect, useRef, useState } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import toast from "react-hot-toast";
import {
  FiActivity,
  FiAlertTriangle,
  FiCalendar,
  FiCheckSquare,
  FiFileText,
  FiGrid,
  FiLink,
  FiLock,
  FiLogOut,
  FiMenu,
  FiRefreshCw,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { auth } from "../../firebase";
import { IDLE_LOCK_MINUTES, isAdminUser, loadEverything } from "../../lib/admin";
import { Crest } from "./AdminUI";
import {
  ApprovalsSection,
  AuditSection,
  ConnectionsSection,
  ConsentSection,
  OverviewSection,
  PeopleSection,
  PersonDrawer,
  SafetySection,
  SessionsSection,
} from "./AdminSections";
import { useDerived } from "../../lib/adminDerive";

const NAV = [
  { key: "overview", label: "Overview", icon: FiGrid },
  { key: "approvals", label: "Approvals", icon: FiCheckSquare, badge: "pendingMentors" },
  { key: "people", label: "People", icon: FiUsers },
  { key: "safety", label: "Safety", icon: FiAlertTriangle, badge: "safetyCount" },
  { key: "connections", label: "Connections", icon: FiLink },
  { key: "sessions", label: "Sessions", icon: FiCalendar },
  { key: "consent", label: "Consent records", icon: FiFileText },
  { key: "audit", label: "Audit log", icon: FiShield },
];

function useNoIndex() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "MentoSpace";
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow, noarchive";
    document.head.appendChild(m);
    const prevBg = document.body.style.background;
    document.body.style.background = "#0c0b09";
    return () => {
      document.title = prevTitle;
      m.remove();
      document.body.style.background = prevBg;
    };
  }, []);
}

function Gate({ user, message, onSignIn, busy }) {
  return (
    <div className="admin-root admin-grain grid min-h-screen place-items-center bg-onyx px-5 text-champagne">
      <div className="w-full max-w-sm text-center animate-rise">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-onyx-2 ring-1 ring-gold-line">
          <Crest size={44} />
        </div>
        <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.3em] text-gold">Restricted</p>
        <h1 className="mt-2 font-serif text-[40px] font-medium leading-tight">
          <span className="gold-text">Master</span> console
        </h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-sand">
          For authorised administrators only. Every action here is recorded.
        </p>
        {message && <p className="mt-6 rounded-xl bg-red-400/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-400/20">{message}</p>}
        <button onClick={onSignIn} disabled={busy} className="gold-btn mt-8 w-full py-3.5 text-[15px]">
          {busy ? "Opening Google…" : user ? "Use a different Google account" : "Sign in with Google"}
        </button>
        {user && (
          <button onClick={() => signOut(auth)} className="mt-3 text-xs font-semibold text-sand hover:text-champagne">
            Sign out of {user.email}
          </button>
        )}
        <p className="mt-10 text-[11px] text-sand/60">Sessions lock after {IDLE_LOCK_MINUTES} minutes without activity.</p>
      </div>
    </div>
  );
}

export default function MasterAdmin() {
  useNoIndex();
  const [user, setUser] = useState(undefined);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [personId, setPersonId] = useState(null);
  const lastActive = useRef(Date.now());

  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u || null)), []);

  const admin = isAdminUser(user);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await loadEverything());
    } catch (err) {
      console.error(err);
      toast.error("Couldn't load data. Check the Firestore rules allow the admin to read.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (admin) refresh();
  }, [admin, refresh]);

  // idle lock
  useEffect(() => {
    if (!admin) return;
    const touch = () => (lastActive.current = Date.now());
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    const t = setInterval(() => {
      if (Date.now() - lastActive.current > IDLE_LOCK_MINUTES * 60000) {
        signOut(auth);
        setData(null);
        setMessage("Locked after inactivity. Sign in again to continue.");
      }
    }, 30000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, touch));
      clearInterval(t);
    };
  }, [admin]);

  const signIn = async () => {
    setBusy(true);
    setMessage("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const { user: u } = await signInWithPopup(auth, provider);
      if (!isAdminUser(u)) {
        await signOut(auth);
        setMessage("That account doesn't have access to this console.");
      }
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        setMessage(err?.code === "auth/unauthorized-domain" ? "This website isn't in Firebase's authorised domains yet." : "Sign-in didn't work. Try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const d = useDerived(data);

  if (user === undefined)
    return <div className="min-h-screen bg-onyx" />;

  if (!admin)
    return <Gate user={user} message={message || (user ? "This account doesn't have access to this console." : "")} onSignIn={signIn} busy={busy} />;

  const go = (k) => {
    setTab(k);
    setNavOpen(false);
    window.scrollTo(0, 0);
  };
  const openPerson = (id) => setPersonId(id);
  const sectionProps = { data, d, refresh, openPerson, go };

  return (
    <div className="admin-root admin-grain min-h-screen bg-onyx text-champagne">
      {/* sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gold-line bg-onyx/95 px-5 py-7 backdrop-blur transition-transform lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-3 px-2">
          <Crest size={36} />
          <div>
            <p className="font-serif text-xl leading-none">
              Mento<span className="gold-text">Space</span>
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-gold">Master</p>
          </div>
        </div>

        <nav className="mt-10 flex-1 space-y-1">
          {NAV.map(({ key, label, icon: Icon, badge }) => { // eslint-disable-line no-unused-vars
            const count = badge ? d[badge] : 0;
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => go(key)}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                  active ? "bg-gold/10 text-gold-light" : "text-sand hover:bg-onyx-3 hover:text-champagne"
                }`}
              >
                {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold" />}
                <Icon className="h-4 w-4" />
                <span className="flex-1">{label}</span>
                {count > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-extrabold text-onyx">{count}</span>}
              </button>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-gold-line pt-5">
          <div className="px-2">
            <p className="truncate text-sm font-semibold">{user.displayName || "Administrator"}</p>
            <p className="truncate text-xs text-sand">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { signOut(auth); setData(null); setMessage("Locked."); }} className="gold-ghost flex-1 px-3 py-2 text-xs">
              <FiLock /> Lock
            </button>
            <button onClick={() => signOut(auth)} className="gold-ghost flex-1 px-3 py-2 text-xs">
              <FiLogOut /> Sign out
            </button>
          </div>
        </div>
      </aside>
      {navOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setNavOpen(false)} />}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-gold-line bg-onyx/80 px-5 py-3.5 backdrop-blur sm:px-8">
          <button className="rounded-lg p-2 text-sand hover:text-champagne lg:hidden" onClick={() => setNavOpen(true)} aria-label="Open menu">
            <FiMenu />
          </button>
          <p className="hidden items-center gap-2 text-xs text-sand sm:flex">
            <FiActivity className="text-gold" /> Live data from Firebase · {d.lastLoaded}
          </p>
          <button onClick={refresh} disabled={loading} className="gold-ghost px-3 py-2 text-xs">
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> {loading ? "Loading" : "Refresh"}
          </button>
        </header>

        <main className="px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          {!data ? (
            <div className="grid min-h-[50vh] place-items-center text-sand">Loading everything…</div>
          ) : (
            <div className="mx-auto max-w-7xl">
              {tab === "overview" && <OverviewSection {...sectionProps} />}
              {tab === "approvals" && <ApprovalsSection {...sectionProps} />}
              {tab === "people" && <PeopleSection {...sectionProps} />}
              {tab === "safety" && <SafetySection {...sectionProps} />}
              {tab === "connections" && <ConnectionsSection {...sectionProps} />}
              {tab === "sessions" && <SessionsSection {...sectionProps} />}
              {tab === "consent" && <ConsentSection {...sectionProps} />}
              {tab === "audit" && <AuditSection {...sectionProps} />}
            </div>
          )}
        </main>
      </div>

      <PersonDrawer key={personId || "none"} id={personId} onClose={() => setPersonId(null)} {...sectionProps} />
    </div>
  );
}
