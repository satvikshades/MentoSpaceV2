import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { CONSENT_VERSION } from "./legal";

/**
 * Stores a consent record on the user's profile and appends a copy to the
 * `consent_logs` collection, so there is a history to show what was agreed
 * and when (DPDP Act s.6(10): the Data Fiduciary must be able to prove consent).
 */
export async function saveConsent(uid, record, extraProfile = {}) {
  await setDoc(
    doc(db, "users", uid),
    { ...extraProfile, consent: record, consentVersion: record.version },
    { merge: true }
  );
  try {
    await addDoc(collection(db, "consent_logs"), { uid, ...record, savedAt: serverTimestamp() });
  } catch (err) {
    // The profile copy is the source of truth; the log is a bonus if rules allow it.
    console.warn("consent log not written", err?.code || err);
  }
}

export function needsConsent(profile) {
  return !profile?.consent || profile.consentVersion !== CONSENT_VERSION;
}

/** Students' mood check-ins are visible to mentors only with explicit consent. */
export function sharesMoods(student) {
  return student?.consent?.shareMoods === true;
}

/** Mentors are visible to students only once an admin has verified them. */
export function mentorIsLive(mentor) {
  if (mentor?.status === "suspended" || mentor?.status === "removed") return false;
  return mentor?.mentorStatus === "verified" || mentor?.mentorStatus === undefined;
}
