// Sales console: pipeline stages, XP, levels, badges and data operations.
//
// XP rules
//   Stage 1  Workshop held        +100 XP
//   Stage 2  Free trial running   +200 XP
//   Stage 3  Contract signed      +300 XP  (counts once the master admin verifies it)
//   Finished (verified contract): that institution's XP is doubled → 1,200 XP
// XP already earned on a school stays if the school is later marked lost.

import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { audit } from "./admin";

export const SALES_AGREEMENT_VERSION = "2026-10-26";

export const STAGES = [
  { n: 0, key: "prospect", label: "To approach", short: "Prospect", xp: 0, verb: "" },
  { n: 1, key: "workshop", label: "Workshop", short: "Stage 1", xp: 100, verb: "Workshop held" },
  { n: 2, key: "trial", label: "Free trial", short: "Stage 2", xp: 200, verb: "Free trial started" },
  { n: 3, key: "contract", label: "Contract", short: "Stage 3", xp: 300, verb: "Contract signed" },
];

export const INSTITUTION_TYPES = [
  { key: "school", label: "School" },
  { key: "college", label: "College" },
  { key: "university", label: "University" },
  { key: "coaching", label: "Coaching institute" },
];

export const BOARDS = ["CBSE", "ICSE", "State board", "IB", "Cambridge", "UGC / AICTE", "Other"];

export const LOST_REASONS = ["Budget", "Already has a counsellor", "Management not interested", "Timing (exams)", "Went with another provider", "No response", "Other"];

/** XP a single school/university is worth right now, and how much is waiting on verification. */
export function leadXP(lead) {
  const stage = lead.stage || 0;
  let earned = 0;
  let pending = 0;
  for (let s = 1; s <= stage; s += 1) {
    if (s === 3 && !lead.contractVerified) pending += STAGES[3].xp;
    else earned += STAGES[s].xp;
  }
  const finished = stage === 3 && lead.contractVerified === true;
  if (finished) earned *= 2;
  else if (stage === 3) pending = (earned + pending) * 2 - earned;
  return { earned, pending, finished };
}

export const SALES_LEVELS = [
  { name: "Rookie", at: 0 },
  { name: "Associate", at: 500 },
  { name: "Senior Associate", at: 1500 },
  { name: "Lead", at: 3500 },
  { name: "Principal", at: 7000 },
  { name: "Partner", at: 12000 },
];

export function salesLevel(xp) {
  let i = 0;
  SALES_LEVELS.forEach((l, idx) => {
    if (xp >= l.at) i = idx;
  });
  const cur = SALES_LEVELS[i];
  const next = SALES_LEVELS[i + 1];
  return {
    number: i + 1,
    name: cur.name,
    nextName: next?.name || null,
    toNext: next ? next.at - xp : 0,
    pct: next ? Math.round(((xp - cur.at) / (next.at - cur.at)) * 100) : 100,
  };
}

const toMs = (v) => (v?.toDate ? v.toDate().getTime() : v ? new Date(v).getTime() : 0);

/** Everything the dashboards show for one rep, from their list of leads. */
export function repStats(leads = []) {
  const active = leads.filter((l) => !l.lost);
  const byStage = [0, 1, 2, 3].map((s) => active.filter((l) => (l.stage || 0) === s).length);
  let xp = 0;
  let pendingXP = 0;
  leads.forEach((l) => {
    const r = leadXP(l);
    xp += r.earned;
    pendingXP += r.pending;
  });
  const contracts = leads.filter((l) => l.stage === 3 && l.contractVerified).length;
  const workshops = leads.filter((l) => (l.stage || 0) >= 1).length;
  const trials = leads.filter((l) => (l.stage || 0) >= 2).length;
  const now = Date.now();
  const monthAgo = now - 30 * 86400000;
  const contractsThisMonth = leads.filter((l) => l.stage === 3 && l.contractVerified && toMs(l.contractVerifiedAt) > monthAgo).length;
  const studentsCovered = leads.filter((l) => l.stage === 3 && l.contractVerified).reduce((s, l) => s + (Number(l.students) || 0), 0);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const due = active
    .filter((l) => l.nextStep?.date && new Date(l.nextStep.date + "T00:00:00") <= today && (l.stage || 0) < 3)
    .sort((a, b) => a.nextStep.date.localeCompare(b.nextStep.date));
  return {
    total: leads.length,
    active: active.length,
    lost: leads.length - active.length,
    byStage,
    xp,
    pendingXP,
    level: salesLevel(xp),
    contracts,
    workshops,
    trials,
    contractsThisMonth,
    studentsCovered,
    universities: leads.filter((l) => l.type === "university" && l.stage === 3 && l.contractVerified).length,
    conversion: workshops ? Math.round((contracts / workshops) * 100) : 0,
    due,
  };
}

