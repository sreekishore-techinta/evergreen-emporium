/**
 * Evergreen Media — API Service Layer
 * All communication with the PHP REST API goes through this file.
 * The React frontend never talks to the database directly.
 */

// ── Base URL ───────────────────────────────────────────────────────
// API paths in this file already include /api prefix (e.g. /api/products).
// So API_BASE must point to the site ROOT, not to /api/.
// Dev: leave empty → Vite proxy handles /api/* → XAMPP
// Prod: set VITE_API_URL=https://yourdomain.com  (no trailing slash, no /api)
export const API_BASE: string = (() => {
  const raw = import.meta.env['VITE_API_URL'] as string | undefined;
  if (!raw) return '';                        // dev — use Vite proxy
  // Strip trailing /api or /api/ if someone accidentally includes it
  return raw.replace(/\/api\/?$/, '');
})();

// ── Token storage ──────────────────────────────────────────────────
const TOKEN_KEY = 'em_user_token';
export const getToken  = ()      => localStorage.getItem(TOKEN_KEY) ?? '';
export const setToken  = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const clearToken = ()     => localStorage.removeItem(TOKEN_KEY);

// ── Shared types ───────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface ApiProduct {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  sku: string;
  tagline: string | null;
  description: string | null;
  long_description: string | null;
  benefits: string[];
  usage_info: string | null;
  type: string | null;
  badge: string | null;
  price: number;
  discount_price: number | null;
  stock: number;
  low_stock_alert: number;
  weight: string | null;
  primary_image: string | null;
  primary_image_url: string;
  rating: number;
  rating_count: number;
  is_active: boolean;
  is_featured: boolean;
  is_bestseller: boolean;
  applications: string[];
  category_name: string;
  category_slug: string;
  images: ApiProductImage[];
  related?: ApiProduct[];
  reviews?: ApiReview[];
}

export interface ApiProductImage {
  id: number;
  product_id: number;
  image_path: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sort_order: number;
  is_active: boolean;
  product_count?: number;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  email_verified: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface ApiCartItem {
  id: number;
  product_id: number;
  quantity: number;
  price_snapshot: number;
  name: string;
  slug: string;
  sku: string;
  current_price: number;
  discount_price: number | null;
  stock: number;
  weight: string | null;
  primary_image: string | null;
  is_active: boolean;
  line_total: number;
}

export interface ApiCart {
  cart_id: number;
  items: ApiCartItem[];
  subtotal: number;
}

export interface ApiOrder {
  id: number;
  order_number: string;
  user_id: number | null;
  status: string;
  subtotal: number;
  shipping_charge: number;
  discount_amount: number;
  grand_total: number;
  coupon_code: string | null;
  payment_status: string;
  payment_method: string | null;
  ship_name: string;
  ship_phone: string;
  ship_line1: string;
  ship_line2: string | null;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  ship_country: string;
  notes: string | null;
  created_at: string;
  items?: ApiOrderItem[];
}

export interface ApiOrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_sku: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface ApiReview {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  body: string | null;
  status: string;
  created_at: string;
  user_name?: string;
}

export interface CheckoutAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

// ── Core fetch wrapper ─────────────────────────────────────────────
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  auth = false
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const opts: RequestInit = { method, headers };
  if (body !== undefined && method !== 'GET') {
    opts.body = JSON.stringify(body);
  }

  try {
    const res  = await fetch(`${API_BASE}${path}`, opts);
    const json = await res.json() as ApiResponse<T>;
    return json;
  } catch (err) {
    return { success: false, message: 'Network error. Please check your connection.' };
  }
}

async function requestPaginated<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<PaginatedResponse<T>> {
  const qs = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') qs.set(k, String(v));
    });
  }
  const url = `${API_BASE}${path}${qs.toString() ? '?' + qs : ''}`;

  try {
    const res  = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });
    return await res.json() as PaginatedResponse<T>;
  } catch {
    return { success: false, data: [], pagination: { total: 0, page: 1, page_size: 20, total_pages: 0 } };
  }
}

// ═══════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════
export const authApi = {
  register: (name: string, email: string, password: string, phone?: string) =>
    request<{ user: ApiUser; token: string }>('POST', '/api/auth/register', { name, email, password, phone }),

  login: (email: string, password: string) =>
    request<{ user: ApiUser; token: string }>('POST', '/api/auth/login', { email, password }),

  logout: () =>
    request('POST', '/api/auth/logout', {}, true),

  profile: () =>
    request<ApiUser>('GET', '/api/auth/profile', undefined, true),

  updateProfile: (data: { name?: string; phone?: string }) =>
    request<ApiUser>('PUT', '/api/auth/profile', data, true),

  changePassword: (current_password: string, new_password: string) =>
    request('POST', '/api/auth/change-password', { current_password, new_password }, true),
};

