import { Link } from "react-router-dom";
import { FiArrowRight, FiCheck } from "react-icons/fi";
import { PLANS } from "../lib/plans";

const PROGRAMS = [
  {
    title: "One-on-one mentoring",
    body: "Private conversations with a peer mentor who listens first. Message whenever you need to, at your own pace.",
  },
  {
    title: "Group support sessions",
    body: "Your mentor runs small sessions where people share what's going on and realise they're not the only ones.",
  },
  {
    title: "Self-care and mindfulness",
    body: "Practical routines for sleep, stress and focus that you can turn into daily habits and track right here.",
  },
  {
    title: "Coping skills",
    body: "Simple tools for hard moments: grounding, reframing, and knowing when to reach out.",
  },
];

function PlanCard({ plan }) {
  const featured = plan.featured;
  return (
    <article
      className={`relative flex flex-col rounded-3xl p-7 transition duration-300 hover:-translate-y-1 ${
        featured
          ? "bg-bg-dark text-white shadow-[0_30px_60px_-30px_rgba(74,84,255,0.55)] ring-1 ring-primary/40"
          : "bg-white ring-1 ring-line hover:shadow-[0_24px_48px_-28px_rgba(29,31,43,0.3)]"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-primary to-secondary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white">
          Recommended
        </span>
      )}

      <p className={`text-[12px] font-bold uppercase tracking-[0.14em] ${featured ? "text-secondary" : "text-primary"}`}>
        Plan {plan.number}
      </p>
      <h3 className={`mt-1 text-2xl font-extrabold ${featured ? "text-white" : ""}`}>{plan.name}</h3>

      <div className="mt-5">
        <p className="flex items-baseline gap-2">
          <span className="text-[40px] font-extrabold leading-none tracking-[-0.03em]">{plan.sessions}</span>
          <span className={`text-lg font-bold ${featured ? "text-white/80" : "text-ink/70"}`}>
            {plan.sessions === 1 ? "session" : "sessions"} a month
          </span>
        </p>
        <p className={`mt-1.5 text-sm ${featured ? "text-white/60" : "text-muted"}`}>One-to-one mentoring for every student</p>
      </div>

      <div className={`mt-4 rounded-2xl px-4 py-3 ${featured ? "bg-white/10" : "bg-primary-50"}`}>
        <p className={`text-[13px] font-bold ${featured ? "text-white" : "text-primary"}`}>Institutional partnership pricing available</p>
        <p className={`mt-0.5 text-[12px] ${featured ? "text-white/60" : "text-ink/60"}`}>Per student, per academic year. Ask us for a quote.</p>
      </div>

      <div className={`mt-6 border-t pt-6 ${featured ? "border-white/10" : "border-line"}`}>
        {plan.inherits && (
          <p className={`mb-3 text-sm font-bold ${featured ? "text-white" : "text-ink"}`}>Everything in {plan.inherits}, plus:</p>
        )}
        {!plan.inherits && <p className="mb-3 text-sm font-bold">Includes:</p>}
        <ul className="space-y-2.5">
          {plan.features.map((f) => (
            <li key={f} className={`flex gap-2.5 text-[15px] leading-snug ${featured ? "text-white/85" : "text-ink/80"}`}>
              <span
                className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] ${
                  featured ? "bg-white/15 text-white" : "bg-primary-50 text-primary"
                }`}
              >
                <FiCheck strokeWidth={3} />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-7">
        <p className={`text-sm leading-relaxed ${featured ? "text-white/60" : "text-muted"}`}>
          <span className={`font-semibold ${featured ? "text-white/90" : "text-ink/80"}`}>Best for:</span> {plan.bestFor}
        </p>
        <Link
          to={`/contact?plan=${plan.key}`}
          className={`mt-5 w-full px-5 py-3 text-[15px] ${featured ? "btn bg-white text-ink hover:bg-primary-50" : "btn-primary"}`}
        >
          Book a pilot with {plan.name} <FiArrowRight />
        </Link>
      </div>
    </article>
  );
}

const Programs = () => {
  return (
    <section id="programs" className="scroll-mt-20 bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Programs</p>
          <h2 className="mt-3 text-[34px] font-extrabold leading-[1.1] sm:text-[44px]">Support that fits how you are this week.</h2>
          <p className="mt-4 max-w-md text-ink/70">
            Some weeks you want to talk. Some weeks you just want to tick off a walk and go to bed. Both count.
          </p>
        </div>
        <ol className="divide-y divide-line border-y border-line">
          {PROGRAMS.map((p, i) => (
            <li key={p.title} className="group grid grid-cols-[3rem_1fr] gap-4 py-7">
              <span className="font-serif text-2xl italic text-primary/70 transition group-hover:text-primary">{i + 1}</span>
              <div>
                <h3 className="text-xl font-bold">{p.title}</h3>
                <p className="mt-2 leading-relaxed text-ink/70">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div id="pricing" className="mx-auto mt-24 max-w-6xl scroll-mt-24 px-5 sm:mt-32 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Plans for schools</p>
          <h2 className="mt-3 text-[34px] font-extrabold leading-[1.1] sm:text-[44px]">
            Pick the level of support your{" "}
            <span className="font-serif font-medium italic tracking-[-0.02em] text-primary">students</span> need.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-ink/70">
            Every plan is priced per student for the full academic year, with lower pricing for partner institutions. Get in touch for a quote.
          </p>
        </div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard key={p.key} plan={p} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl bg-bg-light-gray px-6 py-6 text-center ring-1 ring-line sm:flex-row sm:px-8 sm:text-left">
          <div>
            <p className="text-lg font-bold">Not sure which plan fits?</p>
            <p className="mt-1 text-sm text-ink/70">Start with a pilot. Tell us about your school and we'll help you choose.</p>
          </div>
          <Link to="/contact" className="btn-ghost shrink-0 px-5 py-3">
            Talk to us <FiArrowRight />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Programs;
