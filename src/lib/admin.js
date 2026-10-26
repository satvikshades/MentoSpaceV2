// Master admin: access control and every action the admin can take.
//
// IMPORTANT: the checks in this file only control what the app shows. Real
// protection comes from Firestore Security Rules (see firestore.rules in the
// repo root), which must allow these writes only for the admin email.

import { deleteApp, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signOut } from "firebase/auth";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db, firebaseConfig } from "../firebase";

/** Only these Google-verified addresses can open /masteradmin. */
export const ADMIN_EMAILS = ["ssatviks@gmail.com"];

export function isAdminUser(user) {
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase()) && user.emailVerified === true;
}

/** Minutes of inactivity before the admin console locks itself. */
export const IDLE_LOCK_MINUTES = 15;

/* ------------------------------------------------------------------ */
/* Audit trail: every admin action is written to `admin_audit`.        */
/* ------------------------------------------------------------------ */

export async function audit(action, target = {}, details = {}) {
  try {
    await addDoc(collection(db, "admin_audit"), {
      action,
      targetId: target.id || null,
      targetName: target.name || null,
      targetRole: target.role || null,
      details,
      by: auth.currentUser?.email || "unknown",
      at: serverTimestamp(),
      userAgent: navigator.userAgent.slice(0, 160),
    });
  } catch (err) {
    console.warn("audit log not written", err?.code || err);
  }
}

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

const COLLECTIONS = ["users", "moods", "habits", "habit_logs", "requests", "sessions", "chats", "consent_logs", "admin_audit", "sales_reps", "sales_leads"];

export async function loadEverything() {
  const results = await Promise.all(
    COLLECTIONS.map(async (name) => {
      try {
        const snap = await getDocs(collection(db, name));
        return [name, snap.docs.map((d) => ({ id: d.id, ...d.data() }))];
      } catch (err) {
        console.warn(`could not read ${name}`, err?.code || err);
        return [name, null];
      }
    })
  );
  return Object.fromEntries(results);
}

