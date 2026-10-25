import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const JoinUs = () => {
  return (
    <>
      <section id="mentors" className="scroll-mt-20 bg-bg-light-gray py-24 sm:py-28">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2">
          <div>
            <p className="eyebrow">For mentors</p>
            <h2 className="mt-3 text-[34px] font-extrabold leading-[1.1] sm:text-[44px]">
              Been through it? Help someone who's in it now.
            </h2>
            <p className="mt-4 max-w-lg text-ink/70">
              Mentors see how their students are doing at a glance, get a heads-up when someone logs a hard day, run
              sessions, and message directly. You choose who you take on.
            </p>
            <Link to="/register" className="btn-primary mt-8 px-6 py-3.5 text-base">
              Become a mentor <FiArrowRight />
            </Link>
          </div>
          <div className="rounded-3xl bg-white p-6 ring-1 ring-line">
            <p className="text-sm font-semibold text-muted">How your students are doing</p>
            <ul className="mt-3 divide-y divide-line">
              {[
                ["A", "😔 Low · 2h ago", true],
                ["R", "🙂 Good · yesterday", false],
                ["K", "😄 Great · 3d ago", false],
              ].map(([n, s, flag]) => (
                <li key={n} className="flex items-center gap-3 py-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-50 font-bold text-primary">{n}</span>
                  <div className="flex-1">
                    <p className="flex items-center gap-2 font-bold">
                      Student {n}
                      {flag && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">Check in</span>}
                    </p>
                    <p className="text-xs text-muted">{s}</p>
                  </div>
                  <span className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary">Message</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="text-[38px] font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-[56px]">
            Start with how you feel <span className="font-serif font-medium italic text-primary">today.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-ink/70">It takes about a minute to sign up. Your first check-in takes five seconds.</p>
          <Link to="/register" className="btn-primary mt-9 px-7 py-4 text-base">
            Create your account <FiArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
};

export default JoinUs;