export const SALES_BADGES = [
  { id: "first-school", icon: "🏫", title: "First school", hint: "Add your first institution", test: (s) => s.total >= 1 },
  { id: "first-workshop", icon: "🎤", title: "On stage", hint: "Hold your first workshop", test: (s) => s.workshops >= 1 },
  { id: "first-trial", icon: "🧪", title: "Trial run", hint: "Start your first free trial", test: (s) => s.trials >= 1 },
  { id: "first-contract", icon: "✍️", title: "First signature", hint: "Close your first contract", test: (s) => s.contracts >= 1 },
  { id: "five", icon: "🖐️", title: "High five", hint: "Close 5 contracts", test: (s) => s.contracts >= 5 },
  { id: "hat-trick", icon: "🎩", title: "Hat-trick", hint: "3 contracts in 30 days", test: (s) => s.contractsThisMonth >= 3 },
  { id: "campus", icon: "🎓", title: "Campus closer", hint: "Sign a university", test: (s) => s.universities >= 1 },
  { id: "thousand", icon: "👥", title: "1,000 students", hint: "Cover 1,000 students", test: (s) => s.studentsCovered >= 1000 },
];

/* ------------------------------------------------------------------ */
/* Rep profile                                                         */
/* ------------------------------------------------------------------ */

export async function getRep(uid) {
  const s = await getDoc(doc(db, "sales_reps", uid));
  return s.exists() ? { id: uid, ...s.data() } : null;
}

export async function createRep(uid, data) {
  const rep = {
    ...data,
    status: "pending",
    target: 0,
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, "sales_reps", uid), rep);
  await setDoc(doc(db, "sales_board", uid), { name: data.name, xp: 0, contracts: 0, level: "Rookie", city: data.city || "" });
  return { id: uid, ...rep };
}

/** Keeps the public leaderboard row in sync with the rep's own numbers. */
export async function syncBoard(rep, stats) {
  try {
    await setDoc(
      doc(db, "sales_board", rep.id),
      { name: rep.name, city: rep.city || "", xp: stats.xp, contracts: stats.contracts, level: stats.level.name, updatedAt: serverTimestamp() },
      { merge: true }
    );
  } catch {
    /* leaderboard is a nice-to-have */
  }
}

export async function loadBoard() {
  const snap = await getDocs(collection(db, "sales_board"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.xp || 0) - (a.xp || 0));
}

/* ------------------------------------------------------------------ */
/* Leads (schools / universities)                                      */
/* ------------------------------------------------------------------ */

