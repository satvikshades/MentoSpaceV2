import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FiArrowRight, FiDownload, FiEye, FiPlus, FiUserCheck } from "react-icons/fi";
import {
  approveMentor,
  connect,
  createAccount,
  deleteSession,
  downloadCSV,
  endConnection,
  loadMessages,
  audit,
  rejectMentor,
  removeUser,
  restoreUser,
  suspendUser,
  verifyGuardian,
} from "../../lib/admin";
import { CONSENT_VERSION, HELPLINES, QUALIFICATIONS, qualificationLabel } from "../../lib/legal";
import { EXPERTISE_LABELS, expertiseList } from "../../lib/people";
import { fmtTime, moodByKey, MOODS, timeAgo, toDate } from "../../lib/progress";
import { Confirm, Drawer, Empty, Filter, GoldAvatar, Pill, SearchBox, SectionTitle, Stat } from "./AdminUI";

const fmtDate = (v) => {
  const d = toDate(v);
  return d ? d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
};

function statusPills(p) {
  const out = [];
  if (p.status === "suspended") out.push(<Pill key="s" tone="red">Suspended</Pill>);
  if (p.status === "removed") out.push(<Pill key="r" tone="red">Removed</Pill>);
  if (p.role === "mentor") {
    if (p.mentorStatus === "pending") out.push(<Pill key="m" tone="amber">Awaiting approval</Pill>);
    else if (p.mentorStatus === "rejected") out.push(<Pill key="m" tone="red">Rejected</Pill>);
    else out.push(<Pill key="m" tone="gold">Verified</Pill>);
  }
  if (p.ageGroup === "minor") out.push(<Pill key="a" tone="violet">Under 18</Pill>);
  if (p.ageGroup === "minor" && p.guardianStatus !== "verified") out.push(<Pill key="g" tone="amber">Guardian pending</Pill>);
  if (!p.consent && p.status !== "removed") out.push(<Pill key="c" tone="grey">No consent yet</Pill>);
  else if (p.consentVersion && p.consentVersion !== CONSENT_VERSION) out.push(<Pill key="c" tone="grey">Old consent</Pill>);
  return out;
}

/* ================================================================== */
/* Overview                                                            */
/* ================================================================== */

