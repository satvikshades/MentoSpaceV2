import { useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { avatarUrl } from "../../lib/people";

export function Crest({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="crest-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8e7aa" />
          <stop offset=".5" stopColor="#d4af37" />
          <stop offset="1" stopColor="#9c7a2a" />
        </linearGradient>
      </defs>
      <path d="M24 3 42 10v13c0 11-7.6 19.2-18 22-10.4-2.8-18-11-18-22V10z" fill="none" stroke="url(#crest-g)" strokeWidth="2" />
      <path d="M15 31V18h3.4l5.6 7 5.6-7H33v13h-3.4v-7.6L24 30l-5.6-6.6V31z" fill="url(#crest-g)" />
    </svg>
  );
}

export function GoldAvatar({ person, size = 36 }) {
  return (
    <img
      src={avatarUrl(person)}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="shrink-0 rounded-full object-cover ring-1 ring-gold/40"
    />
  );
}

const PILL = {
  gold: "bg-gold/10 text-gold-light ring-gold/30",
  green: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/25",
  amber: "bg-amber-400/10 text-amber-300 ring-amber-400/25",
  red: "bg-red-400/10 text-red-300 ring-red-400/25",
  grey: "bg-white/5 text-sand ring-white/10",
  violet: "bg-violet-400/10 text-violet-300 ring-violet-400/25",
};

export function Pill({ tone = "grey", children }) {
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${PILL[tone]}`}>{children}</span>;
}

export function Stat({ label, value, hint, tone }) {
  return (
    <div className="gold-panel relative overflow-hidden p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sand">{label}</p>
      <p className={`mt-2 font-serif text-[40px] leading-none tabular-nums ${tone === "alert" ? "text-amber-300" : "gold-text"}`}>{value}</p>
      {hint && <p className="mt-2 text-xs text-sand">{hint}</p>}
    </div>
  );
}

export function SectionTitle({ kicker, title, sub, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {kicker && <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{kicker}</p>}
        <h1 className="mt-1.5 font-serif text-[32px] font-medium leading-tight text-champagne sm:text-[38px]">{title}</h1>
        {sub && <p className="mt-1.5 max-w-2xl text-sm text-sand">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ children }) {
  return <div className="rounded-2xl border border-dashed border-gold-line px-6 py-10 text-center text-sm text-sand">{children}</div>;
}

export function Drawer({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/60 backdrop-blur-[2px] animate-fade" onClick={onClose}>
      <aside
        className="h-full w-full max-w-xl overflow-y-auto border-l border-gold-line bg-onyx-2 p-6 shadow-2xl animate-rise sm:p-8"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gold">{title}</p>
          <button onClick={onClose} className="rounded-lg p-2 text-sand hover:bg-onyx-3 hover:text-champagne" aria-label="Close">
            <FiX />
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}

/**
 * Confirmation dialog for anything that changes data. Asks for a reason
 * (saved in the audit log) and, for destructive actions, a typed word.
 */
export function Confirm({ open, title, body, confirmLabel = "Confirm", danger = false, needReason = true, typeWord, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (open) {
      setReason("");
      setTyped("");
      setBusy(false);
    }
  }, [open]);
  if (!open) return null;
  const ok = (!needReason || reason.trim().length >= 5) && (!typeWord || typed === typeWord) && !busy;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 p-4 backdrop-blur-[2px] animate-fade" onClick={onCancel}>
      <div className="gold-panel w-full max-w-md p-6 shadow-2xl animate-rise" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-serif text-2xl text-champagne">{title}</h2>
        {body && <div className="mt-2 text-sm leading-relaxed text-sand">{body}</div>}
        {needReason && (
          <div className="mt-4">
            <label htmlFor="confirm-reason" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-sand">
              Reason (saved to the audit log)
            </label>
            <textarea id="confirm-reason" rows={2} className="gold-field resize-none" value={reason} onChange={(e) => setReason(e.target.value)} autoFocus />
          </div>
        )}
        {typeWord && (
          <div className="mt-3">
            <label htmlFor="confirm-word" className="mb-1.5 block text-xs text-sand">
              Type <b className="text-champagne">{typeWord}</b> to confirm
            </label>
            <input id="confirm-word" className="gold-field" value={typed} onChange={(e) => setTyped(e.target.value)} />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="gold-ghost">Cancel</button>
          <button
            disabled={!ok}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm(reason.trim());
              } finally {
                setBusy(false);
              }
            }}
            className={danger ? "inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-40" : "gold-btn"}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="gold-field max-w-xs" aria-label={placeholder} />;
}

export function Filter({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(([k, label]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
            value === k ? "bg-gold text-onyx" : "text-sand ring-1 ring-gold-line hover:text-champagne"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
