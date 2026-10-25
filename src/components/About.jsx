const STEPS = [
  {
    n: "01",
    title: "Check in",
    body: "One tap to say how you feel. Add a line if you want. Over a few weeks you start to see what lifts you and what doesn't.",
    visual: (
      <div className="flex gap-1.5">
        {["😄", "🙂", "😐", "😔", "😢"].map((e, i) => (
          <span key={e} className={`grid h-10 w-10 place-items-center rounded-xl text-lg ring-1 ${i === 2 ? "bg-amber-50 ring-2 ring-amber-300" : "bg-white ring-line"}`}>
            {e}
          </span>
        ))}
      </div>
    ),
  },
  {
    n: "02",
    title: "Build one small habit",
    body: "Ten minutes of reading. Phone away by eleven. Tick it off, earn XP, and watch the streak grow without it taking over your day.",
    visual: (
      <div className="w-full max-w-[240px] space-y-1.5">
        {[
          ["20 minute walk", true],
          ["Write 3 good things", true],
          ["Phone away by 11pm", false],
        ].map(([t, d]) => (
          <div key={t} className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-line">
            <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] text-white ${d ? "bg-gradient-to-br from-primary to-secondary" : "border-2 border-line"}`}>{d ? "✓" : ""}</span>
            <span className={d ? "text-muted line-through" : "font-semibold"}>{t}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    n: "03",
    title: "Talk to someone who gets it",
    body: "Browse mentors, ask to connect, and message them when things feel heavy. They can see your check-ins, so you don't have to explain from scratch.",
    visual: (
      <div className="w-full max-w-[240px] space-y-1.5 text-sm">
        <div className="w-fit rounded-2xl rounded-bl-md bg-white px-3 py-2 ring-1 ring-line">Rough week?</div>
        <div className="ml-auto w-fit rounded-2xl rounded-br-md bg-primary px-3 py-2 text-white">Yeah. Exams.</div>
        <div className="w-fit rounded-2xl rounded-bl-md bg-white px-3 py-2 ring-1 ring-line">Been there. Let's make a plan.</div>
      </div>
    ),
  },
];

/** "How it works" section (kept in About.jsx so the import in Home stays the same). */
const AboutUs = () => {
  return (
    <section id="how" className="scroll-mt-20 bg-bg-light-gray py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 text-[34px] font-extrabold leading-[1.1] sm:text-[44px]">
            Small steps, every day. Someone in your corner when you need it.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {STEPS.map((s) => (
            <article key={s.n} className="flex flex-col rounded-3xl bg-white p-7 ring-1 ring-line">
              <div className="grid h-40 place-items-center rounded-2xl bg-bg-light-gray px-4">{s.visual}</div>
              <p className="mt-7 font-serif text-lg italic text-primary">{s.n}</p>
              <h3 className="mt-1 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-ink/70">{s.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
