import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/product/ProductCard';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import { selectCategories } from '@/store/slices/categorySlice';

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const dispatch = useAppDispatch();
  const { list: products, status } = useAppSelector((s) => s.product);
  const categories = useAppSelector(selectCategories);

  useEffect(() => {
    dispatch(fetchProducts({ featured: true, pageSize: 8 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container flex flex-col items-center gap-6 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">Shop the best deals</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Discover premium products at unbeatable prices with fast shipping and easy returns.
          </p>
          <div className="flex gap-3">
            <Button asChild size="lg">
              <Link to="/shop">Browse All Products</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="container py-10">
          <h2 className="mb-4 text-xl font-bold">Shop by Category</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button key={c._id} asChild variant="outline">
                <Link to={`/shop?category=${c._id}`}>{c.name}</Link>
              </Button>
            ))}
          </div>
        </section>
      )}

      <section className="container py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Featured Products</h2>
          <Button asChild variant="ghost">
            <Link to="/shop">View all →</Link>
          </Button>
        </div>
        {status === 'loading' ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No featured products yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}