function Bars({ series }) {
  const max = Math.max(1, ...series.map((s) => s.n));
  const total = series.reduce((a, s) => a + s.n, 0);
  return (
    <div>
      <div className="flex h-32 items-end gap-[3px]">
        {series.map((s) => (
          <div key={s.key} className="group relative flex-1">
            <div
              className="w-full rounded-t-[3px] bg-gradient-to-t from-gold-deep to-gold-light opacity-80 transition group-hover:opacity-100"
              style={{ height: `${Math.max(2, (s.n / max) * 128)}px` }}
            />
            <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-onyx-3 px-1.5 py-0.5 text-[10px] text-champagne ring-1 ring-gold-line group-hover:block">
              {s.n} · {s.key.slice(5)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-sand">
        <span>{series[0]?.key.slice(5)}</span>
        <span>{total} in 30 days</span>
        <span>today</span>
      </div>
    </div>
  );
}

export function OverviewSection({ data, d, go, openPerson, messages }) {
  const recentAudit = [...(data.admin_audit || [])].sort((a, b) => (toDate(b.at)?.getTime() || 0) - (toDate(a.at)?.getTime() || 0)).slice(0, 6);
  const mixTotal = Object.values(d.moodMix).reduce((a, b) => a + b, 0);
  const attention = [
    ...(messages || [])
      .filter((m) => m.status === "new")
      .map((m) => ({ id: "msg" + m.id, kind: `Website message${m.organisation ? ` · ${m.organisation}` : ""}`, who: { name: m.name }, tone: "gold", label: "Message", act: () => go("messages") })),
    ...d.pendingMentorList.map((m) => ({ id: m.id, kind: "Mentor to review", who: m, tone: "amber", act: () => go("approvals") })),
    ...[...new Map(d.lowMoods.map((m) => [m.studentId, m])).values()].map((m) => ({
      id: "lm" + m.id,
      kind: `Logged “${moodByKey[m.mood]?.label || m.mood}” ${timeAgo(m.createdAt)}`,
      who: m.student,
      tone: "red",
      act: () => openPerson(m.studentId),
    })),
    ...d.guardianPending.map((s) => ({ id: "g" + s.id, kind: "Guardian consent to verify", who: s, tone: "violet", act: () => go("safety") })),
  ].slice(0, 8);

  return (
    <div className="space-y-6">
      <SectionTitle
        kicker={new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
        title={<>Good to see you, <span className="gold-text">Satvik</span>.</>}
        sub="Everything happening on MentoSpace, in one place."
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Students" value={d.students.length} hint={`${d.activeWeek} active this week`} />
        <Stat label="Verified mentors" value={d.verifiedMentors.length} hint={`${d.mentors.length} mentors in total`} />
        <Stat label="Awaiting you" value={d.pendingMentors + d.guardianPending.length} hint={`${d.pendingMentors} ${d.pendingMentors === 1 ? "mentor" : "mentors"} · ${d.guardianPending.length} ${d.guardianPending.length === 1 ? "guardian" : "guardians"}`} tone={d.pendingMentors + d.guardianPending.length ? "alert" : undefined} />
        <Stat label="Check-ins today" value={d.checkinsToday} hint={`${d.pendingRequests} mentor ${d.pendingRequests === 1 ? "request" : "requests"} waiting`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="gold-panel p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl">Needs your attention</h2>
            <span className="text-xs text-sand">{attention.length ? `${attention.length} items` : "All clear"}</span>
          </div>
          {attention.length === 0 ? (
            <Empty>Nothing waiting. Website messages, new mentors, low moods and guardian checks will show up here.</Empty>
          ) : (
            <ul className="divide-y divide-gold-line">
              {attention.map((a) => (
                <li key={a.id}>
                  <button onClick={a.act} className="flex w-full items-center gap-3 py-3 text-left transition hover:opacity-90">
                    <GoldAvatar person={a.who} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{a.who?.name || "Unknown"}</p>
                      <p className="truncate text-xs text-sand">{a.kind}</p>
                    </div>
                    <Pill tone={a.tone}>{a.label || (a.tone === "red" ? "Safety" : a.tone === "amber" ? "Review" : "Verify")}</Pill>
                    <FiArrowRight className="text-sand" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="gold-panel p-6 lg:col-span-2">
          <h2 className="font-serif text-xl">New accounts</h2>
          <p className="mb-5 text-xs text-sand">Sign-ups per day, last 30 days</p>
          <Bars series={d.signups} />
          <h3 className="mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-sand">Moods, last 30 days</h3>
          {mixTotal === 0 ? (
            <p className="mt-2 text-sm text-sand">No check-ins yet.</p>
          ) : (
            <>
              <div className="mt-3 flex h-3 overflow-hidden rounded-full">
                {MOODS.filter((m) => d.moodMix[m.key]).map((m, i) => (
                  <span key={m.key} title={`${m.label}: ${d.moodMix[m.key]}`} style={{ width: `${(d.moodMix[m.key] / mixTotal) * 100}%`, opacity: 1 - i * 0.11 }} className="bg-gold" />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-sand">
                {MOODS.filter((m) => d.moodMix[m.key]).map((m) => (
                  <span key={m.key}>
                    {m.emoji} {m.label} <b className="text-champagne">{d.moodMix[m.key]}</b>
                  </span>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <section className="gold-panel p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl">Recent admin activity</h2>
          <button onClick={() => go("audit")} className="text-xs font-semibold text-gold hover:text-gold-light">Full audit log →</button>
        </div>
        {recentAudit.length === 0 ? (
          <p className="text-sm text-sand">No admin actions recorded yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {recentAudit.map((a) => (
              <li key={a.id} className="flex flex-wrap items-baseline justify-between gap-2">
                <span>
                  <span className="font-mono text-xs text-gold">{a.action}</span> <span className="text-champagne">{a.targetName || a.targetId || ""}</span>
                </span>
                <span className="text-xs text-sand">{timeAgo(a.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ================================================================== */
/* Approvals                                                           */
/* ================================================================== */

export function ApprovalsSection({ d, refresh, openPerson }) {
  const [act, setAct] = useState(null);
  const list = d.pendingMentorList;
  const rejected = d.mentors.filter((m) => m.mentorStatus === "rejected");

  return (
    <div>
      <SectionTitle kicker="Approvals" title="Mentors waiting for you" sub="Nobody can see a new mentor until you approve them. Check their qualification, and for clinical psychologists look up the RCI registration number on the RCI's Central Rehabilitation Register." />
      {list.length === 0 ? (
        <Empty>No mentors waiting. When someone signs up as a mentor, they'll appear here.</Empty>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {list.map((m) => (
            <article key={m.id} className="gold-panel flex flex-col p-6">
              <div className="flex items-center gap-4">
                <GoldAvatar person={m} size={56} />
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-2xl">{m.name || "Unnamed"}</h3>
                  <p className="truncate text-xs text-sand">{m.email} · joined {fmtDate(m.createdAt)}</p>
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-sand">Training</dt>
                  <dd>{qualificationLabel(m.mentorDetails?.qualification) || "Not given"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-sand">RCI number</dt>
                  <dd className="font-mono">{m.mentorDetails?.rciNumber || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-sand">Experience</dt>
                  <dd>{m.mentorDetails?.experienceYears ? `${m.mentorDetails.experienceYears} years` : "—"}</dd>
                </div>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-sand">Age</dt>
                  <dd>{m.age ?? "—"}</dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {expertiseList(m.expertise).map((e) => (
                  <Pill key={e.key} tone="gold">{e.label}</Pill>
                ))}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-sand">{m.bio || "No bio yet."}</p>
              <p className="mt-3 text-xs text-sand">
                Mentor agreement {m.consent ? `accepted ${fmtDate(m.consent.acceptedAt)}` : "not accepted yet"}
              </p>
              <div className="mt-5 flex gap-2">
                <button onClick={() => openPerson(m.id)} className="gold-ghost">Details</button>
                <button onClick={() => setAct({ type: "reject", m })} className="gold-danger flex-1">Reject</button>
                <button onClick={() => setAct({ type: "approve", m })} className="gold-btn flex-1">
                  <FiUserCheck /> Approve
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {rejected.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-serif text-xl">Rejected</h2>
          <ul className="gold-panel divide-y divide-gold-line">
            {rejected.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                <GoldAvatar person={m} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.name}</p>
                  <p className="truncate text-xs text-sand">{m.mentorReview?.note}</p>
                </div>
                <button onClick={() => setAct({ type: "approve", m })} className="gold-ghost px-3 py-1.5 text-xs">Approve instead</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Confirm
        open={act?.type === "approve"}
        title={`Approve ${act?.m?.name}?`}
        body="They'll become visible to students straight away."
        confirmLabel="Approve"
        needReason={false}
        onCancel={() => setAct(null)}
        onConfirm={async () => {
          await approveMentor(act.m);
          toast.success(`${act.m.name} approved`);
          setAct(null);
          refresh();
        }}
      />
      <Confirm
        open={act?.type === "reject"}
        title={`Reject ${act?.m?.name}?`}
        body="They'll see that their application wasn't approved. Write the reason so you have a record."
        confirmLabel="Reject"
        danger
        onCancel={() => setAct(null)}
        onConfirm={async (reason) => {
          await rejectMentor(act.m, reason);
          toast.success("Rejected");
          setAct(null);
          refresh();
        }}
      />
    </div>
  );
}

/* ================================================================== */
/* People                                                              */
/* ================================================================== */

function AddPerson({ open, onClose, onDone }) {
  const [f, setF] = useState({ role: "mentor", name: "", email: "", dob: "", qualification: "msc", rciNumber: "", experienceYears: "", expertise: [] });
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  const valid = f.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()) && (f.role !== "mentor" || f.expertise.length);
  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setBusy(true);
    try {
      await createAccount(f);
      toast.success(`Account created. ${f.email} will get an email to set a password.`);
      onDone();
    } catch (err) {
      toast.error(err?.code === "auth/email-already-in-use" ? "That email already has an account." : "Couldn't create the account.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Drawer open onClose={onClose} title="Add a person">
      <form onSubmit={submit} className="space-y-4">
        <h2 className="font-serif text-3xl">New account</h2>
        <p className="text-sm text-sand">
          They'll get an email to set their password, and must accept the consent form the first time they log in. Mentors you add here are approved automatically.
        </p>
        <Filter options={[["mentor", "Mentor"], ["student", "Student"]]} value={f.role} onChange={(role) => setF({ ...f, role })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="gold-field" placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-label="Full name" />
          <input className="gold-field" placeholder="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-label="Email" />
          <label className="text-xs text-sand sm:col-span-2">
            Date of birth (optional, they'll be asked if missing)
            <input className="gold-field mt-1" type="date" value={f.dob} onChange={(e) => setF({ ...f, dob: e.target.value })} />
          </label>
        </div>
        {f.role === "mentor" && (
          <div className="space-y-3">
            <select className="gold-field" value={f.qualification} onChange={(e) => setF({ ...f, qualification: e.target.value })} aria-label="Training">
              {QUALIFICATIONS.map((q) => (
                <option key={q.key} value={q.key}>{q.label}</option>
              ))}
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="gold-field" placeholder="RCI number (if any)" value={f.rciNumber} onChange={(e) => setF({ ...f, rciNumber: e.target.value })} aria-label="RCI number" />
              <input className="gold-field" placeholder="Years of experience" type="number" min="0" value={f.experienceYears} onChange={(e) => setF({ ...f, experienceYears: e.target.value })} aria-label="Years of experience" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(EXPERTISE_LABELS).map(([k, label]) => (
                <button
                  type="button"
                  key={k}
                  onClick={() => setF({ ...f, expertise: f.expertise.includes(k) ? f.expertise.filter((x) => x !== k) : [...f.expertise, k] })}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${f.expertise.includes(k) ? "bg-gold text-onyx" : "text-sand ring-1 ring-gold-line"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
        <button disabled={!valid || busy} className="gold-btn w-full py-3">
          <FiPlus /> {busy ? "Creating…" : "Create account"}
        </button>
      </form>
    </Drawer>
  );
}

export function PeopleSection({ d, refresh, openPerson }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [adding, setAdding] = useState(false);

  const rows = useMemo(() => {
    let list = filter === "removed" ? d.removed : d.people;
    if (filter === "students") list = list.filter((p) => p.role !== "mentor");
    if (filter === "mentors") list = list.filter((p) => p.role === "mentor");
    if (filter === "minors") list = list.filter((p) => p.ageGroup === "minor");
    if (filter === "suspended") list = list.filter((p) => p.status === "suspended");
    const s = q.trim().toLowerCase();
    if (s) list = list.filter((p) => `${p.name} ${p.email}`.toLowerCase().includes(s));
    return [...list].sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
  }, [d, q, filter]);

  const exportRows = () =>
    downloadCSV(
      `mentospace-people-${new Date().toISOString().slice(0, 10)}.csv`,
      rows.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role,
        status: p.status || "active",
        mentorStatus: p.mentorStatus || "",
        ageGroup: p.ageGroup || "",
        guardianStatus: p.guardianStatus || "",
        consentVersion: p.consentVersion || "",
        joined: p.createdAt || "",
      }))
    );

  return (
    <div>
      <SectionTitle
        kicker="People"
        title="Students and mentors"
        sub={`${d.students.length} students · ${d.mentors.length} mentors · ${d.suspended} suspended`}
        action={
          <div className="flex gap-2">
            <button onClick={exportRows} className="gold-ghost"><FiDownload /> Export</button>
            <button onClick={() => setAdding(true)} className="gold-btn"><FiPlus /> Add person</button>
          </div>
        }
      />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Filter
          value={filter}
          onChange={setFilter}
          options={[["all", "Everyone"], ["students", "Students"], ["mentors", "Mentors"], ["minors", "Under 18"], ["suspended", "Suspended"], ["removed", "Removed"]]}
        />
        <SearchBox value={q} onChange={setQ} placeholder="Search name or email" />
      </div>
      <div className="gold-panel overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-gold-line text-[11px] uppercase tracking-wider text-sand">
              <th className="px-5 py-3 font-bold">Person</th>
              <th className="px-3 py-3 font-bold">Role</th>
              <th className="px-3 py-3 font-bold">Status</th>
              <th className="px-3 py-3 font-bold">Joined</th>
              <th className="px-3 py-3 font-bold">Last active</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-line">
            {rows.map((p) => (
              <tr key={p.id} className="transition hover:bg-onyx-3/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <GoldAvatar person={p} size={34} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.name || "—"}</p>
                      <p className="truncate text-xs text-sand">{p.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 capitalize text-sand">{p.role || "—"}</td>
                <td className="px-3 py-3">
                  <div className="flex flex-wrap gap-1">{statusPills(p)}</div>
                </td>
                <td className="px-3 py-3 text-sand">{fmtDate(p.createdAt)}</td>
                <td className="px-3 py-3 text-sand">{d.lastActive[p.id] ? timeAgo(d.lastActive[p.id]) : "—"}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => openPerson(p.id)} className="gold-ghost px-3 py-1.5 text-xs">Open</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="px-5 py-8 text-center text-sm text-sand">Nobody matches that.</p>}
      </div>
      <AddPerson
        open={adding}
        onClose={() => setAdding(false)}
        onDone={() => {
          setAdding(false);
          refresh();
        }}
      />
    </div>
  );
}

/* ================================================================== */
/* Person drawer                                                       */
/* ================================================================== */

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-sand">{k}</dt>
      <dd className="text-right">{v || "—"}</dd>
    </div>
  );
}

export function PersonDrawer({ id, onClose, data, d, refresh }) {
  const [act, setAct] = useState(null);
  const [chat, setChat] = useState(null);
  const [method, setMethod] = useState("Phone call");
  const p = id ? d.byId[id] : null;
  if (!p) return null;

  const moods = (data.moods || []).filter((m) => m.studentId === p.id).sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));
  const habits = (data.habits || []).filter((h) => h.studentId === p.id);
  const reqs = (data.requests || []).filter((r) => r.studentId === p.id || r.mentorId === p.id);
  const chats = (data.chats || []).filter((c) => c.members?.includes(p.id));
  const g = p.consent?.guardian;

  const done = (msg) => {
    toast.success(msg);
    setAct(null);
    refresh();
  };

  return (
    <Drawer open={!!id} onClose={onClose} title={p.role === "mentor" ? "Mentor" : "Student"}>
      <div className="flex items-center gap-4">
        <GoldAvatar person={p} size={64} />
        <div className="min-w-0">
          <h2 className="truncate font-serif text-3xl">{p.name || "—"}</h2>
          <p className="truncate text-sm text-sand">{p.email}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">{statusPills(p)}</div>

      <dl className="mt-6 divide-y divide-gold-line border-y border-gold-line">
        <Row k="Joined" v={fmtDate(p.createdAt)} />
        <Row k="Date of birth" v={p.dob ? `${fmtDate(p.dob + "T00:00:00")} (${p.age})` : null} />
        <Row k="Last active" v={d.lastActive[p.id] ? timeAgo(d.lastActive[p.id]) : null} />
        {p.role === "mentor" ? (
          <>
            <Row k="Training" v={qualificationLabel(p.mentorDetails?.qualification)} />
            <Row k="RCI number" v={p.mentorDetails?.rciNumber} />
            <Row k="Students" v={String(p.myStudents?.length || 0)} />
          </>
        ) : (
          <>
            <Row k="Check-ins" v={String(moods.length)} />
            <Row k="Habits" v={String(habits.length)} />
            <Row k="Shares moods with mentor" v={p.consent?.shareMoods ? "Yes" : "No"} />
          </>
        )}
        <Row k="Consent" v={p.consent ? `v${p.consentVersion} · ${fmtDate(p.consent.acceptedAt)}` : "Not given"} />
        {p.statusReason && <Row k="Status note" v={p.statusReason} />}
      </dl>

      {g && (
        <section className="mt-6 rounded-2xl bg-violet-400/5 p-4 ring-1 ring-violet-400/20">
          <p className="text-[11px] font-bold uppercase tracking-wider text-violet-300">Parent / guardian</p>
          <p className="mt-2 text-sm">
            {g.name} · {g.relation}
          </p>
          <p className="mt-1 select-all text-sm text-sand">{g.phone}</p>
          <p className="select-all text-sm text-sand">{g.email}</p>
          <p className="mt-2 text-xs text-sand">
            {p.guardianStatus === "verified" ? `Verified ${fmtDate(g.verifiedAt)} by ${g.method}` : "Not verified yet. Contact them to confirm, then mark verified."}
          </p>
          {p.guardianStatus !== "verified" && (
            <div className="mt-3 flex gap-2">
              <select value={method} onChange={(e) => setMethod(e.target.value)} className="gold-field" aria-label="How you verified">
                {["Phone call", "Email reply", "DigiLocker", "Video call", "In person"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <button
                onClick={async () => {
                  await verifyGuardian(p, method);
                  done("Guardian marked verified");
                }}
                className="gold-btn shrink-0"
              >
                Mark verified
              </button>
            </div>
          )}
        </section>
      )}

      {moods.length > 0 && (
        <section className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sand">Recent check-ins</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {moods.slice(0, 6).map((m) => (
              <li key={m.id} className="flex justify-between">
                <span>
                  {moodByKey[m.mood]?.emoji} {moodByKey[m.mood]?.label || m.mood}
                </span>
                <span className="text-xs text-sand">{timeAgo(m.createdAt)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(reqs.length > 0 || chats.length > 0) && (
        <section className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sand">Connections</p>
          <ul className="mt-2 space-y-2">
            {chats.map((c) => {
              const otherId = c.members.find((m) => m !== p.id);
              const other = d.byId[otherId];
              return (
                <li key={c.id} className="flex items-center gap-3 text-sm">
                  <GoldAvatar person={other} size={28} />
                  <span className="flex-1 truncate">{other?.name || c.userNames?.[otherId] || "Unknown"}</span>
                  <button onClick={() => setAct({ type: "chat", chatId: c.id, other })} className="gold-ghost px-2.5 py-1 text-xs">
                    <FiEye /> Read conversation
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {chat && (
        <section className="mt-6 rounded-2xl bg-onyx p-4 ring-1 ring-gold-line">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gold">Conversation (access logged)</p>
            <button onClick={() => setChat(null)} className="text-xs text-sand hover:text-champagne">Close</button>
          </div>
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {chat.length === 0 && <p className="text-sm text-sand">No messages.</p>}
            {chat
              .sort((a, b) => (toDate(a.timestamp)?.getTime() || 0) - (toDate(b.timestamp)?.getTime() || 0))
              .map((m) => (
                <div key={m.id} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${m.senderId === p.id ? "ml-auto bg-gold/15" : "bg-onyx-3"}`}>
                  <p>{m.text}</p>
                  <p className="mt-0.5 text-[10px] text-sand">
                    {d.byId[m.senderId]?.name || "?"} · {toDate(m.timestamp)?.toLocaleString() || ""}
                  </p>
                </div>
              ))}
          </div>
        </section>
      )}

      <section className="mt-8 grid gap-2 border-t border-gold-line pt-6 sm:grid-cols-2">
        {p.role === "mentor" && p.mentorStatus !== "verified" && p.status !== "removed" && (
          <button onClick={() => setAct({ type: "approve" })} className="gold-btn">Approve mentor</button>
        )}
        {p.status === "suspended" ? (
          <button onClick={() => setAct({ type: "restore" })} className="gold-btn">Restore access</button>
        ) : (
          p.status !== "removed" && <button onClick={() => setAct({ type: "suspend" })} className="gold-ghost">Suspend</button>
        )}
        {p.status !== "removed" && (
          <button onClick={() => setAct({ type: "remove" })} className="gold-danger">Remove and erase data</button>
        )}
      </section>
      <p className="mt-3 text-xs leading-relaxed text-sand/70">
        Removing erases their check-ins, habits, requests, sessions and conversations. To delete their login too, open Firebase console → Authentication and delete {p.email}.
      </p>

      <Confirm
        open={act?.type === "approve"}
        title={`Approve ${p.name}?`}
        needReason={false}
        confirmLabel="Approve"
        onCancel={() => setAct(null)}
        onConfirm={async () => {
          await approveMentor(p);
          done("Approved");
        }}
      />
      <Confirm
        open={act?.type === "suspend"}
        title={`Suspend ${p.name}?`}
        body="They won't be able to use MentoSpace until you restore them. Nothing is deleted."
        confirmLabel="Suspend"
        danger
        onCancel={() => setAct(null)}
        onConfirm={async (reason) => {
          await suspendUser(p, reason);
          done("Suspended");
        }}
      />
      <Confirm
        open={act?.type === "restore"}
        title={`Restore ${p.name}?`}
        needReason={false}
        confirmLabel="Restore"
        onCancel={() => setAct(null)}
        onConfirm={async () => {
          await restoreUser(p);
          done("Access restored");
        }}
      />
      <Confirm
        open={act?.type === "remove"}
        title={`Remove ${p.name}?`}
        body="This permanently erases their data from MentoSpace. If anything relates to a POCSO report or legal matter, export it first; the law may require you to keep it."
        confirmLabel="Remove forever"
        danger
        typeWord="REMOVE"
        onCancel={() => setAct(null)}
        onConfirm={async (reason) => {
          const c = await removeUser(p, reason);
          onClose();
          done(`Removed. Erased ${c.moods} check-ins, ${c.habits} habits, ${c.chats} conversations.`);
        }}
      />
      <Confirm
        open={act?.type === "chat"}
        title="Open this conversation?"
        body="Conversations are private. Only read one to handle a complaint or a safety concern. Your reason and the time are saved to the audit log."
        confirmLabel="Open"
        onCancel={() => setAct(null)}
        onConfirm={async (reason) => {
          await audit("chat.read", p, { chatId: act.chatId, reason, with: act.other?.name || "" });
          setChat(await loadMessages(act.chatId));
          setAct(null);
        }}
      />
    </Drawer>
  );
}

/* ================================================================== */
/* Safety                                                              */
/* ================================================================== */

export function SafetySection({ d, openPerson }) {
  const byStudent = [...new Map(d.lowMoods.map((m) => [m.studentId, m])).values()];
  return (
    <div className="space-y-8">
      <SectionTitle kicker="Safety" title="Who might need help" sub="Students who logged a low, frustrated or struggling mood in the last 72 hours, and under-18s whose guardian hasn't been confirmed." />

      <section>
        <h2 className="mb-3 font-serif text-xl">Low moods, last 72 hours</h2>
        {byStudent.length === 0 ? (
          <Empty>No low moods in the last three days.</Empty>
        ) : (
          <ul className="gold-panel divide-y divide-gold-line">
            {byStudent.map((m) => {
              const mentorCount = (d.byId[m.studentId] && d.mentors.filter((x) => x.myStudents?.includes(m.studentId)).length) || 0;
              return (
                <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <GoldAvatar person={m.student} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{m.student.name}</p>
                    <p className="text-xs text-sand">
                      {moodByKey[m.mood]?.emoji} {moodByKey[m.mood]?.label} · {timeAgo(m.createdAt)}
                      {m.note ? ` · “${m.note.slice(0, 80)}”` : ""}
                    </p>
                  </div>
                  {m.mood === "depressed" && <Pill tone="red">Struggling</Pill>}
                  <Pill tone={mentorCount ? "green" : "amber"}>{mentorCount ? "Has a mentor" : "No mentor"}</Pill>
                  <button onClick={() => openPerson(m.studentId)} className="gold-ghost px-3 py-1.5 text-xs">Open</button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-serif text-xl">Guardian consent to verify</h2>
        {d.guardianPending.length === 0 ? (
          <Empty>Every under-18 has a verified guardian.</Empty>
        ) : (
          <ul className="gold-panel divide-y divide-gold-line">
            {d.guardianPending.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <GoldAvatar person={s} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {s.name} <span className="text-xs font-normal text-sand">· {s.age} yrs</span>
                  </p>
                  <p className="text-xs text-sand">
                    {s.consent?.guardian ? `${s.consent.guardian.name} (${s.consent.guardian.relation}) · ${s.consent.guardian.phone}` : "No guardian details recorded"}
                  </p>
                </div>
                <button onClick={() => openPerson(s.id)} className="gold-btn px-3 py-1.5 text-xs">Verify</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="gold-panel p-5">
        <h2 className="font-serif text-lg">If someone is at risk</h2>
        <p className="mt-1 text-sm text-sand">
          Contact their mentor first. If a child may be sexually abused, POCSO section 19 requires a report to the police or Special Juvenile Police Unit. If a life is at risk, call 112.
        </p>
        <ul className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {HELPLINES.map((h) => (
            <li key={h.number} className="flex justify-between">
              <span className="text-sand">{h.name}</span>
              <b className="select-all text-gold-light">{h.number}</b>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ================================================================== */
/* Connections                                                         */
/* ================================================================== */

export function ConnectionsSection({ data, d, refresh }) {
  const [studentId, setStudentId] = useState("");
  const [mentorId, setMentorId] = useState("");
  const [ending, setEnding] = useState(null);
  const [filter, setFilter] = useState("accepted");
  const reqs = (data.requests || [])
    .filter((r) => filter === "all" || r.status === filter)
    .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));

  const make = async () => {
    const s = d.byId[studentId];
    const m = d.byId[mentorId];
    if (!s || !m) return;
    try {
      await connect(s, m);
      toast.success(`${s.name} connected with ${m.name}`);
      setStudentId("");
      setMentorId("");
      refresh();
    } catch {
      toast.error("Couldn't connect them.");
    }
  };

  return (
    <div>
      <SectionTitle kicker="Connections" title="Students and their mentors" />
      <section className="gold-panel mb-6 p-5">
        <h2 className="font-serif text-lg">Connect a student with a mentor</h2>
        <div className="mt-3 flex flex-col gap-2 md:flex-row">
          <select className="gold-field" value={studentId} onChange={(e) => setStudentId(e.target.value)} aria-label="Student">
            <option value="">Choose a student</option>
            {d.students.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
            ))}
          </select>
          <select className="gold-field" value={mentorId} onChange={(e) => setMentorId(e.target.value)} aria-label="Mentor">
            <option value="">Choose a verified mentor</option>
            {d.verifiedMentors.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button onClick={make} disabled={!studentId || !mentorId} className="gold-btn shrink-0">Connect</button>
        </div>
        <p className="mt-2 text-xs text-sand">This opens a conversation between them straight away.</p>
      </section>

      <div className="mb-3">
        <Filter value={filter} onChange={setFilter} options={[["accepted", "Active"], ["pending", "Requested"], ["all", "All"]]} />
      </div>
      {reqs.length === 0 ? (
        <Empty>Nothing here.</Empty>
      ) : (
        <ul className="gold-panel divide-y divide-gold-line">
          {reqs.map((r) => {
            const s = d.byId[r.studentId];
            const m = d.byId[r.mentorId];
            return (
              <li key={r.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <GoldAvatar person={s} size={30} />
                <span className="text-sm font-semibold">{s?.name || "Unknown"}</span>
                <FiArrowRight className="text-gold" />
                <GoldAvatar person={m} size={30} />
                <span className="flex-1 text-sm font-semibold">{m?.name || "Unknown"}</span>
                <Pill tone={r.status === "accepted" ? "green" : r.status === "pending" ? "amber" : "grey"}>{r.status}</Pill>
                <span className="text-xs text-sand">{timeAgo(r.createdAt)}</span>
                {r.status === "accepted" && (
                  <button onClick={() => setEnding({ r, s, m })} className="gold-danger px-3 py-1 text-xs">End</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <Confirm
        open={!!ending}
        title="End this connection?"
        body={`${ending?.s?.name} will no longer be ${ending?.m?.name}'s student. Their past messages stay.`}
        confirmLabel="End connection"
        danger
        onCancel={() => setEnding(null)}
        onConfirm={async () => {
          await endConnection(ending.r, ending.s, ending.m);
          toast.success("Connection ended");
          setEnding(null);
          refresh();
        }}
      />
    </div>
  );
}

/* ================================================================== */
/* Sessions                                                            */
/* ================================================================== */

export function SessionsSection({ data, d, refresh }) {
  const [del, setDel] = useState(null);
  const list = [...(data.sessions || [])].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  return (
    <div>
      <SectionTitle kicker="Sessions" title="Every scheduled session" />
      {list.length === 0 ? (
        <Empty>No sessions yet.</Empty>
      ) : (
        <div className="gold-panel overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gold-line text-[11px] uppercase tracking-wider text-sand">
                <th className="px-5 py-3">Session</th>
                <th className="px-3 py-3">Mentor</th>
                <th className="px-3 py-3">When</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-line">
              {list.map((s) => (
                <tr key={s.id}>
                  <td className="px-5 py-3">
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-xs text-sand">{s.category}</p>
                  </td>
                  <td className="px-3 py-3 text-sand">{d.byId[s.mentorId]?.name || s.mentorName}</td>
                  <td className="px-3 py-3 text-sand">
                    {fmtDate(s.date + "T00:00:00")} · {fmtTime(s.time)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => setDel(s)} className="gold-danger px-3 py-1 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Confirm
        open={!!del}
        title={`Delete “${del?.title}”?`}
        confirmLabel="Delete"
        danger
        onCancel={() => setDel(null)}
        onConfirm={async () => {
          await deleteSession(del);
          toast.success("Session deleted");
          setDel(null);
          refresh();
        }}
      />
    </div>
  );
}

/* ================================================================== */
/* Consent records                                                     */
/* ================================================================== */

export function ConsentSection({ data, d }) {
  const logs = [...(data.consent_logs || [])].sort((a, b) => (toDate(b.savedAt)?.getTime() || 0) - (toDate(a.savedAt)?.getTime() || 0));
  const current = d.people.filter((p) => p.consentVersion === CONSENT_VERSION).length;
  return (
    <div>
      <SectionTitle
        kicker="Consent records"
        title="Proof of consent"
        sub={`${current} of ${d.people.length} people have accepted the current notice (version ${CONSENT_VERSION}). Under the DPDP Act you must be able to show what each person agreed to and when.`}
        action={
          <button
            onClick={() =>
              downloadCSV(
                `mentospace-consent-${new Date().toISOString().slice(0, 10)}.csv`,
                logs.map((l) => ({
                  uid: l.uid,
                  name: d.byId[l.uid]?.name || "",
                  version: l.version,
                  role: l.role,
                  acceptedAt: l.acceptedAt,
                  change: l.change || "accepted",
                  shareMoods: l.shareMoods,
                  guardian: l.guardian ? `${l.guardian.name} (${l.guardian.relation})` : "",
                  items: l.items,
                }))
              )
            }
            className="gold-ghost"
          >
            <FiDownload /> Export
          </button>
        }
      />
      {data.consent_logs === null ? (
        <Empty>The consent log couldn't be read. Check that your Firestore rules let the admin read `consent_logs`.</Empty>
      ) : logs.length === 0 ? (
        <Empty>No consent records yet.</Empty>
      ) : (
        <div className="gold-panel overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-gold-line text-[11px] uppercase tracking-wider text-sand">
                <th className="px-5 py-3">Person</th>
                <th className="px-3 py-3">What happened</th>
                <th className="px-3 py-3">Version</th>
                <th className="px-3 py-3">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-line">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-5 py-3">{d.byId[l.uid]?.name || l.uid}</td>
                  <td className="px-3 py-3 text-sand">
                    {l.change || `Accepted as ${l.role}`}
                    {l.guardian ? ` · guardian ${l.guardian.name}` : ""}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-gold">{l.version || "—"}</td>
                  <td className="px-3 py-3 text-sand">{fmtDate(l.savedAt || l.acceptedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/* Audit                                                               */
/* ================================================================== */

export function AuditSection({ data }) {
  const logs = [...(data.admin_audit || [])].sort((a, b) => (toDate(b.at)?.getTime() || 0) - (toDate(a.at)?.getTime() || 0));
  return (
    <div>
      <SectionTitle
        kicker="Audit log"
        title="Everything done in this console"
        sub="Every approval, removal, and conversation opened is recorded here with the reason given. Entries can't be edited from the app."
        action={
          <button onClick={() => downloadCSV(`mentospace-audit-${new Date().toISOString().slice(0, 10)}.csv`, logs.map((l) => ({ at: toDate(l.at)?.toISOString() || "", action: l.action, target: l.targetName || l.targetId, by: l.by, details: l.details })))} className="gold-ghost">
            <FiDownload /> Export
          </button>
        }
      />
      {logs.length === 0 ? (
        <Empty>No actions yet.</Empty>
      ) : (
        <ol className="relative space-y-4 border-l border-gold-line pl-6">
          {logs.map((l) => (
            <li key={l.id} className="relative">
              <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-gold ring-4 ring-onyx" />
              <p className="text-sm">
                <span className="font-mono text-xs text-gold">{l.action}</span> <span className="font-semibold">{l.targetName || l.targetId || ""}</span>
              </p>
              <p className="text-xs text-sand">
                {toDate(l.at)?.toLocaleString() || "—"} · {l.by}
                {l.details?.reason ? ` · “${l.details.reason}”` : ""}
                {l.details?.note ? ` · “${l.details.note}”` : ""}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
