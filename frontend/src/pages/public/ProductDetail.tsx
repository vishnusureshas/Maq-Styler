import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Rating } from '@/components/shared/Rating';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductBySlug, fetchProductById, clearCurrent } from '@/store/slices/productSlice';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const product = useAppSelector((s) => s.product.current);
  const status = useAppSelector((s) => s.product.status);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      dispatch(/^[a-f\d]{24}$/i.test(slug) ? fetchProductById(slug) : fetchProductBySlug(slug));
    }
    return () => {
      dispatch(clearCurrent());
    };
  }, [dispatch, slug]);

  if (status === 'loading' || !product) {
    return (
      <div className="container grid gap-8 py-8 md:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  const isOut = product.stock <= 0;

  return (
    <div className="container py-8">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link to="/shop" className="hover:underline">Shop</Link>
        <span className="mx-2">/</span>
        {typeof product.category === 'object' && product.category ? (
          <Link to={`/shop?category=${product.category._id}`} className="hover:underline">
            {product.category.name}
          </Link>
        ) : (
          <span>Product</span>
        )}
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          {product.images?.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-lg border bg-muted">
                <img src={product.images[activeImage]} alt={product.name} className="aspect-square w-full object-cover" />
              </div>
              {product.images.length > 1 && (
                <div className="flex gap-2">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-20 overflow-hidden rounded-md border ${i === activeImage ? 'ring-2 ring-primary' : ''}`}
                    >
                      <img src={img} alt="" className="aspect-square object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              No image
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <div className="mb-1 text-sm font-medium text-primary/80">{product.brand}</div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <Rating value={product.ratingsAverage} count={product.ratingsQuantity} />
              {product.sku && <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>}
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold">{formatCurrency(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          {product.variants?.map((v) => (
            <div key={v.name}>
              <div className="mb-2 text-sm font-medium">{v.name}</div>
              <div className="flex flex-wrap gap-2">
                {v.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelectedVariant((prev) => ({ ...prev, [v.name]: opt }))}
                    className={`rounded-md border px-3 py-1.5 text-sm ${
                      selectedVariant[v.name] === opt ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 hover:bg-accent"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-10 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="px-3 py-2 hover:bg-accent"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <AddToCartButton
              productId={product._id}
              stock={product.stock}
              quantity={quantity}
              variant={Object.keys(selectedVariant).length ? selectedVariant : undefined}
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            {isOut ? (
              <Badge variant="destructive">Out of Stock</Badge>
            ) : (
              <>
                <Badge variant="outline">In Stock</Badge>
                <span className="text-muted-foreground">{product.stock} available</span>
              </>
            )}
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.map((t) => (
                <Badge key={t} variant="secondary">{t}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Separator className="my-10" />
      <Reviews productId={product._id} />
    </div>
  );
}

function Reviews({ productId }: { productId: string }) {
  const user = useAppSelector((s) => s.auth.user);
  const [reviews, setReviews] = useState<{ _id: string; user: { name: string }; rating: number; title?: string; comment: string; createdAt: string }[]>([]);
  const [form, setForm] = useState({ rating: 5, title: '', comment: '' });

  useEffect(() => {
    fetch(`/api/v1/reviews/product/${productId}`)
      .then((r) => r.json())
      .then((data) => data.reviews && setReviews(data.reviews));
  }, [productId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const res = await fetch(`/api/v1/reviews/product/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ecommerce_token')}` },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setReviews((prev) => [data.review, ...prev]);
      setForm({ rating: 5, title: '', comment: '' });
    }
  };

  return (
    <section>
      <h2 className="mb-4 text-xl font-bold">Reviews ({reviews.length})</h2>

      {user && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Rating:</span>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setForm((f) => ({ ...f, rating: i }))}
                    className={`text-xl ${i <= form.rating ? 'text-yellow-400' : 'text-muted-foreground/30'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
                placeholder="Review title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                placeholder="Write your review…"
                required
                value={form.comment}
                onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
              />
              <Button type="submit">Submit Review</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet.{user ? '' : ' Sign in to write one.'}</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r._id}>
              <CardContent className="pt-6">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">{r.user?.name || 'User'}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                <Rating value={r.rating} />
                {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}