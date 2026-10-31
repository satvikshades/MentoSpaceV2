// Website contact form: every enquiry is saved to Firestore (so it shows up in
// the master admin's Messages tab) and emailed to the team inbox.
//
// Email goes through FormSubmit (https://formsubmit.co), which needs no
// account. The very first submission sends an "Activate form" email to the
// inbox below; click it once and every later enquiry is delivered. To use a
// different service, set VITE_CONTACT_FORM_ENDPOINT to any endpoint that
// accepts a JSON POST.

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { planByKey } from "./plans";

export const CONTACT_EMAIL = "permanentwofliving@gmail.com";

const ENDPOINT = import.meta.env.VITE_CONTACT_FORM_ENDPOINT || `https://formsubmit.co/ajax/${CONTACT_EMAIL}`;

export const TOPICS = [
  { key: "pilot", label: "Book a pilot for my school" },
  { key: "pricing", label: "Questions about plans and pricing" },
  { key: "mentor", label: "I'd like to become a mentor" },
  { key: "other", label: "Something else" },
];

export const topicLabel = (k) => TOPICS.find((t) => t.key === k)?.label || "Enquiry";

/** Field limits, mirrored in firestore.rules. */
export const LIMITS = { name: 100, email: 200, phone: 30, organisation: 150, students: 10, message: 4000 };

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Please tell us your name.";
  if (!form.email.trim()) errors.email = "We need an email address to reply to.";
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = "That email address doesn't look right.";
  if (form.phone.trim() && !/^[+\d][\d\s()-]{6,}$/.test(form.phone.trim())) errors.phone = "Use digits only, e.g. +91 98765 43210.";
  if (form.students && !/^\d{1,7}$/.test(String(form.students).trim())) errors.students = "Enter a number.";
  if (form.message.trim().length < 10) errors.message = "A sentence or two helps us reply properly.";
  return errors;
}

const clip = (v, n) => String(v || "").trim().slice(0, n);

// Firestore keeps retrying while offline, so give up after a while instead of
// leaving the visitor staring at a spinner.
const withTimeout = (promise, ms) =>
  Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);

async function sendEmail(entry) {
  const plan = planByKey[entry.plan];
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      _subject: `MentoSpace · ${topicLabel(entry.topic)} · ${entry.name}${entry.organisation ? ` (${entry.organisation})` : ""}`,
      _template: "table",
      _captcha: "false",
      name: entry.name,
      email: entry.email,
      phone: entry.phone || "—",
      "School / institution": entry.organisation || "—",
      "Number of students": entry.students || "—",
      "Plan of interest": plan ? plan.name : "Not sure yet",
      Topic: topicLabel(entry.topic),
      message: entry.message,
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || String(body.success) === "false") throw new Error(body.message || `Email service returned ${res.status}`);
}

/**
 * Saves and emails one enquiry. Resolves when at least one of the two worked,
 * so the visitor isn't asked to resend something we already have.
 */
export async function submitContact(form) {
  const entry = {
    name: clip(form.name, LIMITS.name),
    email: clip(form.email, LIMITS.email).toLowerCase(),
    phone: clip(form.phone, LIMITS.phone),
    organisation: clip(form.organisation, LIMITS.organisation),
    students: clip(form.students, LIMITS.students),
    plan: planByKey[form.plan] ? form.plan : "",
    topic: TOPICS.some((t) => t.key === form.topic) ? form.topic : "other",
    message: clip(form.message, LIMITS.message),
  };

  const [saved, emailed] = await Promise.allSettled([
    withTimeout(addDoc(collection(db, "contact_messages"), { ...entry, status: "new", source: "website", createdAt: serverTimestamp() }), 15000),
    withTimeout(sendEmail(entry), 15000),
  ]);

  if (saved.status === "rejected") console.warn("contact message not saved", saved.reason?.code || saved.reason);
  if (emailed.status === "rejected") console.warn("contact email not sent", emailed.reason?.message || emailed.reason);
  if (saved.status === "rejected" && emailed.status === "rejected") throw new Error("not-delivered");
  return { saved: saved.status === "fulfilled", emailed: emailed.status === "fulfilled" };
}
