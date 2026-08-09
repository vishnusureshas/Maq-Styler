import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from './Reveal';
import type { Product } from '@/types/product';

function useCountdown() {
  const start = useMemo(() => Date.now() + (2 * 24 * 3600 + 14 * 3600 + 36 * 60 + 45) * 1000, []);
  const [left, setLeft] = useState(() => start - Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft(Math.max(0, start - Date.now()));
    }, 1000);
    return () => window.clearInterval(id);
  }, [start]);

  const total = Math.floor(left / 1000);
  return {
    days: String(Math.floor(total / 86400)).padStart(2, '0'),
    hours: String(Math.floor((total % 86400) / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((total % 3600) / 60)).padStart(2, '0'),
    seconds: String(total % 60).padStart(2, '0'),
  };
}

function TimeBox({ value, label, dark }: { value: string; label: string; dark?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`grid h-14 w-14 place-items-center rounded-2xl text-2xl font-extrabold tabular-nums shadow-md ${
          dark ? 'bg-white/15 text-white backdrop-blur' : 'bg-violet-600/10 text-violet-700'
        }`}
      >
        {value}
      </span>
      <span
        className={`text-[11px] font-bold uppercase tracking-wider ${
          dark ? 'text-white/70' : 'text-violet-500'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export function PromoBanner({ products }: { products: Product[] }) {
  const { days, hours, minutes, seconds } = useCountdown();
  const visual = products.find((p) => p.images?.length);

  return (
    <section className="container py-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/60 blur-2xl" />
            {visual && (
              <div className="pointer-events-none absolute -bottom-10 -right-4 hidden h-48 w-44 sm:block">
                <img
                  src={visual.images[0]}
                  alt=""
                  className="h-full w-full rounded-[1.75rem] border-4 border-white/70 object-cover opacity-90 shadow-2xl shadow-violet-300/40"
                />
              </div>
            )}

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-violet-600 shadow-sm backdrop-blur">
                <Gift className="h-3.5 w-3.5" /> Exclusive offer
              </span>
              <h3 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900">
                Get <span className="text-gradient-pink">20% Off</span>
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-500">
                On your first order — no code needed.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-8 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 shadow-xl shadow-violet-500/30"
              >
                <Link to="/shop">
                  Shop Now <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-950 p-8 sm:p-10">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-3xl" />
              <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-violet-500/25 blur-3xl" />
            </div>
            {visual && (
              <div className="pointer-events-none absolute -bottom-12 right-4 hidden h-44 w-44 sm:block">
                <img
                  src={visual.images[0]}
                  alt=""
                  className="h-full w-full rounded-full object-cover opacity-60 mix-blend-screen"
                />
              </div>
            )}

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-fuchsia-300 backdrop-blur">
                <Timer className="h-3.5 w-3.5" /> Deal of the day
              </span>
              <h3 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-white">
                Up to <span className="text-fuchsia-300">60% Off</span>
              </h3>
              <p className="mt-2 text-sm font-medium text-white/70">
                Don&apos;t miss the best deals — limited time offer.
              </p>

              <div className="mt-8 flex items-center gap-2.5">
                <TimeBox value={days} label="Days" dark />
                <span className="text-2xl font-bold text-white/40">:</span>
                <TimeBox value={hours} label="Hrs" dark />
                <span className="text-2xl font-bold text-white/40">:</span>
                <TimeBox value={minutes} label="Mins" dark />
                <span className="text-2xl font-bold text-white/40">:</span>
                <TimeBox value={seconds} label="Secs" dark />
              </div>

              <Button
                asChild
                size="lg"
                className="mt-8 rounded-full bg-white px-8 text-violet-700 shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:bg-fuchsia-50"
              >
                <Link to="/shop">
                  Shop the sale <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}