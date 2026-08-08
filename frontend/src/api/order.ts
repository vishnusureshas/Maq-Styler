import client from './client';
import type { ShippingAddress } from '../types/order';

export const orderApi = {
  create: (payload: { shippingAddress: ShippingAddress; paymentMethod: string }) =>
    client.post('/orders', payload),
  myOrders: () => client.get('/orders/my-orders'),
  byId: (id: string) => client.get(`/orders/${id}`),
  cancel: (id: string) => client.patch(`/orders/${id}/cancel`),
  return: (id: string) => client.post(`/orders/${id}/return`),
};