import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from './Reveal';

function useCountdown() {
  const target = new Date();
  target.setHours(23, 59, 59, 999);

  const [left, setLeft] = useState(() => target.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const diff = target.getTime() - Date.now();
      setLeft(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const total = Math.max(0, Math.floor(left / 1000));
  return {
    hours: String(Math.floor(total / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((total % 3600) / 60)).padStart(2, '0'),
    seconds: String(total % 60).padStart(2, '0'),
  };
}

function TimeBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="glass grid h-14 w-14 place-items-center rounded-2xl text-2xl font-extrabold text-slate-900">
        {value}
      </span>
      <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/80">
        {label}
      </span>
    </div>
  );
}

export function PromoBanner() {
  const { hours, minutes, seconds } = useCountdown();

  return (
    <section className="container py-8">
      <Reveal>
        <div className="animate-gradient-pan relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-600 via-violet-600 to-cyan-500 p-px shadow-2xl shadow-violet-300/40">
          <div className="relative flex flex-col items-center gap-6 rounded-[2rem] bg-gradient-to-r from-blue-700/90 via-violet-700/90 to-cyan-600/90 px-6 py-12 text-center sm:px-12 lg:flex-row lg:justify-between lg:text-left">
            <div className="pointer-events-none absolute inset-0 bg-grid opacity-20" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
                <Tag className="h-4 w-4" /> Limited-time offer
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Save 20% on your first order
              </h2>
              <p className="mt-2 max-w-md text-white/85">
                Use code <span className="rounded-lg bg-white/20 px-2 py-0.5 font-mono font-bold">SHOP20</span> at
                checkout. Ends tonight — don&apos;t miss it.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white text-blue-700 shadow-lg hover:bg-sky-50"
                >
                  <Link to="/shop">
                    <Gift className="h-5 w-5" /> Shop the sale
                  </Link>
                </Button>
                <div className="flex items-center gap-2">
                  <TimeBox value={hours} label="Hrs" />
                  <span className="text-2xl font-bold text-white/70">:</span>
                  <TimeBox value={minutes} label="Min" />
                  <span className="text-2xl font-bold text-white/70">:</span>
                  <TimeBox value={seconds} label="Sec" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}