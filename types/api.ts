// Standard API response envelope from crm_v2_backend
export interface ApiResponse<T = unknown> {
  success: boolean;
  result: T;
  message?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pages: number;
  count: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export interface PaginationParams {
  page?: number;
  items?: number;
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
