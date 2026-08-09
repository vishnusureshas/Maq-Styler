import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, PackageSearch, Star, Truck, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { ProductCard } from '@/components/product/ProductCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import { selectCategories } from '@/store/slices/categorySlice';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

function ShopSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-3xl border border-white/70 bg-white/70 p-4">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

function ShopHeaderVisual() {
  const products = useAppSelector((s) => s.product.list);
  const images = products.filter((p) => p.images?.length);
  const main = images[0] ?? null;
  const second = images[1] ?? null;
  const third = images[2] ?? null;

  return (
    <div className="relative mx-auto h-[540px] w-full max-w-md">
      {/* Ambient gradient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-blob-float absolute -right-10 top-2 h-56 w-56 rounded-full bg-fuchsia-300/40 blur-3xl" />
        <div className="animate-blob-float absolute -left-6 bottom-2 h-56 w-56 rounded-full bg-indigo-300/40 blur-3xl" style={{ animationDelay: '-6s' }} />
        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-200/50 blur-3xl" />
      </div>

      {/* Decorative concentric rings */}
      <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200/60" />
      <div className="absolute left-1/2 top-1/2 h-[19rem] w-[19rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200/40" />

      {/* Main product card */}
      <div className="animate-float absolute left-1/2 top-10 z-20 w-72 -translate-x-1/2 rounded-[2rem] border border-white/70 bg-white p-3 shadow-2xl shadow-purple-900/20">
        {main ? (
          <img src={main.images[0]} alt={main.name} className="h-72 w-full rounded-[1.4rem] object-cover" />
        ) : (
          <div className="grid h-72 w-full place-items-center rounded-[1.4rem] bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-300">
            <ShoppingBag className="h-14 w-14" />
          </div>
        )}
        <div className="flex items-center justify-between gap-2 px-1 pt-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{main?.name ?? 'Featured picks'}</p>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              4.8 rated
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-600">
            Bestseller
          </span>
        </div>
      </div>

      {/* Secondary product card */}
      {second && (
        <div
          className="animate-float absolute right-1 top-28 z-10 w-52 rotate-6 rounded-3xl border border-white/70 bg-white p-3 shadow-xl shadow-purple-900/15"
          style={{ animationDelay: '-2.5s' }}
        >
          <img src={second.images[0]} alt={second.name} className="mx-auto h-40 w-full rounded-2xl object-cover" />
          <p className="line-clamp-1 px-1 pt-2 text-xs font-bold text-slate-800">{second.name}</p>
        </div>
      )}

      {/* Third product mini-card */}
      {third && (
        <div
          className="animate-float absolute -left-1 bottom-28 z-10 w-48 -rotate-3 rounded-3xl border border-white/70 bg-white p-2.5 shadow-xl shadow-purple-900/15"
          style={{ animationDelay: '-4s' }}
        >
          <img src={third.images[0]} alt={third.name} className="mx-auto h-28 w-full rounded-2xl object-cover" />
        </div>
      )}

      {/* Trust chips */}
      <div className="animate-float absolute left-0 top-6 flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-2 shadow-lg shadow-purple-900/10 backdrop-blur">
        <Truck className="h-4 w-4 text-violet-600" />
        <p className="text-xs font-bold text-slate-700">Free shipping</p>
      </div>
      <div
        className="animate-float absolute bottom-44 right-0 flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 py-2 shadow-lg shadow-purple-900/10 backdrop-blur"
        style={{ animationDelay: '-3s' }}
      >
        <ShieldCheck className="h-4 w-4 text-fuchsia-600" />
        <p className="text-xs font-bold text-slate-700">Secure &amp; easy</p>
      </div>

      {/* Sale badge */}
      <div className="animate-pulse-soft absolute right-4 top-6 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-center text-white shadow-xl shadow-violet-500/30">
        <div>
          <p className="text-lg font-extrabold leading-none">50%</p>
          <p className="text-[9px] font-semibold uppercase tracking-wide">Off</p>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { list: products, status, page, pages, count } = useAppSelector((s) => s.product);
  const categories = useAppSelector(selectCategories);

  const category = searchParams.get('category') || '';

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const debouncedKeyword = useDebounce(keyword, 400);

  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const debouncedMin = useDebounce(minPrice, 400);
  const debouncedMax = useDebounce(maxPrice, 400);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(updates).forEach(([k, v]) => {
        if (v) next.set(k, v);
        else next.delete(k);
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const fetchSignal = useMemo(
    () => [category, debouncedKeyword, debouncedMin, debouncedMax, searchParams.get('page') || '1'].join('&'),
    [category, debouncedKeyword, debouncedMin, debouncedMax, searchParams]
  );

  useEffect(() => {
    dispatch(
      fetchProducts({
        page: Number(searchParams.get('page')) || 1,
        pageSize: 12,
        keyword: debouncedKeyword || undefined,
        category: category || undefined,
        minPrice: debouncedMin ? Number(debouncedMin) : undefined,
        maxPrice: debouncedMax ? Number(debouncedMax) : undefined,
      })
    );
  }, [dispatch, fetchSignal]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    updateParams({ keyword: debouncedKeyword, page: '1' });
  }, [debouncedKeyword]);
  useEffect(() => {
    updateParams({ minPrice: debouncedMin, page: '1' });
  }, [debouncedMin]);
  useEffect(() => {
    updateParams({ maxPrice: debouncedMax, page: '1' });
  }, [debouncedMax]);

  const hasPriceFilter = Boolean(minPrice || maxPrice);
  const hasActiveFilters = hasPriceFilter || Boolean(category) || Boolean(debouncedKeyword);
  const clearFilters = () => {
    setKeyword('');
    setMinPrice('');
    setMaxPrice('');
    updateParams({ keyword: '', category: '', minPrice: '', maxPrice: '', page: '1' });
  };

  const goPage = (p: number) => updateParams({ page: String(p) });

  return (
    <div className="bg-white">
      <section className="relative overflow-hidden border-b border-white/60 bg-gradient-to-br from-violet-100/90 via-white to-fuchsia-50/70">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_80%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-blob-float absolute -left-20 top-0 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl" />
          <div
            className="animate-blob-float absolute right-10 top-10 h-72 w-72 rounded-full bg-fuchsia-300/40 blur-3xl"
            style={{ animationDelay: '-7s' }}
          />
        </div>

        <div className="container relative grid items-center gap-12 py-14 lg:grid-cols-12 lg:py-16">
          <div className="animate-fade-up lg:col-span-7">
            <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-violet-600">
              <Sparkles className="h-4 w-4" /> Browse the collection
            </span>
            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
              The Shop
            </h1>
            <p className="mt-3 max-w-lg text-slate-500">
              Explore every product in the store. Refine by category or price to find exactly what
              you&apos;re after.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="glass mt-8 flex max-w-xl items-center gap-2 rounded-full p-1.5"
            >
              <Search className="ml-3 h-5 w-5 shrink-0 text-violet-600" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search products…"
                className="h-10 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  className="mr-2 text-slate-400 transition-colors hover:text-slate-600"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </form>
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <ShopHeaderVisual />
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="mb-10 rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur lg:sticky lg:top-[6.5rem] lg:z-30">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <SlidersHorizontal className="h-4 w-4 text-violet-600" />
              Filters
            </span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-violet-600 hover:text-violet-700">
                Clear all
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => updateParams({ category: '', page: '1' })}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                !category
                  ? 'border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                onClick={() => updateParams({ category: c._id, page: '1' })}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  category === c._id
                    ? 'border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/25'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600'
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-28 rounded-full"
              />
              <span className="text-slate-400">–</span>
              <Input
                type="number"
                min="0"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-28 rounded-full"
              />
            </div>
            {status !== 'loading' && (
              <span className="ml-auto text-sm text-slate-500">
                <span className="font-semibold text-slate-800">{count}</span> product
                {count !== 1 ? 's' : ''} found
              </span>
            )}
          </div>
        </div>

        {status === 'loading' ? (
          <ShopSkeleton />
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 py-20 text-center">
            <PackageSearch className="h-12 w-12 text-slate-300" />
            <p className="font-semibold text-slate-700">No products found</p>
            <p className="max-w-sm text-sm text-slate-500">
              Try adjusting your search or filters — or clear them to see everything we have.
            </p>
            <Button onClick={clearFilters} className="mt-2 rounded-full px-6">
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <Pagination className="mt-10">
            <PaginationContent className="gap-2">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => goPage(Math.max(1, page - 1))}
                  className="rounded-full border-none bg-white/80 text-slate-700 shadow-sm hover:bg-white"
                />
              </PaginationItem>
              {Array.from({ length: pages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => goPage(i + 1)}
                    className="rounded-full"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => goPage(Math.min(pages, page + 1))}
                  className="rounded-full bg-white/80 text-slate-700 shadow-sm hover:bg-white"
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}