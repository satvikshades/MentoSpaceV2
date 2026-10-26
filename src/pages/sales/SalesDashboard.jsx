import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { signOut } from "firebase/auth";
import {
  FiAlertCircle,
  FiArrowRight,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiColumns,
  FiList,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiUser,
  FiX,
} from "react-icons/fi";
import { auth } from "../../firebase";
import { Burst, EmptyState, Modal, Skeleton, Spinner } from "../../components/ui";
import { avatarUrl } from "../../lib/people";
import {
  addLead,
  advanceLead,
  BOARDS,
  INSTITUTION_TYPES,
  leadXP,
  loadBoard,
  loadLeads,
  LOST_REASONS,
  repStats,
  SALES_BADGES,
  SALES_LEVELS,
  STAGES,
  syncBoard,
  updateLead,
} from "../../lib/sales";

const TABS = [
  { key: "pipeline", label: "Pipeline", icon: FiColumns },
  { key: "schools", label: "Schools", icon: FiList },
  { key: "leaderboard", label: "Leaderboard", icon: FiAward },
  { key: "profile", label: "Profile", icon: FiUser },
];

const STAGE_STYLE = [
  "bg-bg-medium-gray text-ink/70",
  "bg-sky-50 text-sky-700",
  "bg-amber-50 text-amber-700",
  "bg-emerald-50 text-emerald-700",
];

const typeLabel = (k) => INSTITUTION_TYPES.find((t) => t.key === k)?.label || "School";
const fmtD = (s) => (s ? new Date(s.length === 10 ? s + "T00:00:00" : s).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "");
const todayKey = () => new Date().toISOString().slice(0, 10);

function greeting(name) {
  const h = new Date().getHours();
  const first = (name || "").split(" ")[0];
  return `${h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"}, ${first}`;
}

/* ------------------------------------------------------------------ */

