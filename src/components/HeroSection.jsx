import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const MOODS = ["😄", "🙂", "😐", "😴", "😔", "😤", "😢"];

/** A small, live-looking product preview built from real UI, not a screenshot. */
function Preview() {
  return (
    <div className="relative mx-auto w-full max-w-[460px] lg:mx-0">
      <div className="absolute -inset-8 -z-10 rounded-[48px] bg-gradient-to-br from-primary/15 via-secondary/10 to-transparent blur-2xl" />

      <div className="rounded-3xl border border-line bg-white p-5 shadow-[0_30px_60px_-30px_rgba(29,31,43,0.35)] animate-rise" style={{ animationDelay: "250ms" }}>
        <p className="text-xs font-semibold text-muted">Thursday, 12 March</p>
        <p className="mt-1 text-lg font-extrabold">How are you, honestly?</p>
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {MOODS.map((m, i) => (
            <span
              key={m}
              className={`grid aspect-square place-items-center rounded-xl text-xl ring-1 ${
                i === 1 ? "bg-lime-50 ring-2 ring-lime-300" : "ring-line"
              }`}
            >
              {m}
            </span>
          ))}
        </div>
        <p className="mt-4 font-serif text-[15px] italic text-ink/70">What's a small win from today that nobody saw?</p>
        <p className="mt-1.5 rounded-xl bg-bg-light-gray px-3 py-2.5 text-sm text-ink/80">Finally went for that walk. Felt lighter after.</p>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-4">
        <div className="col-span-2 rounded-3xl border border-line bg-white p-4 animate-rise" style={{ animationDelay: "400ms" }}>
          <p className="text-xs font-semibold text-muted">Streak</p>
          <p className="mt-1 text-3xl font-extrabold">
            <span className="inline-block animate-flame">🔥</span> 9
          </p>
          <div className="mt-3 flex gap-1">
            {[1, 1, 1, 1, 1, 1, 0].map((d, i) => (
              <span key={i} className={`h-5 flex-1 rounded ${d ? "bg-gradient-to-b from-primary to-secondary" : "border border-dashed border-primary/40"}`} />
            ))}
          </div>
        </div>
        <div className="col-span-3 rounded-3xl bg-bg-dark p-4 text-white animate-rise" style={{ animationDelay: "550ms" }}>
          <p className="text-xs font-semibold text-white/50">Your mentor</p>
          <div className="mt-2 rounded-2xl rounded-bl-md bg-white/10 px-3 py-2 text-sm leading-snug">
            Proud of you for the walk. Same time tomorrow?
          </div>
          <div className="mt-2 ml-auto w-fit rounded-2xl rounded-br-md bg-primary px-3 py-2 text-sm">Deal 🙂</div>
        </div>
      </div>
    </div>
  );
}

const HeroSection = () => {
  return (
    <header className="relative overflow-hidden bg-white pt-28 sm:pt-36">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
        <div>
          <p className="eyebrow animate-rise">Psychology mentors for students in India</p>
          <h1 className="mt-4 text-[44px] font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-[64px] animate-rise" style={{ animationDelay: "60ms" }}>
            A safe space to heal and grow,{" "}
            <span className="font-serif font-medium italic tracking-[-0.02em] text-primary">together.</span>
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-ink/70 animate-rise" style={{ animationDelay: "120ms" }}>
            Talk to a psychology mentor in confidence about depression, questions about who you are, growing up, or
            harassment you haven't told anyone about. Check in with yourself every day and build small habits that help.
            No real name needed.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3 animate-rise" style={{ animationDelay: "180ms" }}>
            <Link to="/register" className="btn-primary px-6 py-3.5 text-base">
              Start your first check-in <FiArrowRight />
            </Link>
            <a href="#how" className="btn-ghost px-6 py-3.5 text-base">
              See how it works
            </a>
          </div>
          <p className="mt-10 text-sm text-muted animate-rise" style={{ animationDelay: "240ms" }}>
            A vision by <span className="font-semibold text-ink/80">Satvik Sanisetty</span>: a world where no one has to
            face depression alone.
          </p>
        </div>
        <Preview />
      </div>
    </header>
  );
};

export default HeroSection;
