const VALUES = [
  ["Respect", "for every person's own path."],
  ["Hope", "that real change is possible."],
  ["Empowerment", "through shared stories and support."],
  ["Self-awareness", "to notice growth when it happens."],
];

const Values = () => {
  return (
    <section className="relative overflow-hidden bg-bg-dark py-24 text-white sm:py-32">
      <div className="pointer-events-none absolute -right-40 top-0 h-[480px] w-[480px] rounded-full bg-primary/30 blur-[140px]" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-secondary">What we believe</p>
        <p className="mt-5 max-w-4xl font-serif text-[32px] font-medium leading-[1.2] tracking-[-0.01em] sm:text-[48px]">
          Our mission is a community of understanding, resilience and hope, where people can connect, share, and{" "}
          <em className="text-secondary">grow together.</em>
        </p>
        <dl className="mt-16 grid gap-px overflow-hidden rounded-3xl bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(([t, d]) => (
            <div key={t} className="bg-bg-dark p-7">
              <dt className="text-lg font-bold">{t}</dt>
              <dd className="mt-1 text-white/60">{d}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};

export default Values;
