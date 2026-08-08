import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, PackageSearch } from 'lucide-react';
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
      <section className="relative overflow-hidden border-b border-white/60 bg-gradient-to-br from-sky-100/90 via-white to-indigo-50/70">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_80%)]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-blob-float absolute -left-20 top-0 h-72 w-72 rounded-full bg-blue-300/40 blur-3xl" />
          <div
            className="animate-blob-float absolute right-10 top-10 h-72 w-72 rounded-full bg-violet-300/40 blur-3xl"
            style={{ animationDelay: '-7s' }}
          />
        </div>

        <div className="container relative py-14 lg:py-16">
          <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Browse the collection
          </span>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
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
            <Search className="ml-3 h-5 w-5 shrink-0 text-blue-600" />
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
      </section>

      <div className="container py-8">
        <div className="mb-10 rounded-3xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur lg:sticky lg:top-[4.5rem] lg:z-30">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <SlidersHorizontal className="h-4 w-4 text-blue-600" />
              Filters
            </span>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600 hover:text-blue-700">
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