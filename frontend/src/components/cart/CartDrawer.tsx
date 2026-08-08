import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingCart, ShoppingBag, Plus, Minus } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  cartItemCount,
  selectCart,
} from '@/store/slices/cartSlice';
import type { CartItem } from '@/types/cart';
import { formatCurrency } from '@/lib/formatters';

const itemId = (item: CartItem) => String((item.product as { _id?: string })._id ?? item.product);
const itemSlug = (item: CartItem) =>
  String((item.product as { slug?: string })?.slug ?? itemId(item));
const itemName = (item: CartItem) =>
  (item.product as { name?: string })?.name ?? String(item.product);
const itemImage = (item: CartItem) => (item.product as { images?: string[] })?.images?.[0] ?? '';

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cart = useAppSelector(selectCart);
  const count = useAppSelector(cartItemCount);
  const token = useAppSelector((s) => s.auth.token);

  useEffect(() => {
    if (token) dispatch(fetchCart());
  }, [dispatch, token]);

  const items = cart?.items ?? [];
  const shipping = (cart?.totalPrice ?? 0) >= 50 ? 0 : 9.99;

  const changeQty = (productId: string, qty: number) => {
    if (qty < 1) return;
    dispatch(updateCartItem({ productId, quantity: qty }));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Open cart">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 px-1 text-xs">{count}</Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart
          </SheetTitle>
          <SheetDescription>
            {count} item{count !== 1 ? 's' : ''} in your cart
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/40" />
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add some products to get started.</p>
            <Button asChild size="sm">
              <Link to="/shop">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {items.map((item) => (
                <div key={itemId(item)} className="flex gap-3 rounded-lg border p-3">
                  <Link
                    to={`/product/${itemSlug(item)}`}
                    className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted"
                  >
                    <img src={itemImage(item)} alt={itemName(item)} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/product/${itemSlug(item)}`}
                        className="line-clamp-2 text-sm font-medium hover:underline"
                      >
                        {itemName(item)}
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => dispatch(removeCartItem(itemId(item)))}
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1 rounded-md border">
                        <button
                          onClick={() => changeQty(itemId(item), item.quantity - 1)}
                          className="px-1.5 py-1 hover:bg-accent"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => changeQty(itemId(item), item.quantity + 1)}
                          className="px-1.5 py-1 hover:bg-accent"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatCurrency((item.priceAtAdd ?? 0) * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatCurrency(cart?.totalPrice ?? 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                </span>
              </div>
              {typeof cart?.totalDiscount === 'number' && cart.totalDiscount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-semibold text-destructive">
                    -{formatCurrency(cart.totalDiscount)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold">
                  {formatCurrency((cart?.totalPrice ?? 0) + shipping)}
                </span>
              </div>
            </div>

            <SheetFooter className="px-5 pb-4">
              <SheetClose asChild>
                <Button className="w-full" onClick={() => navigate('/checkout')}>
                  Checkout · {formatCurrency((cart?.totalPrice ?? 0) + shipping)}
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button variant="outline" className="w-full" onClick={() => navigate('/cart')}>
                  View full cart
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}