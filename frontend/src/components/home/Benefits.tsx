import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';
import { Reveal } from './Reveal';
import { cn } from '@/lib/utils';

const benefits = [
  { icon: Truck, title: 'Free Shipping', text: 'On orders over $50', tint: 'from-violet-100 to-purple-100 text-violet-600' },
  { icon: RotateCcw, title: '30-Day Returns', text: 'Hassle-free returns', tint: 'from-fuchsia-100 to-pink-100 text-fuchsia-600' },
  { icon: ShieldCheck, title: 'Secure Payments', text: '100% protected', tint: 'from-indigo-100 to-violet-100 text-indigo-600' },
  { icon: Headphones, title: '24/7 Support', text: "We're here to help", tint: 'from-purple-100 to-fuchsia-100 text-purple-600' },
];

export function Benefits() {
  return (
    <section className="relative z-10">
      <div className="container">
        <Reveal>
          <div className="relative -mt-8 overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-xl shadow-violet-200/40 backdrop-blur lg:-mt-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/80 via-white to-fuchsia-50/80" />
            <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((b, i) => (
                <div
                  key={b.title}
                  className={cn(
                    'flex items-center gap-4 px-6 py-6 lg:px-8 lg:py-8',
                    i > 0 && 'lg:border-l lg:border-slate-100'
                  )}
                >
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${b.tint}`}
                  >
                    <b.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="font-bold text-slate-900">{b.title}</p>
                    <p className="text-sm text-slate-500">{b.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}