export async function loadMessages(chatId) {
  const snap = await getDocs(collection(db, "chats", chatId, "messages"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/* ------------------------------------------------------------------ */
/* Mentor review                                                       */
/* ------------------------------------------------------------------ */

export async function approveMentor(person, note = "") {
  await updateDoc(doc(db, "users", person.id), {
    mentorStatus: "verified",
    mentorReview: { decision: "approved", note, by: auth.currentUser?.email || "", at: new Date().toISOString() },
  });
  await audit("mentor.approve", person, { note });
}

export async function rejectMentor(person, reason) {
  await updateDoc(doc(db, "users", person.id), {
    mentorStatus: "rejected",
    mentorReview: { decision: "rejected", note: reason, by: auth.currentUser?.email || "", at: new Date().toISOString() },
  });
  await audit("mentor.reject", person, { reason });
}

/* ------------------------------------------------------------------ */
/* Account status                                                      */
/* ------------------------------------------------------------------ */

export async function suspendUser(person, reason) {
  await updateDoc(doc(db, "users", person.id), {
    status: "suspended",
    statusReason: reason,
    statusAt: new Date().toISOString(),
  });
  await audit("user.suspend", person, { reason });
}

export async function restoreUser(person) {
  await updateDoc(doc(db, "users", person.id), { status: "active", statusReason: "", statusAt: new Date().toISOString() });
  await audit("user.restore", person);
}

export async function verifyGuardian(person, method) {
  await updateDoc(doc(db, "users", person.id), {
    guardianStatus: "verified",
    "consent.guardian.verification": "verified",
    "consent.guardian.verifiedAt": new Date().toISOString(),
    "consent.guardian.verifiedBy": auth.currentUser?.email || "",
    "consent.guardian.method": method,
  });
  await audit("guardian.verify", person, { method });
}

async function deleteWhere(col, field, op, value, batchOps) {
  const snap = await getDocs(query(collection(db, col), where(field, op, value)));
  snap.docs.forEach((d) => batchOps.push(d.ref));
  return snap.size;
}

/**
 * Removes a person: deletes their content and leaves a small "removed" record
 * so the same login can't quietly recreate the profile. Their Firebase login
 * itself must be deleted from Firebase console → Authentication.
 */
export async function removeUser(person, reason) {
  const refs = [];
  const counts = {};
  counts.moods = await deleteWhere("moods", "studentId", "==", person.id, refs);
  counts.habits = await deleteWhere("habits", "studentId", "==", person.id, refs);
  counts.habitLogs = await deleteWhere("habit_logs", "studentId", "==", person.id, refs);
  counts.requests = (await deleteWhere("requests", "studentId", "==", person.id, refs)) + (await deleteWhere("requests", "mentorId", "==", person.id, refs));
  counts.sessions = await deleteWhere("sessions", "mentorId", "==", person.id, refs);

  const chats = await getDocs(query(collection(db, "chats"), where("members", "array-contains", person.id)));
  counts.chats = chats.size;
  for (const c of chats.docs) {
    const msgs = await getDocs(collection(db, "chats", c.id, "messages"));
    msgs.docs.forEach((m) => refs.push(m.ref));
    refs.push(c.ref);
    // take the student off their mentor's list
    const other = c.data().members.find((m) => m !== person.id);
    if (other) {
      try {
        await updateDoc(doc(db, "users", other), { myStudents: arrayRemove(person.id) });
      } catch {
        /* other user may be a student without myStudents */
      }
    }
  }

  for (let i = 0; i < refs.length; i += 400) {
    const batch = writeBatch(db);
    refs.slice(i, i + 400).forEach((r) => batch.delete(r));
    await batch.commit();
  }

  await setDoc(doc(db, "users", person.id), {
    status: "removed",
    statusReason: reason,
    statusAt: new Date().toISOString(),
    role: person.role || null,
    name: "Removed user",
    email: person.email || "",
  });
  await audit("user.remove", person, { reason, deleted: counts });
  return counts;
}

/* ------------------------------------------------------------------ */
/* Adding people and connections                                       */
/* ------------------------------------------------------------------ */

function strongPassword() {
  const a = new Uint32Array(6);
  crypto.getRandomValues(a);
  return Array.from(a, (n) => n.toString(36)).join("") + "#A9";
}

/**
 * Creates a login for someone else without signing the admin out, using a
 * temporary second Firebase app. The person gets a "set your password" email
 * and accepts the consent form the first time they log in.
 */
export async function createAccount({ role, name, email, dob, qualification, rciNumber, experienceYears, expertise }) {
  const temp = initializeApp(firebaseConfig, `admin-create-${Date.now()}`);
  try {
    const tempAuth = getAuth(temp);
    const cred = await createUserWithEmailAndPassword(tempAuth, email.trim(), strongPassword());
    const uid = cred.user.uid;
    await signOut(tempAuth);

    const profile = {
      name: name.trim(),
      email: email.trim(),
      role,
      dob: dob || "",
      createdAt: new Date().toISOString(),
      createdBy: auth.currentUser?.email || "admin",
      status: "active",
      expertise: role === "mentor" ? expertise || [] : "",
    };
    if (role === "mentor") {
      profile.mentorStatus = "verified";
      profile.mentorDetails = { qualification: qualification || "", rciNumber: rciNumber || "", experienceYears: Number(experienceYears) || 0 };
      profile.mentorReview = { decision: "approved", note: "Added by admin", by: profile.createdBy, at: profile.createdAt };
    }
    await setDoc(doc(db, "users", uid), profile);
    await sendPasswordResetEmail(auth, email.trim());
    await audit("user.create", { id: uid, name: profile.name, role }, { email: profile.email });
    return uid;
  } finally {
    deleteApp(temp).catch(() => {});
  }
}

export async function connect(student, mentor) {
  await addDoc(collection(db, "requests"), {
    studentId: student.id,
    mentorId: mentor.id,
    status: "accepted",
    createdAt: new Date(),
    createdBy: "admin",
  });
  await updateDoc(doc(db, "users", mentor.id), { myStudents: arrayUnion(student.id) });
  await setDoc(
    doc(db, "chats", `${student.id}_${mentor.id}`),
    {
      members: [student.id, mentor.id],
      userNames: { [student.id]: student.name || "Student", [mentor.id]: mentor.name || "Mentor" },
      createdAt: Date.now(),
    },
    { merge: true }
  );
  await audit("connection.create", student, { mentorId: mentor.id, mentorName: mentor.name });
}

export async function endConnection(request, student, mentor) {
  await updateDoc(doc(db, "requests", request.id), { status: "removed", removedBy: "admin" });
  if (mentor) await updateDoc(doc(db, "users", mentor.id), { myStudents: arrayRemove(request.studentId) }).catch(() => {});
  await audit("connection.end", student || { id: request.studentId }, { mentorId: request.mentorId, mentorName: mentor?.name });
}

export async function deleteSession(session) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "sessions", session.id));
  await batch.commit();
  await audit("session.delete", { id: session.id, name: session.title }, { mentorId: session.mentorId });
}

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

export function downloadCSV(filename, rows) {
  if (!rows.length) return;
  const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const esc = (v) => {
    const s = v === null || v === undefined ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
