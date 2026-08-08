import type { Product } from './product';

export interface CartItem {
  product: string | Product;
  quantity: number;
  variant?: Record<string, string>;
  priceAtAdd?: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
  totalDiscount: number;
  createdAt: string;
  updatedAt: string;
}