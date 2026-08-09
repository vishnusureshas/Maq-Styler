import { Truck, RotateCcw, ShieldCheck } from 'lucide-react';

const items = [
  { icon: Truck, label: 'Free shipping on orders over $50' },
  { icon: RotateCcw, label: '30-day easy returns' },
  { icon: ShieldCheck, label: 'Secure payment' },
];

export function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50">
      <div className="container flex h-8 items-center justify-between gap-4 sm:h-9">
        {items.map((item) => (
          <p
            key={item.label}
            className="flex min-w-0 items-center gap-1.5 truncate text-[11px] font-medium text-slate-600 sm:text-xs"
          >
            <item.icon className="h-3.5 w-3.5 shrink-0 text-violet-500" />
            <span className="truncate">{item.label}</span>
          </p>
        ))}
      </div>
    </div>
  );
}