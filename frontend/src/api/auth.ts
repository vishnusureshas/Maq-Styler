import client from './client';
import type { User } from '../types/user';

export const authApi = {
  login: (payload: { email: string; password: string }) =>
    client.post('/auth/login', payload),
  register: (payload: { name: string; email: string; password: string }) =>
    client.post('/auth/register', payload),
  logout: () => client.post('/auth/logout'),
  verifyEmail: (token: string) => client.post(`/auth/verify-email/${token}`),
  forgotPassword: (email: string) => client.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    client.post(`/auth/reset-password/${token}`, { password }),
  refreshToken: (refreshToken?: string) =>
    client.post('/auth/refresh-token', { refreshToken }),
  me: () => client.get<{ success: boolean; user: User }>('/auth/me'),
};