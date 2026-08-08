import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';
import type { Category, Product } from '@/types/product';

const gradients = [
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-fuchsia-400',
  'from-amber-400 to-orange-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-pink-500',
  'from-indigo-400 to-blue-500',
  'from-cyan-400 to-sky-500',
  'from-fuchsia-400 to-purple-500',
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
      <Reveal className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Categories
          </p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
            Shop by category
          </h2>
        </div>
        <Link
          to="/shop"
          className="hidden items-center gap-1 text-sm font-medium text-blue-600 hover:underline sm:flex"
        >
          Browse all <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((c, i) => (
          <Reveal key={c._id} delay={(i % 4) * 80}>
            <Link
              to={`/shop?category=${c._id}`}
              className="group relative block h-40 overflow-hidden rounded-3xl border border-white/70 bg-white/60 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-300/40"
            >
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <span
                  className={`flex h-full w-full items-center bg-gradient-to-br ${gradients[i % gradients.length]}`}
                >
                  <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-white/25 text-xl font-extrabold text-white backdrop-blur">
                    {c.name.charAt(0)}
                  </span>
                </span>
              )}
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent px-4 pb-3 pt-10">
                <span className="text-base font-bold text-white drop-shadow">{c.name}</span>
                {countFor(c._id) > 0 && (
                  <span className="ml-2 text-xs font-medium text-white/80">
                    {countFor(c._id)} item{countFor(c._id) > 1 ? 's' : ''}
                  </span>
                )}
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}