import client from './client';
import type { Product, ProductListParams } from '../types/product';

export const productApi = {
  list: (params: ProductListParams = {}) =>
    client.get('/products', {
      params: { page: 1, pageSize: 10, ...params },
    }),
  byId: (id: string) => client.get(`/products/${id}`),
  bySlug: (slug: string) => client.get(`/products/slug/${slug}`),
  create: (payload: Partial<Product>) => client.post('/products', payload),
  update: (id: string, payload: Partial<Product>) => client.put(`/products/${id}`, payload),
  remove: (id: string) => client.delete(`/products/${id}`),
  uploadImages: (files: File[]) => {
    const form = new FormData();
    files.forEach((f) => form.append('images', f));
    return client.post<{ success: boolean; urls: string[] }>('/products/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};