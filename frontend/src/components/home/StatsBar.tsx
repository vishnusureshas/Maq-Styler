import { AnimatedCounter, Reveal } from './Reveal';

const stats = [
  { value: 1200, suffix: '+', label: 'Happy customers' },
  { value: 3600, suffix: '+', label: 'Products in store' },
  { value: 240, suffix: 'K+', label: 'Orders delivered' },
  { value: 4.9, suffix: '/5', label: 'Average rating', decimals: 1 },
];

export function StatsBar() {
  return (
    <section className="bg-gradient-to-r from-sky-50 via-violet-50 to-cyan-50">
      <div className="container grid grid-cols-2 gap-8 py-14 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 100} className="text-center">
<p className="text-gradient text-4xl font-extrabold tracking-tight sm:text-5xl">
              {s.decimals ? (
                <span>
                  {s.value}
                  {s.suffix}
                </span>
              ) : (
                <AnimatedCounter to={s.value} suffix={s.suffix} />
              )}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-500">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}