// ═══════════════════════════════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════════════════════════════
export interface ProductListParams {
  page?: number;
  page_size?: number;
  category_id?: number;
  category_slug?: string;
  featured?: boolean;
  bestseller?: boolean;
  search?: string;
  sort?: 'default' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export const productsApi = {
  list: (params?: ProductListParams) =>
    requestPaginated<ApiProduct>('/api/products', params as Record<string, string | number | boolean | undefined>),

  get: (id: number) =>
    request<ApiProduct>('GET', `/api/products/${id}`),

  getBySlug: (slug: string) =>
    request<ApiProduct>('GET', `/api/products/slug/${slug}`),

  featured: (limit = 4) =>
    requestPaginated<ApiProduct>('/api/products', { featured: true, page_size: limit }),

  bestsellers: (limit = 8) =>
    requestPaginated<ApiProduct>('/api/products', { bestseller: true, page_size: limit }),

  byCategory: (categorySlug: string, page = 1) =>
    requestPaginated<ApiProduct>('/api/products', { category_slug: categorySlug, page, page_size: 12 }),

  reviews: (productId: number, page = 1) =>
    requestPaginated<ApiReview>(`/api/products/${productId}/reviews`, { page }),
};

// ═══════════════════════════════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════════════════════════════
export const categoriesApi = {
  list: (withCount = false) =>
    request<ApiCategory[]>('GET', `/api/categories${withCount ? '?with_count=1' : ''}`),

  get: (id: number) =>
    request<ApiCategory>('GET', `/api/categories/${id}`),
};

// ═══════════════════════════════════════════════════════════════════
// CART  (requires auth)
// ═══════════════════════════════════════════════════════════════════
export const cartApi = {
  get: () =>
    request<ApiCart>('GET', '/api/cart', undefined, true),

  add: (product_id: number, quantity = 1) =>
    request<ApiCart>('POST', '/api/cart/add', { product_id, quantity }, true),

  update: (product_id: number, quantity: number) =>
    request<ApiCart>('PUT', '/api/cart/update', { product_id, quantity }, true),

  remove: (product_id: number) =>
    request<ApiCart>('POST', '/api/cart/remove', { product_id }, true),

  clear: () =>
    request('DELETE', '/api/cart/clear', undefined, true),
};

// ═══════════════════════════════════════════════════════════════════
// WISHLIST  (requires auth)
// ═══════════════════════════════════════════════════════════════════
export const wishlistApi = {
  get: () =>
    request<ApiProduct[]>('GET', '/api/wishlist', undefined, true),

  add: (product_id: number) =>
    request('POST', '/api/wishlist/add', { product_id }, true),

  remove: (product_id: number) =>
    request('DELETE', `/api/wishlist/${product_id}`, undefined, true),

  toggle: (product_id: number) =>
    request<{ wishlisted: boolean }>('POST', '/api/wishlist/toggle', { product_id }, true),
};

// ═══════════════════════════════════════════════════════════════════
// ORDERS  (requires auth)
// ═══════════════════════════════════════════════════════════════════
export const ordersApi = {
  checkout: (data: {
    address: CheckoutAddress;
    payment_method: string;
    coupon_code?: string;
    notes?: string;
  }) => request<ApiOrder>('POST', '/api/checkout', data, true),

  list: (page = 1) =>
    requestPaginated<ApiOrder>('/api/orders', { page, page_size: 10 }),

  get: (id: number) =>
    request<ApiOrder>('GET', `/api/orders/${id}`, undefined, true),
};

// ═══════════════════════════════════════════════════════════════════
// COUPONS
// ═══════════════════════════════════════════════════════════════════
export const couponsApi = {
  validate: (code: string, order_total: number) =>
    request<{ coupon_id: number; code: string; type: string; value: number; discount: number }>(
      'POST', '/api/coupons/validate', { code, order_total }, true
    ),
};

// ═══════════════════════════════════════════════════════════════════
// REVIEWS
// ═══════════════════════════════════════════════════════════════════
export const reviewsApi = {
  submit: (product_id: number, rating: number, title?: string, body?: string) =>
    request('POST', '/api/reviews', { product_id, rating: String(rating), title, body }, true),
};

// ═══════════════════════════════════════════════════════════════════
// CONTACT / NEWSLETTER
// ═══════════════════════════════════════════════════════════════════
export const contactApi = {
  send: (name: string, email: string, message: string, subject?: string, phone?: string) =>
    request('POST', '/api/contact', { name, email, message, subject, phone }),

  subscribe: (email: string) =>
    request('POST', '/api/newsletter/subscribe', { email }),
};

// ═══════════════════════════════════════════════════════════════════
// REACT HOOKS  — lightweight, no extra library needed
// ═══════════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';

/** Generic async-load state shape */
export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Fetch a paginated list of products (shop page, featured, etc.) */
export function useProducts(params?: ProductListParams): UseApiState<{ items: ApiProduct[]; total: number; totalPages: number }> {
  const [data, setData]       = useState<{ items: ApiProduct[]; total: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  // Stable serialised key so the effect re-fires when params change
  const key = JSON.stringify(params ?? {});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    productsApi.list(params).then((res) => {
      if (cancelled) return;
      if (res.success) {
        setData({
          items:      res.data,
          total:      res.pagination.total,
          totalPages: res.pagination.total_pages,
        });
      } else {
        setError('Failed to load products.');
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}

/** Fetch a single product by numeric id or string slug */
export function useProduct(idOrSlug: string | number): UseApiState<ApiProduct> {
  const [data, setData]       = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);

    const fetch$ =
      typeof idOrSlug === 'number'
        ? productsApi.get(idOrSlug)
        : productsApi.getBySlug(String(idOrSlug));

    fetch$.then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setData(res.data);
      } else {
        setError('Product not found.');
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [idOrSlug, tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1) };
}

/** Convenience: fetch featured products for the homepage */
export function useFeaturedProducts(limit = 4) {
  return useProducts({ featured: true, page_size: limit });
}

/** Search products against the live API (for search modal) */
export function useProductSearch(query: string, limit = 6): { results: ApiProduct[]; loading: boolean } {
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) { setResults([]); return; }

    setLoading(true);
    const timer = setTimeout(() => {
      productsApi.list({ search: q, page_size: limit }).then((res) => {
        setResults(res.success ? res.data : []);
        setLoading(false);
      });
    }, 280); // 280 ms debounce

    return () => clearTimeout(timer);
  }, [query, limit]);

  return { results, loading };
}