function StagePill({ lead }) {
  const s = lead.stage || 0;
  if (lead.lost) return <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">Lost</span>;
  if (s === 3 && !lead.contractVerified) return <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-bold text-violet-700">Awaiting verification</span>;
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STAGE_STYLE[s]}`}>{s === 3 ? "Signed" : STAGES[s].label}</span>;
}

function StageTrack({ stage, verified }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((s) => (
        <span
          key={s}
          className={`h-1.5 flex-1 rounded-full ${
            stage >= s ? (s === 3 && !verified ? "bg-violet-300" : "bg-gradient-to-r from-primary to-secondary") : "bg-bg-medium-gray"
          }`}
        />
      ))}
    </div>
  );
}

function LeadCard({ lead, onOpen }) {
  const overdue = lead.nextStep?.date && lead.nextStep.date < todayKey() && (lead.stage || 0) < 3;
  const xp = leadXP(lead);
  return (
    <button onClick={() => onOpen(lead)} className="card w-full p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_24px_-14px_rgba(29,31,43,0.25)]">
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold leading-snug">{lead.name}</p>
        {xp.earned > 0 && <span className="shrink-0 text-[11px] font-extrabold text-primary">{xp.earned} XP</span>}
      </div>
      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
        <FiMapPin className="h-3 w-3" /> {lead.city || "—"} · {typeLabel(lead.type)}
      </p>
      <div className="mt-3">
        <StageTrack stage={lead.stage || 0} verified={lead.contractVerified} />
      </div>
      {lead.stage === 3 ? (
        <p className={`mt-2.5 text-xs font-semibold ${lead.contractVerified ? "text-emerald-700" : "text-violet-700"}`}>
          {lead.contractVerified ? "Verified · XP doubled" : `Awaiting verification · +${xp.pending} XP`}
        </p>
      ) : lead.nextStep?.text ? (
        <p className={`mt-2.5 flex items-center gap-1 text-xs ${overdue ? "font-semibold text-red-600" : "text-muted"}`}>
          {overdue ? <FiAlertCircle /> : <FiCalendar />} {lead.nextStep.text}
          {lead.nextStep.date ? ` · ${fmtD(lead.nextStep.date)}` : ""}
        </p>
      ) : (
        <p className="mt-2.5 text-xs text-muted">No next step set</p>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */

function AddSchool({ open, onClose, onAdd }) {
  const empty = { name: "", type: "school", board: "CBSE", city: "", state: "", students: "", contactName: "", contactRole: "Principal", contactPhone: "", contactEmail: "", nextText: "Call to book a workshop", nextDate: "" };
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.city.trim()) return toast.error("Add the institution's name and city.");
    setBusy(true);
    try {
      await onAdd({
        name: f.name.trim(),
        type: f.type,
        board: f.board,
        city: f.city.trim(),
        state: f.state.trim(),
        students: Number(f.students) || 0,
        contact: { name: f.contactName.trim(), role: f.contactRole.trim(), phone: f.contactPhone.trim(), email: f.contactEmail.trim() },
        nextStep: { text: f.nextText.trim(), date: f.nextDate },
        notes: "",
      });
      setF(empty);
      onClose();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={open} onClose={onClose} title="Add a school or university" size="max-w-xl">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="l-name">Institution name</label>
          <input id="l-name" className="field" value={f.name} onChange={set("name")} placeholder="e.g. Delhi Public School, Sector 45" autoFocus />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="l-type">Type</label>
            <select id="l-type" className="field" value={f.type} onChange={set("type")}>
              {INSTITUTION_TYPES.map((t) => (
                <option key={t.key} value={t.key}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="l-board">Board / body</label>
            <select id="l-board" className="field" value={f.board} onChange={set("board")}>
              {BOARDS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="l-students">Students (approx.)</label>
            <input id="l-students" type="number" min="0" inputMode="numeric" className="field" value={f.students} onChange={set("students")} />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="l-city">City</label>
            <input id="l-city" className="field" value={f.city} onChange={set("city")} />
          </div>
          <div>
            <label className="label" htmlFor="l-state">State</label>
            <input id="l-state" className="field" value={f.state} onChange={set("state")} />
          </div>
        </div>
        <fieldset className="rounded-2xl bg-bg-light-gray p-4">
          <legend className="px-1 text-sm font-bold">Decision maker</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="field" placeholder="Name" value={f.contactName} onChange={set("contactName")} aria-label="Contact name" />
            <input className="field" placeholder="Role (Principal, Counsellor…)" value={f.contactRole} onChange={set("contactRole")} aria-label="Contact role" />
            <input className="field" placeholder="Phone" type="tel" value={f.contactPhone} onChange={set("contactPhone")} aria-label="Contact phone" />
            <input className="field" placeholder="Email" type="email" value={f.contactEmail} onChange={set("contactEmail")} aria-label="Contact email" />
          </div>
          <p className="mt-2 text-xs text-muted">Work contact details only. Never add students' details.</p>
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <label className="label" htmlFor="l-next">Next step</label>
            <input id="l-next" className="field" value={f.nextText} onChange={set("nextText")} />
          </div>
          <div>
            <label className="label" htmlFor="l-date">By</label>
            <input id="l-date" type="date" className="field" value={f.nextDate} onChange={set("nextDate")} />
          </div>
        </div>
        <button disabled={busy} className="btn-primary w-full py-3">
          {busy && <Spinner />} Add to pipeline
        </button>
      </form>
    </Modal>
  );
}

function AdvanceModal({ lead, onClose, onDone }) {
  const next = Math.min(3, (lead?.stage || 0) + 1);
  const [f, setF] = useState({ date: todayKey(), note: "", students: lead?.students || "", value: "" });
  const [busy, setBusy] = useState(false);
  if (!lead) return null;
  const st = STAGES[next];
  const submit = async (e) => {
    e.preventDefault();
    if (next === 3 && !f.note.trim()) return toast.error("Add a note about the signed agreement or PO.");
    setBusy(true);
    try {
      await onDone(lead, f);
    } finally {
      setBusy(false);
    }
  };
  const prompts = {
    1: "How did the workshop go? Who attended?",
    2: "What does the trial include, and how long does it run?",
    3: "Agreement or PO reference, signing date, who signed. The admin uses this to verify.",
  };
  return (
    <Modal open onClose={onClose} title={`${st.verb} at ${lead.name}`}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-white">
          <span className="text-sm font-semibold">{st.short} · {st.label}</span>
          <span className="text-lg font-extrabold">
            +{st.xp} XP{next === 3 ? " (×2 when verified)" : ""}
          </span>
        </div>
        <div>
          <label className="label" htmlFor="a-date">Date</label>
          <input id="a-date" type="date" className="field" max={todayKey()} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} />
        </div>
        {next === 3 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="a-students">Students covered</label>
              <input id="a-students" type="number" min="0" className="field" value={f.students} onChange={(e) => setF({ ...f, students: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="a-value">Contract value (₹ per year)</label>
              <input id="a-value" type="number" min="0" className="field" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} />
            </div>
          </div>
        )}
        <div>
          <label className="label" htmlFor="a-note">Notes</label>
          <textarea id="a-note" rows={3} className="field resize-none" placeholder={prompts[next]} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
        </div>
        <button disabled={busy} className="btn-primary w-full py-3">
          {busy && <Spinner />} {next === 3 ? "Submit for verification" : `Mark ${st.label.toLowerCase()} done`}
        </button>
      </form>
    </Modal>
  );
}

function LeadDrawer({ lead, onClose, onAdvance, onSave }) {
  const [f, setF] = useState(() => ({
    nextText: lead?.nextStep?.text || "",
    nextDate: lead?.nextStep?.date || "",
    notes: lead?.notes || "",
    lostReason: LOST_REASONS[0],
  }));
  const [busy, setBusy] = useState(false);
  if (!lead) return null;
  const stage = lead.stage || 0;
  const xp = leadXP(lead);

  const save = async (patch, msg) => {
    setBusy(true);
    try {
      await onSave(lead, patch);
      toast.success(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-ink/40 backdrop-blur-[2px] animate-fade" onClick={onClose}>
      <aside className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl animate-rise sm:p-8" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={lead.name}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <StagePill lead={lead} />
            <h2 className="mt-2 text-2xl font-extrabold leading-tight">{lead.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {typeLabel(lead.type)} · {lead.board} · {lead.city}
              {lead.state ? `, ${lead.state}` : ""}
              {lead.students ? ` · ~${Number(lead.students).toLocaleString()} students` : ""}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-muted hover:bg-bg-light-gray" aria-label="Close">
            <FiX />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`rounded-xl px-2 py-3 ${stage >= s ? "bg-primary-50 text-primary" : "bg-bg-light-gray text-muted"}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider">{STAGES[s].short}</p>
              <p className="text-sm font-bold">{STAGES[s].label}</p>
              <p className="text-[11px]">{lead.stageDates?.[STAGES[s].key] ? fmtD(lead.stageDates[STAGES[s].key]) : `+${STAGES[s].xp} XP`}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm">
          <b className="text-primary">{xp.earned} XP</b> earned here
          {xp.pending ? <span className="text-violet-700"> · {xp.pending} XP waiting for verification</span> : null}
        </p>

        {!lead.lost && stage < 3 && (
          <button onClick={() => onAdvance(lead)} className="btn-primary mt-5 w-full py-3">
            {STAGES[stage + 1].verb}? <span className="rounded-md bg-white/20 px-1.5 py-0.5 text-xs">+{STAGES[stage + 1].xp} XP</span> <FiArrowRight />
          </button>
        )}

        {lead.contact?.name && (
          <section className="mt-6 rounded-2xl bg-bg-light-gray p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Decision maker</p>
            <p className="mt-1 font-bold">
              {lead.contact.name} <span className="font-normal text-muted">· {lead.contact.role}</span>
            </p>
            <div className="mt-1 space-y-0.5 text-sm">
              {lead.contact.phone && (
                <p className="flex items-center gap-2"><FiPhone className="text-muted" /> <span className="select-all">{lead.contact.phone}</span></p>
              )}
              {lead.contact.email && (
                <p className="flex items-center gap-2"><FiMail className="text-muted" /> <span className="select-all">{lead.contact.email}</span></p>
              )}
            </div>
          </section>
        )}

        {!lead.lost && stage < 3 && (
          <section className="mt-6 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Next step</p>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input className="field" value={f.nextText} onChange={(e) => setF({ ...f, nextText: e.target.value })} aria-label="Next step" />
              <input type="date" className="field" value={f.nextDate} onChange={(e) => setF({ ...f, nextDate: e.target.value })} aria-label="Next step date" />
            </div>
          </section>
        )}

        <section className="mt-5">
          <label className="text-xs font-bold uppercase tracking-wider text-muted" htmlFor="d-notes">Notes</label>
          <textarea id="d-notes" rows={3} className="field mt-2 resize-none" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
          <button
            disabled={busy}
            onClick={() => save({ nextStep: { text: f.nextText.trim(), date: f.nextDate }, notes: f.notes }, "Saved")}
            className="btn-soft mt-2"
          >
            Save
          </button>
        </section>

        <section className="mt-7">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">History</p>
          <ol className="mt-3 space-y-3 border-l-2 border-line pl-4">
            {[...(lead.history || [])].reverse().map((h, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-white" />
                <p className="text-sm font-semibold">{h.stage > 0 ? STAGES[h.stage].verb || STAGES[h.stage].label : "Added to pipeline"}</p>
                <p className="text-xs text-muted">
                  {fmtD(h.date || h.at)}
                  {h.note ? ` · ${h.note}` : ""}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 border-t border-line pt-5">
          {lead.lost ? (
            <button disabled={busy} onClick={() => save({ lost: false, lostReason: "" }, "Back in the pipeline")} className="btn-ghost">
              Reopen this school
            </button>
          ) : (
            stage < 3 && (
              <div className="flex flex-wrap items-center gap-2">
                <select className="field max-w-[220px]" value={f.lostReason} onChange={(e) => setF({ ...f, lostReason: e.target.value })} aria-label="Reason">
                  {LOST_REASONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <button disabled={busy} onClick={() => save({ lost: true, lostReason: f.lostReason }, "Marked as lost")} className="btn-danger">
                  Mark as lost
                </button>
              </div>
            )
          )}
        </section>
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Hero({ rep, stats, rank, teamSize }) {
  const target = rep.target || 0;
  const pct = target ? Math.min(100, Math.round((stats.contracts / target) * 100)) : 0;
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-secondary p-6 text-white sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
      <div className="relative grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="text-sm font-semibold text-white/75">
            {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 text-[30px] font-extrabold leading-tight text-white sm:text-[38px]">{greeting(rep.name)}.</h1>
          <p className="mt-2 max-w-md text-[15px] text-white/80">
            {stats.due.length
              ? `You have ${stats.due.length} follow-up${stats.due.length > 1 ? "s" : ""} due. Clearing them is the fastest way to XP.`
              : "Your follow-ups are clear. A good day to add new schools."}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold">{stats.level.name}</span>
            {rank > 0 && (
              <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold">
                Rank #{rank} of {teamSize}
              </span>
            )}
            <span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold">{rep.city}</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/20 backdrop-blur">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-white/80">Total XP</p>
              <p className="text-xs text-white/70">{stats.level.nextName ? `${stats.level.toNext.toLocaleString()} to ${stats.level.nextName}` : "Top level"}</p>
            </div>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">{stats.xp.toLocaleString()}</p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white transition-[width] duration-700" style={{ width: `${stats.level.pct}%` }} />
            </div>
            {stats.pendingXP > 0 && <p className="mt-2 text-xs text-white/80">+{stats.pendingXP.toLocaleString()} XP waiting for contract verification</p>}
          </div>
          <div className="rounded-2xl bg-white/12 p-4 ring-1 ring-white/20 backdrop-blur">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-white/80">Contracts vs target</p>
              <p className="text-xs text-white/70">{target ? `${pct}%` : "No target set yet"}</p>
            </div>
            <p className="mt-1 text-4xl font-extrabold tabular-nums">
              {stats.contracts}
              <span className="text-xl text-white/60">/{target || "—"}</span>
            </p>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Funnel({ stats }) {
  const rows = [
    { label: "In pipeline", n: stats.total },
    { label: "Workshops", n: stats.workshops },
    { label: "Free trials", n: stats.trials },
    { label: "Contracts", n: stats.contracts },
  ];
  const max = Math.max(1, rows[0].n);
  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">Your funnel</h2>
        <p className="text-sm text-muted">{stats.conversion}% workshop → contract</p>
      </div>
      <div className="mt-4 space-y-2.5">
        {rows.map((r, i) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm font-semibold text-ink/70">{r.label}</span>
            <div className="h-8 flex-1 overflow-hidden rounded-lg bg-bg-light-gray">
              <div
                className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-primary to-secondary px-2 text-xs font-bold text-white transition-[width] duration-700"
                style={{ width: `${Math.max(r.n ? 10 : 0, (r.n / max) * 100)}%`, opacity: 1 - i * 0.12 }}
              >
                {r.n > 0 ? r.n : ""}
              </div>
            </div>
            {r.n === 0 && <span className="w-4 text-xs text-muted">0</span>}
          </div>
        ))}
      </div>
      {stats.studentsCovered > 0 && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Your signed institutions cover about <b>{stats.studentsCovered.toLocaleString()}</b> students.
        </p>
      )}
    </section>
  );
}

function Leaderboard({ board, me }) {
  if (!board) return <Skeleton className="h-80" />;
  if (!board.length) return <EmptyState icon="🏆" title="No rankings yet" body="Once the team starts earning XP, the leaderboard fills up." />;
  const top = board.slice(0, 3);
  const order = [top[1], top[0], top[2]].filter(Boolean);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 items-end gap-3">
        {order.map((r) => {
          const place = board.indexOf(r) + 1;
          const h = place === 1 ? "h-36" : place === 2 ? "h-28" : "h-24";
          return (
            <div key={r.id} className="text-center">
              <img src={avatarUrl(r)} alt="" className="mx-auto h-14 w-14 rounded-full ring-4 ring-white" />
              <p className="mt-2 truncate text-sm font-bold">{r.name}</p>
              <p className="text-xs text-muted">{(r.xp || 0).toLocaleString()} XP</p>
              <div className={`mt-2 grid ${h} place-items-center rounded-t-2xl bg-gradient-to-b ${place === 1 ? "from-primary to-secondary text-white" : "from-primary-100 to-primary-50 text-primary"}`}>
                <span className="text-3xl font-extrabold">{place}</span>
              </div>
            </div>
          );
        })}
      </div>
      <ol className="card divide-y divide-line overflow-hidden">
        {board.map((r, i) => (
          <li key={r.id} className={`flex items-center gap-3 px-4 py-3 ${r.id === me ? "bg-primary-50/70" : ""}`}>
            <span className="w-6 text-center text-sm font-extrabold text-muted">{i + 1}</span>
            <img src={avatarUrl(r)} alt="" className="h-9 w-9 rounded-full" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">
                {r.name} {r.id === me && <span className="text-primary">(you)</span>}
              </p>
              <p className="text-xs text-muted">
                {r.level || "Rookie"} · {r.city || ""} · {r.contracts || 0} contracts
              </p>
            </div>
            <span className="text-sm font-extrabold tabular-nums">{(r.xp || 0).toLocaleString()}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function SalesDashboard({ user, rep }) {
  const [tab, setTab] = useState("pipeline");
  const [leads, setLeads] = useState(null);
  const [board, setBoard] = useState(null);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [advancing, setAdvancing] = useState(null);
  const [fire, setFire] = useState(0);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    loadLeads(user.uid)
      .then(setLeads)
      .catch(() => {
        setLeads([]);
        toast.error("Couldn't load your schools.");
      });
    loadBoard().then(setBoard).catch(() => setBoard([]));
  }, [user.uid]);

  const stats = useMemo(() => repStats(leads || []), [leads]);

  // keep my leaderboard row current
  useEffect(() => {
    if (!leads) return;
    syncBoard(rep, stats);
    setBoard((b) => (b ? b.map((r) => (r.id === rep.id ? { ...r, xp: stats.xp, contracts: stats.contracts, level: stats.level.name } : r)).sort((a, c) => (c.xp || 0) - (a.xp || 0)) : b));
  }, [leads, rep, stats]);

  const rank = board ? board.findIndex((r) => r.id === rep.id) + 1 : 0;
  const openLead = leads?.find((l) => l.id === openId) || null;

  const add = async (data) => {
    try {
      const l = await addLead(user.uid, data);
      setLeads((p) => [...p, l]);
      toast.success(`${l.name} added to your pipeline`);
    } catch {
      toast.error("Couldn't add that school.");
    }
  };

  const advance = async (lead, form) => {
    try {
      const before = repStats(leads).level.name;
      const updated = await advanceLead(lead, form);
      const next = leads.map((l) => (l.id === lead.id ? updated : l));
      setLeads(next);
      setAdvancing(null);
      setFire(Date.now());
      const st = STAGES[updated.stage];
      toast.success(updated.stage === 3 ? `Submitted for verification · ${leadXP(updated).pending} XP waiting` : `${st.verb} · +${st.xp} XP`);
      const after = repStats(next).level.name;
      if (after !== before) setTimeout(() => toast.success(`Level up! You're now ${after}`), 900);
    } catch (err) {
      console.error(err);
      toast.error("Couldn't save that. Try again.");
    }
  };

  const save = async (lead, patch) => {
    const updated = await updateLead(lead, patch);
    setLeads((p) => p.map((l) => (l.id === lead.id ? updated : l)));
  };

  const shown = useMemo(() => {
    let list = leads || [];
    if (filter === "active") list = list.filter((l) => !l.lost);
    if (filter === "lost") list = list.filter((l) => l.lost);
    if (filter === "signed") list = list.filter((l) => l.stage === 3);
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((l) => `${l.name} ${l.city} ${l.contact?.name || ""}`.toLowerCase().includes(s));
    return [...list].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [leads, q, filter]);

  const badges = SALES_BADGES.map((b) => ({ ...b, earned: b.test(stats) }));

  return (
    <div className="min-h-screen bg-bg-light-gray">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="wordmark text-xl">MentoSpace<span className="text-secondary">.</span></span>
            <span className="rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">Sales</span>
          </div>
          <nav className="hidden gap-1 md:flex">
            {TABS.map(({ key, label, icon: Icon }) => ( // eslint-disable-line no-unused-vars
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${tab === key ? "bg-primary-50 text-primary" : "text-ink/70 hover:bg-bg-light-gray"}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-bold leading-tight">{rep.name}</span>
              <span className="block text-xs text-muted">{stats.level.name} · {stats.xp.toLocaleString()} XP</span>
            </span>
            <img src={avatarUrl(rep)} alt="" className="h-9 w-9 rounded-full" />
            <button onClick={() => signOut(auth)} className="rounded-lg p-2 text-muted hover:bg-bg-light-gray hover:text-ink" aria-label="Log out" title="Log out">
              <FiLogOut />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 md:pb-12">
        <div className="relative">
          <Burst fire={fire} />
        </div>
        {!leads ? (
          <div className="space-y-4">
            <Skeleton className="h-56" />
            <Skeleton className="h-64" />
          </div>
        ) : tab === "pipeline" ? (
          <div className="space-y-6">
            <Hero rep={rep} stats={stats} rank={rank} teamSize={board?.length || 0} />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {STAGES.map((s, i) => (
                <div key={s.key} className="card p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">{i === 0 ? "To approach" : `${s.short} · ${s.label}`}</p>
                  <p className="mt-1 text-3xl font-extrabold tabular-nums">{stats.byStage[i]}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Pipeline</h2>
                  <button onClick={() => setAdding(true)} className="btn-primary">
                    <FiPlus /> Add school
                  </button>
                </div>
                {stats.active === 0 ? (
                  <EmptyState
                    icon="🏫"
                    title="Your pipeline is empty"
                    body="Add the schools, colleges and universities you plan to approach. Each one can be worth up to 1,200 XP."
                    action={<button onClick={() => setAdding(true)} className="btn-primary"><FiPlus /> Add your first school</button>}
                  />
                ) : (
                  <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 xl:mx-0 xl:grid xl:grid-cols-4 xl:overflow-visible xl:px-0">
                    {STAGES.map((s) => {
                      const col = (leads || []).filter((l) => !l.lost && (l.stage || 0) === s.n);
                      return (
                        <div key={s.key} className="w-[270px] shrink-0 snap-start rounded-2xl bg-white/60 p-3 ring-1 ring-line xl:w-auto">
                          <div className="mb-3 flex items-center justify-between px-1">
                            <p className="text-sm font-bold">{s.label}</p>
                            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-muted ring-1 ring-line">{col.length}</span>
                          </div>
                          <div className="space-y-2.5">
                            {col.map((l) => (
                              <LeadCard key={l.id} lead={l} onOpen={(x) => setOpenId(x.id)} />
                            ))}
                            {col.length === 0 && <p className="px-1 py-6 text-center text-xs text-muted">Nothing here yet</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <aside className="space-y-6">
                <section className="card p-5">
                  <h2 className="text-lg font-bold">Follow-ups due</h2>
                  {stats.due.length === 0 ? (
                    <p className="mt-2 text-sm text-muted">Nothing due today.</p>
                  ) : (
                    <ul className="mt-3 space-y-2">
                      {stats.due.slice(0, 6).map((l) => {
                        const late = l.nextStep.date < todayKey();
                        return (
                          <li key={l.id}>
                            <button onClick={() => setOpenId(l.id)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-bg-light-gray">
                              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold ${late ? "bg-red-50 text-red-600" : "bg-primary-50 text-primary"}`}>
                                {fmtD(l.nextStep.date)}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-bold">{l.name}</span>
                                <span className="block truncate text-xs text-muted">{l.nextStep.text}</span>
                              </span>
                              <FiChevronRight className="text-muted" />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
                <Funnel stats={stats} />
              </aside>
            </div>
          </div>
        ) : tab === "schools" ? (
          <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Schools</p>
                <h1 className="mt-1 text-[28px] font-extrabold">Every institution you're working</h1>
              </div>
              <button onClick={() => setAdding(true)} className="btn-primary"><FiPlus /> Add school</button>
            </div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {[["active", "Active"], ["signed", "Signed"], ["lost", "Lost"], ["all", "All"]].map(([k, l]) => (
                  <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filter === k ? "bg-ink text-white" : "bg-white text-ink/70 ring-1 ring-line"}`}>
                    {l}
                  </button>
                ))}
              </div>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search school, city or contact" className="field sm:max-w-xs" aria-label="Search" />
            </div>
            {shown.length === 0 ? (
              <EmptyState icon="🔍" title="Nothing here" body="Try another filter, or add a school." />
            ) : (
              <div className="card overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
                      <th className="px-4 py-3">Institution</th>
                      <th className="px-3 py-3">Stage</th>
                      <th className="px-3 py-3">Next step</th>
                      <th className="px-3 py-3 text-right">XP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {shown.map((l) => (
                      <tr key={l.id} onClick={() => setOpenId(l.id)} className="cursor-pointer transition hover:bg-bg-light-gray">
                        <td className="px-4 py-3">
                          <p className="font-bold">{l.name}</p>
                          <p className="text-xs text-muted">{typeLabel(l.type)} · {l.city}</p>
                        </td>
                        <td className="px-3 py-3"><StagePill lead={l} /></td>
                        <td className="px-3 py-3 text-muted">{l.lost ? l.lostReason : l.stage === 3 ? "—" : `${l.nextStep?.text || "—"}${l.nextStep?.date ? ` · ${fmtD(l.nextStep.date)}` : ""}`}</td>
                        <td className="px-3 py-3 text-right font-bold tabular-nums">{leadXP(l).earned}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : tab === "leaderboard" ? (
          <div className="mx-auto max-w-2xl">
            <p className="eyebrow">Leaderboard</p>
            <h1 className="mb-6 mt-1 text-[28px] font-extrabold">The whole team, by XP</h1>
            <Leaderboard board={board} me={rep.id} />
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-5">
            <section className="card flex items-center gap-4 p-6">
              <img src={avatarUrl(rep)} alt="" className="h-16 w-16 rounded-full" />
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-extrabold">{rep.name}</h1>
                <p className="truncate text-sm text-muted">{rep.email} · {rep.phone} · {rep.city}, {rep.state}</p>
                <p className="mt-1 text-xs text-muted">Partner agreement v{rep.agreement?.version} accepted {fmtD(rep.agreement?.acceptedAt)}</p>
              </div>
            </section>
            <section className="card p-6">
              <div className="flex items-baseline justify-between">
                <h2 className="text-lg font-bold">Badges</h2>
                <p className="text-sm text-muted">{badges.filter((b) => b.earned).length} of {badges.length}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {badges.map((b) => (
                  <div key={b.id} className={`rounded-2xl p-4 text-center ${b.earned ? "bg-gradient-to-br from-primary-50 to-white ring-1 ring-primary/20" : "bg-bg-light-gray"}`}>
                    <div className={`mx-auto grid h-12 w-12 place-items-center rounded-full text-2xl ${b.earned ? "bg-white shadow-sm" : "opacity-30 grayscale"}`}>{b.icon}</div>
                    <p className={`mt-2 text-sm font-bold ${b.earned ? "" : "text-muted"}`}>{b.title}</p>
                    <p className="text-[11px] text-muted">{b.hint}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="card p-6">
              <h2 className="text-lg font-bold">How XP and levels work</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-ink/80">
                {STAGES.slice(1).map((s) => (
                  <li key={s.key} className="flex justify-between"><span>{s.short}: {s.label}</span><b>+{s.xp} XP</b></li>
                ))}
                <li className="flex justify-between"><span>Contract verified by MentoSpace</span><b>School's XP × 2 (1,200)</b></li>
              </ul>
              <div className="mt-5 flex flex-wrap gap-2">
                {SALES_LEVELS.map((l) => (
                  <span key={l.name} className={`rounded-full px-3 py-1 text-xs font-bold ${stats.level.name === l.name ? "bg-primary text-white" : "bg-bg-light-gray text-muted"}`}>
                    {l.name} · {l.at.toLocaleString()}
                  </span>
                ))}
              </div>
            </section>
            <section className="card p-6 text-sm text-ink/80">
              <h2 className="text-lg font-bold text-ink">In a school</h2>
              <p className="mt-2 flex gap-2"><FiCheckCircle className="mt-0.5 shrink-0 text-primary" /> Carry ID and follow visitor rules. Never be alone with a student.</p>
              <p className="mt-1.5 flex gap-2"><FiCheckCircle className="mt-0.5 shrink-0 text-primary" /> If a child discloses abuse, report it to the police or Special Juvenile Police Unit (POCSO s.19) and tell MentoSpace. CHILDLINE: 1098.</p>
              <p className="mt-1.5 flex gap-2"><FiCheckCircle className="mt-0.5 shrink-0 text-primary" /> Describe MentoSpace honestly: mentoring and support, not clinical treatment.</p>
            </section>
          </div>
        )}
      </main>

      {/* mobile tabs */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur-md md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex justify-around">
          {TABS.map(({ key, label, icon: Icon }) => ( // eslint-disable-line no-unused-vars
            <button key={key} onClick={() => setTab(key)} className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${tab === key ? "text-primary" : "text-muted"}`}>
              <Icon className="h-[19px] w-[19px]" /> {label}
            </button>
          ))}
        </div>
      </nav>

      <AddSchool open={adding} onClose={() => setAdding(false)} onAdd={add} />
      {openLead && <LeadDrawer key={openLead.id + (openLead.updatedAt || "")} lead={openLead} onClose={() => setOpenId(null)} onAdvance={(l) => setAdvancing(l)} onSave={save} />}
      {advancing && <AdvanceModal lead={advancing} onClose={() => setAdvancing(null)} onDone={advance} />}
    </div>
  );
}