export async function loadLeads(repId) {
  const snap = await getDocs(query(collection(db, "sales_leads"), where("repId", "==", repId)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function addLead(repId, data, assignedBy = "self") {
  const lead = {
    ...data,
    repId,
    stage: 0,
    lost: false,
    contractVerified: false,
    assignedBy,
    history: [{ stage: 0, at: new Date().toISOString(), note: assignedBy === "self" ? "Added" : "Assigned by admin", by: auth.currentUser?.email || "" }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, "sales_leads"), lead);
  return { id: ref.id, ...lead };
}

export async function advanceLead(lead, { date, note, students, value }) {
  const next = Math.min(3, (lead.stage || 0) + 1);
  const entry = { stage: next, at: new Date().toISOString(), date: date || "", note: note || "", by: auth.currentUser?.email || "" };
  const patch = {
    stage: next,
    history: arrayUnion(entry),
    updatedAt: new Date().toISOString(),
    [`stageDates.${STAGES[next].key}`]: date || new Date().toISOString().slice(0, 10),
  };
  if (next === 3) {
    patch.contractVerified = false;
    patch.contractClaimedAt = new Date().toISOString();
    if (students) patch.students = Number(students) || 0;
    if (value) patch.contractValue = Number(value) || 0;
  }
  await updateDoc(doc(db, "sales_leads", lead.id), patch);
  return { ...lead, ...patch, history: [...(lead.history || []), entry], stageDates: { ...(lead.stageDates || {}), [STAGES[next].key]: patch[`stageDates.${STAGES[next].key}`] } };
}

export async function updateLead(lead, patch) {
  const p = { ...patch, updatedAt: new Date().toISOString() };
  await updateDoc(doc(db, "sales_leads", lead.id), p);
  return { ...lead, ...p };
}

/* ------------------------------------------------------------------ */
/* Master admin actions                                                */
/* ------------------------------------------------------------------ */

export async function setRepStatus(rep, status, reason = "") {
  await updateDoc(doc(db, "sales_reps", rep.id), { status, statusReason: reason, statusAt: new Date().toISOString() });
  await audit(`sales.${status}`, { id: rep.id, name: rep.name, role: "sales" }, { reason });
}

export async function setRepTarget(rep, target) {
  await updateDoc(doc(db, "sales_reps", rep.id), { target: Number(target) || 0 });
  await audit("sales.target", { id: rep.id, name: rep.name, role: "sales" }, { target: Number(target) || 0 });
}

export async function verifyContract(lead, rep, ok, note = "") {
  if (ok) {
    await updateDoc(doc(db, "sales_leads", lead.id), {
      contractVerified: true,
      contractVerifiedAt: new Date().toISOString(),
      contractVerifiedBy: auth.currentUser?.email || "",
      history: arrayUnion({ stage: 3, at: new Date().toISOString(), note: `Verified by admin${note ? `: ${note}` : ""}`, by: auth.currentUser?.email || "" }),
    });
  } else {
    await updateDoc(doc(db, "sales_leads", lead.id), {
      stage: 2,
      contractVerified: false,
      history: arrayUnion({ stage: 2, at: new Date().toISOString(), note: `Contract not verified: ${note}`, by: auth.currentUser?.email || "" }),
    });
  }
  await audit(ok ? "sales.contract.verify" : "sales.contract.reject", { id: lead.id, name: lead.name, role: "lead" }, { rep: rep?.name, note });
}

export async function reassignLead(lead, toRep, fromRep) {
  await updateDoc(doc(db, "sales_leads", lead.id), {
    repId: toRep.id,
    history: arrayUnion({ stage: lead.stage || 0, at: new Date().toISOString(), note: `Reassigned from ${fromRep?.name || "?"} to ${toRep.name}`, by: auth.currentUser?.email || "" }),
  });
  await audit("sales.lead.reassign", { id: lead.id, name: lead.name, role: "lead" }, { from: fromRep?.name, to: toRep.name });
}

/* ------------------------------------------------------------------ */
/* Sales partner agreement (shown at registration)                     */
/* ------------------------------------------------------------------ */

export const SALES_AGREEMENT = [
  {
    id: "s-about",
    title: "What this role is",
    body: [
      "MentoSpace sales partners introduce our psychology mentoring programme to schools, colleges and universities, run awareness workshops, set up free trials and close contracts.",
      "Your account stays pending until the MentoSpace master admin approves it. You can't see the sales console until then.",
    ],
  },
  {
    id: "s-data",
    title: "Your data and the data you handle",
    body: [
      "We store your name, email, phone, city and the schools you work with, to run the console, calculate XP and pay or reward you. Your name, city, level and XP appear on the team leaderboard.",
      "You'll record names and contact details of school staff. Collect only what's needed to follow up, keep it inside the console, and never copy it to personal phones, spreadsheets or WhatsApp groups. This is personal data under the Digital Personal Data Protection Act, 2023.",
      "Never record any student's personal details or anything students share with you during a workshop.",
    ],
  },
  {
    id: "s-conduct",
    title: "Conduct in schools",
    body: [
      "Children's safety comes first. Never be alone with a student, always follow the school's visitor rules, and carry ID. If a child tells you about abuse, you must report it to the police or Special Juvenile Police Unit under section 19 of the POCSO Act, 2012, and tell MentoSpace.",
      "Describe MentoSpace honestly. Don't promise clinical treatment, diagnoses or results we don't offer, and don't offer gifts or payments to staff to win a contract.",
    ],
  },
  {
    id: "s-xp",
    title: "XP and verification",
    body: [
      "You earn 100 XP for a workshop, 200 XP for a free trial and 300 XP for a contract. When a contract is verified by the master admin, that institution's XP doubles to 1,200.",
      "Contracts count only after verification, so keep a copy of the signed agreement or purchase order. Recording false progress ends your partnership.",
    ],
  },
];

export const SALES_AGREEMENT_ITEMS = [
  { id: "data", required: true, label: "I agree that MentoSpace can store and use my details as described, including showing my name, city and XP on the team leaderboard." },
  { id: "handling", required: true, label: "I will keep school contacts' details inside the console and never record students' personal information." },
  { id: "conduct", required: true, label: "I will follow the school conduct rules, including my duty to report child sexual abuse under POCSO." },
  { id: "honest", required: true, label: "I will describe MentoSpace honestly and record only real progress. I understand contracts need proof to be verified." },
];
