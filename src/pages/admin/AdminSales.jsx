import { useState } from "react";
import { useSalesData } from "../../lib/salesDerive";
import toast from "react-hot-toast";
import { FiCheck, FiDownload, FiPlus } from "react-icons/fi";
import { downloadCSV } from "../../lib/admin";
import {
  addLead,
  INSTITUTION_TYPES,
  leadXP,
  reassignLead,
  setRepStatus,
  setRepTarget,
  STAGES,
  verifyContract,
} from "../../lib/sales";
import { timeAgo } from "../../lib/progress";
import { Confirm, Drawer, Empty, Filter, GoldAvatar, Pill, SearchBox, SectionTitle, Stat } from "./AdminUI";

const fmt = (n) => (Number(n) || 0).toLocaleString("en-IN");
const typeLabel = (k) => INSTITUTION_TYPES.find((t) => t.key === k)?.label || "School";

function stagePill(l) {
  if (l.lost) return <Pill tone="red">Lost</Pill>;
  const s = l.stage || 0;
  if (s === 3) return l.contractVerified ? <Pill tone="green">Signed · verified</Pill> : <Pill tone="violet">Awaiting verification</Pill>;
  return <Pill tone={s === 0 ? "grey" : s === 1 ? "gold" : "amber"}>{s === 0 ? "To approach" : `${STAGES[s].short} · ${STAGES[s].label}`}</Pill>;
}

