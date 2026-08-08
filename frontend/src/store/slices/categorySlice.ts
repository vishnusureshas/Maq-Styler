import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';
import type { Category } from '../../types/product';

interface CategoryState {
  items: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchCategories = createAsyncThunk('category/list', async () => {
  const { data } = await client.get('/categories');
  return data.categories as Category[];
});

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.error.message as string) || 'Failed to load categories';
      });
  },
});

export const selectCategories = (state: { category: CategoryState }) => state.category.items;
export default categorySlice.reducer;