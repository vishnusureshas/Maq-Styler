import type { User } from './user';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: Record<string, string>;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
  phone?: string;
}

export interface Order {
  _id: string;
  user: string | User;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'card' | 'cod' | 'paypal';
  taxPrice: number;
  shippingPrice: number;
  itemsPrice: number;
  totalPrice: number;
  discount: number;
  isPaid: boolean;
  paidAt?: string;
  paymentStatus: PaymentStatus;
  coupon?: string;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; changedAt: string; note?: string }[];
  createdAt: string;
  updatedAt: string;
}