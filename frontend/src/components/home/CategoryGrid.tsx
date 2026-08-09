import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Car,
  Dumbbell,
  Gamepad2,
  Home,
  MonitorSmartphone,
  Package,
  Palette,
  Shirt,
  type LucideIcon,
} from 'lucide-react';
import { Reveal } from './Reveal';
import type { Category, Product } from '@/types/product';

const iconFor = (name: string): LucideIcon => {
  const n = name.toLowerCase();
  if (/(electronics|gadget|tech|watch|phone|computer|audio)/.test(n)) return MonitorSmartphone;
  if (/(fashion|cloth|apparel|wear|shoe|jewel)/.test(n)) return Shirt;
  if (/(home|kitchen|garden|furniture|decor)/.test(n)) return Home;
  if (/(beauty|cosmetic|skincare|makeup)/.test(n)) return Palette;
  if (/(sport|fitness|gym|outdoor)/.test(n)) return Dumbbell;
  if (/(toy|game|kids)/.test(n)) return Gamepad2;
  if (/(book|stationery|office)/.test(n)) return BookOpen;
  if (/(auto|car|vehicle)/.test(n)) return Car;
  return Package;
};

const tints = [
  'from-violet-100 to-purple-100 text-violet-600',
  'from-fuchsia-100 to-pink-100 text-fuchsia-600',
  'from-indigo-100 to-violet-100 text-indigo-600',
  'from-rose-100 to-fuchsia-100 text-rose-500',
  'from-purple-100 to-fuchsia-100 text-purple-600',
  'from-blue-100 to-indigo-100 text-blue-600',
  'from-pink-100 to-rose-100 text-pink-600',
  'from-violet-100 to-indigo-100 text-violet-600',
];

export function CategoryGrid({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) {
  const countFor = (id: string) =>
    products.filter((p) => {
      const c = p.category;
      return typeof c === 'string' ? c === id : c?._id === id;
    }).length;

  return (
    <section className="container py-16">
      <Reveal className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-wider text-violet-600">
            Browse
          </p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Shop by Categories
          </h2>
        </div>
        <Link
          to="/shop"
          className="flex items-center gap-1 text-sm font-semibold text-violet-600 transition-colors hover:text-violet-700"
        >
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((c, i) => {
          const Icon = iconFor(c.name);
          return (
            <Reveal key={c._id} delay={(i % 8) * 60}>
              <Link
                to={`/shop?category=${c._id}`}
                className="group flex h-full flex-col items-center justify-center gap-3 rounded-3xl border border-slate-100 bg-white px-3 py-7 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-200/40"
              >
                <span
                  className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${tints[i % tints.length]} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className="h-7 w-7" />
                </span>
                <div>
                  <p className="font-bold text-slate-800">{c.name}</p>
                  {countFor(c._id) > 0 && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {countFor(c._id)} item{countFor(c._id) > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}