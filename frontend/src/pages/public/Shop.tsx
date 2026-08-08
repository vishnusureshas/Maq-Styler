import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { EmptyState } from '@/components/shared/EmptyState';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import { selectCategories } from '@/store/slices/categorySlice';
import { useDebounce } from '@/hooks/useDebounce';

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

  // Sync debounced values back into the URL only once they settle
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
  const clearFilters = () => {
    setKeyword('');
    setMinPrice('');
    setMaxPrice('');
    updateParams({ keyword: '', category: '', minPrice: '', maxPrice: '', page: '1' });
  };

  const goPage = (p: number) => updateParams({ page: String(p) });

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Shop</h1>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center">
          <Input
            placeholder="Search products…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="md:max-w-xs"
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              placeholder="Min price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-28"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              min="0"
              placeholder="Max price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-28"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => updateParams({ category: '', page: '1' })}
            className={`rounded-full border px-4 py-1.5 text-sm ${!category ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => updateParams({ category: c._id, page: '1' })}
              className={`rounded-full border px-4 py-1.5 text-sm ${category === c._id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              {c.name}
            </button>
          ))}
          {(hasPriceFilter || category || debouncedKeyword) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {status === 'loading' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState title="No products found" description="Try adjusting your filters or search." />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            {count} product{count !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </>
      )}

      {pages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => goPage(Math.max(1, page - 1))} />
            </PaginationItem>
            {Array.from({ length: pages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={page === i + 1}
                  onClick={() => goPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => goPage(Math.min(pages, page + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}