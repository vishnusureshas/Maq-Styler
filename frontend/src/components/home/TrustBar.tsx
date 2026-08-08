import { Truck, RotateCcw, CreditCard, Headphones } from 'lucide-react';
import { Reveal } from './Reveal';

const items = [
  { icon: Truck, title: 'Free shipping', text: 'On orders over $50' },
  { icon: RotateCcw, title: 'Easy returns', text: '30-day money back' },
  { icon: CreditCard, title: 'Secure checkout', text: 'Encrypted payments' },
  { icon: Headphones, title: '24/7 support', text: 'Real humans, fast help' },
];

export function TrustBar() {
  return (
    <section className="border-y border-slate-100 bg-white">
      <div className="container grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 100}>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 text-blue-600">
                <item.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold text-slate-800">{item.title}</p>
                <p className="text-sm text-slate-500">{item.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}