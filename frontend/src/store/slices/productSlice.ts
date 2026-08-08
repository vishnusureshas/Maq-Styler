import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productApi } from '../../api/product';
import type { Product, ProductListParams } from '../../types/product';

interface ProductState {
  list: Product[];
  current: Product | null;
  page: number;
  pages: number;
  count: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductState = {
  list: [],
  current: null,
  page: 1,
  pages: 1,
  count: 0,
  status: 'idle',
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'product/list',
  async (params: ProductListParams = {}) => {
    const { data } = await productApi.list(params);
    return data as {
      products: Product[];
      page: number;
      pages: number;
      count: number;
    };
  }
);

export const fetchProductBySlug = createAsyncThunk('product/detail', async (slug: string) => {
  const { data } = await productApi.bySlug(slug);
  return data.product as Product;
});

export const fetchProductById = createAsyncThunk('product/detailId', async (id: string) => {
  const { data } = await productApi.byId(id);
  return data.product as Product;
});

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    clearCurrent: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.count = action.payload.count;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.error.message as string) || 'Failed to load products';
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export const { clearCurrent } = productSlice.actions;
export const selectProducts = (state: { product: ProductState }) => state.product.list;
export const selectCurrentProduct = (state: { product: ProductState }) => state.product.current;
export default productSlice.reducer;