import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheck, FiMail } from "react-icons/fi";
import Navbar from "../components/common/Navbar";
import Footer from "../components/Footer";
import { Spinner } from "../components/ui";
import { CONTACT_EMAIL, LIMITS, submitContact, TOPICS, validate } from "../lib/contact";
import { planByKey, PLANS } from "../lib/plans";

const STEPS = [
  ["Tell us about your school", "A few lines on your students and what you're hoping for."],
  ["We reply by email", "We'll set up a short call to understand your school's needs."],
  ["Start your pilot", "We run a pilot with your students so you can see the impact first."],
];

function Field({ id, label, optional, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label} {optional && <span className="font-normal text-muted">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function Success({ name, onReset }) {
  return (
    <div className="flex flex-col items-center px-2 py-10 text-center animate-rise">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-2xl text-white animate-pop">
        <FiCheck strokeWidth={3} />
      </span>
      <h2 className="mt-6 text-2xl font-extrabold">Thank you, {name.split(" ")[0]}.</h2>
      <p className="mt-2 max-w-sm text-ink/70">
        Your message is with the MentoSpace team. We'll reply to you by email soon.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary px-5 py-3">
          Back to home
        </Link>
        <button onClick={onReset} className="btn-ghost px-5 py-3">
          Send another message
        </button>
      </div>
    </div>
  );
}

const blank = (plan, topic) => ({
  name: "",
  email: "",
  phone: "",
  organisation: "",
  students: "",
  plan: planByKey[plan] ? plan : "",
  topic: TOPICS.some((t) => t.key === topic) ? topic : "pilot",
  message: "",
  website: "", // honeypot: left empty by people, filled by bots
});

export default function Contact() {
  const [params] = useSearchParams();
  const [form, setForm] = useState(() => blank(params.get("plan"), params.get("topic")));
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | failed

  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.title;
    document.title = "Contact us · Book a pilot | MentoSpace";
    return () => (document.title = prev);
  }, []);

  const plan = planByKey[form.plan];
  const isSchool = form.topic === "pilot" || form.topic === "pricing";
  const liveErrors = useMemo(() => validate(form), [form]);

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (touched[k]) setErrors((er) => ({ ...er, [k]: validate({ ...form, [k]: v })[k] }));
  };
  const blur = (k) => () => {
    setTouched((t) => ({ ...t, [k]: true }));
    setErrors((er) => ({ ...er, [k]: liveErrors[k] }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.website) return setStatus("sent"); // quietly drop bots
    const errs = validate(form);
    setErrors(errs);
    setTouched({ name: true, email: true, phone: true, students: true, message: true });
    const first = Object.keys(errs)[0];
    if (first) return document.getElementById(`c-${first}`)?.focus();
    setStatus("sending");
    try {
      await submitContact(form);
      setStatus("sent");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setStatus("failed");
    }
  };

  const fieldProps = (k) => ({
    id: `c-${k}`,
    value: form[k],
    onChange: set(k),
    onBlur: blur(k),
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `c-${k}-error` : undefined,
    className: `field ${errors[k] ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`,
  });

  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("MentoSpace enquiry")}&body=${encodeURIComponent(
    `${form.message}\n\n${form.name}\n${form.organisation}\n${form.phone}`.trim()
  )}`;

  return (
    <div className="bg-white text-ink">
      <Navbar />
      <main className="relative overflow-clip pt-28 sm:pt-36">
        <div className="pointer-events-none absolute -right-40 -top-20 h-[420px] w-[420px] rounded-full bg-primary/10 blur-[120px]" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-24 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-0 lg:pb-32">
          {/* intro (on phones the form follows straight after this) */}
          <div className="animate-rise lg:col-start-1 lg:row-start-1">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink">
              <FiArrowLeft /> Back to home
            </Link>
            <p className="eyebrow mt-8">Contact us</p>
            <h1 className="mt-3 text-[40px] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
              Book a pilot for your{" "}
              <span className="font-serif font-medium italic tracking-[-0.02em] text-primary">school.</span>
            </h1>
            <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/70">
              Questions about plans, a pilot, or becoming a mentor? Send us a note and the team will get back to you.
            </p>
          </div>

          {/* what happens next + direct email */}
          <div className="animate-rise lg:col-start-1 lg:row-start-2" style={{ animationDelay: "60ms" }}>
            <ol className="space-y-5 lg:mt-10">
              {STEPS.map(([t, b], i) => (
                <li key={t} className="flex gap-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary-50 font-serif text-lg italic text-primary">{i + 1}</span>
                  <div>
                    <p className="font-bold">{t}</p>
                    <p className="text-sm text-ink/70">{b}</p>
                  </div>
                </li>
              ))}
            </ol>

            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-10 flex items-center gap-3 rounded-2xl bg-bg-light-gray p-4 ring-1 ring-line transition hover:ring-primary/30"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-primary ring-1 ring-line">
                <FiMail />
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-semibold text-muted">Prefer email?</span>
                <span className="block truncate font-bold">{CONTACT_EMAIL}</span>
              </span>
            </a>
          </div>

          {/* right: form */}
          <div className="self-start rounded-3xl border border-line bg-white p-6 shadow-[0_30px_60px_-30px_rgba(29,31,43,0.3)] sm:p-8 animate-rise lg:col-start-2 lg:row-span-2 lg:row-start-1" style={{ animationDelay: "120ms" }}>
            {status === "sent" ? (
              <Success
                name={form.name || "there"}
                onReset={() => {
                  setForm(blank(form.plan, form.topic));
                  setErrors({});
                  setTouched({});
                  setStatus("idle");
                }}
              />
            ) : (
              <form onSubmit={onSubmit} noValidate className="relative space-y-5">
                <div>
                  <p className="label">What can we help with?</p>
                  <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Topic">
                    {TOPICS.map((t) => (
                      <button
                        type="button"
                        key={t.key}
                        role="radio"
                        aria-checked={form.topic === t.key}
                        onClick={() => setForm((f) => ({ ...f, topic: t.key }))}
                        className={`rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition ${
                          form.topic === t.key ? "bg-primary-50 text-primary ring-2 ring-primary" : "text-ink/75 ring-1 ring-line hover:bg-bg-light-gray"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="c-name" label="Your name" error={errors.name}>
                    <input {...fieldProps("name")} autoComplete="name" maxLength={LIMITS.name} placeholder="Full name" />
                  </Field>
                  <Field id="c-email" label="Email" error={errors.email}>
                    <input {...fieldProps("email")} type="email" autoComplete="email" maxLength={LIMITS.email} placeholder="you@school.edu.in" />
                  </Field>
                </div>

                {isSchool && (
                  <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr] animate-fade">
                    <Field id="c-organisation" label="School or institution" optional>
                      <input {...fieldProps("organisation")} autoComplete="organization" maxLength={LIMITS.organisation} placeholder="School name, city" />
                    </Field>
                    <Field id="c-students" label="No. of students" optional error={errors.students}>
                      <input {...fieldProps("students")} inputMode="numeric" maxLength={LIMITS.students} placeholder="e.g. 400" />
                    </Field>
                  </div>
                )}

                <Field id="c-phone" label="Phone" optional error={errors.phone}>
                  <input {...fieldProps("phone")} type="tel" autoComplete="tel" maxLength={LIMITS.phone} placeholder="+91 98765 43210" />
                </Field>

                {isSchool && (
                  <div className="animate-fade">
                    <p className="label">
                      Plan you're interested in <span className="font-normal text-muted">(optional)</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[...PLANS, { key: "", name: "Not sure yet" }].map((p) => (
                        <button
                          type="button"
                          key={p.key || "none"}
                          onClick={() => setForm((f) => ({ ...f, plan: p.key }))}
                          aria-pressed={form.plan === p.key}
                          className={`rounded-xl px-3 py-2.5 text-left transition ${
                            form.plan === p.key ? "bg-primary-50 ring-2 ring-primary" : "ring-1 ring-line hover:bg-bg-light-gray"
                          }`}
                        >
                          <span className={`block text-sm font-bold ${form.plan === p.key ? "text-primary" : ""}`}>{p.name}</span>
                          <span className="block text-[11px] text-muted">{p.sessions ? `${p.sessions} ${p.sessions === 1 ? "session" : "sessions"}/month` : "Help me choose"}</span>
                        </button>
                      ))}
                    </div>
                    {plan && (
                      <p className="mt-2 text-[13px] text-ink/70">
                        {plan.name}: {plan.sessions} individual mentoring {plan.sessions === 1 ? "session" : "sessions"} per student each month. We'll share pricing for your school by email.
                      </p>
                    )}
                  </div>
                )}

                <Field id="c-message" label="Your message" error={errors.message}>
                  <textarea
                    {...fieldProps("message")}
                    rows={5}
                    maxLength={LIMITS.message}
                    className={`${fieldProps("message").className} resize-y`}
                    placeholder={
                      form.topic === "mentor"
                        ? "Tell us a little about your background and why you'd like to mentor."
                        : "Tell us about your school, your students, and what you'd like a pilot to cover."
                    }
                  />
                  <p className="mt-1 text-right text-[11px] text-muted">
                    {form.message.length}/{LIMITS.message}
                  </p>
                </Field>

                {/* honeypot */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={set("website")}
                  className="pointer-events-none absolute left-0 top-0 h-0 w-0 opacity-0"
                  aria-hidden="true"
                />

                {status === "failed" && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">
                    We couldn't send that just now. Check your connection and try again, or{" "}
                    <a href={mailto} className="font-bold underline">
                      email us directly
                    </a>
                    .
                  </div>
                )}

                <button type="submit" disabled={status === "sending"} className="btn-primary w-full px-6 py-3.5 text-base">
                  {status === "sending" ? (
                    <>
                      <Spinner /> Sending…
                    </>
                  ) : (
                    <>
                      {form.topic === "pilot" ? "Request a pilot" : "Send message"} <FiArrowRight />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-muted">
                  We only use these details to reply to you. See our{" "}
                  <Link to="/privacy" className="font-semibold text-ink/70 underline-offset-2 hover:underline">
                    privacy notice
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
