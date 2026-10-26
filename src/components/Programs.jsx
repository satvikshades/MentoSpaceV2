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
    </section>
  );
};

export default Programs;
