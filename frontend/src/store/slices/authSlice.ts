import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client, { getToken, setToken, clearToken } from '../../api/client';
import type { User } from '../../types/user';

export interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: getToken(),
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    const { data } = await client.post('/auth/login', credentials);
    setToken(data.token);
    return data as { token: string; role: 'user' | 'admin'; user: User };
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (payload: { name: string; email: string; password: string }) => {
    const { data } = await client.post('/auth/register', payload);
    setToken(data.token);
    return data as { token: string; role: 'user' | 'admin'; user: User };
  }
);

export const fetchMe = createAsyncThunk('auth/me', async () => {
  const { data } = await client.get('/auth/me');
  return data.user as User;
});

export const refreshAccessToken = createAsyncThunk('auth/refresh', async () => {
  const { data } = await client.post('/auth/refresh-token');
  return data as { token: string };
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await client.post('/auth/logout');
  } catch {
    // ignore — always clear local session even if the API call fails
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      clearToken();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.error.message as string) || 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.error.message as string) || 'Registration failed';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
      })
      .addCase(logoutUser.pending, (state) => {
        clearToken();
        state.token = null;
        state.user = null;
        state.error = null;
      });
  },
});

export const { clearAuth } = authSlice.actions;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => Boolean(state.auth.token);
export default authSlice.reducer;