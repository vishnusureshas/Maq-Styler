import client from './client';
import type { Cart } from '../types/cart';

export const cartApi = {
  get: () => client.get<{ cart: Cart }>('/cart'),
  add: (payload: { productId: string; quantity?: number; variant?: Record<string, string> }) =>
    client.post('/cart/add', payload),
  update: (productId: string, payload: { quantity?: number; variant?: Record<string, string> }) =>
    client.put(`/cart/update/${productId}`, payload),
  remove: (productId: string) => client.delete(`/cart/remove/${productId}`),
  clear: () => client.delete('/cart/clear'),
  applyCoupon: (code: string) => client.post('/cart/apply-coupon', { code }),
  removeCoupon: () => client.delete('/cart/remove-coupon'),
};