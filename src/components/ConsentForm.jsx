import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiChevronDown, FiPhone } from "react-icons/fi";
import {
  CONSENT_VERSION,
  GUARDIAN_ITEMS,
  GUARDIAN_NOTICE,
  HELPLINES,
  MENTOR_ITEMS,
  MENTOR_NOTICE,
  STUDENT_ITEMS,
  STUDENT_NOTICE,
} from "../lib/legal";
import { Spinner } from "./ui";

export function NoticeSections({ sections, openFirst = true }) {
  const [open, setOpen] = useState(() => new Set(openFirst ? [sections[0]?.id] : []));
  const toggle = (id) =>
    setOpen((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-white">
      {sections.map((s) => {
        const isOpen = open.has(s.id);
        return (
          <section key={s.id}>
            <button
              type="button"
              onClick={() => toggle(s.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[15px] font-bold"
            >
              {s.title}
              <FiChevronDown className={`shrink-0 text-muted transition ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="space-y-2.5 px-4 pb-4 text-[14px] leading-relaxed text-ink/80 animate-fade">
                {s.body.map((p, i) => (
                  <p key={i} className={p.startsWith("•") ? "pl-3" : ""}>
                    {p}
                  </p>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export function Helplines({ compact = false }) {
  return (
    <div className={`rounded-2xl bg-violet-50 ring-1 ring-violet-200 ${compact ? "p-3.5" : "p-4"}`}>
      <p className="flex items-center gap-2 text-sm font-bold text-violet-900">
        <FiPhone /> Need help right now?
      </p>
      <ul className="mt-2 grid gap-x-4 gap-y-1 text-[13px] text-violet-900 sm:grid-cols-2">
        {HELPLINES.map((h) => (
          <li key={h.number} className="flex justify-between gap-3">
            <span>{h.name}</span>
            <b className="select-all tabular-nums">{h.number}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Check({ item, checked, onChange }) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 ring-1 transition ${
        checked ? "bg-primary-50/60 ring-primary/40" : "bg-white ring-line hover:ring-primary/30"
      }`}
    >
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition ${
          checked ? "border-primary bg-primary text-white" : "border-line bg-white text-transparent"
        }`}
      >
        <FiCheck className="h-3.5 w-3.5" strokeWidth={3.5} />
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="text-[14px] leading-snug text-ink/90">
        {item.label}
        {item.required && <span className="ml-1 text-red-500" aria-label="required">*</span>}
      </span>
    </label>
  );
}

const RELATIONS = ["Mother", "Father", "Legal guardian"];

/**
 * The consent step. Calls onAccept(record) only when every required box is
 * ticked (and, for minors, the guardian part is complete).
 */
export default function ConsentForm({ role = "student", isMinor = false, busy = false, submitLabel = "Agree and create account", backLabel = "Back", onAccept, onBack }) {
  const notice = role === "mentor" ? MENTOR_NOTICE : STUDENT_NOTICE;
  const items = role === "mentor" ? MENTOR_ITEMS : STUDENT_ITEMS;
  const [ticked, setTicked] = useState({});
  const [g, setG] = useState({ name: "", relation: RELATIONS[0], phone: "", email: "" });
  const [gTicked, setGTicked] = useState({});

  const guardianValid =
    !isMinor ||
    (g.name.trim().length > 1 &&
      /^[+\d][\d\s-]{8,}$/.test(g.phone.trim()) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(g.email.trim()) &&
      GUARDIAN_ITEMS.every((i) => !i.required || gTicked[i.id]));

  const allRequired = items.every((i) => !i.required || ticked[i.id]);
  const ready = allRequired && guardianValid && !busy;
  const missing = useMemo(() => items.filter((i) => i.required && !ticked[i.id]).length, [items, ticked]);

  const submit = (e) => {
    e.preventDefault();
    if (!ready) return;
    const now = new Date().toISOString();
    const record = {
      version: CONSENT_VERSION,
      role,
      acceptedAt: now,
      method: "in-app checkbox (clickwrap)",
      language: "en",
      items: Object.fromEntries(items.map((i) => [i.id, !!ticked[i.id]])),
      shareMoods: role === "student" ? !!ticked.shareMoods : undefined,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : "",
    };
    if (isMinor) {
      record.guardian = {
        name: g.name.trim(),
        relation: g.relation,
        phone: g.phone.trim(),
        email: g.email.trim(),
        declaredAt: now,
        items: Object.fromEntries(GUARDIAN_ITEMS.map((i) => [i.id, !!gTicked[i.id]])),
        verification: "pending",
      };
    }
    if (record.shareMoods === undefined) delete record.shareMoods;
    onAccept(record);
  };

  return (
    <form onSubmit={submit} className="space-y-5 animate-rise">
      <div>
        <p className="text-sm text-muted">
          Please read this before we create your account. Tap a heading to open it. You can read it again any time on our{" "}
          <Link to="/privacy" target="_blank" className="font-semibold text-primary hover:underline">
            privacy page
          </Link>
          .
        </p>
      </div>

      <NoticeSections sections={notice} />

      {role === "student" && <Helplines compact />}

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-bold">Your consent</legend>
        {items.map((item) => (
          <Check key={item.id} item={item} checked={!!ticked[item.id]} onChange={(v) => setTicked((t) => ({ ...t, [item.id]: v }))} />
        ))}
      </fieldset>

      {isMinor && (
        <fieldset className="space-y-3 rounded-2xl border-2 border-dashed border-primary/30 p-4">
          <legend className="px-1 text-sm font-bold text-primary">Parent or guardian consent</legend>
          <p className="text-[13px] text-muted">
            You're under 18, so a parent or guardian needs to fill this in with you.
          </p>
          <NoticeSections sections={GUARDIAN_NOTICE} />
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="g-name">Their full name</label>
              <input id="g-name" className="field" value={g.name} onChange={(e) => setG({ ...g, name: e.target.value })} autoComplete="off" />
            </div>
            <div>
              <label className="label" htmlFor="g-rel">Relationship</label>
              <select id="g-rel" className="field" value={g.relation} onChange={(e) => setG({ ...g, relation: e.target.value })}>
                {RELATIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="g-phone">Their phone</label>
              <input id="g-phone" type="tel" inputMode="tel" className="field" value={g.phone} onChange={(e) => setG({ ...g, phone: e.target.value })} placeholder="+91" autoComplete="off" />
            </div>
            <div>
              <label className="label" htmlFor="g-email">Their email</label>
              <input id="g-email" type="email" className="field" value={g.email} onChange={(e) => setG({ ...g, email: e.target.value })} autoComplete="off" />
            </div>
          </div>
          {GUARDIAN_ITEMS.map((item) => (
            <Check key={item.id} item={item} checked={!!gTicked[item.id]} onChange={(v) => setGTicked((t) => ({ ...t, [item.id]: v }))} />
          ))}
        </fieldset>
      )}

      <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
        {onBack ? (
          <button type="button" onClick={onBack} className="btn-ghost">
            {backLabel}
          </button>
        ) : (
          <span />
        )}
        <button type="submit" disabled={!ready} className="btn-primary py-3">
          {busy && <Spinner />} {submitLabel}
        </button>
      </div>
      {!allRequired && (
        <p className="text-right text-xs text-muted">
          {missing} required {missing === 1 ? "box" : "boxes"} left to tick
        </p>
      )}
      {allRequired && !guardianValid && (
        <p className="text-right text-xs text-muted">Add your parent or guardian's details and their consent</p>
      )}
    </form>
  );
}
