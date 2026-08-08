export interface ApiResponseSuccess {
  success: true;
  message?: string;
}

export interface ApiErrorBody {
  success: false;
  message: string;
  stack?: string;
}

export interface Paginated<T> {
  page: number;
  pages: number;
  count: number;
  [key: string]: unknown;
  items?: T[];
}