function RepDrawer({ rep, s, onClose, refresh }) {
  const [target, setTarget] = useState(rep?.target || 0);
  const [act, setAct] = useState(null);
  const [assign, setAssign] = useState({ name: "", city: rep?.city || "", type: "school" });
  const [moving, setMoving] = useState({});
  if (!rep) return null;
  const st = rep.stats;

  const saveTarget = async () => {
    await setRepTarget(rep, target);
    toast.success("Target updated");
    refresh();
  };
  const doAssign = async (e) => {
    e.preventDefault();
    if (!assign.name.trim()) return;
    await addLead(rep.id, { name: assign.name.trim(), city: assign.city.trim(), type: assign.type, board: "Other", students: 0, contact: {}, nextStep: { text: "First contact", date: "" }, notes: "" }, "admin");
    toast.success(`${assign.name} assigned to ${rep.name}`);
    setAssign({ name: "", city: rep.city || "", type: "school" });
    refresh();
  };

  return (
    <Drawer open onClose={onClose} title="Sales partner">
      <div className="flex items-center gap-4">
        <GoldAvatar person={rep} size={60} />
        <div className="min-w-0">
          <h2 className="truncate font-serif text-3xl">{rep.name}</h2>
          <p className="truncate text-sm text-sand">{rep.email} · {rep.phone}</p>
          <p className="text-xs text-sand">{rep.city}, {rep.state}{rep.referral ? ` · code ${rep.referral}` : ""}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        <Pill tone={rep.status === "approved" ? "green" : rep.status === "pending" ? "amber" : "red"}>{rep.status}</Pill>
        <Pill tone="gold">{st.level.name}</Pill>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-onyx p-3 ring-1 ring-gold-line"><p className="font-serif text-2xl gold-text">{fmt(st.xp)}</p><p className="text-[10px] uppercase tracking-wider text-sand">XP</p></div>
        <div className="rounded-xl bg-onyx p-3 ring-1 ring-gold-line"><p className="font-serif text-2xl gold-text">{st.active}</p><p className="text-[10px] uppercase tracking-wider text-sand">In pipeline</p></div>
        <div className="rounded-xl bg-onyx p-3 ring-1 ring-gold-line"><p className="font-serif text-2xl gold-text">{st.contracts}</p><p className="text-[10px] uppercase tracking-wider text-sand">Contracts</p></div>
      </div>

      <section className="mt-6">
        <label htmlFor="rep-target" className="text-[11px] font-bold uppercase tracking-wider text-sand">Contract target</label>
        <div className="mt-2 flex gap-2">
          <input id="rep-target" type="number" min="0" className="gold-field" value={target} onChange={(e) => setTarget(e.target.value)} />
          <button onClick={saveTarget} className="gold-btn shrink-0">Save target</button>
        </div>
      </section>

      <section className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-sand">Assign a school to {rep.name.split(" ")[0]}</p>
        <form onSubmit={doAssign} className="mt-2 grid gap-2 sm:grid-cols-[1fr_120px_auto]">
          <input className="gold-field" placeholder="Institution name" value={assign.name} onChange={(e) => setAssign({ ...assign, name: e.target.value })} aria-label="Institution name" />
          <input className="gold-field" placeholder="City" value={assign.city} onChange={(e) => setAssign({ ...assign, city: e.target.value })} aria-label="City" />
          <button className="gold-ghost"><FiPlus /> Assign</button>
        </form>
      </section>

      <section className="mt-6">
        <p className="text-[11px] font-bold uppercase tracking-wider text-sand">Institutions ({rep.leads.length})</p>
        {rep.leads.length === 0 ? (
          <p className="mt-2 text-sm text-sand">None yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-gold-line">
            {rep.leads.map((l) => (
              <li key={l.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{l.name}</p>
                    <p className="text-xs text-sand">{typeLabel(l.type)} · {l.city} · {fmt(leadXP(l).earned)} XP</p>
                  </div>
                  {stagePill(l)}
                </div>
                <div className="mt-2 flex gap-2">
                  <select className="gold-field py-1.5 text-xs" value={moving[l.id] || ""} onChange={(e) => setMoving({ ...moving, [l.id]: e.target.value })} aria-label="Reassign to">
                    <option value="">Reassign to…</option>
                    {s.approved.filter((r) => r.id !== rep.id).map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                  {moving[l.id] && (
                    <button
                      onClick={async () => {
                        await reassignLead(l, s.byId[moving[l.id]], rep);
                        toast.success("Reassigned");
                        refresh();
                      }}
                      className="gold-ghost px-3 py-1.5 text-xs"
                    >
                      Move
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8 grid gap-2 border-t border-gold-line pt-6 sm:grid-cols-2">
        {rep.status !== "approved" && <button onClick={() => setAct("approved")} className="gold-btn">Approve</button>}
        {rep.status === "approved" && <button onClick={() => setAct("suspended")} className="gold-danger">Suspend</button>}
        {rep.status === "pending" && <button onClick={() => setAct("rejected")} className="gold-danger">Reject</button>}
      </section>

      <Confirm
        open={!!act}
        title={act === "approved" ? `Approve ${rep.name}?` : act === "suspended" ? `Suspend ${rep.name}?` : `Reject ${rep.name}?`}
        body={act === "approved" ? "They'll get access to the sales console straight away." : "They'll lose access to the sales console. Their schools stay so you can reassign them."}
        needReason={act !== "approved"}
        danger={act !== "approved"}
        confirmLabel={act === "approved" ? "Approve" : act === "suspended" ? "Suspend" : "Reject"}
        onCancel={() => setAct(null)}
        onConfirm={async (reason) => {
          await setRepStatus(rep, act, reason);
          toast.success("Done");
          setAct(null);
          refresh();
        }}
      />
    </Drawer>
  );
}

export function SalesSection({ data, refresh }) {
  const s = useSalesData(data);
  const [openRep, setOpenRep] = useState(null);
  const [verify, setVerify] = useState(null);
  const [q, setQ] = useState("");
  const [view, setView] = useState("team");

  const teamXP = s.approved.reduce((a, r) => a + r.stats.xp, 0);
  const verified = s.leads.filter((l) => l.stage === 3 && l.contractVerified).length;
  const ranked = [...s.reps].filter((r) => r.status !== "rejected").sort((a, b) => b.stats.xp - a.stats.xp);
  const leadRows = s.leads
    .filter((l) => !q.trim() || `${l.name} ${l.city} ${s.byId[l.repId]?.name || ""}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));

  const exportTeam = () =>
    downloadCSV(
      `mentospace-sales-team-${new Date().toISOString().slice(0, 10)}.csv`,
      ranked.map((r) => ({
        name: r.name,
        email: r.email,
        phone: r.phone,
        city: r.city,
        state: r.state,
        status: r.status,
        level: r.stats.level.name,
        xp: r.stats.xp,
        pendingXP: r.stats.pendingXP,
        schoolsInPipeline: r.stats.active,
        workshops: r.stats.workshops,
        trials: r.stats.trials,
        contracts: r.stats.contracts,
        target: r.target || 0,
        studentsCovered: r.stats.studentsCovered,
      }))
    );

  return (
    <div className="space-y-8">
      <SectionTitle
        kicker="Sales team"
        title="Partners, pipeline and points"
        sub="Approve new sales partners, verify contracts before XP doubles, set targets and move schools between people."
        action={<button onClick={exportTeam} className="gold-ghost"><FiDownload /> Export team</button>}
      />

      {s.unreadable && <Empty>The sales data couldn't be read. Publish the updated firestore.rules so the admin can read sales_reps and sales_leads.</Empty>}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Active partners" value={s.approved.length} hint={`${s.pending.length} waiting for approval`} tone={s.pending.length ? "alert" : undefined} />
        <Stat label="Schools in pipeline" value={s.leads.filter((l) => !l.lost).length} hint={`${s.leads.filter((l) => (l.stage || 0) >= 1).length} reached a workshop`} />
        <Stat label="Contracts" value={verified} hint={`${s.awaiting.length} awaiting your verification`} tone={s.awaiting.length ? "alert" : undefined} />
        <Stat label="Team XP" value={fmt(teamXP)} hint={`${fmt(s.leads.filter((l) => l.stage === 3 && l.contractVerified).reduce((a, l) => a + (Number(l.students) || 0), 0))} students covered`} />
      </div>

      {s.pending.length > 0 && (
        <section>
          <h2 className="mb-3 font-serif text-xl">Applications</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {s.pending.map((r) => (
              <article key={r.id} className="gold-panel p-5">
                <div className="flex items-center gap-3">
                  <GoldAvatar person={r} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-xl">{r.name}</p>
                    <p className="truncate text-xs text-sand">{r.email} · {r.phone}</p>
                  </div>
                  <span className="text-xs text-sand">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="mt-3 text-sm text-sand">
                  Covers {r.city}, {r.state}
                  {r.referral ? ` · referral code ${r.referral}` : ""} · agreement v{r.agreement?.version} accepted
                </p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => setOpenRep(r.id)} className="gold-ghost">Review</button>
                  <button
                    onClick={async () => {
                      await setRepStatus(r, "approved");
                      toast.success(`${r.name} approved`);
                      refresh();
                    }}
                    className="gold-btn flex-1"
                  >
                    <FiCheck /> Approve
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {s.awaiting.length > 0 && (
        <section>
          <h2 className="mb-3 font-serif text-xl">Contracts to verify</h2>
          <ul className="gold-panel divide-y divide-gold-line">
            {s.awaiting.map((l) => {
              const rep = s.byId[l.repId];
              const last = [...(l.history || [])].reverse().find((h) => h.stage === 3);
              return (
                <li key={l.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{l.name} <span className="text-xs font-normal text-sand">· {typeLabel(l.type)}, {l.city}</span></p>
                    <p className="text-xs text-sand">
                      by {rep?.name || "?"} · {l.students ? `${fmt(l.students)} students` : "students not given"}
                      {l.contractValue ? ` · ₹${fmt(l.contractValue)}/yr` : ""}
                    </p>
                    {last?.note && <p className="mt-1 text-xs italic text-champagne/80">“{last.note}”</p>}
                  </div>
                  <span className="text-xs font-bold text-gold-light">+{fmt(leadXP(l).pending)} XP on verify</span>
                  <button onClick={() => setVerify({ l, rep, ok: false })} className="gold-danger px-3 py-1.5 text-xs">Not valid</button>
                  <button onClick={() => setVerify({ l, rep, ok: true })} className="gold-btn px-3 py-1.5 text-xs">Verify</button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Filter value={view} onChange={setView} options={[["team", "Leaderboard"], ["schools", "All institutions"]]} />
          {view === "schools" && <SearchBox value={q} onChange={setQ} placeholder="Search school, city or partner" />}
        </div>

        {view === "team" ? (
          ranked.length === 0 ? (
            <Empty>No sales partners yet. They can apply at /sales.</Empty>
          ) : (
            <div className="gold-panel overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gold-line text-[11px] uppercase tracking-wider text-sand">
                    <th className="px-5 py-3">#</th>
                    <th className="px-3 py-3">Partner</th>
                    <th className="px-3 py-3 text-right">XP</th>
                    <th className="px-3 py-3 text-center">Pipeline</th>
                    <th className="px-3 py-3 text-center">Workshop</th>
                    <th className="px-3 py-3 text-center">Trial</th>
                    <th className="px-3 py-3 text-center">Signed</th>
                    <th className="px-3 py-3">Target</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-line">
                  {ranked.map((r, i) => {
                    const pct = r.target ? Math.min(100, Math.round((r.stats.contracts / r.target) * 100)) : 0;
                    return (
                      <tr key={r.id} className="transition hover:bg-onyx-3/60">
                        <td className="px-5 py-3 font-serif text-lg text-gold">{i + 1}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <GoldAvatar person={r} size={32} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold">{r.name}</p>
                              <p className="truncate text-xs text-sand">{r.stats.level.name} · {r.city}</p>
                            </div>
                            {r.status !== "approved" && <Pill tone={r.status === "pending" ? "amber" : "red"}>{r.status}</Pill>}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className="font-serif text-lg gold-text">{fmt(r.stats.xp)}</span>
                          {r.stats.pendingXP > 0 && <span className="block text-[10px] text-violet-300">+{fmt(r.stats.pendingXP)} pending</span>}
                        </td>
                        <td className="px-3 py-3 text-center tabular-nums">{r.stats.active}</td>
                        <td className="px-3 py-3 text-center tabular-nums">{r.stats.byStage[1]}</td>
                        <td className="px-3 py-3 text-center tabular-nums">{r.stats.byStage[2]}</td>
                        <td className="px-3 py-3 text-center tabular-nums">{r.stats.contracts}</td>
                        <td className="px-3 py-3">
                          {r.target ? (
                            <div className="w-28">
                              <p className="text-xs text-sand">{r.stats.contracts}/{r.target}</p>
                              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-onyx-3">
                                <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-sand">Not set</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => setOpenRep(r.id)} className="gold-ghost px-3 py-1.5 text-xs">Open</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : leadRows.length === 0 ? (
          <Empty>No institutions yet.</Empty>
        ) : (
          <div className="gold-panel overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-gold-line text-[11px] uppercase tracking-wider text-sand">
                  <th className="px-5 py-3">Institution</th>
                  <th className="px-3 py-3">Partner</th>
                  <th className="px-3 py-3">Stage</th>
                  <th className="px-3 py-3 text-right">XP</th>
                  <th className="px-5 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-line">
                {leadRows.map((l) => (
                  <tr key={l.id}>
                    <td className="px-5 py-3">
                      <p className="font-semibold">{l.name}</p>
                      <p className="text-xs text-sand">{typeLabel(l.type)} · {l.city}{l.students ? ` · ${fmt(l.students)} students` : ""}</p>
                    </td>
                    <td className="px-3 py-3">
                      <button onClick={() => setOpenRep(l.repId)} className="text-champagne hover:text-gold-light">{s.byId[l.repId]?.name || "Unknown"}</button>
                    </td>
                    <td className="px-3 py-3">{stagePill(l)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{fmt(leadXP(l).earned)}</td>
                    <td className="px-5 py-3 text-xs text-sand">{timeAgo(l.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {openRep && s.byId[openRep] && <RepDrawer key={openRep} rep={s.byId[openRep]} s={s} onClose={() => setOpenRep(null)} refresh={refresh} />}

      <Confirm
        open={!!verify}
        title={verify?.ok ? `Verify the contract with ${verify?.l?.name}?` : `Reject this contract claim?`}
        body={
          verify?.ok
            ? `Check the signed agreement or PO first. ${verify?.rep?.name} gets +${fmt(verify ? leadXP(verify.l).pending : 0)} XP and the school's XP doubles.`
            : "The school goes back to the free-trial stage. Your reason is shown in its history."
        }
        needReason={!verify?.ok}
        danger={!verify?.ok}
        confirmLabel={verify?.ok ? "Verify contract" : "Reject claim"}
        onCancel={() => setVerify(null)}
        onConfirm={async (reason) => {
          await verifyContract(verify.l, verify.rep, verify.ok, reason);
          toast.success(verify.ok ? "Contract verified" : "Claim rejected");
          setVerify(null);
          refresh();
        }}
      />
    </div>
  );
}
