import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectWishlist, removeWishlist, clearWishlist } from '@/store/slices/wishlistSlice';
import { formatCurrency } from '@/lib/formatters';

export function WishlistDrawer() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlist);
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Open wishlist">
          <Heart className="h-5 w-5" />
          {items.length > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 bg-rose-500 px-1 text-xs text-white hover:bg-rose-500">
              {items.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
            Your wishlist
          </SheetTitle>
          <SheetDescription>
            {items.length} item{items.length !== 1 ? 's' : ''} saved for later
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <Heart className="h-12 w-12 text-muted-foreground/40" />
            <p className="font-medium">No favourites yet</p>
            <p className="text-sm text-muted-foreground">
              Tap the heart on any product to save it here.
            </p>
            <Button asChild size="sm" onClick={() => setOpen(false)}>
              <Link to="/shop">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {items.map((item) => {
                const image = item.images?.[0];
                const href = `/product/${item.slug ?? item._id}`;
                return (
                  <div key={item._id} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
                    <Link
                      to={href}
                      onClick={() => setOpen(false)}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-violet-50"
                    >
                      {image ? (
                        <img src={image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-xs text-slate-300">
                          <ShoppingBag className="h-6 w-6" />
                        </div>
                      )}
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={href}
                          onClick={() => setOpen(false)}
                          className="line-clamp-2 text-sm font-medium hover:text-violet-600"
                        >
                          {item.name}
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-slate-400 hover:text-rose-500"
                          onClick={() => dispatch(removeWishlist(item._id))}
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {formatCurrency(item.price)}
                      </p>
                      <div className="mt-auto flex items-center justify-end pt-2">
                        <AddToCartButton productId={item._id} stock={item.stock} iconOnly />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <SheetFooter className="border-t px-5 py-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => dispatch(clearWishlist())}
              >
                Clear wishlist
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}