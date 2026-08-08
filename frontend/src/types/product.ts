export interface Category {
  _id: string;
  name: string;
  slug?: string;
  parent?: string;
  image?: string;
  isActive: boolean;
}

export interface Variant {
  name: string;
  options: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  brand?: string;
  price: number;
  compareAtPrice?: number;
  category: string | Category;
  images: string[];
  stock: number;
  sku?: string;
  variants?: Variant[];
  ratingsAverage: number;
  ratingsQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}