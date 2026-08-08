import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  selectCart,
} from '@/store/slices/cartSlice';
import type { CartItem } from '@/types/cart';
import type { Product } from '@/types/product';

export function productImage(p?: Product | string | unknown): string {
  if (p && typeof p === 'object') {
    const obj = p as { images?: string[]; image?: string | string[] };
    if (Array.isArray(obj.images)) return obj.images[0] ?? '';
    if (typeof obj.image === 'string') return obj.image;
    if (Array.isArray(obj.image)) return obj.image[0] ?? '';
  }
  return '';
}

export function productName(p?: Product | string | unknown): string {
  if (p && typeof p === 'object' && 'name' in (p as object)) return (p as { name: string }).name;
  return String(p ?? '');
}

const fmt = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const itemId = (item: CartItem) => String((item.product as { _id?: string })._id ?? item.product);
const itemSlug = (item: CartItem) => (item.product as { slug?: string }).slug ?? '';

export default function Cart() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchCart()).finally(() => setLoading(false));
  }, [dispatch]);

  if (loading)
    return <div className="container py-16 text-center text-muted-foreground">Loading cart…</div>;

  const items = cart?.items ?? [];
  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground">Looks like you haven&apos;t added anything yet.</p>
        <Button asChild>
          <Link to="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  const productsTotal = items.reduce((sum, item) => sum + (item.priceAtAdd ?? 0) * item.quantity, 0);
  const shipping = (cart!.totalPrice ?? 0) >= 50 ? 0 : 9.99;
  const grandTotal = (cart!.totalPrice ?? 0) + shipping;
  const changeQty = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    dispatch(updateCartItem({ productId, quantity }));
  };

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-bold">Shopping cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={itemId(item)} className="flex gap-4 rounded-lg border p-4">
              <Link
                to={`/product/${itemSlug(item)}`}
                className="h-24 w-24 shrink-0 overflow-hidden rounded-md"
              >
                <img
                  src={productImage(item.product)}
                  alt={productName(item.product)}
                  className="h-full w-full object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/product/${itemSlug(item)}`} className="font-medium hover:underline">
                      {productName(item.product)}
                    </Link>
                    <p className="text-sm text-muted-foreground">{fmt(item.priceAtAdd ?? 0)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove item"
                    onClick={() => dispatch(removeCartItem(itemId(item)))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => changeQty(itemId(item), item.quantity - 1)}
                    >
                      −
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => changeQty(itemId(item), item.quantity + 1)}
                    >
                      +
                    </Button>
                  </div>
                  <p className="font-semibold">{fmt((item.priceAtAdd ?? 0) * item.quantity)}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => dispatch(clearCart())}>
              Clear cart
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4 rounded-lg border p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Products</span>
                <span>{fmt(productsTotal)}</span>
              </div>
              {cart!.totalDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coupon discount</span>
                  <span className="text-destructive">−{fmt(cart!.totalDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : fmt(shipping)}</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{fmt(grandTotal)}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Input
                placeholder="Coupon code"
                value={couponCode}
                disabled={cart!.totalDiscount > 0}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (cart!.totalDiscount > 0) dispatch(removeCoupon());
                  else if (couponCode.trim()) dispatch(applyCoupon(couponCode.trim()));
                }}
              >
                {cart!.totalDiscount > 0 ? 'Remove' : 'Apply'}
              </Button>
            </div>
            {cart!.totalDiscount > 0 && (
              <p className="text-xs text-primary">Coupon applied</p>
            )}

            <Button className="w-full" asChild>
              <Link to="/checkout">
                Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link to="/shop">Continue shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}