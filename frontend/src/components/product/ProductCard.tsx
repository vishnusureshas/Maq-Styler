import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rating } from '@/components/shared/Rating';
import { AddToCartButton } from './AddToCartButton';
import { formatCurrency } from '@/lib/formatters';
import type { Product } from '@/types/product';

export function ProductCard({ product }: { product: Product }) {
  const image = product.images?.[0];
  const isOut = product.stock <= 0;
  const href = `/product/${product.slug ?? product._id}`;

  return (
    <Card className="group flex flex-col overflow-hidden">
      <Link to={href} className="relative aspect-square w-full overflow-hidden bg-muted">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <Badge className="absolute left-2 top-2" variant="destructive">
            Sale
          </Badge>
        )}
      </Link>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="text-sm font-medium text-primary/80">{product.brand || 'ShopCart'}</div>
        <Link to={href} className="font-semibold leading-snug line-clamp-2 hover:underline">
          {product.name}
        </Link>
        <Rating value={product.ratingsAverage} count={product.ratingsQuantity} />
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-sm text-muted-foreground line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>
        <AddToCartButton productId={product._id} stock={product.stock} />
        {isOut && <span className="text-center text-xs text-destructive">Out of stock</span>}
      </CardContent>
    </Card>
  );
}