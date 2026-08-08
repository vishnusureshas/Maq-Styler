import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const TOKEN_KEY = 'ecommerce_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  withCredentials: true,
});

client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function tryRefresh(): Promise<string | null> {
  const { refreshAccessToken } = await import('../store/slices/authSlice');
  const { store } = await import('../store');
  try {
    const action = await store.dispatch(refreshAccessToken());
    const token = (action.payload as { token?: string } | undefined)?.token ?? null;
    if (token) setToken(token);
    return token;
  } catch {
    return null;
  }
}

client.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string }>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const isAuthRequest =
      typeof original?.url === 'string' &&
      (original.url.includes('/auth/login') ||
        original.url.includes('/auth/register') ||
        original.url.includes('/auth/refresh-token'));

    if (error.response?.status === 401 && !original?._retry && !isAuthRequest) {
      original._retry = true;
      refreshing = refreshing ?? tryRefresh();
      const token = await refreshing;
      refreshing = null;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return client(original);
      }
      const { store } = await import('../store');
      const { clearAuth } = await import('../store/slices/authSlice');
      store.dispatch(clearAuth());
      window.location.href = '/login';
    }

    const message =
      error.response?.data?.message ||
      (error.request ? 'Network error. Please try again.' : error.message);
    if (error.response?.status !== 401 || isAuthRequest) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default client;